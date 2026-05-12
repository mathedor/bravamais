-- ============================================================
-- BRAVA+ — Stories ("HOJE") + Loyalty Rewards + Gift Card extras
-- ============================================================

-- Stories ("Hoje" do estabelecimento, TTL 24h)
create table if not exists public.establishment_stories (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image',
  caption text,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  views_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists establishment_stories_active_idx
  on public.establishment_stories (establishment_id, expires_at desc);

alter table public.establishment_stories enable row level security;

drop policy if exists "stories_select_active" on public.establishment_stories;
create policy "stories_select_active" on public.establishment_stories for select
  using (expires_at > now() or public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "stories_write_owner" on public.establishment_stories;
create policy "stories_write_owner" on public.establishment_stories for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- Loyalty rewards (histórico de prêmios resgatados, com código pra validar)
create table if not exists public.loyalty_rewards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  club_id uuid not null references public.loyalty_clubs(id) on delete cascade,
  benefit_description text not null,
  reward_code text not null unique,
  claimed_at timestamptz not null default now(),
  used_at timestamptz,
  used_by_establishment_user_id uuid references public.profiles(id)
);

create index if not exists loyalty_rewards_user_idx on public.loyalty_rewards (user_id, claimed_at desc);
create index if not exists loyalty_rewards_estab_idx on public.loyalty_rewards (establishment_id, claimed_at desc);
create index if not exists loyalty_rewards_code_idx on public.loyalty_rewards (reward_code);

alter table public.loyalty_rewards enable row level security;

drop policy if exists "loyalty_rewards_select" on public.loyalty_rewards;
create policy "loyalty_rewards_select" on public.loyalty_rewards for select
  using (
    user_id = auth.uid()
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );

drop policy if exists "loyalty_rewards_insert" on public.loyalty_rewards;
create policy "loyalty_rewards_insert" on public.loyalty_rewards for insert
  with check (user_id = auth.uid() or public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "loyalty_rewards_update" on public.loyalty_rewards;
create policy "loyalty_rewards_update" on public.loyalty_rewards for update
  using (public.owns_establishment(establishment_id) or public.is_admin());

-- Gift cards: extras pra fluxo de compra
alter table public.gift_cards add column if not exists buyer_user_id uuid references public.profiles(id) on delete set null;
alter table public.gift_cards add column if not exists recipient_name text;
alter table public.gift_cards add column if not exists recipient_message text;
alter table public.gift_cards add column if not exists efi_charge_id text;
alter table public.gift_cards add column if not exists status text not null default 'pending';

-- Permitir o comprador (user) ver os vale-presentes que comprou
drop policy if exists "gift_cards_select" on public.gift_cards;
create policy "gift_cards_select" on public.gift_cards for select
  using (
    granted_to_user_id = auth.uid()
    or buyer_user_id = auth.uid()
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );

-- Permitir users autenticados inserir vale-presente (compra)
drop policy if exists "gift_cards_insert_buyer" on public.gift_cards;
create policy "gift_cards_insert_buyer" on public.gift_cards for insert
  with check (
    buyer_user_id = auth.uid()
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );
