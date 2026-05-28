-- ============================================================
-- 20260528000026_coupon_grants_active_default.sql
-- Fixes:
--  (1) coupon_grants — registra que usuário recebeu um cupom (personal/blast/etc),
--      pra "Meus cupons" mostrar disponíveis e não só usados.
--  (2) Garante is_active=true como default em establishments (estab self-service
--      ficava invisível na busca por padrão).
--  (3) Backfill: pra cada notificação 🎁 que mencione um código existente,
--      cria o grant retroativamente.
-- ============================================================

-- (1) Tabela coupon_grants
create table if not exists public.coupon_grants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  source text not null default 'personal' check (source in ('personal','blast','renewable','referral','admin','backfill','other')),
  created_at timestamptz not null default now(),
  viewed_at timestamptz,
  used_at timestamptz,
  unique (user_id, coupon_id)
);

create index if not exists coupon_grants_user_idx on public.coupon_grants(user_id);
create index if not exists coupon_grants_coupon_idx on public.coupon_grants(coupon_id);

alter table public.coupon_grants enable row level security;

drop policy if exists "cg_user_select" on public.coupon_grants;
create policy "cg_user_select" on public.coupon_grants for select using (
  user_id = auth.uid() or public.is_admin() or exists (
    select 1 from public.coupons c
    join public.establishments e on e.id = c.establishment_id
    where c.id = coupon_grants.coupon_id and e.owner_id = auth.uid()
  )
);

drop policy if exists "cg_user_update_view" on public.coupon_grants;
create policy "cg_user_update_view" on public.coupon_grants for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "cg_admin_write" on public.coupon_grants;
create policy "cg_admin_write" on public.coupon_grants for all
  using (public.is_admin()) with check (public.is_admin());

-- (2) Default is_active=true em establishments (afeta apenas novos)
alter table public.establishments alter column is_active set default true;

-- (3) Backfill: associa notificações 🎁 antigas a cupons existentes via código mencionado no body
insert into public.coupon_grants (user_id, coupon_id, source)
select distinct n.user_id, c.id, 'backfill'
  from public.notifications n
  join public.coupons c on n.body ilike '%' || c.code || '%'
 where n.title ilike '%Cupom%'
   and not exists (
     select 1 from public.coupon_grants g
      where g.user_id = n.user_id and g.coupon_id = c.id
   );

-- (4) Atualiza link das notificações antigas 🎁 pra /app/cupons (mais útil que o estab)
update public.notifications
   set link = '/app/cupons'
 where title ilike '%Cupom%'
   and link ilike '/app/estabelecimento/%';

-- (5) RPC pra marcar cupom como visualizado
create or replace function public.mark_coupon_grant_viewed(p_coupon_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupon_grants
     set viewed_at = coalesce(viewed_at, now())
   where user_id = auth.uid() and coupon_id = p_coupon_id;
$$;

grant execute on function public.mark_coupon_grant_viewed(uuid) to authenticated;
