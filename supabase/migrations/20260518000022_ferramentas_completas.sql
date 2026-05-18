-- ============================================================
-- SPRINT FERRAMENTAS — usuário (11) + lojista (13) + admin/CRUD
-- ============================================================
-- USUÁRIO:
--  1. BRAVA Wallet (pré-pagamento com bônus)
--  2. Modo Grupo (group_outings)
--  3. Vou aí agora (arrival_intents)
--  4. Recomendação por momento (recommendation_events)
--  5. Stories de amigos (friendships)
--  6. Notas privadas (private_notes)
--  7. Badges de explorador (badges + user_badges)
--  8. Birthday squad bonus (birthday_squad_grants)
--  9. Cupom-presente pessoal (personal_coupon_gifts)
-- 10. Lista de espera digital (waitlist)
-- 11. Reativação ativa de churn (já tem churn_radar — adiciona reactivation_offers)
--
-- LOJISTA:
--  1. Pedido na mesa via QR (mesa_qr + mesa_orders)
--  2. Comparativo anônimo da região (vw_estab_regional_benchmarks)
--  3. Parceria com vizinho (partnership_suggestions + partnerships)
--  4. A/B test de cupom (coupon_ab_tests + variants)
--  5. Recibo digital com cross-sell (cross_sell_rules)
--  6. Cliente VIP detectado (vip_flags na carteirinha — calculado)
--  7. Calendário de promo (promo_calendar_events)
--  8. Auto-resposta de chat (chat_auto_replies)
--  9. Sazonalidade automática (seasonal_templates)
-- 10. TV pra cozinha (apenas página nova, sem tabela)
-- 11. Inventário em vitrine (já tem stock — só usa)
-- 12. Treinamento in-app (training_videos + user_training_progress)
-- 13. Backup auto CFO (cfo_backup_subscriptions)
-- ============================================================

-- ============================================================
-- 1) BRAVA Wallet (pré-pagamento com bônus)
-- ============================================================
create table if not exists public.wallet_balances (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance_cents bigint not null default 0 check (balance_cents >= 0),
  total_deposited_cents bigint not null default 0,
  total_spent_cents bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.wallet_balances enable row level security;
drop policy if exists "wallet_owner_select" on public.wallet_balances;
create policy "wallet_owner_select" on public.wallet_balances for select
  using (user_id = auth.uid() or public.is_admin());

create table if not exists public.wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('deposit', 'bonus', 'spend', 'refund', 'expiry')),
  amount_cents bigint not null,
  description text,
  reference_id uuid,
  bonus_pack_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists wallet_txn_user_idx on public.wallet_transactions (user_id, created_at desc);

alter table public.wallet_transactions enable row level security;
drop policy if exists "wallet_txn_owner_select" on public.wallet_transactions;
create policy "wallet_txn_owner_select" on public.wallet_transactions for select
  using (user_id = auth.uid() or public.is_admin());

-- Packs configuráveis pelo admin: "deposita X, ganha Y"
create table if not exists public.wallet_bonus_packs (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  deposit_cents bigint not null,
  bonus_cents bigint not null,
  is_active boolean not null default true,
  display_order int not null default 100,
  created_at timestamptz not null default now()
);

alter table public.wallet_bonus_packs enable row level security;
drop policy if exists "wallet_packs_public_select" on public.wallet_bonus_packs;
create policy "wallet_packs_public_select" on public.wallet_bonus_packs for select using (is_active or public.is_admin());
drop policy if exists "wallet_packs_admin_write" on public.wallet_bonus_packs;
create policy "wallet_packs_admin_write" on public.wallet_bonus_packs for all using (public.is_admin()) with check (public.is_admin());

