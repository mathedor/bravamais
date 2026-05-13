-- ============================================================
-- BRAVA+ — Sprint 5: Onboarding lojista (wizard) + estrutura plano lojista
-- ============================================================

-- =========================================================
-- 1) establishments: onboarding tracking + plan features
-- =========================================================
alter table public.establishments add column if not exists onboarding jsonb not null default '{
  "profile_complete": false,
  "first_coupon": false,
  "loyalty_setup": false,
  "first_story": false,
  "first_visit_scanned": false,
  "completed_at": null
}'::jsonb;

-- Auto-mark profile_complete quando logo + cover + descrição existem
-- (será refletido server-side; aqui só garantimos default)

-- =========================================================
-- 2) establishment_plans: catálogo dos planos lojista
-- =========================================================
create table if not exists public.establishment_plans_catalog (
  tier establishment_plan_tier primary key,
  name text not null,
  monthly_cents int not null,
  yearly_cents int,
  features jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  is_active boolean not null default true
);

alter table public.establishment_plans_catalog enable row level security;
drop policy if exists "estab_plans_select" on public.establishment_plans_catalog;
create policy "estab_plans_select" on public.establishment_plans_catalog for select using (true);

drop policy if exists "estab_plans_admin_write" on public.establishment_plans_catalog;
create policy "estab_plans_admin_write" on public.establishment_plans_catalog for all
  using (public.is_admin()) with check (public.is_admin());

insert into public.establishment_plans_catalog (tier, name, monthly_cents, yearly_cents, features, display_order) values
  ('basico', 'Lojista Básico', 0, 0,
   '{"bullets":["Página completa no clube","Cupons + fidelidade básicos","CRM simples","Saques manuais"],"limits":{"blasts_per_month":4,"coupons_active":10,"stories_per_day":3}}'::jsonb, 1),
  ('pro', 'Lojista PRO', 9990, 99900,
   '{"bullets":["Tudo do básico","Promo flash ilimitada","Painel de receita BI","Cupom personalizado pra top clientes","Roleta da sorte","Embaixadores"],"limits":{"blasts_per_month":-1,"coupons_active":-1,"stories_per_day":-1}}'::jsonb, 2),
  ('enterprise', 'Lojista Enterprise', 29990, 299900,
   '{"bullets":["Tudo do PRO","Slot destaque grátis no topo da categoria","Múltiplas filiais","Suporte prioritário","API e webhooks","Onboarding white-glove"],"limits":{"blasts_per_month":-1,"coupons_active":-1,"stories_per_day":-1}}'::jsonb, 3)
on conflict (tier) do update set
  name = excluded.name,
  monthly_cents = excluded.monthly_cents,
  yearly_cents = excluded.yearly_cents,
  features = excluded.features,
  display_order = excluded.display_order;

-- =========================================================
-- 3) establishment_subscriptions: assinaturas reais do lojista
-- (separado de subscriptions de user pra evitar mistura)
-- =========================================================
create table if not exists public.establishment_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null unique references public.establishments(id) on delete cascade,
  tier establishment_plan_tier not null default 'basico',
  status text not null default 'active', -- active, trial, past_due, canceled
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end boolean not null default false,
  efi_subscription_id text,
  efi_customer_id text,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.establishment_subscriptions enable row level security;

drop policy if exists "estab_sub_select" on public.establishment_subscriptions;
create policy "estab_sub_select" on public.establishment_subscriptions for select
  using (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "estab_sub_write" on public.establishment_subscriptions;
create policy "estab_sub_write" on public.establishment_subscriptions for all
  using (public.is_admin()) with check (public.is_admin());

-- Backfill: cria registro 'basico' active pra todo estabelecimento existente
insert into public.establishment_subscriptions (establishment_id, tier, status)
select e.id, 'basico'::establishment_plan_tier, 'active'
from public.establishments e
where not exists (select 1 from public.establishment_subscriptions es where es.establishment_id = e.id);

-- Trigger: novo estabelecimento = subscription basico active
create or replace function public.handle_new_establishment()
returns trigger language plpgsql security definer as $$
begin
  insert into public.establishment_subscriptions (establishment_id, tier, status)
  values (new.id, 'basico', 'active')
  on conflict (establishment_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_establishment_created on public.establishments;
create trigger on_establishment_created
  after insert on public.establishments
  for each row execute function public.handle_new_establishment();

drop trigger if exists set_updated_at_estab_sub on public.establishment_subscriptions;
create trigger set_updated_at_estab_sub before update on public.establishment_subscriptions
  for each row execute function public.set_updated_at();
