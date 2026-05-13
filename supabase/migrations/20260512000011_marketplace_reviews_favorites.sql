-- ============================================================
-- BRAVA+ — Sprint 6: Reviews, Favoritos, Filtros, Compartilhamento
-- ============================================================

-- =========================================================
-- 1) reviews — estrelas + comentário
-- =========================================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  visit_id uuid references public.visits(id) on delete set null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, establishment_id, visit_id)
);

create index if not exists reviews_estab_idx on public.reviews (establishment_id, created_at desc);
create index if not exists reviews_user_idx on public.reviews (user_id);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews for select
  using (not is_hidden or user_id = auth.uid() or public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert" on public.reviews for insert
  with check (user_id = auth.uid());

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews for update
  using (user_id = auth.uid() or public.is_admin());

-- Recalcula average_rating + total_reviews ao inserir/atualizar/deletar
create or replace function public.recalc_estab_rating()
returns trigger language plpgsql security definer as $$
declare
  v_estab uuid;
begin
  v_estab := coalesce(new.establishment_id, old.establishment_id);
  update public.establishments
    set
      average_rating = (select round(avg(rating)::numeric, 2) from public.reviews where establishment_id = v_estab and not is_hidden),
      total_reviews = (select count(*) from public.reviews where establishment_id = v_estab and not is_hidden)
    where id = v_estab;
  return new;
end;
$$;

drop trigger if exists recalc_rating_after_change on public.reviews;
create trigger recalc_rating_after_change
  after insert or update or delete on public.reviews
  for each row execute function public.recalc_estab_rating();

-- =========================================================
-- 2) favorites — lista de parceiros favoritos do user
-- =========================================================
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, establishment_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites for insert with check (user_id = auth.uid());

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites for delete using (user_id = auth.uid());

-- =========================================================
-- 3) establishments: campo open_hours pra filtro "aberto agora"
-- (simples: jsonb { mon:[start,end], tue:[start,end], ... } em HHmm)
-- =========================================================
alter table public.establishments add column if not exists open_hours jsonb;