-- Default packs
insert into public.wallet_bonus_packs (label, deposit_cents, bonus_cents, display_order)
values
  ('R$ 100 + R$ 10 bônus (10%)', 10000, 1000, 1),
  ('R$ 300 + R$ 50 bônus (~16%)', 30000, 5000, 2),
  ('R$ 500 + R$ 100 bônus (20%)', 50000, 10000, 3),
  ('R$ 1000 + R$ 250 bônus (25%)', 100000, 25000, 4)
on conflict do nothing;

-- ============================================================
-- 2) Modo Grupo (group_outings)
-- ============================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'outing_status') then
    create type public.outing_status as enum ('planejando', 'confirmado', 'em_andamento', 'concluido', 'cancelado');
  end if;
end $$;

create table if not exists public.group_outings (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid references public.establishments(id) on delete set null,
  title text not null,
  description text,
  planned_at timestamptz,
  max_members int default 10,
  status public.outing_status not null default 'planejando',
  shared_coupon_id uuid references public.coupons(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists outings_organizer_idx on public.group_outings (organizer_id, planned_at desc);
create index if not exists outings_estab_idx on public.group_outings (establishment_id, planned_at desc);

alter table public.group_outings enable row level security;
drop policy if exists "outings_visible" on public.group_outings;
create policy "outings_visible" on public.group_outings for select using (
  organizer_id = auth.uid()
  or exists (select 1 from public.group_outing_members m where m.outing_id = id and m.user_id = auth.uid())
  or public.is_admin()
);
drop policy if exists "outings_organizer_write" on public.group_outings;
create policy "outings_organizer_write" on public.group_outings for all
  using (organizer_id = auth.uid() or public.is_admin())
  with check (organizer_id = auth.uid() or public.is_admin());

create table if not exists public.group_outing_members (
  outing_id uuid not null references public.group_outings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  arrived boolean not null default false,
  primary key (outing_id, user_id)
);

alter table public.group_outing_members enable row level security;
drop policy if exists "outing_members_visible" on public.group_outing_members;
create policy "outing_members_visible" on public.group_outing_members for select using (
  user_id = auth.uid()
  or exists (select 1 from public.group_outings o where o.id = outing_id and o.organizer_id = auth.uid())
  or public.is_admin()
);
drop policy if exists "outing_members_join" on public.group_outing_members;
create policy "outing_members_join" on public.group_outing_members for insert with check (user_id = auth.uid());

-- ============================================================
-- 3) Vou aí agora (arrival_intents)
-- ============================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'arrival_status') then
    create type public.arrival_status as enum ('a_caminho', 'chegou', 'cancelado');
  end if;
end $$;

create table if not exists public.arrival_intents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  declared_at timestamptz not null default now(),
  eta_minutes int not null default 15 check (eta_minutes between 5 and 90),
  status public.arrival_status not null default 'a_caminho',
  courtesy_message text,
  courtesy_offered_at timestamptz,
  arrived_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists arrival_user_idx on public.arrival_intents (user_id, created_at desc);
create index if not exists arrival_estab_idx on public.arrival_intents (establishment_id, declared_at desc) where status = 'a_caminho';

alter table public.arrival_intents enable row level security;
drop policy if exists "arrival_visible" on public.arrival_intents;
create policy "arrival_visible" on public.arrival_intents for select using (
  user_id = auth.uid()
  or public.owns_establishment(establishment_id)
  or public.is_admin()
);
drop policy if exists "arrival_user_insert" on public.arrival_intents;
create policy "arrival_user_insert" on public.arrival_intents for insert with check (user_id = auth.uid());
drop policy if exists "arrival_lojista_update" on public.arrival_intents;
create policy "arrival_lojista_update" on public.arrival_intents for update using (
  public.owns_establishment(establishment_id) or user_id = auth.uid() or public.is_admin()
);

