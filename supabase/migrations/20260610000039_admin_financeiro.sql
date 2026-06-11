-- Resumo financeiro pro painel admin (pagamentos + recorrência).
create or replace function public.admin_financeiro_summary()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'total_paid_cents', coalesce((select sum(amount_cents) from payments where status = 'paid'), 0),
    'paid_30d_cents', coalesce((select sum(amount_cents) from payments where status = 'paid' and paid_at > now() - interval '30 days'), 0),
    'count_paid', (select count(*) from payments where status = 'paid'),
    'count_pending', (select count(*) from payments where status = 'pending'),
    'count_failed', (select count(*) from payments where status in ('failed','expired')),
    'count_refunded', (select count(*) from payments where status = 'refunded'),
    'by_method', (select coalesce(json_agg(t), '[]') from (
      select method, count(*) cnt,
             coalesce(sum(amount_cents) filter (where status = 'paid'), 0) paid_cents
      from payments group by method order by method
    ) t),
    'by_gateway', (select coalesce(json_agg(t), '[]') from (
      select gateway, count(*) cnt from payments group by gateway order by gateway
    ) t),
    'by_kind', (select coalesce(json_agg(t), '[]') from (
      select kind, count(*) cnt,
             coalesce(sum(amount_cents) filter (where status = 'paid'), 0) paid_cents
      from payments group by kind order by paid_cents desc
    ) t),
    'mrr_cents', coalesce((select sum(amount_cents) from recurring_subscriptions
                           where status = 'active' and cancel_at_period_end = false), 0),
    'recurring_active', (select count(*) from recurring_subscriptions where status = 'active'),
    'recurring_past_due', (select count(*) from recurring_subscriptions where status = 'past_due'),
    'recurring_canceled', (select count(*) from recurring_subscriptions where status = 'canceled'),
    'recurring_cancel_scheduled', (select count(*) from recurring_subscriptions
                                   where status = 'active' and cancel_at_period_end = true)
  );
$$;

revoke all on function public.admin_financeiro_summary() from public;
