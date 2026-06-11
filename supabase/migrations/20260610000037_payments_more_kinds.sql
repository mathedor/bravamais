-- ============================================================
-- Estende pagamentos pra TODOS os tipos de cobrança:
--   tag_monthly | category_subscription | establishment_plan | gift_card | wallet_deposit
-- + RPCs de fulfillment (rodam como service role, recebem user_id por parâmetro,
--   já que auth.uid() é null no contexto de webhook/admin).
-- ============================================================

alter table public.payments drop constraint if exists payments_kind_check;
alter table public.payments add constraint payments_kind_check check (
  kind in (
    'subscription','order','tag_recharge',
    'tag_monthly','category_subscription','establishment_plan','gift_card','wallet_deposit'
  )
);

-- ---------- Tag mensal (versão fulfill por user_id) ----------
create or replace function public.tag_subscribe_monthly_fulfill(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings record;
  v_wallet_id uuid;
  v_balance int;
begin
  select * into v_settings from public.tag_settings where id = 1;
  v_wallet_id := public.ensure_tag_wallet(p_user_id);

  update public.tag_wallets
     set balance_cents = balance_cents + v_settings.monthly_plan_credit_cents,
         total_recharged_cents = total_recharged_cents + v_settings.monthly_plan_cents,
         monthly_active = true,
         monthly_next_charge = now() + interval '1 month',
         updated_at = now()
   where id = v_wallet_id
   returning balance_cents into v_balance;

  insert into public.tag_transactions (
    wallet_id, user_id, type, amount_cents, balance_after_cents, description
  ) values (
    v_wallet_id, p_user_id, 'subscription', v_settings.monthly_plan_credit_cents, v_balance,
    'Plano BRAVA Tag mensal'
  );

  return json_build_object('ok', true, 'balance_cents', v_balance);
end $$;

revoke all on function public.tag_subscribe_monthly_fulfill(uuid) from public;

-- ---------- Categorias (versão fulfill por user_id) ----------
create or replace function public.set_user_categories_fulfill(p_user_id uuid, p_category_ids uuid[])
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub_id uuid;
  v_total int;
begin
  select id into v_sub_id from public.subscriptions where user_id = p_user_id limit 1;
  if not found then
    return json_build_object('ok', false, 'error', 'subscription_not_found');
  end if;

  delete from public.user_subscription_categories where subscription_id = v_sub_id;

  if array_length(p_category_ids, 1) is not null then
    insert into public.user_subscription_categories (subscription_id, category_id)
    select v_sub_id, unnest(p_category_ids)
    on conflict do nothing;
  end if;

  v_total := public.compute_user_monthly_total(v_sub_id);

  update public.subscriptions
     set categories_total_cents = v_total,
         custom_categories_set = true,
         status = 'active',
         updated_at = now()
   where id = v_sub_id;

  return json_build_object('ok', true, 'total_cents', v_total);
end $$;

revoke all on function public.set_user_categories_fulfill(uuid, uuid[]) from public;
