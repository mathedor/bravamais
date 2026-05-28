-- ============================================================
-- 20260528000031_relatorios.sql
-- RPCs de agregação pra relatórios:
--  - admin_category_stats: MRR + vendas + uso por categoria
--  - admin_sales_summary: vendas no balcão (período, breakdown por benefit_kind)
--  - admin_top_establishments: ranking por receita
--  - user_economy_breakdown: pra usuário — economia por categoria + tipo de benefício + ROI
-- ============================================================

-- 1) Stats por categoria (admin)
create or replace function public.admin_category_stats()
returns json
language sql stable
security definer
set search_path = public
as $$
  with
  estabs_per_cat as (
    select c.id as category_id, count(distinct ec.establishment_id) as estabs_count
      from public.categories c
      left join public.establishment_categories ec on ec.category_id = c.id
     group by c.id
  ),
  subs_per_cat as (
    select usc.category_id, count(distinct usc.subscription_id) as subscribers_count
      from public.user_subscription_categories usc
     group by usc.category_id
  ),
  sales_per_cat as (
    select ec.category_id,
           count(ps.id) as sales_count,
           coalesce(sum(ps.gross_cents), 0)::bigint as gross_cents,
           coalesce(sum(ps.discount_cents), 0)::bigint as discount_cents,
           coalesce(sum(ps.net_cents), 0)::bigint as net_cents,
           count(*) filter (where ps.benefit_kind <> 'none') as sales_with_benefit
      from public.pos_sales ps
      join public.establishment_categories ec on ec.establishment_id = ps.establishment_id
     where ps.created_at > now() - interval '90 days'
     group by ec.category_id
  )
  select coalesce(json_agg(row_to_json(t) order by t.mrr_cents desc), '[]'::json) from (
    select
      c.id,
      c.slug,
      c.name,
      c.monthly_cents,
      c.is_active,
      coalesce(epc.estabs_count, 0) as estabs_count,
      coalesce(spc.subscribers_count, 0) as subscribers_count,
      (coalesce(spc.subscribers_count, 0) * c.monthly_cents)::bigint as mrr_cents,
      coalesce(salespc.sales_count, 0) as sales_count_90d,
      coalesce(salespc.gross_cents, 0) as gross_90d,
      coalesce(salespc.discount_cents, 0) as discount_90d,
      coalesce(salespc.net_cents, 0) as net_90d,
      coalesce(salespc.sales_with_benefit, 0) as sales_with_benefit_90d
      from public.categories c
      left join estabs_per_cat epc on epc.category_id = c.id
      left join subs_per_cat spc on spc.category_id = c.id
      left join sales_per_cat salespc on salespc.category_id = c.id
     order by mrr_cents desc nulls last
  ) t;
$$;

grant execute on function public.admin_category_stats() to authenticated;

-- 2) Sales summary (admin) - últimos N dias
create or replace function public.admin_sales_summary(p_days int default 30)
returns json
language sql stable
security definer
set search_path = public
as $$
  with
  totals as (
    select
      count(*)::bigint as total_sales,
      coalesce(sum(gross_cents), 0)::bigint as gross,
      coalesce(sum(discount_cents), 0)::bigint as discount,
      coalesce(sum(net_cents), 0)::bigint as net,
      count(*) filter (where benefit_kind <> 'none')::bigint as with_benefit
      from public.pos_sales
     where created_at > now() - (p_days || ' days')::interval
  ),
  by_kind as (
    select benefit_kind,
           count(*)::bigint as cnt,
           coalesce(sum(gross_cents), 0)::bigint as gross,
           coalesce(sum(discount_cents), 0)::bigint as discount
      from public.pos_sales
     where created_at > now() - (p_days || ' days')::interval
     group by benefit_kind
     order by cnt desc
  ),
  by_day as (
    select date_trunc('day', created_at)::date as day,
           count(*)::bigint as cnt,
           coalesce(sum(gross_cents), 0)::bigint as gross,
           coalesce(sum(discount_cents), 0)::bigint as discount,
           coalesce(sum(net_cents), 0)::bigint as net
      from public.pos_sales
     where created_at > now() - (p_days || ' days')::interval
     group by 1
     order by 1
  )
  select json_build_object(
    'totals', (select row_to_json(t) from totals t),
    'by_kind', (select coalesce(json_agg(row_to_json(t)), '[]'::json) from by_kind t),
    'by_day', (select coalesce(json_agg(row_to_json(t)), '[]'::json) from by_day t)
  );