-- Regras de cortesia por lojista ("a partir do Xº intent recebe Y")
create table if not exists public.arrival_courtesy_rules (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  min_eta_minutes int not null default 15,
  tier_required public.subscription_tier,
  courtesy_text text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists arrival_rules_estab_idx on public.arrival_courtesy_rules (establishment_id, is_active);

alter table public.arrival_courtesy_rules enable row level security;
drop policy if exists "arrival_rules_public" on public.arrival_courtesy_rules;
create policy "arrival_rules_public" on public.arrival_courtesy_rules for select using (is_active or public.owns_establishment(establishment_id) or public.is_admin());
drop policy if exists "arrival_rules_lojista_write" on public.arrival_courtesy_rules;
create policy "arrival_rules_lojista_write" on public.arrival_courtesy_rules for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- ============================================================
-- 4) Recomendação por momento (engine simples + log)
-- ============================================================
create table if not exists public.recommendation_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid references public.establishments(id) on delete cascade,
  reason text,
  context jsonb,
  clicked boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists recs_user_idx on public.recommendation_events (user_id, created_at desc);

alter table public.recommendation_events enable row level security;
drop policy if exists "recs_owner" on public.recommendation_events;
create policy "recs_owner" on public.recommendation_events for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ============================================================
-- 5) Stories de amigos (friendships)
-- ============================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'friendship_status') then
    create type public.friendship_status as enum ('pending', 'accepted', 'blocked');
  end if;
end $$;

create table if not exists public.friendships (
  id uuid primary key default uuid_generate_v4(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  status public.friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (user_a, user_b),
  check (user_a < user_b)
);

alter table public.friendships enable row level security;
drop policy if exists "friendships_owner" on public.friendships;
create policy "friendships_owner" on public.friendships for all using (
  user_a = auth.uid() or user_b = auth.uid() or public.is_admin()
);

-- ============================================================
-- 6) Notas privadas (private_notes)
-- ============================================================
create table if not exists public.private_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notes_owner_idx on public.private_notes (user_id, establishment_id);

alter table public.private_notes enable row level security;
drop policy if exists "notes_owner" on public.private_notes;
create policy "notes_owner" on public.private_notes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop trigger if exists notes_updated_trg on public.private_notes;
create trigger notes_updated_trg before update on public.private_notes for each row execute function public.set_updated_at();

-- ============================================================
-- 7) Badges de explorador
-- ============================================================
create table if not exists public.badges (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  label text not null,
  description text,
  icon text default '🏆',
  rule_kind text not null check (rule_kind in ('categories', 'visits', 'cities', 'estabs', 'streak_days')),
  rule_value int not null,
  coins_reward int not null default 50,
  is_active boolean not null default true,
  display_order int not null default 100,
  created_at timestamptz not null default now()
);

alter table public.badges enable row level security;
drop policy if exists "badges_public" on public.badges;
create policy "badges_public" on public.badges for select using (is_active or public.is_admin());
drop policy if exists "badges_admin_write" on public.badges;
create policy "badges_admin_write" on public.badges for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  progress int not null default 0,
  primary key (user_id, badge_id)
);

alter table public.user_badges enable row level security;
drop policy if exists "user_badges_owner" on public.user_badges;
create policy "user_badges_owner" on public.user_badges for select using (user_id = auth.uid() or public.is_admin());

-- Seed badges padrão
insert into public.badges (slug, label, description, icon, rule_kind, rule_value, coins_reward, display_order)
values
  ('explorador-iniciante', 'Explorador Iniciante', 'Visite 3 estabelecimentos diferentes', '🥉', 'estabs', 3, 50, 1),
  ('explorador-curioso', 'Explorador Curioso', 'Visite 10 estabelecimentos diferentes', '🥈', 'estabs', 10, 100, 2),
  ('explorador-mestre', 'Mestre Explorador', 'Visite 30 estabelecimentos diferentes', '🥇', 'estabs', 30, 250, 3),
  ('eclético', 'Eclético', 'Visite 5 categorias diferentes', '🎨', 'categories', 5, 100, 4),
  ('frequentador', 'Frequentador Fiel', 'Faça 50 visitas no total', '⭐', 'visits', 50, 200, 5),
  ('viajante', 'Viajante', 'Faça check-in em 3 cidades diferentes', '🌎', 'cities', 3, 150, 6)
