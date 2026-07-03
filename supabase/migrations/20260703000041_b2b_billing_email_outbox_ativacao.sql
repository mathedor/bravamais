-- =============================================================
-- 041 — B2B billing (faturas mensais) + email outbox (teto diário
-- Resend) + régua de trial (dedupe) + RPC de ativação (founder CRM)
-- =============================================================

-- 1) payments aceita kind b2b_invoice
alter table public.payments drop constraint if exists payments_kind_check;
alter table public.payments add constraint payments_kind_check check (
  kind in (
    'subscription','order','tag_recharge',
    'tag_monthly','category_subscription','establishment_plan','gift_card','wallet_deposit',
    'b2b_invoice'
  )
);

-- 2) Faturas mensais B2B (seats_used × preço, geradas por cron)
create table if not exists public.b2b_invoices (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.b2b_accounts(id) on delete cascade,
  period_month date not null, -- primeiro dia do mês faturado
  seats int not null,
  amount_cents int not null,
  status text not null default 'pending' check (status in ('pending','paid','overdue','canceled')),
  payment_id uuid references public.payments(id) on delete set null,
  pix_code text,
  due_date date not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (account_id, period_month)
);
create index if not exists b2b_invoices_status_idx on public.b2b_invoices (status, due_date);

alter table public.b2b_invoices enable row level security;
drop policy if exists "b2b_invoices_admin" on public.b2b_invoices;
create policy "b2b_invoices_admin" on public.b2b_invoices for all
  using (public.is_admin()) with check (public.is_admin());

-- 3) Outbox de email — todo envio passa por aqui (teto diário do Resend)
create table if not exists public.email_outbox (
  id uuid primary key default uuid_generate_v4(),
  to_addr text not null,
  subject text not null,
  html text not null,
  status text not null default 'queued' check (status in ('queued','sent','failed')),
  attempts int not null default 0,
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists email_outbox_status_idx on public.email_outbox (status, created_at);
create index if not exists email_outbox_sent_at_idx on public.email_outbox (sent_at desc);

alter table public.email_outbox enable row level security;
drop policy if exists "email_outbox_admin" on public.email_outbox;
create policy "email_outbox_admin" on public.email_outbox for select
  using (public.is_admin());

-- 4) Régua de trial — dedupe por (user, passo)
create table if not exists public.trial_touch_log (
  user_id uuid not null references public.profiles(id) on delete cascade,
  step text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, step)
);

-- 5) CRM de ativação: últimos N assinantes com o que cada um fez
create or replace function public.admin_activation_overview(p_limit int default 100)
returns jsonb
language sql
security definer
set search_path = public
as $fn$
  select coalesce(jsonb_agg(row order by row->>'created_at' desc), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'user_id', p.id,
      'full_name', p.full_name,
      'email', u.email,
      'created_at', p.created_at,
      'city', p.city,
      'tier', s.tier,
      'sub_status', s.status,
      'trial_ends_at', s.trial_ends_at,
      'categories_set', coalesce(s.custom_categories_set, false),
      'visits', (select count(*) from visits v where v.user_id = p.id),
      'redemptions', (select count(*) from coupon_redemptions cr where cr.user_id = p.id),
      'orders', (select count(*) from orders o where o.user_id = p.id),
      'pos_sales', (select count(*) from pos_sales ps where ps.user_id = p.id),
      'last_activity', greatest(
        (select max(v.created_at) from visits v where v.user_id = p.id),
        (select max(cr.redeemed_at) from coupon_redemptions cr where cr.user_id = p.id),
        (select max(o.created_at) from orders o where o.user_id = p.id)
      )
    ) as row
    from profiles p
    join auth.users u on u.id = p.id
    left join subscriptions s on s.user_id = p.id
    where p.role = 'subscriber'
      and u.email not like '%@bravamais.app' -- só gente real
    order by p.created_at desc
    limit p_limit
  ) t;
$fn$;

revoke all on function public.admin_activation_overview(int) from public, anon, authenticated;
grant execute on function public.admin_activation_overview(int) to service_role;
