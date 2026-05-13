-- ============================================================
-- BRAVA+ — Sprint 10: Compartilhar cupom + Afiliados comerciais +
-- Pacotes sazonais + Contábil lojista
-- ============================================================

-- =========================================================
-- 1) shared_coupons — usuário compartilha cupom com amigo
-- =========================================================
create table if not exists public.shared_coupons (
  id uuid primary key default uuid_generate_v4(),
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  recipient_hint text, -- nome ou email visível pro sender, não obriga conta
  share_token text not null unique default replace(uuid_generate_v4()::text, '-', ''),
  redeemed_by_user_id uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

create index if not exists shared_coupons_token_idx on public.shared_coupons (share_token);
create index if not exists shared_coupons_sender_idx on public.shared_coupons (sender_user_id, created_at desc);
create index if not exists shared_coupons_coupon_idx on public.shared_coupons (coupon_id);

alter table public.shared_coupons enable row level security;

drop policy if exists "shared_coupons_select" on public.shared_coupons;
create policy "shared_coupons_select" on public.shared_coupons for select
  using (sender_user_id = auth.uid() or redeemed_by_user_id = auth.uid() or public.is_admin());

drop policy if exists "shared_coupons_insert" on public.shared_coupons;
create policy "shared_coupons_insert" on public.shared_coupons for insert
  with check (sender_user_id = auth.uid());

-- =========================================================
-- 2) Afiliados comerciais (canal B2B)
-- =========================================================
create table if not exists public.commercial_affiliates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  code text not null unique, -- ex: COM-AB1234
  commission_rate numeric(5,4) not null default 0.20, -- 20% padrão
  duration_months int not null default 12, -- comissão por 12 meses
  pix_key text,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists comm_aff_code_idx on public.commercial_affiliates (code);
create index if not exists comm_aff_user_idx on public.commercial_affiliates (user_id);

alter table public.commercial_affiliates enable row level security;

drop policy if exists "comm_aff_select" on public.commercial_affiliates;
create policy "comm_aff_select" on public.commercial_affiliates for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "comm_aff_admin_write" on public.commercial_affiliates;
create policy "comm_aff_admin_write" on public.commercial_affiliates for all
  using (public.is_admin()) with check (public.is_admin());

-- Vínculo affiliate × estabelecimento (cada estab indicado)
create table if not exists public.affiliate_referrals (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.commercial_affiliates(id) on delete cascade,
  establishment_id uuid not null unique references public.establishments(id) on delete cascade,
  signed_at timestamptz not null default now(),
  commission_until timestamptz not null default (now() + interval '12 months'),
  commission_rate numeric(5,4) not null default 0.20,
  total_paid_cents bigint not null default 0
);

create index if not exists aff_ref_aff_idx on public.affiliate_referrals (affiliate_id);
create index if not exists aff_ref_active_idx on public.affiliate_referrals (commission_until);

alter table public.affiliate_referrals enable row level security;

