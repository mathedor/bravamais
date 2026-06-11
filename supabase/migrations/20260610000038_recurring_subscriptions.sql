-- ============================================================
-- Recorrência automática de cobranças.
--   Cartão (Stripe): salva customer + payment_method e cobra off-session via cron.
--   PIX (SyncPay): sem débito automático → cron gera cobrança e notifica.
-- Cobre: subscription | category_subscription | establishment_plan | tag_monthly
-- ============================================================

alter table public.profiles add column if not exists stripe_customer_id text;

create table if not exists public.recurring_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('subscription','category_subscription','establishment_plan','tag_monthly')),
  ref_id text,
  ref_meta jsonb not null default '{}'::jsonb,
  amount_cents int not null,
  method text not null check (method in ('card','pix')),
  gateway text not null check (gateway in ('stripe','syncpay','mock')),
  stripe_customer_id text,
  stripe_payment_method_id text,
  status text not null default 'active' check (status in ('active','past_due','canceled')),
  current_period_end timestamptz not null,
  next_charge_at timestamptz not null,
  cancel_at_period_end boolean not null default false,
  retries int not null default 0,
  last_payment_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists recurring_sub_uniq on public.recurring_subscriptions (user_id, kind);
create index if not exists recurring_sub_due_idx on public.recurring_subscriptions (status, cancel_at_period_end, next_charge_at);

alter table public.recurring_subscriptions enable row level security;

drop policy if exists "recurring_select_own" on public.recurring_subscriptions;
create policy "recurring_select_own" on public.recurring_subscriptions for select
  using (user_id = auth.uid());

-- escrita só via service role (cron/fulfillment).

drop trigger if exists set_updated_at_recurring on public.recurring_subscriptions;
create trigger set_updated_at_recurring before update on public.recurring_subscriptions
  for each row execute function public.set_updated_at();
