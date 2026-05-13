-- ============================================================
-- BRAVA+ — Sprint 4: Admin BI + Antifraude + Slot destaque pago + Plano lojista + Empresas
-- ============================================================

-- =========================================================
-- 1) featured_slots — slot de destaque pago (estab paga pra aparecer no topo)
-- =========================================================
create table if not exists public.featured_slots (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  placement text not null, -- 'home_hero','category_top','nearby_top'
  category_slug text,
  city text,
  state char(2),
  priority int not null default 100,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  monthly_cents int not null default 0,
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists featured_slots_active_idx
  on public.featured_slots (placement, ends_at) where paid = true;
create index if not exists featured_slots_estab_idx
  on public.featured_slots (establishment_id);

alter table public.featured_slots enable row level security;
drop policy if exists "featured_select" on public.featured_slots;
create policy "featured_select" on public.featured_slots for select using (true);

drop policy if exists "featured_write" on public.featured_slots;
create policy "featured_write" on public.featured_slots for all
  using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- 2) establishment_plans — plano de assinatura do lojista (básico/pro)
-- =========================================================
do $$ begin
  create type establishment_plan_tier as enum ('basico','pro','enterprise');
exception when duplicate_object then null; end $$;

alter table public.establishments add column if not exists plan_tier establishment_plan_tier not null default 'basico';
alter table public.establishments add column if not exists plan_started_at timestamptz;
alter table public.establishments add column if not exists plan_ends_at timestamptz;

-- =========================================================
-- 3) BRAVA+ Empresas (B2B)
-- =========================================================
create table if not exists public.b2b_accounts (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  cnpj text,
  contact_name text,
  contact_email text,
  seats_purchased int not null default 0,
  seats_used int not null default 0,
  monthly_cents_per_seat int not null default 1990,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.b2b_invites (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.b2b_accounts(id) on delete cascade,
  email text not null,
  invited_by_admin_user_id uuid references public.profiles(id),
  accepted_user_id uuid references public.profiles(id),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  unique (account_id, email)
);

create index if not exists b2b_invites_email_idx on public.b2b_invites (email);

alter table public.b2b_accounts enable row level security;
alter table public.b2b_invites enable row level security;

drop policy if exists "b2b_acc_admin" on public.b2b_accounts;
create policy "b2b_acc_admin" on public.b2b_accounts for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "b2b_inv_select" on public.b2b_invites;
create policy "b2b_inv_select" on public.b2b_invites for select
  using (public.is_admin() or email = (select email from auth.users where id = auth.uid()));

drop policy if exists "b2b_inv_admin_write" on public.b2b_invites;
create policy "b2b_inv_admin_write" on public.b2b_invites for insert
  with check (public.is_admin());

-- =========================================================
-- 4) RPCs: BI admin
-- =========================================================

-- Cohort de retenção: usuários criados por mês × % que tiveram visita nos meses seguintes
create or replace function public.cohort_retention()
returns table (
  cohort_month date,
  cohort_size int,
  active_m0 int,
  active_m1 int,
  active_m2 int,
  active_m3 int
)
language sql stable security definer as $$
  with cohorts as (
    select
      id as user_id,
      date_trunc('month', created_at)::date as cohort_month
    from public.profiles
    where role = 'subscriber'
  ),
  activity as (
    select
      c.user_id,
      c.cohort_month,
      date_trunc('month', v.created_at)::date as activity_month,
      (extract(year from age(v.created_at, c.cohort_month)) * 12
        + extract(month from age(v.created_at, c.cohort_month)))::int as months_since
    from cohorts c
    join public.visits v on v.user_id = c.user_id
  )
  select
    c.cohort_month,
    count(distinct c.user_id)::int as cohort_size,
    count(distinct case when a.months_since = 0 then a.user_id end)::int as active_m0,
    count(distinct case when a.months_since = 1 then a.user_id end)::int as active_m1,
    count(distinct case when a.months_since = 2 then a.user_id end)::int as active_m2,
    count(distinct case when a.months_since = 3 then a.user_id end)::int as active_m3
  from cohorts c
  left join activity a on a.user_id = c.user_id
  group by c.cohort_month
  order by c.cohort_month desc
  limit 12;
$$;

-- Churn risk: usuários assinantes ativos sem visita nos últimos 30 dias
create or replace function public.churn_risk()
returns table (
  user_id uuid,
  full_name text,
  email text,
  days_since_last_visit int,
  total_visits int,
  tier subscription_tier
)
language sql stable security definer as $$
  select
    p.id as user_id,
    p.full_name,
    u.email::text,
    coalesce(
      extract(day from (now() - (select max(created_at) from public.visits v where v.user_id = p.id)))::int,
      999
    ) as days_since_last_visit,
    coalesce((select count(*) from public.visits v where v.user_id = p.id),0)::int as total_visits,
    s.tier
  from public.profiles p
  join auth.users u on u.id = p.id
  join public.subscriptions s on s.user_id = p.id
  where p.role = 'subscriber'
    and s.status in ('active','trial')
    and (
      not exists (select 1 from public.visits v where v.user_id = p.id)
      or (select max(created_at) from public.visits v where v.user_id = p.id) < now() - interval '30 days'
    )
  order by total_visits desc
  limit 100;
$$;

-- Antifraude: check-ins suspeitos (mesmo cliente >5 visitas em <30 min num único estab,
-- ou mesmo cupom usado por muitos usuários do mesmo IP/UA — simplificado: visita-burst)
create or replace function public.fraud_signals()
returns table (
  user_id uuid,
  establishment_id uuid,
  full_name text,
  estab_name text,
  visits_in_window int,
  window_start timestamptz
)
language sql stable security definer as $$
  select
    v.user_id,
    v.establishment_id,
    p.full_name,
    e.name as estab_name,
    count(*)::int as visits_in_window,
    min(v.created_at) as window_start
  from public.visits v
  join public.profiles p on p.id = v.user_id
  join public.establishments e on e.id = v.establishment_id
  where v.created_at > now() - interval '30 days'
  group by v.user_id, v.establishment_id, p.full_name, e.name
  having count(*) >= 6
     and (max(v.created_at) - min(v.created_at)) < interval '30 minutes'
  order by visits_in_window desc
  limit 50;
$$;

-- Receita global BRAVA+ (subscriptions ativas + transações lojista + featured slots)
create or replace function public.platform_revenue_breakdown()
returns table (
  source text,
  monthly_estimate_cents bigint,
  count int
)
language sql stable security definer as $$
  -- Assinaturas user ativas
  select
    'user_subscriptions'::text as source,
    coalesce(sum(case s.tier when 'basico' then 1990 when 'premium' then 3990 when 'vip' then 7990 end),0)::bigint as monthly_estimate_cents,
    count(*)::int
  from public.subscriptions s
  where s.status in ('active','trial')

  union all

  -- Featured slots ativos
  select
    'featured_slots'::text,
    coalesce(sum(monthly_cents),0)::bigint,
    count(*)::int
  from public.featured_slots
  where paid and ends_at > now()

  union all

  -- B2B
  select
    'b2b_seats'::text,
    coalesce(sum(seats_used * monthly_cents_per_seat),0)::bigint,
    sum(seats_used)::int
  from public.b2b_accounts
  where active;
$$;
