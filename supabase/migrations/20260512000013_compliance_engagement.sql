-- ============================================================
-- BRAVA+ — Sprint 8: LGPD/Termos + Denúncia + Tier badges + Notif timeline
-- ============================================================

-- =========================================================
-- 1) profiles: aceite de termos + flag de onboarding feito
-- =========================================================
alter table public.profiles add column if not exists terms_accepted_at timestamptz;
alter table public.profiles add column if not exists terms_version int;
alter table public.profiles add column if not exists onboarded_at timestamptz;

-- =========================================================
-- 2) deletion_requests — LGPD direito de remoção
-- =========================================================
create table if not exists public.deletion_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  reason text,
  scheduled_for timestamptz not null default (now() + interval '7 days'),
  cancelled_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists deletion_req_scheduled_idx
  on public.deletion_requests (scheduled_for) where processed_at is null and cancelled_at is null;

alter table public.deletion_requests enable row level security;

drop policy if exists "deletion_select_own" on public.deletion_requests;
create policy "deletion_select_own" on public.deletion_requests for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "deletion_insert_own" on public.deletion_requests;
create policy "deletion_insert_own" on public.deletion_requests for insert
  with check (user_id = auth.uid());

drop policy if exists "deletion_update_own" on public.deletion_requests;
create policy "deletion_update_own" on public.deletion_requests for update
  using (user_id = auth.uid() or public.is_admin());

-- =========================================================
-- 3) reports — denúncias de story/estab/review
-- =========================================================
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null, -- 'story','establishment','review','message'
  target_id uuid not null,
  reason text not null,
  detail text,
  status text not null default 'open', -- open, resolved, dismissed
  resolved_by_admin_user_id uuid references public.profiles(id),
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status, created_at desc);
create index if not exists reports_target_idx on public.reports (target_type, target_id);

alter table public.reports enable row level security;

drop policy if exists "reports_select" on public.reports;
create policy "reports_select" on public.reports for select
  using (reporter_user_id = auth.uid() or public.is_admin());

drop policy if exists "reports_insert" on public.reports;
create policy "reports_insert" on public.reports for insert
  with check (reporter_user_id = auth.uid());

drop policy if exists "reports_update_admin" on public.reports;
create policy "reports_update_admin" on public.reports for update using (public.is_admin());

-- =========================================================
-- 4) View: user_stats — pra calcular tier badge (bronze/prata/ouro/diamante)
-- =========================================================
create or replace view public.user_stats as
select
  p.id as user_id,
  coalesce((select count(*) from public.visits v where v.user_id = p.id),0)::int as total_visits,
  coalesce((select count(*) from public.coupon_redemptions cr where cr.user_id = p.id),0)::int as total_coupons_used,
  coalesce(p.coins_balance,0) as coins_balance,
  case
    when coalesce(p.coins_balance,0) >= 1000 or coalesce((select count(*) from public.visits v where v.user_id = p.id),0) >= 50 then 'diamante'
    when coalesce(p.coins_balance,0) >= 500 or coalesce((select count(*) from public.visits v where v.user_id = p.id),0) >= 20 then 'ouro'
    when coalesce(p.coins_balance,0) >= 200 or coalesce((select count(*) from public.visits v where v.user_id = p.id),0) >= 5 then 'prata'
    else 'bronze'
  end as tier_badge
from public.profiles p
where p.role = 'subscriber';

grant select on public.user_stats to authenticated;
