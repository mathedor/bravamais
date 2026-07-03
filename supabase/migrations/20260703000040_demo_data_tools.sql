-- =============================================================
-- 040 — Ferramentas de dados demo
-- admin_demo_stats(): contagens do que existe de fictício
-- admin_clear_demo_data(p_keep_logins): apaga TUDO que é demo
--   (usuários @bravamais.app, estabelecimentos deles e toda a
--    atividade ligada). p_keep_logins=true preserva os 5 logins
--    demo.{usuario,lojista,entregador,comercial,admin}.
-- =============================================================

create or replace function public.admin_demo_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_users uuid[];
  v_estabs uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_users
    from auth.users where email like '%@bravamais.app';
  select coalesce(array_agg(id), '{}') into v_estabs
    from establishments where owner_id = any(v_users);

  return jsonb_build_object(
    'demo_users', coalesce(array_length(v_users, 1), 0),
    'demo_estabs', coalesce(array_length(v_estabs, 1), 0),
    'visits', (select count(*) from visits where user_id = any(v_users) or establishment_id = any(v_estabs)),
    'orders', (select count(*) from orders where user_id = any(v_users) or establishment_id = any(v_estabs)),
    'pos_sales', (select count(*) from pos_sales where user_id = any(v_users) or establishment_id = any(v_estabs)),
    'payments', (select count(*) from payments where user_id = any(v_users)),
    'gift_cards', (select count(*) from gift_cards where buyer_user_id = any(v_users) or establishment_id = any(v_estabs)),
    'coupon_redemptions', (select count(*) from coupon_redemptions where user_id = any(v_users)),
    'stories', (select count(*) from establishment_stories where establishment_id = any(v_estabs)),
    'withdrawals', (select count(*) from withdrawals where establishment_id = any(v_estabs)),
    'refund_tickets', (select count(*) from refund_tickets where user_id = any(v_users) or establishment_id = any(v_estabs)),
    'notifications', (select count(*) from notifications where user_id = any(v_users))
  );
end;
$fn$;

revoke all on function public.admin_demo_stats() from public, anon, authenticated;
grant execute on function public.admin_demo_stats() to service_role;

create or replace function public.admin_clear_demo_data(p_keep_logins boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_users uuid[];
  v_estabs uuid[];
  v_counts jsonb := '{}'::jsonb;
  v_n bigint;
begin
  select coalesce(array_agg(id), '{}') into v_users
    from auth.users
   where email like '%@bravamais.app'
     and (not p_keep_logins or email not in (
       'demo.usuario@bravamais.app',
       'demo.lojista@bravamais.app',
       'demo.entregador@bravamais.app',
       'demo.comercial@bravamais.app',
       'demo.admin@bravamais.app'));

  select coalesce(array_agg(id), '{}') into v_estabs
    from establishments where owner_id = any(v_users);

  if coalesce(array_length(v_users, 1), 0) = 0 then
    return jsonb_build_object('demo_users', 0, 'msg', 'nada pra limpar');
  end if;

  -- A ordem importa: primeiro as tabelas com FK RESTRICT / NO ACTION,
  -- depois estabelecimentos (cascade) e por fim os usuários (cascade).

  delete from tag_transactions
   where user_id = any(v_users) or establishment_id = any(v_estabs)
      or pos_sale_id in (select id from pos_sales where user_id = any(v_users) or scanner_user_id = any(v_users) or establishment_id = any(v_estabs));
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('tag_transactions', v_n);

  delete from pos_sales
   where user_id = any(v_users) or scanner_user_id = any(v_users) or establishment_id = any(v_estabs);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('pos_sales', v_n);

  delete from loyalty_rewards
   where user_id = any(v_users) or used_by_establishment_user_id = any(v_users) or establishment_id = any(v_estabs);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('loyalty_rewards', v_n);

  update refund_tickets set resolved_by_admin_user_id = null where resolved_by_admin_user_id = any(v_users);
  delete from refund_tickets
   where user_id = any(v_users) or establishment_id = any(v_estabs)
      or order_id in (select id from orders where user_id = any(v_users) or establishment_id = any(v_estabs));
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('refund_tickets', v_n);

  delete from deliveries
   where establishment_id = any(v_estabs)
      or order_id in (select id from orders where user_id = any(v_users) or establishment_id = any(v_estabs))
      or deliverer_id in (select id from deliverers where user_id = any(v_users));
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('deliveries', v_n);

  delete from visits
   where user_id = any(v_users) or scanned_by_user_id = any(v_users) or establishment_id = any(v_estabs)
      or order_id in (select id from orders where user_id = any(v_users) or establishment_id = any(v_estabs));
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('visits', v_n);

  delete from orders where user_id = any(v_users) or establishment_id = any(v_estabs);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('orders', v_n);

  delete from gift_cards
   where buyer_user_id = any(v_users) or granted_to_user_id = any(v_users) or establishment_id = any(v_estabs);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('gift_cards', v_n);

  update withdrawals set processed_by_admin_user_id = null where processed_by_admin_user_id = any(v_users);
  delete from withdrawals where establishment_id = any(v_estabs) or requested_by_user_id = any(v_users);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('withdrawals', v_n);

  delete from promo_blasts where establishment_id = any(v_estabs) or fired_by_user_id = any(v_users);
  delete from b2b_invites where invited_by_admin_user_id = any(v_users) or accepted_user_id = any(v_users);
  delete from campaigns where created_by = any(v_users);
  delete from editorial_lists where created_by_admin_user_id = any(v_users);

  update fraud_signals_log set resolved_by = null where resolved_by = any(v_users);
  delete from fraud_signals_log where user_id = any(v_users) or establishment_id = any(v_estabs);

  update reports set resolved_by_admin_user_id = null where resolved_by_admin_user_id = any(v_users);
  delete from reports where reporter_user_id = any(v_users);

  delete from shared_coupons where sender_user_id = any(v_users) or redeemed_by_user_id = any(v_users);

  update support_tickets set assigned_admin_user_id = null where assigned_admin_user_id = any(v_users);
  delete from support_tickets where opener_user_id = any(v_users) or establishment_id = any(v_estabs);

  delete from payments where user_id = any(v_users);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('payments', v_n);

  delete from recurring_subscriptions where user_id = any(v_users);
  delete from login_events where user_id = any(v_users);
  delete from retention_offers where user_id = any(v_users);
  delete from access_logs
   where user_id = any(v_users)
      or (entity_type = 'establishment' and entity_id = any(v_estabs));
  delete from group_outings where establishment_id = any(v_estabs);

  delete from commercial_prospects
   where converted_user_id = any(v_users) or converted_establishment_id = any(v_estabs)
      or affiliate_id in (select id from commercial_affiliates where user_id = any(v_users));
  delete from commercial_affiliates where user_id = any(v_users);

  update deliverers set approved_by = null where approved_by = any(v_users);
  delete from deliverers where user_id = any(v_users);

  delete from partnerships where proposed_by = any(v_estabs);
  update establishment_feature_requests set resolved_by = null where resolved_by = any(v_users);

  delete from establishments where id = any(v_estabs);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('establishments', v_n);

  delete from auth.users where id = any(v_users);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('users', v_n);

  return v_counts;
end;
$fn$;

revoke all on function public.admin_clear_demo_data(boolean) from public, anon, authenticated;
grant execute on function public.admin_clear_demo_data(boolean) to service_role;
