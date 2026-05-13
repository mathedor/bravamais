-- ============================================================
-- BRAVA+ — Sprint 3: Stories interativos + Roleta da sorte + Geo push perto
-- ============================================================

-- =========================================================
-- 1) Stories interativos: cupom anexado + enquete
-- =========================================================
alter table public.establishment_stories add column if not exists coupon_id uuid references public.coupons(id) on delete set null;
alter table public.establishment_stories add column if not exists poll_question text;
alter table public.establishment_stories add column if not exists poll_options jsonb;
-- poll_options shape: [{ id: "a", label: "Sim" }, { id: "b", label: "Não" }]

create table if not exists public.story_poll_votes (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.establishment_stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  unique (story_id, user_id)
);

create index if not exists story_poll_votes_story_idx on public.story_poll_votes (story_id);

alter table public.story_poll_votes enable row level security;

drop policy if exists "story_votes_select" on public.story_poll_votes;
create policy "story_votes_select" on public.story_poll_votes for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.establishment_stories s where s.id = story_id and public.owns_establishment(s.establishment_id))
    or public.is_admin()
  );

drop policy if exists "story_votes_insert" on public.story_poll_votes;
create policy "story_votes_insert" on public.story_poll_votes for insert
  with check (user_id = auth.uid());

-- View agregada de votos por opção
create or replace view public.story_poll_tally as
select story_id, option_id, count(*)::int as votes
from public.story_poll_votes
group by story_id, option_id;
grant select on public.story_poll_tally to authenticated;

-- =========================================================
-- 2) Roleta da sorte (lucky draws)
-- =========================================================
create table if not exists public.lucky_draws (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null default 'Roleta da Sorte',
  is_active boolean not null default true,
  -- prizes: array de prêmios com pesos
  -- shape: [{ id, label, kind:'coupon|coins|nothing', value: int|null, coupon_id: uuid|null, weight: int }]
  prizes jsonb not null default '[]'::jsonb,
  max_spins_per_user_day int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists lucky_draws_estab_idx on public.lucky_draws (establishment_id);

alter table public.lucky_draws enable row level security;

drop policy if exists "lucky_draws_select" on public.lucky_draws;
create policy "lucky_draws_select" on public.lucky_draws for select using (true);

drop policy if exists "lucky_draws_write" on public.lucky_draws;
create policy "lucky_draws_write" on public.lucky_draws for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- Spins (histórico)
create table if not exists public.lucky_draw_spins (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid not null references public.lucky_draws(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  prize_id text not null,
  prize_label text not null,
  prize_kind text not null, -- coupon|coins|nothing
  coupon_id uuid references public.coupons(id) on delete set null,
  coins_granted int default 0,
  created_at timestamptz not null default now()
);

create index if not exists lucky_draw_spins_user_day_idx
  on public.lucky_draw_spins (user_id, draw_id, created_at);

alter table public.lucky_draw_spins enable row level security;

drop policy if exists "lucky_spins_select" on public.lucky_draw_spins;
create policy "lucky_spins_select" on public.lucky_draw_spins for select
  using (
    user_id = auth.uid()
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );

-- =========================================================
-- 3) Geo push log (pra evitar spam — não notificar de novo o mesmo estab nas próximas 6h)
-- =========================================================
create table if not exists public.geo_push_log (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  pushed_at timestamptz not null default now()
);

create index if not exists geo_push_log_user_estab_idx
  on public.geo_push_log (user_id, establishment_id, pushed_at desc);

alter table public.geo_push_log enable row level security;
drop policy if exists "geo_log_select" on public.geo_push_log;
create policy "geo_log_select" on public.geo_push_log for select
  using (user_id = auth.uid() or public.is_admin());
-- Inserts feitos via service_role somente

-- =========================================================
-- 4) RPC: estabs próximos com promo ativa (pra geo push)
-- =========================================================
create or replace function public.nearby_with_promo(
  p_user_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_radius_meters int default 500
)
returns table (
  establishment_id uuid,
  name text,
  slug text,
  distance_m double precision,
  active_coupons int
)
language sql stable security definer as $$
  with point as (
    select st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography as g
  )
  select
    e.id as establishment_id,
    e.name,
    e.slug,
    st_distance(e.location, (select g from point)) as distance_m,
    (
      select count(*)::int from public.coupons c
      where c.establishment_id = e.id
        and c.is_active
        and (c.valid_until is null or c.valid_until > now())
    ) as active_coupons
  from public.establishments e
  where e.is_active
    and e.location is not null
    and st_dwithin(e.location, (select g from point), p_radius_meters)
    and not exists (
      select 1 from public.geo_push_log gpl
      where gpl.user_id = p_user_id
        and gpl.establishment_id = e.id
        and gpl.pushed_at > now() - interval '6 hours'
    )
  order by distance_m asc
  limit 5;
$$;
