-- ============================================================
-- BRAVA+ — Sprint 2: BI lojista + CRM + Promo blast + Embaixadores + Benchmark
-- ============================================================

-- =========================================================
-- 1) establishments: campos novos (embaixadores via tabela; aqui só meta)
-- =========================================================
alter table public.establishments add column if not exists category_main_slug text;

-- Sincroniza category_main_slug a partir da primeira categoria já mapeada (best effort)
update public.establishments e
set category_main_slug = sub.slug
from (
  select ec.establishment_id, c.slug,
         row_number() over (partition by ec.establishment_id order by c.display_order) as rn
  from public.establishment_categories ec
  join public.categories c on c.id = ec.category_id
) sub
where sub.establishment_id = e.id and sub.rn = 1 and e.category_main_slug is null;

create index if not exists establishments_category_main_idx on public.establishments (category_main_slug);

-- =========================================================
-- 2) ambassadors — embaixadores VIP por estabelecimento
-- =========================================================
create table if not exists public.ambassadors (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique (establishment_id, user_id)
);

create index if not exists ambassadors_estab_idx on public.ambassadors (establishment_id);
create index if not exists ambassadors_user_idx on public.ambassadors (user_id);

alter table public.ambassadors enable row level security;

drop policy if exists "ambassadors_select" on public.ambassadors;
create policy "ambassadors_select" on public.ambassadors for select
  using (
    user_id = auth.uid()
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );

drop policy if exists "ambassadors_write" on public.ambassadors;
create policy "ambassadors_write" on public.ambassadors for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- =========================================================
-- 3) promo_blasts — disparo de promoção flash pra base do estab
-- =========================================================
create table if not exists public.promo_blasts (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  fired_by_user_id uuid references public.profiles(id),
  title text not null,
  body text not null,
  coupon_id uuid references public.coupons(id) on delete set null,
  audience text not null default 'recent_visitors', -- recent_visitors | all_visitors | ambassadors
  sent_count int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists promo_blasts_estab_idx on public.promo_blasts (establishment_id, created_at desc);

alter table public.promo_blasts enable row level security;

drop policy if exists "promo_blasts_select" on public.promo_blasts;
create policy "promo_blasts_select" on public.promo_blasts for select
  using (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "promo_blasts_write" on public.promo_blasts;
create policy "promo_blasts_write" on public.promo_blasts for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- =========================================================
-- 4) RPC: top customers — ranking por visitas + último check-in + total gasto
-- =========================================================
create or replace function public.estab_top_customers(p_estab_id uuid, p_limit int default 50)
returns table (
  user_id uuid,
  full_name text,
  city text,
  state text,
  visits int,
  orders int,
  last_visit timestamptz,
  total_spent_cents bigint,
  is_ambassador boolean
)
language sql stable security definer as $$
  with v as (
    select user_id, count(*)::int as visits, max(created_at) as last_visit
    from public.visits
    where establishment_id = p_estab_id
    group by user_id
  ),
  o as (
    select user_id,
           count(*)::int as orders,
           coalesce(sum(total_cents), 0)::bigint as spent
    from public.orders
    where establishment_id = p_estab_id and status in ('paid','completed')
    group by user_id
  ),
  a as (
    select user_id from public.ambassadors where establishment_id = p_estab_id
  )
  select
    p.id as user_id,
    p.full_name,
    p.city,
    p.state,
    coalesce(v.visits, 0) as visits,
    coalesce(o.orders, 0) as orders,
    v.last_visit,
    coalesce(o.spent, 0)::bigint as total_spent_cents,
    (a.user_id is not null) as is_ambassador
  from public.profiles p
  left join v on v.user_id = p.id
  left join o on o.user_id = p.id
  left join a on a.user_id = p.id
  where coalesce(v.visits,0) + coalesce(o.orders,0) > 0
  order by coalesce(v.visits,0) desc, coalesce(o.spent,0) desc
  limit p_limit;
$$;

-- =========================================================
-- 5) RPC: revenue breakdown — receita BRAVA+ incremental
-- =========================================================
create or replace function public.estab_revenue_breakdown(p_estab_id uuid)
returns table (
  total_orders int,
  total_revenue_cents bigint,
  new_customer_orders int,
  new_customer_revenue_cents bigint,
  recurring_orders int,
  recurring_revenue_cents bigint,
  avg_ticket_cents int,
  refunded_cents bigint
)
language sql stable security definer as $$
  with paid_orders as (
    select o.id, o.user_id, o.total_cents, o.created_at
    from public.orders o
    where o.establishment_id = p_estab_id
      and o.status in ('paid', 'completed', 'refunded')
  ),
  first_order_per_user as (
    select user_id, min(created_at) as first_at
    from paid_orders
    group by user_id
  ),
  classified as (
    select po.id, po.user_id, po.total_cents,
           case when po.created_at = fp.first_at then 'new' else 'recurring' end as kind
    from paid_orders po
    join first_order_per_user fp on fp.user_id = po.user_id
  ),
  refunded as (
    select coalesce(sum(refund_amount_cents),0)::bigint as refunded_total
    from public.refund_tickets
    where establishment_id = p_estab_id and status = 'refunded'
  )
  select
    (select count(*)::int from classified) as total_orders,
    (select coalesce(sum(total_cents),0)::bigint from classified) as total_revenue_cents,
    (select count(*)::int from classified where kind='new') as new_customer_orders,
    (select coalesce(sum(total_cents),0)::bigint from classified where kind='new') as new_customer_revenue_cents,
    (select count(*)::int from classified where kind='recurring') as recurring_orders,
    (select coalesce(sum(total_cents),0)::bigint from classified where kind='recurring') as recurring_revenue_cents,
    (select coalesce(avg(total_cents),0)::int from classified) as avg_ticket_cents,
    (select refunded_total from refunded) as refunded_cents;
