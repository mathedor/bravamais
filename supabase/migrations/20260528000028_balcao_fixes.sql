-- ============================================================
-- 20260528000028_balcao_fixes.sql
-- Pequenos ajustes ao record_pos_sale:
--  - renewable_benefit_grants.status passa pra 'usado' (não só used_at)
--  - gift_cards.status reflete saldo zerado
-- ============================================================

create or replace function public.record_pos_sale(
  p_estab_id uuid,
  p_user_id uuid,
  p_gross_cents int,
  p_benefit_kind text,
  p_benefit_ref_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_discount int := 0;
  v_net int;
  v_label text := null;
  v_sale_id uuid;
  v_user_name text;
  v_estab_name text;
  v_coupon record;
  v_gift record;
  v_reward record;
  v_renewable record;
  v_min_order int := 0;
  v_remaining_after int := 0;
begin
  if not (public.owns_establishment(p_estab_id) or public.is_admin()) then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_gross_cents < 0 then return json_build_object('ok', false, 'error', 'invalid_gross'); end if;

  if p_benefit_kind = 'coupon' and p_benefit_ref_id is not null then
    select c.*, g.id as grant_id
      into v_coupon
      from public.coupons c
      left join public.coupon_grants g on g.coupon_id = c.id and g.user_id = p_user_id
     where c.id = p_benefit_ref_id
       and c.establishment_id = p_estab_id
       and c.is_active = true
       and (c.valid_until is null or c.valid_until > now())
     limit 1;

    if not found then return json_build_object('ok', false, 'error', 'coupon_invalid'); end if;
    if exists (select 1 from public.coupon_redemptions where coupon_id = v_coupon.id and user_id = p_user_id) then
      return json_build_object('ok', false, 'error', 'coupon_already_used');
    end if;

    if v_coupon.discount_percent is not null then
      v_discount := (p_gross_cents * v_coupon.discount_percent / 100)::int;
    elsif v_coupon.discount_cents is not null then
      v_discount := least(v_coupon.discount_cents, p_gross_cents);
    end if;

    v_label := 'Cupom ' || v_coupon.code;

    insert into public.coupon_redemptions (coupon_id, user_id, redeemed_at)
    values (v_coupon.id, p_user_id, now());

    if v_coupon.grant_id is not null then
      update public.coupon_grants set used_at = now() where id = v_coupon.grant_id;
    end if;

    update public.coupons set uses_count = coalesce(uses_count, 0) + 1 where id = v_coupon.id;

  elsif p_benefit_kind = 'gift_card' and p_benefit_ref_id is not null then
    select * into v_gift
      from public.gift_cards
     where id = p_benefit_ref_id
       and granted_to_user_id = p_user_id
       and establishment_id = p_estab_id
       and remaining_cents > 0
       and (expires_at is null or expires_at > now())
     limit 1;
    if not found then return json_build_object('ok', false, 'error', 'gift_card_invalid'); end if;

    v_discount := least(v_gift.remaining_cents, p_gross_cents);
    v_remaining_after := v_gift.remaining_cents - v_discount;
    v_label := 'Vale-presente ' || v_gift.code;

    update public.gift_cards
       set remaining_cents = v_remaining_after,
           redeemed_at = case when v_remaining_after = 0 then now() else redeemed_at end,
           status = case when v_remaining_after = 0 then 'redeemed' else status end
     where id = v_gift.id;

  elsif p_benefit_kind = 'loyalty_reward' and p_benefit_ref_id is not null then
    select * into v_reward
      from public.loyalty_rewards
     where id = p_benefit_ref_id
       and user_id = p_user_id
       and establishment_id = p_estab_id
       and used_at is null
     limit 1;
    if not found then return json_build_object('ok', false, 'error', 'reward_invalid'); end if;

    v_discount := p_gross_cents;
    v_label := 'Fidelidade: ' || v_reward.benefit_description;

    update public.loyalty_rewards
       set used_at = now(),
           used_by_establishment_user_id = auth.uid()
     where id = v_reward.id;

  elsif p_benefit_kind = 'renewable' and p_benefit_ref_id is not null then
    select rg.*, rb.kind as benefit_kind_inner, rb.min_order_cents, rb.headline
      into v_renewable
      from public.renewable_benefit_grants rg
      join public.renewable_benefits rb on rb.id = rg.benefit_id
     where rg.id = p_benefit_ref_id
       and rg.user_id = p_user_id
       and rb.establishment_id = p_estab_id
       and rg.used_at is null
       and rg.expires_at > now()
     limit 1;
    if not found then return json_build_object('ok', false, 'error', 'renewable_invalid'); end if;

    v_min_order := coalesce(v_renewable.min_order_cents, 0);
    if v_min_order > 0 and p_gross_cents < v_min_order then
      return json_build_object('ok', false, 'error', 'below_min_order', 'min_order_cents', v_min_order);
    end if;

    if v_renewable.benefit_kind_inner = 'percent' then
      v_discount := (p_gross_cents * v_renewable.value / 100)::int;
    else
      v_discount := least(v_renewable.value, p_gross_cents);
    end if;

    v_label := 'Renovável: ' || v_renewable.headline;

    update public.renewable_benefit_grants
       set used_at = now(),
           status = 'usado'
     where id = v_renewable.id;

  elsif p_benefit_kind = 'none' or p_benefit_kind is null then
    v_discount := 0;
    v_label := null;
  else
    return json_build_object('ok', false, 'error', 'invalid_benefit_kind');
  end if;

  v_net := greatest(0, p_gross_cents - v_discount);

  insert into public.pos_sales (
    establishment_id, user_id, scanner_user_id, gross_cents, discount_cents, net_cents,
    benefit_kind, benefit_ref_id, benefit_label
  )
  values (
    p_estab_id, p_user_id, auth.uid(), p_gross_cents, v_discount, v_net,
    coalesce(p_benefit_kind, 'none'), p_benefit_ref_id, v_label
  )
  returning id into v_sale_id;

  select name into v_estab_name from public.establishments where id = p_estab_id;
  select full_name into v_user_name from public.profiles where id = p_user_id;

  if v_discount > 0 then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      p_user_id,
      'system',
      '🎉 Você economizou R$ ' || to_char(v_discount/100.0, 'FM999G999D00') || ' na ' || v_estab_name,
      coalesce(v_label, '') || ' aplicado. Total final: R$ ' || to_char(v_net/100.0, 'FM999G999D00') || '.',
      '/app/economia'
    );
  else
    insert into public.notifications (user_id, type, title, body, link)
    values (
      p_user_id,
      'system',
      '✅ Visita registrada na ' || v_estab_name,
      'R$ ' || to_char(p_gross_cents/100.0, 'FM999G999D00') || ' registrado. Continue ganhando benefícios!',
      '/app/visitas'
    );
  end if;

  return json_build_object(
    'ok', true,
    'sale_id', v_sale_id,
    'gross_cents', p_gross_cents,
    'discount_cents', v_discount,
    'net_cents', v_net,
    'benefit_kind', coalesce(p_benefit_kind, 'none'),
    'benefit_label', v_label,
    'user_name', v_user_name
  );
end $$;

grant execute on function public.record_pos_sale(uuid, uuid, int, text, uuid) to authenticated;