on conflict (slug) do nothing;

-- ============================================================
-- 8) Birthday squad bonus
-- ============================================================
create table if not exists public.birthday_squad_grants (
  id uuid primary key default uuid_generate_v4(),
  birthday_user_id uuid not null references public.profiles(id) on delete cascade,
  guest_user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  coins_awarded int not null default 30,
  granted_at timestamptz not null default now()
);
create index if not exists bsg_birthday_idx on public.birthday_squad_grants (birthday_user_id);
create index if not exists bsg_guest_idx on public.birthday_squad_grants (guest_user_id);

alter table public.birthday_squad_grants enable row level security;
drop policy if exists "bsg_visible" on public.birthday_squad_grants;
create policy "bsg_visible" on public.birthday_squad_grants for select using (
  birthday_user_id = auth.uid() or guest_user_id = auth.uid() or public.is_admin()
);

-- ============================================================
-- 9) Cupom-presente pessoal
-- ============================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'personal_gift_status') then
    create type public.personal_gift_status as enum ('pendente', 'aceito', 'usado', 'expirado');
  end if;
end $$;

create table if not exists public.personal_coupon_gifts (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  recipient_hint text,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  discount_kind text not null check (discount_kind in ('percent', 'fixed')),
  discount_value numeric(12,2) not null,
  message text,
  share_token text not null unique default replace(uuid_generate_v4()::text, '-', ''),
  status public.personal_gift_status not null default 'pendente',
  redeemed_at timestamptz,
  used_at timestamptz,
  expires_at timestamptz not null default (now() + interval '60 days'),
  created_at timestamptz not null default now()
);
create index if not exists pcg_sender_idx on public.personal_coupon_gifts (sender_id, created_at desc);
create index if not exists pcg_recipient_idx on public.personal_coupon_gifts (recipient_id, created_at desc);
create index if not exists pcg_estab_idx on public.personal_coupon_gifts (establishment_id);

alter table public.personal_coupon_gifts enable row level security;
drop policy if exists "pcg_visible" on public.personal_coupon_gifts;
create policy "pcg_visible" on public.personal_coupon_gifts for select using (
  sender_id = auth.uid() or recipient_id = auth.uid()
  or public.owns_establishment(establishment_id) or public.is_admin()
);
drop policy if exists "pcg_sender_insert" on public.personal_coupon_gifts;
create policy "pcg_sender_insert" on public.personal_coupon_gifts for insert with check (sender_id = auth.uid());

-- ============================================================
-- 10) Lista de espera digital (waitlist)
-- ============================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'waitlist_status') then
    create type public.waitlist_status as enum ('aguardando', 'chamado', 'sentado', 'desistiu');
  end if;
end $$;

create table if not exists public.waitlist_entries (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  guest_name text,
  guest_phone text,
  party_size int not null default 2 check (party_size between 1 and 30),
  joined_at timestamptz not null default now(),
  called_at timestamptz,
  seated_at timestamptz,
  status public.waitlist_status not null default 'aguardando',
  position int,
  notes text
);
create index if not exists waitlist_estab_idx on public.waitlist_entries (establishment_id, status, joined_at);

alter table public.waitlist_entries enable row level security;
drop policy if exists "waitlist_visible" on public.waitlist_entries;
create policy "waitlist_visible" on public.waitlist_entries for select using (
  user_id = auth.uid() or public.owns_establishment(establishment_id) or public.is_admin()
);
drop policy if exists "waitlist_join" on public.waitlist_entries;
create policy "waitlist_join" on public.waitlist_entries for insert with check (true);
drop policy if exists "waitlist_lojista_update" on public.waitlist_entries;
create policy "waitlist_lojista_update" on public.waitlist_entries for update using (
  public.owns_establishment(establishment_id) or user_id = auth.uid() or public.is_admin()
);

