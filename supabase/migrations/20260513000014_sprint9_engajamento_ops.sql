-- ============================================================
-- BRAVA+ — Sprint 9: Engajamento + Operação
-- Onboarding user, desafios, wishlist produto, listas editoriais,
-- tickets suporte, digest log
-- ============================================================

-- =========================================================
-- 1) Onboarding user (flag já existe: profiles.onboarded_at)
-- Adicionar preferências capturadas no onboarding
-- =========================================================
alter table public.profiles add column if not exists favorite_categories text[] not null default '{}';

-- =========================================================
-- 2) Desafios mensais (challenges)
-- =========================================================
do $$ begin
  create type challenge_kind as enum ('visits_in_category', 'coupons_redeemed', 'distinct_estabs_visited', 'gift_cards_purchased');
exception when duplicate_object then null; end $$;

create table if not exists public.monthly_challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  kind challenge_kind not null,
  target_category_slug text,
  target_n int not null default 5,
  reward_coins int not null default 100,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  is_active boolean not null default true,
  cover_emoji text default '🏆',
  created_at timestamptz not null default now()
);

create index if not exists challenges_active_idx on public.monthly_challenges (is_active, ends_at) where is_active;

alter table public.monthly_challenges enable row level security;
drop policy if exists "challenges_select" on public.monthly_challenges;
create policy "challenges_select" on public.monthly_challenges for select using (true);

drop policy if exists "challenges_admin_write" on public.monthly_challenges;
create policy "challenges_admin_write" on public.monthly_challenges for all
  using (public.is_admin()) with check (public.is_admin());

-- Progresso do usuário em cada desafio
create table if not exists public.challenge_progress (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.monthly_challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  count int not null default 0,
  completed_at timestamptz,
  claimed_at timestamptz,
  unique (challenge_id, user_id)
);

create index if not exists challenge_prog_user_idx on public.challenge_progress (user_id);

alter table public.challenge_progress enable row level security;

drop policy if exists "challenge_prog_select" on public.challenge_progress;
create policy "challenge_prog_select" on public.challenge_progress for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "challenge_prog_write_own" on public.challenge_progress;
create policy "challenge_prog_write_own" on public.challenge_progress for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- RPC: claim challenge reward
create or replace function public.claim_challenge_reward(p_challenge_id uuid)
returns table (ok boolean, message text, coins_granted int)
language plpgsql security definer as $$
declare
  v_user uuid := auth.uid();
  v_challenge record;
  v_progress record;
begin
  if v_user is null then
    return query select false, 'Não autenticado', 0;
    return;
  end if;

  select * into v_challenge from public.monthly_challenges where id = p_challenge_id;
  if v_challenge is null then
    return query select false, 'Desafio não encontrado', 0;
    return;
  end if;

  select * into v_progress from public.challenge_progress where challenge_id = p_challenge_id and user_id = v_user;
  if v_progress is null or v_progress.count < v_challenge.target_n then
    return query select false, 'Desafio incompleto', 0;
    return;
  end if;

  if v_progress.claimed_at is not null then
    return query select false, 'Recompensa já resgatada', 0;
    return;
  end if;

  perform public.grant_coins(v_user, v_challenge.reward_coins, 'challenge_reward', 'challenge', p_challenge_id);
  update public.challenge_progress set claimed_at = now() where id = v_progress.id;

  insert into public.notifications (user_id, type, title, body, link)
  values (v_user, 'system', '🏆 Desafio concluído!', 'Você ganhou ' || v_challenge.reward_coins || ' coins por completar "' || v_challenge.title || '"', '/app/desafios');

  return query select true, 'Resgatado!', v_challenge.reward_coins;
end;
$$;

-- =========================================================
-- 3) Wishlist de produtos ("me avise quando voltar")
-- =========================================================
create table if not exists public.product_alerts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  primary key (user_id, product_id)
);

create index if not exists product_alerts_user_idx on public.product_alerts (user_id);
create index if not exists product_alerts_product_idx on public.product_alerts (product_id);

