-- ============================================================
-- Pagamentos reais: SyncPay (PIX) + Stripe (cartão / Apple Pay / Google Pay)
--
-- Tabela única `payments` = fonte da verdade de toda cobrança.
-- Cada cobrança aponta pra um "kind" (subscription | order | tag_recharge)
-- e é confirmada por webhook OU por polling (idempotente).
-- ============================================================

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('subscription','order','tag_recharge')),
  ref_id text,                               -- tier / order_id / pack_id
  ref_meta jsonb not null default '{}'::jsonb,
  method text not null check (method in ('pix','card')),
  gateway text not null check (gateway in ('syncpay','stripe','mock')),
  gateway_charge_id text,                    -- syncpay identifier | stripe payment_intent id
  amount_cents int not null,
  status text not null default 'pending'
    check (status in ('pending','paid','failed','expired','refunded')),
  pix_code text,                             -- copia e cola
  pix_qr_base64 text,
  expires_at timestamptz,
  paid_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);
create index if not exists payments_charge_idx on public.payments (gateway, gateway_charge_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_kind_ref_idx on public.payments (kind, ref_id);

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments for select
  using (user_id = auth.uid());

-- escrita só via service role (server actions / webhooks). Nenhuma policy de insert/update
-- pra authenticated => bloqueado por padrão; service role ignora RLS.

drop trigger if exists set_updated_at_payments on public.payments;
create trigger set_updated_at_payments before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================
-- RPC: credita recarga da Tag a partir de um pagamento confirmado.
-- Versão "paga de verdade" do tag_recharge (que era mock instantâneo).
-- Roda como service role no fulfillment. Idempotência fica no payments.status.
-- ============================================================
create or replace function public.tag_recharge_fulfill(p_user_id uuid, p_pack_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pack   public.tag_recharge_packs%rowtype;
  v_wallet_id uuid;
  v_balance bigint;
begin
  select * into v_pack from public.tag_recharge_packs where id = p_pack_id and is_active = true;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'pack_not_found');
  end if;

  -- garante carteira
  insert into public.tag_wallets (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  update public.tag_wallets
     set balance_cents = balance_cents + v_pack.amount_cents + v_pack.bonus_cents,
         total_recharged_cents = total_recharged_cents + v_pack.amount_cents,
         updated_at = now()
   where user_id = p_user_id
  returning id, balance_cents into v_wallet_id, v_balance;

  insert into public.tag_transactions (
    wallet_id, user_id, type, amount_cents, balance_after_cents, description
  ) values (
    v_wallet_id, p_user_id, 'recharge', v_pack.amount_cents,
    v_balance - v_pack.bonus_cents, 'Recarga ' || v_pack.name
  );

  if v_pack.bonus_cents > 0 then
    insert into public.tag_transactions (
      wallet_id, user_id, type, amount_cents, balance_after_cents, description
    ) values (
      v_wallet_id, p_user_id, 'bonus', v_pack.bonus_cents, v_balance, 'Bônus de recarga'
    );
  end if;

  return jsonb_build_object('ok', true, 'balance_cents', v_balance, 'bonus_cents', v_pack.bonus_cents);
end;
$$;

revoke all on function public.tag_recharge_fulfill(uuid, uuid) from public;