-- ============================================================
-- 11) Reativação ativa (reactivation_offers)
-- ============================================================
create table if not exists public.reactivation_offers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  offer_kind text not null,
  offer_payload jsonb,
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  redeemed_at timestamptz
);
create index if not exists react_user_idx on public.reactivation_offers (user_id, sent_at desc);

alter table public.reactivation_offers enable row level security;
drop policy if exists "react_visible" on public.reactivation_offers;
create policy "react_visible" on public.reactivation_offers for select using (user_id = auth.uid() or public.is_admin());

-- ============================================================
-- LOJISTA — features
-- ============================================================

-- 1) Mesa QR
create table if not exists public.mesa_qr (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  label text not null,
  token text not null unique default replace(uuid_generate_v4()::text, '-', ''),
  capacity int default 4,
  is_active boolean not null default true,
  scans int not null default 0,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists mesa_estab_idx on public.mesa_qr (establishment_id, is_active);

alter table public.mesa_qr enable row level security;
drop policy if exists "mesa_public_select" on public.mesa_qr;
create policy "mesa_public_select" on public.mesa_qr for select using (true);
drop policy if exists "mesa_lojista_write" on public.mesa_qr;
create policy "mesa_lojista_write" on public.mesa_qr for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- Tabela mesa_orders separa pedidos via mesa (vs delivery/retirada normais em orders)
-- Pra simplicidade, marcamos uma coluna em orders quando disponível
alter table public.orders add column if not exists mesa_token text;
create index if not exists orders_mesa_idx on public.orders (mesa_token) where mesa_token is not null;

-- 2) Comparativo regional (view com benchmarks anônimos)
create or replace view public.estab_regional_benchmarks as
select
  e.category_id,
  e.city,
  count(*) as estab_count,
  avg(coalesce(stats.orders_count, 0)) as avg_orders_per_estab,
  avg(coalesce(stats.revenue_cents, 0)) as avg_revenue_cents,
  avg(coalesce(stats.coupons_redeemed, 0)) as avg_coupons,
  avg(coalesce(stats.visits_count, 0)) as avg_visits
from public.establishment_categories ec
join public.establishments e on e.id = ec.establishment_id
left join lateral (
  select
    (select count(*) from public.orders o where o.establishment_id = e.id and o.status in ('paid','completed') and o.created_at > now() - interval '30 days') as orders_count,
    (select coalesce(sum(total_cents), 0) from public.orders o where o.establishment_id = e.id and o.status in ('paid','completed') and o.created_at > now() - interval '30 days') as revenue_cents,
    (select count(*) from public.coupon_redemptions cr where cr.establishment_id = e.id and cr.created_at > now() - interval '30 days') as coupons_redeemed,
    (select count(*) from public.visits v where v.establishment_id = e.id and v.created_at > now() - interval '30 days') as visits_count
) stats on true
where e.is_active = true
group by e.category_id, e.city;

-- 3) Parcerias entre lojistas
do $$ begin
  if not exists (select 1 from pg_type where typname = 'partnership_status') then
    create type public.partnership_status as enum ('sugerida', 'proposta', 'aceita', 'recusada', 'ativa', 'pausada');
  end if;
end $$;

