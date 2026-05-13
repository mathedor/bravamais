-- ============================================================
-- BRAVA+ — Sprint 1: BRAVA Coins + Referrals + Aniversário + Economia
-- ============================================================

-- =========================================================
-- 1) Profiles: aniversário + saldo de coins + referral code
-- =========================================================
alter table public.profiles add column if not exists birthdate date;
alter table public.profiles add column if not exists coins_balance int not null default 0;
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists referred_by_user_id uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists last_birthday_gift_at timestamptz;

create index if not exists profiles_referral_code_idx on public.profiles (referral_code);
create index if not exists profiles_referred_by_idx on public.profiles (referred_by_user_id);

-- Gera referral_code estilo BRAVA-XXXXX pros que ainda não têm
update public.profiles
set referral_code = 'BRAVA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
where referral_code is null;

-- Trigger: novo profile recebe referral_code automaticamente
create or replace function public.generate_referral_code()
returns trigger language plpgsql as $$
begin
  if new.referral_code is null then
    new.referral_code := 'BRAVA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end if;
  return new;
end;
$$;

drop trigger if exists set_referral_code on public.profiles;
create trigger set_referral_code
  before insert on public.profiles
  for each row execute function public.generate_referral_code();

-- =========================================================
-- 2) coin_transactions — ledger imutável
-- =========================================================
create table if not exists public.coin_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta int not null, -- positivo = ganhou, negativo = gastou
  reason text not null, -- 'visit','coupon_redeemed','order_paid','referral_bonus','birthday_gift','redeem_reward'
  related_entity_type text, -- 'visit','coupon','order','referral','reward'
  related_entity_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists coin_tx_user_idx on public.coin_transactions (user_id, created_at desc);
create index if not exists coin_tx_reason_idx on public.coin_transactions (user_id, reason);

alter table public.coin_transactions enable row level security;

drop policy if exists "coin_tx_select" on public.coin_transactions;
create policy "coin_tx_select" on public.coin_transactions for select
  using (user_id = auth.uid() or public.is_admin());

-- =========================================================
-- 3) RPC: grant_coins (atômico, idempotente)
-- =========================================================
-- Se já existe transação com mesmo (user, reason, entity_id) e entity_id não é null, não duplica.
create or replace function public.grant_coins(
  p_user_id uuid,
  p_delta int,
  p_reason text,
  p_entity_type text default null,
  p_entity_id uuid default null
) returns int
language plpgsql security definer as $$
declare
  v_new_balance int;
  v_already_exists boolean;
begin
  if p_delta = 0 then
    select coins_balance into v_new_balance from public.profiles where id = p_user_id;
    return coalesce(v_new_balance, 0);
  end if;

  -- Idempotência: se vier com entity_id, evita gravar duas vezes pro mesmo evento
  if p_entity_id is not null then
    select exists(
      select 1 from public.coin_transactions
      where user_id = p_user_id and reason = p_reason and related_entity_id = p_entity_id
    ) into v_already_exists;
    if v_already_exists then
      select coins_balance into v_new_balance from public.profiles where id = p_user_id;
      return coalesce(v_new_balance, 0);
    end if;
  end if;

  insert into public.coin_transactions (user_id, delta, reason, related_entity_type, related_entity_id)
  values (p_user_id, p_delta, p_reason, p_entity_type, p_entity_id);

  update public.profiles
  set coins_balance = greatest(0, coalesce(coins_balance,0) + p_delta)
  where id = p_user_id
  returning coins_balance into v_new_balance;

  return coalesce(v_new_balance, 0);
end;
$$;

-- =========================================================
-- 4) Referrals — quem indicou quem + status do bônus
-- =========================================================
create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_user_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid not null unique references public.profiles(id) on delete cascade,
  status text not null default 'pending', -- pending, confirmed
  bonus_coins int not null default 50,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists referrals_referrer_idx on public.referrals (referrer_user_id, created_at desc);
create index if not exists referrals_status_idx on public.referrals (status);

alter table public.referrals enable row level security;

drop policy if exists "referrals_select" on public.referrals;
create policy "referrals_select" on public.referrals for select
  using (referrer_user_id = auth.uid() or referred_user_id = auth.uid() or public.is_admin());

-- =========================================================
-- 5) View: total economizado por usuário (cupons usados)
-- =========================================================
create or replace view public.user_savings as
select
  cr.user_id,
  count(*) as coupons_used,
  -- usa discount_cents direto OU estimativa via discount_percent sobre ticket médio fictício de R$ 50
  -- (versão simples; refina depois quando coupon_redemptions guardar discount_applied)
  coalesce(sum(coalesce(c.discount_cents, (50 * c.discount_percent))), 0)::int as total_saved_cents
from public.coupon_redemptions cr
join public.coupons c on c.id = cr.coupon_id
group by cr.user_id;

grant select on public.user_savings to authenticated;

-- =========================================================
-- 6) Coupon redemptions: guardar valor efetivamente economizado
-- =========================================================
alter table public.coupon_redemptions add column if not exists discount_applied_cents int;

-- =========================================================
-- 7) Auto-trigger: ao criar profile, criar entrada de subscription (já existe) — não muda.
--    Birthday cron: deixaremos como check on-load (cheap).
-- =========================================================

-- =========================================================
-- 8) RPC: confirma referral quando o indicado completa assinatura paga
-- =========================================================
create or replace function public.confirm_referral(p_referred_user_id uuid)
returns void
language plpgsql security definer as $$
declare
  v_ref public.referrals%rowtype;
begin
  select * into v_ref from public.referrals where referred_user_id = p_referred_user_id and status = 'pending';
  if not found then return; end if;

  update public.referrals
    set status = 'confirmed', confirmed_at = now()
    where id = v_ref.id;

  -- bonus pro indicador
  perform public.grant_coins(v_ref.referrer_user_id, v_ref.bonus_coins, 'referral_bonus', 'referral', v_ref.id);
  -- bonus pro indicado
  perform public.grant_coins(v_ref.referred_user_id, v_ref.bonus_coins, 'referral_welcome', 'referral', v_ref.id);

  insert into public.notifications (user_id, type, title, body, link)
  values (
    v_ref.referrer_user_id,
    'system',
    '🎉 Seu indicado entrou!',
    'Você ganhou ' || v_ref.bonus_coins || ' BRAVA Coins. Valeu por trazer mais gente pro clube.',
    '/app/indique'
  );
end;
$$;
