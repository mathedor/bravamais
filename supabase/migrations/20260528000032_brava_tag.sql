-- ============================================================
-- 20260528000032_brava_tag.sql
-- BRAVA Tag — a carteira da rede.
--  - Saldo único usável em qualquer estab parceiro (opt-in via feature aceita_tag)
--  - Modelo híbrido: assinatura mensal (auto-recarga c/ bônus) + recarga avulsa
--  - Estab recebe (valor pago em tag − comissão da rede), default 9%
--  - Repasse Efí mock por enquanto (migrar pra real depois)
-- ============================================================

-- 1) Settings globais da Tag (admin edita)
create table if not exists public.tag_settings (
  id int primary key default 1,
  commission_pct numeric(5,2) not null default 9.00 check (commission_pct >= 0 and commission_pct <= 50),
  monthly_plan_cents int not null default 4900,
  monthly_plan_credit_cents int not null default 6000,
  recharge_bonus_pct numeric(5,2) not null default 10.00,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.tag_settings (id) values (1)
on conflict (id) do nothing;

alter table public.tag_settings enable row level security;

drop policy if exists "tag_settings_select" on public.tag_settings;
create policy "tag_settings_select" on public.tag_settings for select using (true);

drop policy if exists "tag_settings_admin_write" on public.tag_settings;
create policy "tag_settings_admin_write" on public.tag_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- 2) Carteira Tag por usuário (1:1 com profile)
create table if not exists public.tag_wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  balance_cents int not null default 0 check (balance_cents >= 0),
  total_recharged_cents bigint not null default 0,
  total_spent_cents bigint not null default 0,
  monthly_active boolean not null default false,
  monthly_next_charge timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tag_wallets_user_idx on public.tag_wallets(user_id);

alter table public.tag_wallets enable row level security;

drop policy if exists "tag_wallets_self" on public.tag_wallets;
create policy "tag_wallets_self" on public.tag_wallets for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "tag_wallets_admin_write" on public.tag_wallets;
create policy "tag_wallets_admin_write" on public.tag_wallets for all
  using (public.is_admin()) with check (public.is_admin());

-- 3) Transações da Tag (extrato)
create table if not exists public.tag_transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid not null references public.tag_wallets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('recharge','spend','bonus','subscription','refund','admin_adjust')),
  amount_cents int not null,
  balance_after_cents int not null,
  description text,
  establishment_id uuid references public.establishments(id) on delete set null,
  pos_sale_id uuid references public.pos_sales(id) on delete set null,
  commission_cents int default 0,
  net_to_estab_cents int default 0,
  efi_charge_id text,
  created_at timestamptz not null default now()
);

create index if not exists tag_tx_user_idx on public.tag_transactions(user_id, created_at desc);
create index if not exists tag_tx_estab_idx on public.tag_transactions(establishment_id, created_at desc);

alter table public.tag_transactions enable row level security;

drop policy if exists "tag_tx_select" on public.tag_transactions;
create policy "tag_tx_select" on public.tag_transactions for select using (
  user_id = auth.uid()
  or public.owns_establishment(establishment_id)
  or public.is_admin()
);

drop policy if exists "tag_tx_admin_write" on public.tag_transactions;
create policy "tag_tx_admin_write" on public.tag_transactions for all
  using (public.is_admin()) with check (public.is_admin());

-- 4) Packs de recarga (admin cadastra)
create table if not exists public.tag_recharge_packs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  amount_cents int not null check (amount_cents > 0),
  bonus_cents int not null default 0 check (bonus_cents >= 0),
  display_order int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.tag_recharge_packs enable row level security;

drop policy if exists "tag_packs_select" on public.tag_recharge_packs;
create policy "tag_packs_select" on public.tag_recharge_packs for select using (true);

drop policy if exists "tag_packs_admin_write" on public.tag_recharge_packs;
create policy "tag_packs_admin_write" on public.tag_recharge_packs for all
  using (public.is_admin()) with check (public.is_admin());

insert into public.tag_recharge_packs (name, amount_cents, bonus_cents, display_order) values
  ('Recarga R$ 30',  3000,  300, 10),
  ('Recarga R$ 50',  5000,  500, 20),
  ('Recarga R$ 100', 10000, 1500, 30),
  ('Recarga R$ 200', 20000, 4000, 40)