$$;

-- =========================================================
-- 6) RPC: benchmark da categoria (percentil de visitas dentro da categoria)
-- =========================================================
create or replace function public.estab_category_benchmark(p_estab_id uuid)
returns table (
  category_slug text,
  category_size int,
  my_visits int,
  category_avg_visits numeric,
  my_percentile numeric
)
language sql stable security definer as $$
  with target as (
    select id, category_main_slug, total_visits from public.establishments where id = p_estab_id
  ),
  peers as (
    select e.id, e.total_visits
    from public.establishments e
    where e.category_main_slug = (select category_main_slug from target)
      and e.is_active
  )
  select
    (select category_main_slug from target) as category_slug,
    (select count(*)::int from peers) as category_size,
    coalesce((select total_visits from target),0) as my_visits,
    coalesce((select avg(total_visits) from peers), 0)::numeric as category_avg_visits,
    case
      when (select count(*) from peers) <= 1 then 100
      else round(
        100.0 * (
          (select count(*) from peers where total_visits < coalesce((select total_visits from target),0))
          / (select count(*)::numeric from peers)
        ), 1
      )
    end as my_percentile;
$$;

-- =========================================================
-- 7) Trigger: incrementa total_visits automaticamente a cada visit
-- (até agora era manual; deixa o benchmark vivo)
-- =========================================================
create or replace function public.tick_total_visits()
returns trigger language plpgsql security definer as $$
begin
  update public.establishments
    set total_visits = coalesce(total_visits,0) + 1
    where id = new.establishment_id;
  return new;
end;
$$;

drop trigger if exists tick_total_visits_after_insert on public.visits;
create trigger tick_total_visits_after_insert
  after insert on public.visits
  for each row execute function public.tick_total_visits();

-- =========================================================
-- 8) Backfill: total_visits real a partir das visitas existentes (uma vez)
-- =========================================================
update public.establishments e
set total_visits = sub.c
from (
  select establishment_id, count(*) as c
  from public.visits
  group by establishment_id
) sub
where sub.establishment_id = e.id;