alter table public.product_alerts enable row level security;
drop policy if exists "alerts_select_own" on public.product_alerts;
create policy "alerts_select_own" on public.product_alerts for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "alerts_write_own" on public.product_alerts;
create policy "alerts_write_own" on public.product_alerts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================
-- 4) Listas editoriais
-- =========================================================
create table if not exists public.editorial_lists (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  description text,
  cover_url text,
  city text,
  is_published boolean not null default false,
  display_order int not null default 100,
  created_by_admin_user_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.editorial_list_items (
  list_id uuid not null references public.editorial_lists(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  position int not null default 0,
  note text,
  primary key (list_id, establishment_id)
);

create index if not exists editorial_lists_published_idx on public.editorial_lists (is_published, display_order) where is_published;

alter table public.editorial_lists enable row level security;
alter table public.editorial_list_items enable row level security;

drop policy if exists "edlist_select" on public.editorial_lists;
create policy "edlist_select" on public.editorial_lists for select
  using (is_published or public.is_admin());

drop policy if exists "edlist_write" on public.editorial_lists;
create policy "edlist_write" on public.editorial_lists for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "edlist_items_select" on public.editorial_list_items;
create policy "edlist_items_select" on public.editorial_list_items for select using (true);

drop policy if exists "edlist_items_write" on public.editorial_list_items;
create policy "edlist_items_write" on public.editorial_list_items for all
  using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- 5) Tickets de suporte
-- =========================================================
do $$ begin
  create type support_status as enum ('open', 'waiting_user', 'waiting_admin', 'resolved', 'closed');
exception when duplicate_object then null; end $$;

create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  opener_user_id uuid not null references public.profiles(id) on delete cascade,
  opener_role user_role not null,
  establishment_id uuid references public.establishments(id) on delete set null,
  subject text not null,
  category text default 'geral',
  status support_status not null default 'open',
  priority int not null default 3,
  assigned_admin_user_id uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tickets_status_idx on public.support_tickets (status, last_message_at desc);
create index if not exists tickets_user_idx on public.support_tickets (opener_user_id, created_at desc);

create table if not exists public.support_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  is_admin_reply boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists tickets_messages_idx on public.support_messages (ticket_id, created_at);

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "tickets_select" on public.support_tickets;
create policy "tickets_select" on public.support_tickets for select
  using (opener_user_id = auth.uid() or public.is_admin());

drop policy if exists "tickets_insert" on public.support_tickets;
create policy "tickets_insert" on public.support_tickets for insert
  with check (opener_user_id = auth.uid());

drop policy if exists "tickets_update" on public.support_tickets;
create policy "tickets_update" on public.support_tickets for update
  using (opener_user_id = auth.uid() or public.is_admin());

drop policy if exists "ticket_msgs_select" on public.support_messages;
create policy "ticket_msgs_select" on public.support_messages for select
  using (exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id and (t.opener_user_id = auth.uid() or public.is_admin())
  ));

drop policy if exists "ticket_msgs_insert" on public.support_messages;
create policy "ticket_msgs_insert" on public.support_messages for insert
  with check (sender_user_id = auth.uid());

-- =========================================================
-- 6) Digest log (semanal lojista) — anti-duplicação
-- =========================================================
create table if not exists public.weekly_digests_log (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  period_start date not null,
  sent_at timestamptz not null default now(),
  unique (establishment_id, period_start)
);

create index if not exists digests_estab_idx on public.weekly_digests_log (establishment_id, period_start desc);

-- =========================================================
-- 7) Sponsored editorial seed: insere lista de exemplo
-- =========================================================
insert into public.editorial_lists (slug, title, description, is_published, display_order)
values
  ('top-saboroso-sp', 'Top saboroso do mês', 'Curadoria BRAVA+ dos parceiros mais comentados', true, 10)
on conflict (slug) do nothing;

-- =========================================================
-- 8) Stories: garantir que UI consegue ler joins de cupom
-- (não muda schema, já existe coupon_id em establishment_stories — Sprint 3)
-- =========================================================