drop policy if exists "aff_ref_select" on public.affiliate_referrals;
create policy "aff_ref_select" on public.affiliate_referrals for select
  using (
    public.owns_establishment(establishment_id)
    or exists (select 1 from public.commercial_affiliates a where a.id = affiliate_id and a.user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "aff_ref_admin_write" on public.affiliate_referrals;
create policy "aff_ref_admin_write" on public.affiliate_referrals for all
  using (public.is_admin()) with check (public.is_admin());

-- Histórico de payouts
create table if not exists public.affiliate_payouts (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.commercial_affiliates(id) on delete cascade,
  period_month date not null,
  amount_cents bigint not null check (amount_cents >= 0),
  estabs_count int not null default 0,
  paid_at timestamptz,
  receipt_url text,
  notes text,
  created_at timestamptz not null default now(),
  unique (affiliate_id, period_month)
);

create index if not exists aff_payouts_aff_idx on public.affiliate_payouts (affiliate_id, period_month desc);

alter table public.affiliate_payouts enable row level security;

drop policy if exists "aff_payouts_select" on public.affiliate_payouts;
create policy "aff_payouts_select" on public.affiliate_payouts for select
  using (
    exists (select 1 from public.commercial_affiliates a where a.id = affiliate_id and a.user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "aff_payouts_admin_write" on public.affiliate_payouts;
create policy "aff_payouts_admin_write" on public.affiliate_payouts for all
  using (public.is_admin()) with check (public.is_admin());

-- RPC: calcula payout do mês para todos affiliates ativos
create or replace function public.calculate_affiliate_payouts(p_period date)
returns table (
  affiliate_id uuid,
  affiliate_name text,
  affiliate_code text,
  estabs_count int,
  total_revenue_cents bigint,
  commission_cents bigint
)
language sql stable security definer as $$
  with period_bounds as (
    select date_trunc('month', p_period)::timestamptz as p_start,
           (date_trunc('month', p_period) + interval '1 month')::timestamptz as p_end
  ),
  estab_revenue as (
    select
      ar.affiliate_id,
      ar.establishment_id,
      ar.commission_rate,
      ar.commission_until,
      coalesce(sum(o.total_cents), 0)::bigint as revenue
    from public.affiliate_referrals ar
    cross join period_bounds pb
    left join public.orders o on o.establishment_id = ar.establishment_id
      and o.status in ('paid', 'completed')
      and o.created_at >= pb.p_start
      and o.created_at < pb.p_end
    where ar.commission_until > pb.p_start
    group by ar.affiliate_id, ar.establishment_id, ar.commission_rate, ar.commission_until
  )
  select
    a.id as affiliate_id,
    a.name as affiliate_name,
    a.code as affiliate_code,
    count(er.establishment_id)::int as estabs_count,
    sum(er.revenue)::bigint as total_revenue_cents,
    sum(floor(er.revenue * er.commission_rate))::bigint as commission_cents
  from public.commercial_affiliates a
  join estab_revenue er on er.affiliate_id = a.id
  where a.is_active
  group by a.id, a.name, a.code
  having sum(er.revenue) > 0;
$$;

-- =========================================================
-- 3) Pacotes editoriais sazonais (Black Friday etc.)
-- =========================================================
create table if not exists public.seasonal_packages (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  cover_url text,
  theme_color text default '#FFD400',
  theme_emoji text default '🎉',
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  is_active boolean not null default true,
  display_order int not null default 100,
  created_at timestamptz not null default now()
);

create index if not exists seasonal_active_idx on public.seasonal_packages (is_active, ends_at) where is_active;

alter table public.seasonal_packages enable row level security;

drop policy if exists "seasonal_select" on public.seasonal_packages;
create policy "seasonal_select" on public.seasonal_packages for select
  using (is_active or public.is_admin());

drop policy if exists "seasonal_admin_write" on public.seasonal_packages;
create policy "seasonal_admin_write" on public.seasonal_packages for all
  using (public.is_admin()) with check (public.is_admin());

-- Cupons agrupados num pacote
create table if not exists public.seasonal_package_coupons (
  package_id uuid not null references public.seasonal_packages(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  display_order int not null default 100,
  highlight boolean not null default false,
  primary key (package_id, coupon_id)
);

create index if not exists seasonal_pkg_coupons_idx on public.seasonal_package_coupons (package_id, display_order);

alter table public.seasonal_package_coupons enable row level security;

drop policy if exists "seasonal_pkg_coupons_select" on public.seasonal_package_coupons;
create policy "seasonal_pkg_coupons_select" on public.seasonal_package_coupons for select using (true);

drop policy if exists "seasonal_pkg_coupons_write" on public.seasonal_package_coupons;
create policy "seasonal_pkg_coupons_write" on public.seasonal_package_coupons for all
  using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- 4) View: extrato contábil mensal do lojista
-- =========================================================
create or replace function public.estab_monthly_statement(p_estab_id uuid, p_month date)
returns table (
  period_month date,
  gross_revenue_cents bigint,
  orders_count int,
  refunded_cents bigint,
  refunds_count int,
  net_revenue_cents bigint,
  withdrawn_cents bigint,
  withdrawals_count int,
  balance_pending_cents bigint
)
language sql stable security definer as $$
  with period_bounds as (
    select date_trunc('month', p_month)::timestamptz as p_start,
           (date_trunc('month', p_month) + interval '1 month')::timestamptz as p_end
  ),
  rev as (
    select coalesce(sum(o.total_cents), 0)::bigint as gross,
           count(*)::int as cnt
    from public.orders o, period_bounds pb
    where o.establishment_id = p_estab_id
      and o.status in ('paid','completed')
      and o.created_at >= pb.p_start and o.created_at < pb.p_end
  ),
  ref as (
    select coalesce(sum(r.refund_amount_cents),0)::bigint as refunded,
           count(*)::int as cnt
    from public.refund_tickets r, period_bounds pb
    where r.establishment_id = p_estab_id
      and r.status = 'refunded'
      and coalesce(r.resolved_at, r.created_at) >= pb.p_start
      and coalesce(r.resolved_at, r.created_at) < pb.p_end
  ),
  wit as (
    select coalesce(sum(w.amount_cents),0)::bigint as amt,
           count(*)::int as cnt
    from public.withdrawals w, period_bounds pb
    where w.establishment_id = p_estab_id
      and w.status = 'paid'
      and w.paid_at >= pb.p_start and w.paid_at < pb.p_end
  ),
  pending as (
    select coalesce(sum(o.total_cents),0)::bigint as amt
    from public.orders o
    where o.establishment_id = p_estab_id
      and o.status in ('paid','completed')
      and o.withdrawn_at is null
  )
  select
    date_trunc('month', p_month)::date as period_month,
    (select gross from rev) as gross_revenue_cents,
    (select cnt from rev) as orders_count,
    (select refunded from ref) as refunded_cents,
    (select cnt from ref) as refunds_count,
    ((select gross from rev) - (select refunded from ref))::bigint as net_revenue_cents,
    (select amt from wit) as withdrawn_cents,
    (select cnt from wit) as withdrawals_count,
    (select amt from pending) as balance_pending_cents;
$$;

-- Linhas detalhadas pra exportar CSV
create or replace function public.estab_monthly_lines(p_estab_id uuid, p_month date)
returns table (
  occurred_at timestamptz,
  kind text,
  description text,
  amount_cents bigint,
  reference_id uuid
)
language sql stable security definer as $$
  with period_bounds as (
    select date_trunc('month', p_month)::timestamptz as p_start,
           (date_trunc('month', p_month) + interval '1 month')::timestamptz as p_end
  )
  -- Orders pagos
  select
    o.created_at as occurred_at,
    'order' as kind,
    'Pedido #' || substr(o.id::text, 1, 8) as description,
    o.total_cents::bigint as amount_cents,
    o.id as reference_id
  from public.orders o, period_bounds pb
  where o.establishment_id = p_estab_id
    and o.status in ('paid','completed')
    and o.created_at >= pb.p_start and o.created_at < pb.p_end

  union all

  -- Refunds processados
  select
    coalesce(r.resolved_at, r.created_at) as occurred_at,
    'refund' as kind,
    'Extorno #' || substr(r.id::text, 1, 8) as description,
    -coalesce(r.refund_amount_cents, 0)::bigint as amount_cents,
    r.id as reference_id
  from public.refund_tickets r, period_bounds pb
  where r.establishment_id = p_estab_id
    and r.status = 'refunded'
    and coalesce(r.resolved_at, r.created_at) >= pb.p_start
    and coalesce(r.resolved_at, r.created_at) < pb.p_end

  union all

  -- Withdrawals pagos
  select
    w.paid_at as occurred_at,
    'withdrawal' as kind,
    'Saque PIX ' || coalesce(w.pix_key, '') as description,
    -w.amount_cents::bigint as amount_cents,
    w.id as reference_id
  from public.withdrawals w, period_bounds pb
  where w.establishment_id = p_estab_id
    and w.status = 'paid'
    and w.paid_at >= pb.p_start and w.paid_at < pb.p_end

  order by occurred_at desc;
$$;