create table if not exists public.partnerships (
  id uuid primary key default uuid_generate_v4(),
  estab_a uuid not null references public.establishments(id) on delete cascade,
  estab_b uuid not null references public.establishments(id) on delete cascade,
  status public.partnership_status not null default 'sugerida',
  reason text,
  combo_label text,
  combo_price_cents bigint,
  split_percent_a numeric(5,2) default 50,
  split_percent_b numeric(5,2) default 50,
  proposed_by uuid references public.establishments(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check (estab_a < estab_b)
);
create index if not exists partner_a_idx on public.partnerships (estab_a, status);
create index if not exists partner_b_idx on public.partnerships (estab_b, status);

alter table public.partnerships enable row level security;
drop policy if exists "partnerships_visible" on public.partnerships;
create policy "partnerships_visible" on public.partnerships for select using (
  public.owns_establishment(estab_a) or public.owns_establishment(estab_b) or public.is_admin()
);
drop policy if exists "partnerships_member_write" on public.partnerships;
create policy "partnerships_member_write" on public.partnerships for all using (
  public.owns_establishment(estab_a) or public.owns_establishment(estab_b) or public.is_admin()
);

-- 4) A/B test de cupom
do $$ begin
  if not exists (select 1 from pg_type where typname = 'ab_test_status') then
    create type public.ab_test_status as enum ('rascunho', 'rodando', 'concluido', 'cancelado');
  end if;
end $$;

create table if not exists public.coupon_ab_tests (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  hypothesis text not null,
  variant_a_label text not null,
  variant_a_discount_kind text not null,
  variant_a_discount_value numeric(12,2) not null,
  variant_b_label text not null,
  variant_b_discount_kind text not null,
  variant_b_discount_value numeric(12,2) not null,
  audience_size int not null default 100,
  audience_a_count int default 0,
  audience_b_count int default 0,
  variant_a_redeemed int default 0,
  variant_b_redeemed int default 0,
  variant_a_revenue_cents bigint default 0,
  variant_b_revenue_cents bigint default 0,
  status public.ab_test_status not null default 'rascunho',
  started_at timestamptz,
  ended_at timestamptz,
  winner text,
  created_at timestamptz not null default now()
);
create index if not exists ab_estab_idx on public.coupon_ab_tests (establishment_id, created_at desc);

alter table public.coupon_ab_tests enable row level security;
drop policy if exists "ab_visible" on public.coupon_ab_tests;
create policy "ab_visible" on public.coupon_ab_tests for select using (
  public.owns_establishment(establishment_id) or public.is_admin()
);
drop policy if exists "ab_write" on public.coupon_ab_tests;
create policy "ab_write" on public.coupon_ab_tests for all using (
  public.owns_establishment(establishment_id) or public.is_admin()
);

-- 5) Cross-sell pós-pagamento
create table if not exists public.cross_sell_rules (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  trigger_product_id uuid references public.products(id) on delete cascade,
  offer_label text not null,
  discount_kind text not null check (discount_kind in ('percent', 'fixed')),
  discount_value numeric(12,2) not null,
  valid_hours int not null default 24,
  is_active boolean not null default true,
  shown_count int default 0,
  redeemed_count int default 0,
  created_at timestamptz not null default now()
);

alter table public.cross_sell_rules enable row level security;
drop policy if exists "cs_visible" on public.cross_sell_rules;
create policy "cs_visible" on public.cross_sell_rules for select using (is_active or public.owns_establishment(establishment_id) or public.is_admin());
drop policy if exists "cs_lojista_write" on public.cross_sell_rules;
create policy "cs_lojista_write" on public.cross_sell_rules for all using (
  public.owns_establishment(establishment_id) or public.is_admin()
);

-- 6) Cliente VIP detectado — usa coluna em profiles (calculado)
alter table public.profiles add column if not exists is_vip_calculated boolean not null default false;
alter table public.profiles add column if not exists vip_calculated_at timestamptz;

-- 7) Calendário de promo (eventos agendados)
create table if not exists public.promo_calendar_events (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  kind text not null check (kind in ('coupon', 'blast', 'roleta', 'fidelidade', 'sazonal', 'outro')),
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  payload jsonb,
  status text not null default 'agendado',
  created_at timestamptz not null default now()
);
create index if not exists promo_cal_estab_idx on public.promo_calendar_events (establishment_id, scheduled_at);

