-- ============================================================
-- 20260528000027_balcao_pos_sales.sql
-- "Balcão BRAVA+": registra venda física no estab e usa 1 benefício
-- (cupom / vale-presente / recompensa fidelidade / benefício renovável)
-- ============================================================

-- 1) Tabela pos_sales — registro central de cada venda no balcão
create table if not exists public.pos_sales (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  scanner_user_id uuid references public.profiles(id),
  gross_cents int not null check (gross_cents >= 0),
  discount_cents int not null default 0 check (discount_cents >= 0),
  net_cents int not null check (net_cents >= 0),
  benefit_kind text check (benefit_kind in ('coupon','gift_card','loyalty_reward','renewable','none')),
  benefit_ref_id uuid,
  benefit_label text,
  visit_id uuid references public.visits(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists pos_sales_estab_idx on public.pos_sales(establishment_id, created_at desc);
create index if not exists pos_sales_user_idx on public.pos_sales(user_id, created_at desc);

alter table public.pos_sales enable row level security;

drop policy if exists "pos_sales_select" on public.pos_sales;
create policy "pos_sales_select" on public.pos_sales for select using (
  user_id = auth.uid()
  or public.owns_establishment(establishment_id)
  or public.is_admin()
);

drop policy if exists "pos_sales_insert_estab" on public.pos_sales;
create policy "pos_sales_insert_estab" on public.pos_sales for insert with check (
  public.owns_establishment(establishment_id) or public.is_admin()
);

-- 2) RPC: lista benefícios que o user tem disponíveis NESSE estab
create or replace function public.list_user_benefits_at_estab(
  p_estab_id uuid,
  p_user_id uuid
)
returns json
language sql stable
security definer
set search_path = public
as $$
  with
  coupons_avail as (
    select 'coupon' as kind,
           c.id as ref_id,
           coalesce(c.description, 'Cupom ' || c.code) as label,
           c.code as code,
           c.discount_percent,
           c.discount_cents,
           c.valid_until,
           g.id as grant_id
      from public.coupon_grants g
      join public.coupons c on c.id = g.coupon_id
     where g.user_id = p_user_id
       and c.establishment_id = p_estab_id
       and c.is_active = true
       and g.used_at is null
       and (c.valid_until is null or c.valid_until > now())
       and not exists (
         select 1 from public.coupon_redemptions r
          where r.coupon_id = c.id and r.user_id = p_user_id
       )
  ),
  gift_cards_avail as (
    select 'gift_card' as kind,
           gc.id as ref_id,
           ('Vale-presente ' || gc.code) as label,
           gc.code as code,
           gc.value_cents,
           gc.remaining_cents,
           gc.expires_at
      from public.gift_cards gc
     where gc.granted_to_user_id = p_user_id
       and gc.establishment_id = p_estab_id
       and gc.remaining_cents > 0
       and (gc.expires_at is null or gc.expires_at > now())
  ),
  loyalty_avail as (
    select 'loyalty_reward' as kind,
           lr.id as ref_id,
           ('Prêmio fidelidade: ' || lr.benefit_description) as label,
           lr.reward_code as code,
           lr.benefit_description,
           lr.claimed_at
      from public.loyalty_rewards lr
     where lr.user_id = p_user_id
       and lr.establishment_id = p_estab_id
       and lr.used_at is null
  ),
  renewable_avail as (
    select 'renewable' as kind,
           rg.id as ref_id,
           ('Benefício renovável: ' || rb.headline) as label,
           rg.code as code,
           rb.kind as benefit_subkind,
           rg.value as benefit_value,
           rg.expires_at,
           rb.min_order_cents
      from public.renewable_benefit_grants rg
      join public.renewable_benefits rb on rb.id = rg.benefit_id
     where rg.user_id = p_user_id
       and rb.establishment_id = p_estab_id
       and rg.used_at is null
       and rg.expires_at > now()
  ),
  loyalty_progress_info as (
    select lc.visits_required, coalesce(lp.visits_count, 0) as visits_count, lc.benefit_description
      from public.loyalty_clubs lc
      left join public.loyalty_progress lp on lp.club_id = lc.id and lp.user_id = p_user_id
     where lc.establishment_id = p_estab_id and lc.is_active = true
     limit 1
  )
  select json_build_object(
    'coupons',           coalesce((select json_agg(row_to_json(c)) from coupons_avail c), '[]'::json),
    'gift_cards',        coalesce((select json_agg(row_to_json(g)) from gift_cards_avail g), '[]'::json),
    'loyalty_rewards',   coalesce((select json_agg(row_to_json(l)) from loyalty_avail l), '[]'::json),
    'renewable_grants',  coalesce((select json_agg(row_to_json(r)) from renewable_avail r), '[]'::json),
    'loyalty_progress',  (select row_to_json(p) from loyalty_progress_info p)
  );
$$;

grant execute on function public.list_user_benefits_at_estab(uuid, uuid) to authenticated;

-- 3) RPC: registra venda no balcão (com ou sem benefício)
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
  v_renewable_cfg record;
  v_min_order int := 0;
