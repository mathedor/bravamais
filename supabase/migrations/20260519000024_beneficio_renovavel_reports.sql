-- ============================================================
-- RELATÓRIOS do Benefício Renovável (lojista, usuário, admin)
-- ============================================================

-- ============================================================
-- 1) LOJISTA — relatório completo do benefício
-- ============================================================
-- Resumo geral + evolução mensal (6 meses) + por ciclo + top clientes.

create or replace function public.renewable_lojista_report(p_estab_id uuid)
returns jsonb
language sql stable security definer as $$
  with grants as (
    select * from public.renewable_benefit_grants where establishment_id = p_estab_id
  ),
  resumo as (
    select
      count(*)::int as total,
      count(*) filter (where status = 'ativo')::int as ativos,
      count(*) filter (where status = 'usado')::int as usados,
      count(*) filter (where status = 'expirado')::int as expirados,
      count(distinct user_id)::int as clientes_alcancados,
      case when count(*) filter (where status in ('usado','expirado')) > 0
        then round(100.0 * count(*) filter (where status = 'usado')
              / count(*) filter (where status in ('usado','expirado')), 1)
        else 0 end as conversao_pct
    from grants
  ),
  mensal as (
    select jsonb_agg(m order by m_key) as data from (
      select
        to_char(date_trunc('month', granted_at), 'YYYY-MM') as m_key,
        to_char(date_trunc('month', granted_at), 'Mon/YY') as mes,
        count(*)::int as entregues,
        count(*) filter (where status = 'usado')::int as usados
      from grants
      where granted_at > now() - interval '6 months'
      group by 1, 2
    ) m
  ),
  por_ciclo as (
    select jsonb_agg(c order by cycle) as data from (
      select
        cycle,
        count(*)::int as entregues,
        count(*) filter (where status = 'usado')::int as usados
      from grants
      group by cycle
      order by cycle
      limit 12
    ) c
  ),
  top_clientes as (
    select jsonb_agg(t) as data from (
      select
        p.full_name as nome,
        count(*) filter (where g.status = 'usado')::int as usos
      from grants g
      join public.profiles p on p.id = g.user_id
      where g.status = 'usado'
      group by p.full_name
      order by usos desc
      limit 10
    ) t
  )
  select jsonb_build_object(
    'resumo', (select to_jsonb(resumo) from resumo),
    'mensal', coalesce((select data from mensal), '[]'::jsonb),
    'por_ciclo', coalesce((select data from por_ciclo), '[]'::jsonb),
    'top_clientes', coalesce((select data from top_clientes), '[]'::jsonb)
  );
$$;

-- ============================================================
-- 2) USUÁRIO — stats de uso (economia, aproveitamento)
-- ============================================================
create or replace function public.renewable_user_stats(p_user_id uuid)
returns table (
  total_recebidos int,
  usados int,
  perdidos int,
  ativos int,
  aproveitamento_pct numeric,
  economia_estimada_cents bigint
)
language sql stable security definer as $$
  select
    count(*)::int,
    count(*) filter (where status = 'usado')::int,
    count(*) filter (where status = 'expirado')::int,
    count(*) filter (where status = 'ativo')::int,
    case when count(*) filter (where status in ('usado','expirado')) > 0
      then round(100.0 * count(*) filter (where status = 'usado')
            / count(*) filter (where status in ('usado','expirado')), 1)
      else 0 end,
    -- economia estimada: voucher = valor; percent = % sobre min_order (ou R$ 50 base)
    coalesce(sum(
      case when status = 'usado' then
        case when kind = 'voucher' then value::bigint
             else floor((value / 100.0) * coalesce(min_order_cents, 5000))::bigint
        end
      else 0 end
    ), 0)::bigint
  from public.renewable_benefit_grants
  where user_id = p_user_id;
$$;