alter table public.promo_calendar_events enable row level security;
drop policy if exists "promo_cal_visible" on public.promo_calendar_events;
create policy "promo_cal_visible" on public.promo_calendar_events for select using (
  public.owns_establishment(establishment_id) or public.is_admin()
);
drop policy if exists "promo_cal_write" on public.promo_calendar_events;
create policy "promo_cal_write" on public.promo_calendar_events for all using (
  public.owns_establishment(establishment_id) or public.is_admin()
);

-- 8) Auto-resposta de chat (bot simples)
create table if not exists public.chat_auto_replies (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  trigger_pattern text not null,
  reply_text text not null,
  is_active boolean not null default true,
  fired_count int default 0,
  created_at timestamptz not null default now()
);
create index if not exists car_estab_idx on public.chat_auto_replies (establishment_id, is_active);

alter table public.chat_auto_replies enable row level security;
drop policy if exists "car_visible" on public.chat_auto_replies;
create policy "car_visible" on public.chat_auto_replies for select using (
  public.owns_establishment(establishment_id) or public.is_admin()
);
drop policy if exists "car_write" on public.chat_auto_replies;
create policy "car_write" on public.chat_auto_replies for all using (
  public.owns_establishment(establishment_id) or public.is_admin()
);

-- 9) Sazonalidade automática (templates)
create table if not exists public.seasonal_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  month_start int not null check (month_start between 1 and 12),
  month_end int not null check (month_end between 1 and 12),
  suggested_discount_percent numeric(5,2),
  suggested_title text,
  icon text default '🎉',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.seasonal_templates enable row level security;
drop policy if exists "season_public" on public.seasonal_templates;
create policy "season_public" on public.seasonal_templates for select using (is_active or public.is_admin());
drop policy if exists "season_admin_write" on public.seasonal_templates;
create policy "season_admin_write" on public.seasonal_templates for all using (public.is_admin()) with check (public.is_admin());

insert into public.seasonal_templates (name, description, month_start, month_end, suggested_discount_percent, suggested_title, icon) values
  ('Festa Junina', 'Cupom temático junho', 6, 6, 20, '20% off — comemore o São João', '🎆'),
  ('Black Friday', 'Mega promo novembro', 11, 11, 40, '40% off Black Friday BRAVA+', '🛒'),
  ('Natal', 'Ofertas de Natal', 12, 12, 15, 'Especial Natal — 15% off', '🎄'),
  ('Volta às Aulas', 'Fevereiro', 2, 2, 15, '15% off Volta às Aulas', '🎒'),
  ('Dia das Mães', 'Maio', 5, 5, 20, '20% off Dia das Mães', '🌷'),
  ('Dia dos Pais', 'Agosto', 8, 8, 20, '20% off Dia dos Pais', '👔')
on conflict do nothing;