on conflict do nothing;

-- 5) RPC pra garantir wallet existe (cria preguiçosamente)
create or replace function public.ensure_tag_wallet(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.tag_wallets (user_id) values (p_user_id)
  on conflict (user_id) do update set updated_at = now()
  returning id into v_id;
  return v_id;
end $$;

grant execute on function public.ensure_tag_wallet(uuid) to authenticated;

-- 6) RPC tag_recharge — usuário recarrega o saldo (Efí mock)
create or replace function public.tag_recharge(p_pack_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pack record;
  v_wallet_id uuid;
  v_balance int;
  v_tx_id uuid;
begin
  select * into v_pack from public.tag_recharge_packs
   where id = p_pack_id and is_active = true;
  if not found then return json_build_object('ok', false, 'error', 'pack_not_found'); end if;

  v_wallet_id := public.ensure_tag_wallet(auth.uid());

  update public.tag_wallets
     set balance_cents = balance_cents + v_pack.amount_cents + v_pack.bonus_cents,
         total_recharged_cents = total_recharged_cents + v_pack.amount_cents,
         updated_at = now()
   where id = v_wallet_id
   returning balance_cents into v_balance;

  insert into public.tag_transactions (
    wallet_id, user_id, type, amount_cents, balance_after_cents,
    description, efi_charge_id
  ) values (
    v_wallet_id, auth.uid(), 'recharge', v_pack.amount_cents, v_balance - v_pack.bonus_cents,
    v_pack.name, 'mock_' || gen_random_uuid()::text
  ) returning id into v_tx_id;

  if v_pack.bonus_cents > 0 then
    insert into public.tag_transactions (
      wallet_id, user_id, type, amount_cents, balance_after_cents, description
    ) values (
      v_wallet_id, auth.uid(), 'bonus', v_pack.bonus_cents, v_balance,
      'Bônus de recarga'
    );
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    auth.uid(),
    'system',
    '⚡ BRAVA Tag recarregada',
    'Saldo agora: R$ ' || to_char(v_balance/100.0, 'FM999G999D00') ||
      case when v_pack.bonus_cents > 0
        then ' (incluindo R$ ' || to_char(v_pack.bonus_cents/100.0, 'FM999G999D00') || ' de bônus)' else '' end,
    '/app/tag'
  );

  return json_build_object('ok', true, 'balance_cents', v_balance, 'bonus_cents', v_pack.bonus_cents);
end $$;

grant execute on function public.tag_recharge(uuid) to authenticated;

-- 7) RPC tag_subscribe_monthly — ativa assinatura mensal (mock)
create or replace function public.tag_subscribe_monthly()
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

  v_wallet_id := public.ensure_tag_wallet(auth.uid());

  update public.tag_wallets
     set balance_cents = balance_cents + v_settings.monthly_plan_credit_cents,
         total_recharged_cents = total_recharged_cents + v_settings.monthly_plan_cents,
         monthly_active = true,
         monthly_next_charge = now() + interval '1 month',
         updated_at = now()
   where id = v_wallet_id
   returning balance_cents into v_balance;

  insert into public.tag_transactions (
    wallet_id, user_id, type, amount_cents, balance_after_cents, description, efi_charge_id
  ) values (
    v_wallet_id, auth.uid(), 'subscription', v_settings.monthly_plan_credit_cents, v_balance,
    'Plano BRAVA Tag mensal — R$ ' || to_char(v_settings.monthly_plan_cents/100.0, 'FM999G999D00')
      || ' viraram R$ ' || to_char(v_settings.monthly_plan_credit_cents/100.0, 'FM999G999D00'),
    'mock_sub_' || gen_random_uuid()::text
  );

  insert into public.notifications (user_id, type, title, body, link)
  values (
    auth.uid(),
    'system',
    '🎁 Plano BRAVA Tag ativado',
    'Saldo recorrente todo mês. Próxima recarga automática em 30 dias.',
    '/app/tag'
  );

  return json_build_object('ok', true, 'balance_cents', v_balance);
end $$;

grant execute on function public.tag_subscribe_monthly() to authenticated;