begin
  -- valida ownership
  if not (public.owns_establishment(p_estab_id) or public.is_admin()) then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_gross_cents < 0 then return json_build_object('ok', false, 'error', 'invalid_gross'); end if;

  -- calcula desconto e marca benefício como usado, conforme tipo
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
    v_label := 'Vale-presente ' || v_gift.code;

    update public.gift_cards
       set remaining_cents = remaining_cents - v_discount,
           redeemed_at = case when remaining_cents - v_discount = 0 then now() else redeemed_at end
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

    -- recompensa de fidelidade tradicionalmente vale 'X de graça' — aplica 100% como cortesia
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
      -- voucher (centavos)
      v_discount := least(v_renewable.value, p_gross_cents);
    end if;

    v_label := 'Renovável: ' || v_renewable.headline;

    update public.renewable_benefit_grants
       set used_at = now()
     where id = v_renewable.id;

  elsif p_benefit_kind = 'none' or p_benefit_kind is null then
    v_discount := 0;
    v_label := null;
  else
    return json_build_object('ok', false, 'error', 'invalid_benefit_kind');
  end if;

  v_net := greatest(0, p_gross_cents - v_discount);

  -- insere venda
  insert into public.pos_sales (
    establishment_id, user_id, scanner_user_id, gross_cents, discount_cents, net_cents,
    benefit_kind, benefit_ref_id, benefit_label
  )
  values (
    p_estab_id, p_user_id, auth.uid(), p_gross_cents, v_discount, v_net,
    coalesce(p_benefit_kind, 'none'), p_benefit_ref_id, v_label
  )
  returning id into v_sale_id;

  -- nomes para notification
  select name into v_estab_name from public.establishments where id = p_estab_id;
  select full_name into v_user_name from public.profiles where id = p_user_id;

  -- notifica o cliente
  if v_discount > 0 then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      p_user_id,
      'system',
      '🎉 Você economizou R$ ' || to_char(v_discount/100.0, 'FM999G999D00') || ' na ' || v_estab_name,
      coalesce(v_label, '') || ' aplicado. Total final: R$ ' || to_char(v_net/100.0, 'FM999G999D00') || '.',
      '/app/visitas'
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

-- 4) RPC pra dashboard do estab: vendas + descontos no período
create or replace function public.estab_pos_summary(p_estab_id uuid, p_days int default 30)
returns json
language sql stable
as $$
  with window_data as (
    select coalesce(sum(gross_cents), 0) as gross_total,
           coalesce(sum(discount_cents), 0) as discount_total,
           coalesce(sum(net_cents), 0) as net_total,
           count(*) as sales_count,
           count(*) filter (where benefit_kind <> 'none') as sales_with_benefit
      from public.pos_sales
     where establishment_id = p_estab_id
       and created_at > now() - (p_days || ' days')::interval
  )
  select row_to_json(window_data) from window_data;
$$;

grant execute on function public.estab_pos_summary(uuid, int) to authenticated;
