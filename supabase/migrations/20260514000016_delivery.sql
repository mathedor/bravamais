-- ============================================================
-- BRAVA+ — Delivery & Entregadores (sprint 2026-05-14)
-- ============================================================
-- Adiciona: endereços do usuário, entregadores (próprios e freelancers),
-- zonas de entrega, deliveries com tracking realtime, avaliações.
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
alter type user_role add value if not exists 'deliverer';

do $$ begin
  create type delivery_type as enum ('pickup','delivery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_status as enum (
    'awaiting_assignment',
    'assigned',
    'accepted',
    'picked_up',
    'in_transit',
    'delivered',
    'canceled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type deliverer_status as enum ('pending_review','approved','rejected','suspended','inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vehicle_type as enum ('moto','carro','bike','a_pe','van');
exception when duplicate_object then null; end $$;

alter type notification_type add value if not exists 'delivery';

-- ============================================================
-- user_addresses
-- ============================================================
create table if not exists public.user_addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Casa',
  recipient_name text,
  recipient_phone text,
  cep text not null,
  street text not null,
  number text,
  complement text,
  neighborhood text,
  city text not null,
  state char(2) not null,
  reference text,
  lat double precision,
  lng double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_addresses_user_idx on public.user_addresses (user_id);

-- ============================================================
-- deliverers (pessoa entregadora)
-- ============================================================
create table if not exists public.deliverers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null,
  cpf text,
  rg text,
  birth_date date,
  phone text not null,
  whatsapp text,
  email text,
  photo_url text,
  cnh_number text,
  cnh_url text,
  rg_url text,
  cpf_url text,
  vehicle vehicle_type not null default 'moto',
  vehicle_model text,
  vehicle_color text,
  plate text,
  city text,
  state char(2),
  status deliverer_status not null default 'pending_review',
  is_public_freelancer boolean not null default false,
  is_online boolean not null default false,
  current_lat double precision,
  current_lng double precision,
  last_seen_at timestamptz,
  rating_avg numeric(3,2),
  rating_count int not null default 0,
  total_deliveries int not null default 0,
  rejection_reason text,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deliverers_status_idx on public.deliverers (status);
create index if not exists deliverers_public_idx on public.deliverers (is_public_freelancer, status);
create index if not exists deliverers_user_idx on public.deliverers (user_id);

-- ============================================================
-- establishment_deliverers (pivot: loja ↔ entregador)
-- ============================================================
create table if not exists public.establishment_deliverers (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  deliverer_id uuid not null references public.deliverers(id) on delete cascade,
  is_active boolean not null default true,
  hired_via text not null default 'manual', -- 'manual' | 'bridge' (vitrine pública)
  notes text,
  created_at timestamptz not null default now(),
  unique (establishment_id, deliverer_id)
);

create index if not exists estab_deliverers_estab_idx on public.establishment_deliverers (establishment_id);
create index if not exists estab_deliverers_deliverer_idx on public.establishment_deliverers (deliverer_id);

-- ============================================================
-- delivery_zones (taxas por raio configuradas pelo estabelecimento)
-- ============================================================
create table if not exists public.delivery_zones (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  max_km numeric(6,2) not null check (max_km > 0),
  fee_cents int not null check (fee_cents >= 0),
  free_above_cents int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (establishment_id, max_km)
);

create index if not exists delivery_zones_estab_idx on public.delivery_zones (establishment_id, max_km);

-- ============================================================
-- establishment_delivery_settings
-- ============================================================
create table if not exists public.establishment_delivery_settings (
  establishment_id uuid primary key references public.establishments(id) on delete cascade,
  delivery_enabled boolean not null default true,
  pickup_enabled boolean not null default true,
  max_radius_km numeric(6,2) not null default 20,
  default_prep_minutes int not null default 30,
  notify_template_whatsapp text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ALTER orders: adiciona campos de delivery
-- ============================================================
alter table public.orders add column if not exists delivery_type delivery_type;
alter table public.orders add column if not exists delivery_address_id uuid references public.user_addresses(id);
alter table public.orders add column if not exists delivery_fee_cents int not null default 0;
alter table public.orders add column if not exists delivery_distance_km numeric(6,2);
alter table public.orders add column if not exists delivery_notes text;

-- ============================================================
-- deliveries (uma entrega tem 1 order; pickup orders NÃO geram delivery)
-- ============================================================
create table if not exists public.deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete restrict,
  deliverer_id uuid references public.deliverers(id) on delete set null,
  status delivery_status not null default 'awaiting_assignment',
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  dropoff_address text not null,
  dropoff_lat double precision,
  dropoff_lng double precision,
  recipient_name text,
  recipient_phone text,
  distance_km numeric(6,2),
  fee_cents int not null default 0,
  confirmation_code text not null,
  notes text,
  route_index int,
  assigned_at timestamptz,
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  canceled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deliveries_status_idx on public.deliveries (status);
create index if not exists deliveries_deliverer_idx on public.deliveries (deliverer_id, status);
create index if not exists deliveries_estab_idx on public.deliveries (establishment_id, created_at desc);

-- ============================================================
-- delivery_tracking_pings (GPS sharing realtime)
-- ============================================================
create table if not exists public.delivery_tracking_pings (
  id bigserial primary key,
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  deliverer_id uuid not null references public.deliverers(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  speed_kmh numeric(5,2),
  heading numeric(5,2),
  accuracy_m numeric(7,2),
  created_at timestamptz not null default now()
);

create index if not exists tracking_delivery_idx on public.delivery_tracking_pings (delivery_id, created_at desc);

-- ============================================================
-- delivery_ratings
-- ============================================================
create table if not exists public.delivery_ratings (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid not null unique references public.deliveries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  deliverer_id uuid not null references public.deliverers(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists delivery_ratings_deliverer_idx on public.delivery_ratings (deliverer_id);

-- ============================================================
-- Helper functions
-- ============================================================

-- Verifica se o user é o entregador desta delivery
create or replace function public.is_delivery_courier(d_id uuid) returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.deliveries d
    join public.deliverers dv on dv.id = d.deliverer_id
    where d.id = d_id and dv.user_id = auth.uid()
  );
$$;

-- Verifica se o user é entregador (qualquer status)
create or replace function public.is_deliverer() returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.deliverers where user_id = auth.uid()
  );
$$;

-- Atualiza rating_avg do deliverer quando rating é inserido
create or replace function public.update_deliverer_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.deliverers
  set rating_avg = (
    select round(avg(stars)::numeric, 2) from public.delivery_ratings where deliverer_id = new.deliverer_id
  ),
  rating_count = (
    select count(*) from public.delivery_ratings where deliverer_id = new.deliverer_id
  )
  where id = new.deliverer_id;
  return new;
end;
$$;

drop trigger if exists trg_update_deliverer_rating on public.delivery_ratings;
create trigger trg_update_deliverer_rating
  after insert on public.delivery_ratings
  for each row execute function public.update_deliverer_rating();

-- Incrementa total_deliveries quando delivery vira 'delivered'
create or replace function public.bump_total_deliveries()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'delivered' and (old.status is distinct from 'delivered') and new.deliverer_id is not null then
    update public.deliverers set total_deliveries = total_deliveries + 1 where id = new.deliverer_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bump_total_deliveries on public.deliveries;
create trigger trg_bump_total_deliveries
  after update on public.deliveries
  for each row execute function public.bump_total_deliveries();

-- Seeda zonas default quando establishment é criado
create or replace function public.seed_default_delivery_zones()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.delivery_zones (establishment_id, max_km, fee_cents) values
    (new.id, 5,  1500),
    (new.id, 10, 2500),
    (new.id, 20, 3500)
  on conflict (establishment_id, max_km) do nothing;

  insert into public.establishment_delivery_settings (establishment_id) values (new.id)
  on conflict (establishment_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_seed_delivery_zones on public.establishments;
create trigger trg_seed_delivery_zones
  after insert on public.establishments
  for each row execute function public.seed_default_delivery_zones();

-- Backfill: insere zonas+settings pros estabelecimentos existentes
insert into public.delivery_zones (establishment_id, max_km, fee_cents)
select e.id, v.max_km, v.fee_cents
from public.establishments e
cross join (values (5::numeric, 1500), (10::numeric, 2500), (20::numeric, 3500)) as v(max_km, fee_cents)
on conflict (establishment_id, max_km) do nothing;

insert into public.establishment_delivery_settings (establishment_id)
select id from public.establishments
on conflict (establishment_id) do nothing;

-- set_updated_at em novas tabelas
drop trigger if exists set_updated_at_user_addresses on public.user_addresses;
create trigger set_updated_at_user_addresses before update on public.user_addresses
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_deliverers on public.deliverers;
create trigger set_updated_at_deliverers before update on public.deliverers
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_deliveries on public.deliveries;
create trigger set_updated_at_deliveries before update on public.deliveries
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.user_addresses enable row level security;
alter table public.deliverers enable row level security;
alter table public.establishment_deliverers enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.establishment_delivery_settings enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_tracking_pings enable row level security;
alter table public.delivery_ratings enable row level security;

-- user_addresses: dono ou admin
drop policy if exists "user_addresses_select" on public.user_addresses;
create policy "user_addresses_select" on public.user_addresses for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_addresses_write" on public.user_addresses;
create policy "user_addresses_write" on public.user_addresses for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- deliverers: público vê quem é freelancer aprovado (vitrine); dono do registro vê o seu; admin tudo
drop policy if exists "deliverers_select" on public.deliverers;
create policy "deliverers_select" on public.deliverers for select
  using (
    (is_public_freelancer and status = 'approved')
    or user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.establishment_deliverers ed
      join public.establishments e on e.id = ed.establishment_id
      where ed.deliverer_id = deliverers.id and e.owner_id = auth.uid()
    )
  );

drop policy if exists "deliverers_insert" on public.deliverers;
create policy "deliverers_insert" on public.deliverers for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "deliverers_update" on public.deliverers;
create policy "deliverers_update" on public.deliverers for update
  using (user_id = auth.uid() or public.is_admin());

-- establishment_deliverers: loja dona + admin + o entregador (pra ver onde trabalha)
drop policy if exists "estab_deliverers_select" on public.establishment_deliverers;
create policy "estab_deliverers_select" on public.establishment_deliverers for select
  using (
    public.owns_establishment(establishment_id)
    or public.is_admin()
    or exists (select 1 from public.deliverers d where d.id = deliverer_id and d.user_id = auth.uid())
  );

drop policy if exists "estab_deliverers_write" on public.establishment_deliverers;
create policy "estab_deliverers_write" on public.establishment_deliverers for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- delivery_zones: público lê ativas; loja dona escreve
drop policy if exists "delivery_zones_select" on public.delivery_zones;
create policy "delivery_zones_select" on public.delivery_zones for select
  using (is_active or public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "delivery_zones_write" on public.delivery_zones;
create policy "delivery_zones_write" on public.delivery_zones for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- establishment_delivery_settings: similar
drop policy if exists "estab_delivery_settings_select" on public.establishment_delivery_settings;
create policy "estab_delivery_settings_select" on public.establishment_delivery_settings for select
  using (true);

drop policy if exists "estab_delivery_settings_write" on public.establishment_delivery_settings;
create policy "estab_delivery_settings_write" on public.establishment_delivery_settings for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- deliveries: loja dona + entregador atribuído + cliente dono do order + admin
drop policy if exists "deliveries_select" on public.deliveries;
create policy "deliveries_select" on public.deliveries for select
  using (
    public.owns_establishment(establishment_id)
    or public.is_admin()
    or exists (select 1 from public.deliverers d where d.id = deliverer_id and d.user_id = auth.uid())
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

drop policy if exists "deliveries_insert" on public.deliveries;
create policy "deliveries_insert" on public.deliveries for insert
  with check (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "deliveries_update" on public.deliveries;
create policy "deliveries_update" on public.deliveries for update
  using (
    public.owns_establishment(establishment_id)
    or public.is_admin()
    or exists (select 1 from public.deliverers d where d.id = deliverer_id and d.user_id = auth.uid())
  );

-- delivery_tracking_pings: cliente do order, loja, entregador, admin
drop policy if exists "tracking_select" on public.delivery_tracking_pings;
create policy "tracking_select" on public.delivery_tracking_pings for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.deliveries d
      where d.id = delivery_id
      and (
        public.owns_establishment(d.establishment_id)
        or exists (select 1 from public.deliverers dv where dv.id = d.deliverer_id and dv.user_id = auth.uid())
        or exists (select 1 from public.orders o where o.id = d.order_id and o.user_id = auth.uid())
      )
    )
  );

drop policy if exists "tracking_insert" on public.delivery_tracking_pings;
create policy "tracking_insert" on public.delivery_tracking_pings for insert
  with check (
    exists (select 1 from public.deliverers d where d.id = deliverer_id and d.user_id = auth.uid())
  );

-- delivery_ratings: cliente do order escreve; todos veem
drop policy if exists "delivery_ratings_select" on public.delivery_ratings;
create policy "delivery_ratings_select" on public.delivery_ratings for select using (true);

drop policy if exists "delivery_ratings_insert" on public.delivery_ratings;
create policy "delivery_ratings_insert" on public.delivery_ratings for insert
  with check (user_id = auth.uid());

-- ============================================================
-- ROLE_HOME update — registro semântico (lido pelo app)
-- ============================================================
-- O ROLE_HOME do app é em TS (lib/supabase/types.ts) — vai ser atualizado lá.