-- 8) RPC tag_cancel_monthly — desativa
create or replace function public.tag_cancel_monthly()
returns json
language sql
security definer
set search_path = public
as $$
  update public.tag_wallets
     set monthly_active = false,
         monthly_next_charge = null,
         updated_at = now()
   where user_id = auth.uid()
  returning json_build_object('ok', true);
$$;

grant execute on function public.tag_cancel_monthly() to authenticated;

-- 9) Atualiza record_pos_sale pra aceitar benefit_kind='tag'
-- Cliente paga com saldo Tag (até o limite do saldo). Resto = net_cents.
-- Estab recebe net_cents − comissão sobre a parte paga em Tag.
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
  v_wallet record;
  v_settings record;
  v_tag_paid int := 0;
  v_commission int := 0;
  v_net_to_estab int := 0;
  v_min_order int := 0;
  v_remaining_after int := 0;
begin
  if not (public.owns_establishment(p_estab_id) or public.is_admin()) then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_gross_cents < 0 then return json_build_object('ok', false, 'error', 'invalid_gross'); end if;

  if p_benefit_kind = 'coupon' and p_benefit_ref_id is not null then
    select c.*, g.id as grant_id into v_coupon
      from public.coupons c
      left join public.coupon_grants g on g.coupon_id = c.id and g.user_id = p_user_id
     where c.id = p_benefit_ref_id and c.establishment_id = p_estab_id and c.is_active = true
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
    insert into public.coupon_redemptions (coupon_id, user_id, redeemed_at) values (v_coupon.id, p_user_id, now());
    if v_coupon.grant_id is not null then update public.coupon_grants set used_at = now() where id = v_coupon.grant_id; end if;
    update public.coupons set uses_count = coalesce(uses_count, 0) + 1 where id = v_coupon.id;

  elsif p_benefit_kind = 'gift_card' and p_benefit_ref_id is not null then
    select * into v_gift from public.gift_cards
     where id = p_benefit_ref_id and granted_to_user_id = p_user_id and establishment_id = p_estab_id
       and remaining_cents > 0 and (expires_at is null or expires_at > now())
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
    select * into v_reward from public.loyalty_rewards
     where id = p_benefit_ref_id and user_id = p_user_id and establishment_id = p_estab_id and used_at is null
     limit 1;
    if not found then return json_build_object('ok', false, 'error', 'reward_invalid'); end if;
    v_discount := p_gross_cents;
    v_label := 'Fidelidade: ' || v_reward.benefit_description;
    update public.loyalty_rewards set used_at = now(), used_by_establishment_user_id = auth.uid() where id = v_reward.id;

  elsif p_benefit_kind = 'renewable' and p_benefit_ref_id is not null then
    select rg.*, rb.kind as benefit_kind_inner, rb.min_order_cents, rb.headline into v_renewable
      from public.renewable_benefit_grants rg
      join public.renewable_benefits rb on rb.id = rg.benefit_id
     where rg.id = p_benefit_ref_id and rg.user_id = p_user_id and rb.establishment_id = p_estab_id
       and rg.used_at is null and rg.expires_at > now()
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
    update public.renewable_benefit_grants set used_at = now(), status = 'usado' where id = v_renewable.id;

  elsif p_benefit_kind = 'tag' then
    -- valida que o estab aceita Tag
    if not exists (
      select 1 from public.establishment_feature_grants
       where establishment_id = p_estab_id and feature_slug = 'aceita_tag'
    ) then
      return json_build_object('ok', false, 'error', 'estab_does_not_accept_tag');
    end if;

    select * into v_wallet from public.tag_wallets where user_id = p_user_id limit 1;
    if not found or v_wallet.balance_cents <= 0 then
      return json_build_object('ok', false, 'error', 'tag_no_balance');
    end if;

    v_tag_paid := least(v_wallet.balance_cents, p_gross_cents);
    v_label := 'BRAVA Tag (saldo) — R$ ' || to_char(v_tag_paid/100.0, 'FM999G999D00');
    v_discount := 0; -- tag não é desconto, é meio de pagamento

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

  -- Se foi tag, debita do wallet e registra transação + repasse pro estab (com comissão)
  if p_benefit_kind = 'tag' and v_tag_paid > 0 then
    select * into v_settings from public.tag_settings where id = 1;
    v_commission := (v_tag_paid * v_settings.commission_pct / 100)::int;
    v_net_to_estab := v_tag_paid - v_commission;

    update public.tag_wallets
       set balance_cents = balance_cents - v_tag_paid,
           total_spent_cents = total_spent_cents + v_tag_paid,
           updated_at = now()
     where id = v_wallet.id;

    insert into public.tag_transactions (
      wallet_id, user_id, type, amount_cents, balance_after_cents, description,
      establishment_id, pos_sale_id, commission_cents, net_to_estab_cents
    ) values (
      v_wallet.id, p_user_id, 'spend', v_tag_paid, v_wallet.balance_cents - v_tag_paid,
      v_label, p_estab_id, v_sale_id, v_commission, v_net_to_estab
    );

    -- discount_cents da venda = 0, mas o estab só vê o valor liquido a receber
    -- (atualiza o pos_sales pra marcar quanto vai pro estab — usamos discount_cents só pra fim de relatorio)
    update public.pos_sales set discount_cents = v_commission where id = v_sale_id;
    v_net := p_gross_cents - v_commission;
    update public.pos_sales set net_cents = v_net where id = v_sale_id;
  end if;

  select name into v_estab_name from public.establishments where id = p_estab_id;
  select full_name into v_user_name from public.profiles where id = p_user_id;

  if p_benefit_kind = 'tag' then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      p_user_id,
      'system',
      '💳 Pagou com BRAVA Tag na ' || v_estab_name,
      'R$ ' || to_char(v_tag_paid/100.0, 'FM999G999D00') || ' debitado do seu saldo.',
      '/app/tag'
    );
  elsif v_discount > 0 then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      p_user_id, 'system',
      '🎉 Você economizou R$ ' || to_char(v_discount/100.0, 'FM999G999D00') || ' na ' || v_estab_name,
      coalesce(v_label, '') || ' aplicado. Total final: R$ ' || to_char(v_net/100.0, 'FM999G999D00') || '.',
      '/app/economia'
    );
  else
    insert into public.notifications (user_id, type, title, body, link)
    values (
      p_user_id, 'system',
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
    'tag_paid_cents', v_tag_paid,
    'benefit_kind', coalesce(p_benefit_kind, 'none'),
    'benefit_label', v_label,
    'user_name', v_user_name
  );