-- ============================================================
-- 3) ADMIN — overview global do Benefício Renovável
-- ============================================================
create or replace function public.renewable_admin_overview()
returns jsonb
language sql stable security definer as $$
  with g as (select * from public.renewable_benefit_grants),
  totais as (
    select
      count(*)::int as total_grants,
      count(*) filter (where status = 'ativo')::int as ativos,
      count(*) filter (where status = 'usado')::int as usados,
      count(*) filter (where status = 'expirado')::int as expirados,
      count(distinct user_id)::int as usuarios_alcancados,
      count(distinct establishment_id)::int as lojas_com_grant,
      case when count(*) filter (where status in ('usado','expirado')) > 0
        then round(100.0 * count(*) filter (where status = 'usado')
              / count(*) filter (where status in ('usado','expirado')), 1)
        else 0 end as conversao_global_pct
    from g
  ),
  benef_ativos as (
    select count(*)::int as cnt from public.renewable_benefits where is_active = true
  ),
  estabs_total as (
    select count(*)::int as cnt from public.establishments where is_active = true
  ),
  top_lojas as (
    select jsonb_agg(t) as data from (
      select
        e.name as loja,
        e.city as cidade,
        count(*)::int as entregues,
        count(*) filter (where g.status = 'usado')::int as usados,
        case when count(*) filter (where g.status in ('usado','expirado')) > 0
          then round(100.0 * count(*) filter (where g.status = 'usado')
                / count(*) filter (where g.status in ('usado','expirado')), 1)
          else 0 end as conversao
      from g
      join public.establishments e on e.id = g.establishment_id
      group by e.name, e.city
      order by usados desc
      limit 15
    ) t
  ),
  sem_beneficio as (
    select jsonb_agg(t) as data from (
      select e.name as loja, e.city as cidade
      from public.establishments e
      where e.is_active = true
        and not exists (select 1 from public.renewable_benefits rb where rb.establishment_id = e.id and rb.is_active = true)
      order by e.created_at desc
      limit 30
    ) t
  )
  select jsonb_build_object(
    'totais', (select to_jsonb(totais) from totais),
    'beneficios_ativos', (select cnt from benef_ativos),
    'estabs_ativos', (select cnt from estabs_total),
    'cobertura_pct', case when (select cnt from estabs_total) > 0
        then round(100.0 * (select cnt from benef_ativos) / (select cnt from estabs_total), 1)
        else 0 end,
    'top_lojas', coalesce((select data from top_lojas), '[]'::jsonb),
    'sem_beneficio', coalesce((select data from sem_beneficio), '[]'::jsonb)
  );
$$;

-- ============================================================
-- 4) Atualiza admin_tools_kpis incluindo o benefício renovável
-- ============================================================
-- drop necessário: muda o tipo de retorno (10 → 13 colunas)
drop function if exists public.admin_tools_kpis();
create or replace function public.admin_tools_kpis()
returns table (
  wallet_total_cents bigint, wallet_active_users int, outings_active int, arrivals_today int,
  badges_earned_30d int, mesa_qr_total int, partnerships_active int, ab_tests_running int,
  cross_sell_offers int, waitlist_active int,
  renewable_active_grants int, renewable_used_30d int, renewable_coverage_pct numeric
)
language sql stable security definer as $$
  select
    (select coalesce(sum(balance_cents), 0)::bigint from public.wallet_balances),
    (select count(*)::int from public.wallet_balances where balance_cents > 0),
    (select count(*)::int from public.group_outings where status in ('planejando','confirmado','em_andamento')),
    (select count(*)::int from public.arrival_intents where declared_at::date = current_date),
    (select count(*)::int from public.user_badges where earned_at > now() - interval '30 days'),
    (select count(*)::int from public.mesa_qr where is_active = true),
    (select count(*)::int from public.partnerships where status in ('ativa','aceita')),
    (select count(*)::int from public.coupon_ab_tests where status = 'rodando'),
    (select count(*)::int from public.cross_sell_rules where is_active = true),
    (select count(*)::int from public.waitlist_entries where status in ('aguardando','chamado')),
    (select count(*)::int from public.renewable_benefit_grants where status = 'ativo'),
    (select count(*)::int from public.renewable_benefit_grants where status = 'usado' and used_at > now() - interval '30 days'),
    (select case when (select count(*) from public.establishments where is_active) > 0
        then round(100.0 * (select count(*) from public.renewable_benefits where is_active)
              / (select count(*) from public.establishments where is_active), 1)
        else 0 end);
$$;
