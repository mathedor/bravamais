-- ============================================================
-- BRAVA+ — initial schema
-- Run this once in Supabase SQL Editor (apply against production DB)
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type user_role as enum ('subscriber','establishment','commercial','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_tier as enum ('basico','premium','vip');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('trial','active','past_due','canceled','paused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type promotion_type as enum ('cupom_desconto','vale_presente','vale_compras','clube_fidelidade','cashback');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('cart','pending_payment','paid','preparing','ready','completed','canceled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('pix','credit_card');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visit_source as enum ('qr_scan','order','manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('subscription','order','message','loyalty_reward','establishment_news','system');
exception when duplicate_object then null; end $$;

-- ============================================================
-- profiles (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'subscriber',
  full_name text,
  cpf text,
  phone text,
  avatar_url text,
  city text,
  state char(2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- categories
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  icon text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- establishments
-- ============================================================
create table if not exists public.establishments (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  logo_url text,
  cover_url text,
  photos text[] not null default '{}',
  phone text,
  whatsapp text,
  instagram text,
  website text,
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state char(2),
  lat double precision,
  lng double precision,
  location geography(point, 4326),
  is_active boolean not null default true,
  is_verified boolean not null default false,
  average_rating numeric(3,2),
  total_reviews int not null default 0,
  total_visits int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists establishments_location_idx on public.establishments using gist (location);
create index if not exists establishments_city_idx on public.establishments (city);
create index if not exists establishments_active_idx on public.establishments (is_active);

create table if not exists public.establishment_categories (
  establishment_id uuid references public.establishments(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (establishment_id, category_id)
);

create table if not exists public.establishment_promotions (
  establishment_id uuid references public.establishments(id) on delete cascade,
  promotion_type promotion_type not null,
  is_active boolean not null default true,
  primary key (establishment_id, promotion_type)
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  photos text[] not null default '{}',
  category_label text,
  stock int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_establishment_idx on public.products (establishment_id);

-- ============================================================
-- coupons
-- ============================================================
create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  code text not null,
  description text,
  discount_percent int check (discount_percent between 1 and 100),
  discount_cents int check (discount_cents > 0),
  min_subtotal_cents int default 0,
  max_uses int,
  max_uses_per_user int default 1,
  uses_count int not null default 0,
  tier_required subscription_tier,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupon_one_discount check (
    (discount_percent is not null and discount_cents is null) or
    (discount_percent is null and discount_cents is not null)
  ),
  unique (establishment_id, code)
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default uuid_generate_v4(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid,
  redeemed_at timestamptz not null default now()
);

-- ============================================================
-- gift cards
-- ============================================================
create table if not exists public.gift_cards (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  code text not null unique,
  value_cents int not null check (value_cents > 0),
  remaining_cents int not null check (remaining_cents >= 0),
  granted_to_user_id uuid references public.profiles(id),
  granted_by text,
  reason text,
  expires_at timestamptz,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- loyalty clubs
-- ============================================================
create table if not exists public.loyalty_clubs (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null,
  description text,
  visits_required int not null check (visits_required > 0),
  benefit_description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  club_id uuid not null references public.loyalty_clubs(id) on delete cascade,
  visits_count int not null default 0,
  completed_at timestamptz,
  claimed_at timestamptz,
  reset_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, club_id)
);

-- ============================================================
-- qr cards (carteirinha)
-- ============================================================
create table if not exists public.qr_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  code text not null unique,
  issued_at timestamptz not null default now(),
  rotated_at timestamptz
);

-- ============================================================
-- visits
-- ============================================================
create table if not exists public.visits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  source visit_source not null,
  order_id uuid,
  scanned_by_user_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists visits_user_idx on public.visits (user_id, created_at desc);
create index if not exists visits_establishment_idx on public.visits (establishment_id, created_at desc);

-- ============================================================
-- orders
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  establishment_id uuid not null references public.establishments(id) on delete restrict,
  status order_status not null default 'cart',
  subtotal_cents int not null default 0,
  discount_cents int not null default 0,
  total_cents int not null default 0,
  applied_coupon_id uuid references public.coupons(id),
  applied_gift_card_id uuid references public.gift_cards(id),
  payment_method payment_method,
  efi_charge_id text,
  efi_pix_qr text,
  paid_at timestamptz,
  completed_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_establishment_idx on public.orders (establishment_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty int not null check (qty > 0),
  unit_price_cents int not null check (unit_price_cents >= 0)
);

-- ============================================================
-- subscriptions (BRAVA+ — 3 tiers)
-- ============================================================
create table if not exists public.subscription_plans (
  tier subscription_tier primary key,
  name text not null,
  monthly_cents int not null,
  yearly_cents int,
  features jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  tier subscription_tier not null default 'basico',
  status subscription_status not null default 'trial',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end boolean not null default false,
  efi_subscription_id text,
  efi_customer_id text,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- chat: conversations + messages
-- ============================================================
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  last_message_at timestamptz,
  unread_by_user int not null default 0,
  unread_by_establishment int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, establishment_id)
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ============================================================
-- notifications
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc) where read_at is null;

-- ============================================================
-- access_logs (for 360 telemetry)
-- ============================================================
create table if not exists public.access_logs (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists access_logs_entity_idx on public.access_logs (entity_type, entity_id, created_at desc);

-- ============================================================
-- Helper functions
-- ============================================================
create or replace function public.current_user_role() returns user_role
language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.owns_establishment(eid uuid) returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.establishments
    where id = eid and owner_id = auth.uid()
  );
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.establishments enable row level security;
alter table public.establishment_categories enable row level security;
alter table public.establishment_promotions enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.gift_cards enable row level security;
alter table public.loyalty_clubs enable row level security;
alter table public.loyalty_progress enable row level security;
alter table public.qr_cards enable row level security;
alter table public.visits enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.access_logs enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories for select using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "establishments_select" on public.establishments;
create policy "establishments_select" on public.establishments for select
  using (is_active or owner_id = auth.uid() or public.is_admin());

drop policy if exists "establishments_insert" on public.establishments;
create policy "establishments_insert" on public.establishments for insert
  with check (owner_id = auth.uid());

drop policy if exists "establishments_update" on public.establishments;
create policy "establishments_update" on public.establishments for update
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "establishments_delete" on public.establishments;
create policy "establishments_delete" on public.establishments for delete using (public.is_admin());

drop policy if exists "estab_cat_select" on public.establishment_categories;
create policy "estab_cat_select" on public.establishment_categories for select using (true);

drop policy if exists "estab_cat_write" on public.establishment_categories;
create policy "estab_cat_write" on public.establishment_categories for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "estab_promo_select" on public.establishment_promotions;
create policy "estab_promo_select" on public.establishment_promotions for select using (true);

drop policy if exists "estab_promo_write" on public.establishment_promotions;
create policy "estab_promo_write" on public.establishment_promotions for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products for select
  using (is_active or public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "products_write" on public.products;
create policy "products_write" on public.products for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "coupons_select" on public.coupons;
create policy "coupons_select" on public.coupons for select
  using (
    (is_active and (valid_until is null or valid_until > now()))
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );

drop policy if exists "coupons_write" on public.coupons;
create policy "coupons_write" on public.coupons for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "coupon_redemptions_select" on public.coupon_redemptions;
create policy "coupon_redemptions_select" on public.coupon_redemptions for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.coupons c
      where c.id = coupon_id
      and (public.owns_establishment(c.establishment_id) or public.is_admin())
    )
  );

drop policy if exists "coupon_redemptions_insert" on public.coupon_redemptions;
create policy "coupon_redemptions_insert" on public.coupon_redemptions for insert
  with check (user_id = auth.uid());

drop policy if exists "gift_cards_select" on public.gift_cards;
create policy "gift_cards_select" on public.gift_cards for select
  using (
    granted_to_user_id = auth.uid()
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );

drop policy if exists "gift_cards_write" on public.gift_cards;
create policy "gift_cards_write" on public.gift_cards for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "loyalty_clubs_select" on public.loyalty_clubs;
create policy "loyalty_clubs_select" on public.loyalty_clubs for select
  using (is_active or public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "loyalty_clubs_write" on public.loyalty_clubs;
create policy "loyalty_clubs_write" on public.loyalty_clubs for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "loyalty_progress_select" on public.loyalty_progress;
create policy "loyalty_progress_select" on public.loyalty_progress for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.loyalty_clubs c
      where c.id = club_id
      and (public.owns_establishment(c.establishment_id) or public.is_admin())
    )
  );

drop policy if exists "loyalty_progress_insert" on public.loyalty_progress;
create policy "loyalty_progress_insert" on public.loyalty_progress for insert
  with check (user_id = auth.uid());

drop policy if exists "loyalty_progress_update" on public.loyalty_progress;
create policy "loyalty_progress_update" on public.loyalty_progress for update
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.loyalty_clubs c
      where c.id = club_id
      and (public.owns_establishment(c.establishment_id) or public.is_admin())
    )
  );

drop policy if exists "qr_cards_select" on public.qr_cards;
create policy "qr_cards_select" on public.qr_cards for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "qr_cards_insert" on public.qr_cards;
create policy "qr_cards_insert" on public.qr_cards for insert with check (user_id = auth.uid());

drop policy if exists "visits_select" on public.visits;
create policy "visits_select" on public.visits for select
  using (
    user_id = auth.uid()
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );

drop policy if exists "visits_insert" on public.visits;
create policy "visits_insert" on public.visits for insert
  with check (
    public.owns_establishment(establishment_id)
    or scanned_by_user_id = auth.uid()
    or user_id = auth.uid()
  );

drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders for select
  using (user_id = auth.uid() or public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders for insert with check (user_id = auth.uid());

drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders for update
  using (
    user_id = auth.uid()
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items for select
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
    and (o.user_id = auth.uid() or public.owns_establishment(o.establishment_id) or public.is_admin())
  ));

drop policy if exists "order_items_write" on public.order_items;
create policy "order_items_write" on public.order_items for all
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
    and (o.user_id = auth.uid() or public.owns_establishment(o.establishment_id) or public.is_admin())
  ))
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id
    and (o.user_id = auth.uid() or public.owns_establishment(o.establishment_id) or public.is_admin())
  ));