end $$;

grant execute on function public.record_pos_sale(uuid, uuid, int, text, uuid) to authenticated;

-- 10) RPC pra UI lojista descobrir se aceita Tag + saldo do cliente
create or replace function public.tag_user_balance_at_estab(p_user_id uuid, p_estab_id uuid)
returns json
language sql stable
security definer
set search_path = public
as $$
  select json_build_object(
    'accepts_tag', exists (
      select 1 from public.establishment_feature_grants
       where establishment_id = p_estab_id and feature_slug = 'aceita_tag'
    ),
    'balance_cents', coalesce(
      (select balance_cents from public.tag_wallets where user_id = p_user_id), 0
    )
  );
$$;

grant execute on function public.tag_user_balance_at_estab(uuid, uuid) to authenticated;

-- 11) RPC tag summary admin
create or replace function public.admin_tag_summary()
returns json
language sql stable
security definer
set search_path = public
as $$
  select json_build_object(
    'total_balance', coalesce((select sum(balance_cents) from public.tag_wallets), 0)::bigint,
    'active_wallets', (select count(*) from public.tag_wallets where balance_cents > 0)::bigint,
    'monthly_subscribers', (select count(*) from public.tag_wallets where monthly_active = true)::bigint,
    'total_recharged', coalesce((select sum(total_recharged_cents) from public.tag_wallets), 0)::bigint,
    'total_spent', coalesce((select sum(total_spent_cents) from public.tag_wallets), 0)::bigint,
    'total_commission_30d', coalesce((
      select sum(commission_cents) from public.tag_transactions
       where type = 'spend' and created_at > now() - interval '30 days'
    ), 0)::bigint
  );
$$;

grant execute on function public.admin_tag_summary() to authenticated;