-- 10) Treinamento in-app
create table if not exists public.training_videos (
  id uuid primary key default uuid_generate_v4(),
  audience text not null check (audience in ('usuario', 'lojista', 'entregador', 'comercial', 'admin')),
  title text not null,
  description text,
  video_url text,
  duration_seconds int,
  topic text,
  display_order int default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.training_videos enable row level security;
drop policy if exists "training_public" on public.training_videos;
create policy "training_public" on public.training_videos for select using (is_active or public.is_admin());
drop policy if exists "training_admin_write" on public.training_videos;
create policy "training_admin_write" on public.training_videos for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.user_training_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.training_videos(id) on delete cascade,
  watched_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

alter table public.user_training_progress enable row level security;
drop policy if exists "training_progress_owner" on public.user_training_progress;
create policy "training_progress_owner" on public.user_training_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 11) CFO backup (assinatura de email semanal)
create table if not exists public.cfo_backup_subscriptions (
  establishment_id uuid primary key references public.establishments(id) on delete cascade,
  email text not null,
  frequency text not null default 'weekly' check (frequency in ('weekly', 'monthly')),
  last_sent_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cfo_backup_subscriptions enable row level security;
drop policy if exists "cfo_visible" on public.cfo_backup_subscriptions;
create policy "cfo_visible" on public.cfo_backup_subscriptions for select using (
  public.owns_establishment(establishment_id) or public.is_admin()
);
drop policy if exists "cfo_write" on public.cfo_backup_subscriptions;
create policy "cfo_write" on public.cfo_backup_subscriptions for all using (
  public.owns_establishment(establishment_id) or public.is_admin()
);

-- ============================================================
-- RPCs auxiliares pra dashboards
-- ============================================================

-- Wallet do user
create or replace function public.wallet_summary(p_user_id uuid)
returns table (
  balance_cents bigint,
  total_deposited_cents bigint,
  total_spent_cents bigint,
  recent_txns_count int
)
language sql stable security definer as $$
  select
    coalesce(wb.balance_cents, 0),
    coalesce(wb.total_deposited_cents, 0),
    coalesce(wb.total_spent_cents, 0),
    (select count(*)::int from public.wallet_transactions where user_id = p_user_id and created_at > now() - interval '30 days')
  from public.wallet_balances wb
  where wb.user_id = p_user_id
  union all
  select 0::bigint, 0::bigint, 0::bigint, 0
  where not exists (select 1 from public.wallet_balances where user_id = p_user_id)
  limit 1;
$$;

-- KPIs do lojista pra novas ferramentas
create or replace function public.lojista_tools_kpis(p_estab_id uuid)
returns table (
  mesa_orders_today int,
  arrivals_pending int,
  partnerships_active int,
  ab_tests_running int,
  promo_events_upcoming int,
  cross_sell_offers_active int,
  waitlist_count int
)
language sql stable security definer as $$
  select
    (select count(*)::int from public.orders where establishment_id = p_estab_id and mesa_token is not null and created_at::date = current_date),
    (select count(*)::int from public.arrival_intents where establishment_id = p_estab_id and status = 'a_caminho'),
    (select count(*)::int from public.partnerships where (estab_a = p_estab_id or estab_b = p_estab_id) and status in ('ativa', 'aceita')),
    (select count(*)::int from public.coupon_ab_tests where establishment_id = p_estab_id and status = 'rodando'),
    (select count(*)::int from public.promo_calendar_events where establishment_id = p_estab_id and scheduled_at > now() and scheduled_at < now() + interval '30 days'),
    (select count(*)::int from public.cross_sell_rules where establishment_id = p_estab_id and is_active = true),
    (select count(*)::int from public.waitlist_entries where establishment_id = p_estab_id and status in ('aguardando','chamado'));
$$;

-- Admin tools KPIs
create or replace function public.admin_tools_kpis()
returns table (
  wallet_total_cents bigint,
  wallet_active_users int,
  outings_active int,
  arrivals_today int,
  badges_earned_30d int,
  mesa_qr_total int,
  partnerships_active int,
  ab_tests_running int,
  cross_sell_offers int,
  waitlist_active int
)
language sql stable security definer as $$
  select
    (select coalesce(sum(balance_cents), 0)::bigint from public.wallet_balances),
    (select count(*)::int from public.wallet_balances where balance_cents > 0),
    (select count(*)::int from public.group_outings where status in ('planejando','confirmado','em_andamento')),
    (select count(*)::int from public.arrival_intents where declared_at::date = current_date),
    (select count(*)::int from public.user_badges where earned_at > now() - interval '30 days'),
    (select count(*)::int from public.mesa_qr where is_active = true),
    (select count(*)::int from public.partnerships where status in ('ativa','aceita')),
    (select count(*)::int from public.coupon_ab_tests where status = 'rodando'),
    (select count(*)::int from public.cross_sell_rules where is_active = true),
    (select count(*)::int from public.waitlist_entries where status in ('aguardando','chamado'));
$$;
