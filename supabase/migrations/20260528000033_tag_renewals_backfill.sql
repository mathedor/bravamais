-- ============================================================
-- 20260528000033_tag_renewals_backfill.sql
-- Polimento da BRAVA Tag:
--  - RPC tag_run_monthly_renewals(limit) — pra cron renovar saldo mensal
--  - Backfill: dá a feature aceita_tag pra todos os estabs ativos
-- ============================================================

-- 1) RPC pra processar renovações mensais vencidas
create or replace function public.tag_run_monthly_renewals(p_limit int default 1000)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings record;
  v_processed int := 0;
  v_failed int := 0;
  v_total_credit bigint := 0;
  w record;
begin
  select * into v_settings from public.tag_settings where id = 1;
  if not v_settings.is_active then
    return json_build_object('ok', false, 'reason', 'tag_settings_inactive');
  end if;

  for w in
    select id, user_id, balance_cents
      from public.tag_wallets
     where monthly_active = true
       and monthly_next_charge <= now()
     order by monthly_next_charge asc
     limit p_limit
  loop
    begin
      update public.tag_wallets
         set balance_cents = balance_cents + v_settings.monthly_plan_credit_cents,
             total_recharged_cents = total_recharged_cents + v_settings.monthly_plan_cents,
             monthly_next_charge = now() + interval '1 month',
             updated_at = now()
       where id = w.id;

      insert into public.tag_transactions (
        wallet_id, user_id, type, amount_cents, balance_after_cents, description, efi_charge_id
      ) values (
        w.id, w.user_id, 'subscription', v_settings.monthly_plan_credit_cents,
        w.balance_cents + v_settings.monthly_plan_credit_cents,
        'Renovação automática mensal — R$ ' ||
          to_char(v_settings.monthly_plan_cents/100.0, 'FM999G999D00') ||
          ' viraram R$ ' || to_char(v_settings.monthly_plan_credit_cents/100.0, 'FM999G999D00'),
        'mock_renewal_' || gen_random_uuid()::text
      );

      insert into public.notifications (user_id, type, title, body, link)
      values (
        w.user_id, 'system',
        '♻️ BRAVA Tag renovada',
        'Seu saldo foi atualizado: + R$ ' ||
          to_char(v_settings.monthly_plan_credit_cents/100.0, 'FM999G999D00'),
        '/app/tag'
      );

      v_processed := v_processed + 1;
      v_total_credit := v_total_credit + v_settings.monthly_plan_credit_cents;
    exception when others then
      v_failed := v_failed + 1;
    end;
  end loop;

  return json_build_object(
    'ok', true,
    'processed', v_processed,
    'failed', v_failed,
    'total_credited_cents', v_total_credit
  );
end $$;

grant execute on function public.tag_run_monthly_renewals(int) to authenticated;

-- 2) Backfill: feature aceita_tag pra estabs ativos que ainda não têm
insert into public.establishment_feature_grants (establishment_id, feature_slug, source, notes)
select e.id, 'aceita_tag', 'admin', 'backfill 2026-05-28 — opt-in automático na rede Tag'
  from public.establishments e
 where e.is_active = true
   and not exists (
     select 1 from public.establishment_feature_grants g
      where g.establishment_id = e.id and g.feature_slug = 'aceita_tag'
   )
on conflict (establishment_id, feature_slug) do nothing;