drop policy if exists "subscription_plans_select" on public.subscription_plans;
create policy "subscription_plans_select" on public.subscription_plans for select using (true);

drop policy if exists "subscription_plans_admin_write" on public.subscription_plans;
create policy "subscription_plans_admin_write" on public.subscription_plans for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subscriptions_select" on public.subscriptions;
create policy "subscriptions_select" on public.subscriptions for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "subscriptions_insert" on public.subscriptions;
create policy "subscriptions_insert" on public.subscriptions for insert with check (user_id = auth.uid());

drop policy if exists "subscriptions_update" on public.subscriptions;
create policy "subscriptions_update" on public.subscriptions for update
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "conversations_select" on public.conversations;
create policy "conversations_select" on public.conversations for select
  using (user_id = auth.uid() or public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "conversations_insert" on public.conversations;
create policy "conversations_insert" on public.conversations for insert with check (user_id = auth.uid());

drop policy if exists "conversations_update" on public.conversations;
create policy "conversations_update" on public.conversations for update
  using (user_id = auth.uid() or public.owns_establishment(establishment_id));

drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
    and (c.user_id = auth.uid() or public.owns_establishment(c.establishment_id) or public.is_admin())
  ));

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert
  with check (
    sender_id = auth.uid() and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.user_id = auth.uid() or public.owns_establishment(c.establishment_id))
    )
  );

drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications for select using (user_id = auth.uid());

drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications for update using (user_id = auth.uid());

drop policy if exists "access_logs_select" on public.access_logs;
create policy "access_logs_select" on public.access_logs for select using (public.is_admin());

drop policy if exists "access_logs_insert" on public.access_logs;
create policy "access_logs_insert" on public.access_logs for insert
  with check (user_id is null or user_id = auth.uid());

-- ============================================================
-- Triggers: auto profile + qr_card + subscription on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_code text;
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;

  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  insert into public.qr_cards (user_id, code) values (new.id, v_code)
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, tier, status, trial_ends_at)
  values (new.id, 'basico', 'trial', now() + interval '7 days')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_establishments on public.establishments;
create trigger set_updated_at_establishments before update on public.establishments
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_orders on public.orders;
create trigger set_updated_at_orders before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_subscriptions on public.subscriptions;
create trigger set_updated_at_subscriptions before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ============================================================
-- Seed: categorias + planos
-- ============================================================
insert into public.categories (slug, name, icon, display_order) values
  ('restaurantes','Restaurantes','utensils-crossed', 1),
  ('bares','Bares e Pubs','beer', 2),
  ('cafes','Cafés e Padarias','coffee', 3),
  ('beleza','Beleza e Estética','sparkles', 4),
  ('moda','Moda e Vestuário','shirt', 5),
  ('saude','Saúde e Bem-estar','heart-pulse', 6),
  ('esportes','Esportes e Academias','dumbbell', 7),
  ('lazer','Lazer e Entretenimento','party-popper', 8),
  ('petshop','Pet Shop','paw-print', 9),
  ('servicos','Serviços','briefcase', 10)
on conflict (slug) do nothing;

insert into public.subscription_plans (tier, name, monthly_cents, yearly_cents, features, display_order) values
  ('basico', 'Básico', 1990, 19900,
   '{"bullets":["Lista completa de estabelecimentos","Cupons básicos","Carteirinha QR","Clube de fidelidade"]}'::jsonb, 1),
  ('premium', 'Premium', 3990, 39900,
   '{"bullets":["Tudo do Básico","Vale-presente mensal","Chat com lojistas","Compras online com desconto extra"]}'::jsonb, 2),
  ('vip', 'VIP', 7990, 79900,
   '{"bullets":["Tudo do Premium","Eventos exclusivos","Early access a novas parcerias","Suporte prioritário"]}'::jsonb, 3)
on conflict (tier) do nothing;
