-- ============================================================
-- BRAVA+ — Fix recursão RLS deliverers ↔ establishment_deliverers
-- ============================================================
-- Bug: deliverers_select referenciava establishment_deliverers,
-- e estab_deliverers_select referenciava deliverers. Loop infinito.
-- Fix: helpers SECURITY DEFINER que pulam RLS dentro da função.
-- ============================================================

create or replace function public.deliverer_works_for_my_estab(d_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.establishment_deliverers ed
    join public.establishments e on e.id = ed.establishment_id
    where ed.deliverer_id = d_id and e.owner_id = auth.uid()
  );
$$;

create or replace function public.is_my_deliverer_record(d_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.deliverers where id = d_id and user_id = auth.uid());
$$;

create or replace function public.am_i_the_courier(d_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.deliveries dv
    join public.deliverers dl on dl.id = dv.deliverer_id
    where dv.id = d_id and dl.user_id = auth.uid()
  );
$$;

-- ============================================================
-- Recria policies sem auto-referência circular
-- ============================================================

drop policy if exists "deliverers_select" on public.deliverers;
create policy "deliverers_select" on public.deliverers for select
  using (
    (is_public_freelancer and status = 'approved')
    or user_id = auth.uid()
    or public.is_admin()
    or public.deliverer_works_for_my_estab(id)
  );

drop policy if exists "estab_deliverers_select" on public.establishment_deliverers;
create policy "estab_deliverers_select" on public.establishment_deliverers for select
  using (
    public.owns_establishment(establishment_id)
    or public.is_admin()
    or public.is_my_deliverer_record(deliverer_id)
  );

drop policy if exists "deliveries_select" on public.deliveries;
create policy "deliveries_select" on public.deliveries for select
  using (
    public.owns_establishment(establishment_id)
    or public.is_admin()
    or public.is_my_deliverer_record(deliverer_id)
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

drop policy if exists "deliveries_update" on public.deliveries;
create policy "deliveries_update" on public.deliveries for update
  using (
    public.owns_establishment(establishment_id)
    or public.is_admin()
    or public.is_my_deliverer_record(deliverer_id)
  );

drop policy if exists "tracking_select" on public.delivery_tracking_pings;
create policy "tracking_select" on public.delivery_tracking_pings for select
  using (
    public.is_admin()
    or public.am_i_the_courier(delivery_id)
    or exists (
      select 1 from public.deliveries d
      where d.id = delivery_id
      and (
        public.owns_establishment(d.establishment_id)
        or exists (select 1 from public.orders o where o.id = d.order_id and o.user_id = auth.uid())
      )
    )
  );

drop policy if exists "tracking_insert" on public.delivery_tracking_pings;
create policy "tracking_insert" on public.delivery_tracking_pings for insert
  with check (public.is_my_deliverer_record(deliverer_id));