$$;

grant execute on function public.admin_sales_summary(int) to authenticated;

-- 3) Top estabs (admin)
create or replace function public.admin_top_establishments(p_days int default 30, p_limit int default 10)
returns json
language sql stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(row_to_json(t) order by t.gross_cents desc), '[]'::json)
    from (
      select
        e.id, e.slug, e.name,
        count(ps.id)::bigint as sales_count,
        coalesce(sum(ps.gross_cents), 0)::bigint as gross_cents,
        coalesce(sum(ps.discount_cents), 0)::bigint as discount_cents,
        coalesce(sum(ps.net_cents), 0)::bigint as net_cents
        from public.establishments e
        left join public.pos_sales ps on ps.establishment_id = e.id and ps.created_at > now() - (p_days || ' days')::interval
       group by e.id, e.slug, e.name
       order by gross_cents desc
       limit p_limit
    ) t;
$$;

grant execute on function public.admin_top_establishments(int, int) to authenticated;

-- 4) Breakdown do usuário
create or replace function public.user_economy_breakdown(p_user_id uuid)
returns json
language sql stable
security definer
set search_path = public
as $$
  with
  totals as (
    select
      count(*)::bigint as total_sales,
      coalesce(sum(gross_cents), 0)::bigint as gross,
      coalesce(sum(discount_cents), 0)::bigint as saved,
      coalesce(sum(net_cents), 0)::bigint as spent
      from public.pos_sales
     where user_id = p_user_id
  ),
  by_kind as (
    select benefit_kind,
           count(*)::bigint as cnt,
           coalesce(sum(discount_cents), 0)::bigint as saved
      from public.pos_sales
     where user_id = p_user_id
       and benefit_kind <> 'none'
     group by benefit_kind
     order by saved desc
  ),
  by_category as (
    select c.id as category_id, c.name as category_name, c.slug,
           count(ps.id)::bigint as cnt,
           coalesce(sum(ps.gross_cents), 0)::bigint as gross,
           coalesce(sum(ps.discount_cents), 0)::bigint as saved,
           coalesce(sum(ps.net_cents), 0)::bigint as spent
      from public.pos_sales ps
      join public.establishment_categories ec on ec.establishment_id = ps.establishment_id
      join public.categories c on c.id = ec.category_id
     where ps.user_id = p_user_id
     group by c.id, c.name, c.slug
     order by saved desc
  ),
  by_month as (
    select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
           count(*)::bigint as cnt,
           coalesce(sum(gross_cents), 0)::bigint as gross,
           coalesce(sum(discount_cents), 0)::bigint as saved
      from public.pos_sales
     where user_id = p_user_id
       and created_at > now() - interval '180 days'
     group by 1
     order by 1
  ),
  subscription_info as (
    select coalesce(s.categories_total_cents, 0)::bigint as monthly_cents,
           s.trial_ends_at,
           (s.trial_ends_at > now()) as in_trial
      from public.subscriptions s
     where s.user_id = p_user_id
     limit 1
  )
  select json_build_object(
    'totals', (select row_to_json(t) from totals t),
    'by_kind', (select coalesce(json_agg(row_to_json(t)), '[]'::json) from by_kind t),
    'by_category', (select coalesce(json_agg(row_to_json(t)), '[]'::json) from by_category t),
    'by_month', (select coalesce(json_agg(row_to_json(t)), '[]'::json) from by_month t),
    'subscription', (select row_to_json(t) from subscription_info t)
  );
$$;

grant execute on function public.user_economy_breakdown(uuid) to authenticated;
