-- ============================================================
-- 20260528000035_login_events_multi_ip.sql
-- Captura logins (user_id + ip + user_agent) e adiciona regra
-- multiple_ips ao run_fraud_scan (>2 IPs distintos em < 1h).
-- ============================================================

-- 1) Tabela de eventos de login
create table if not exists public.login_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists login_events_user_idx on public.login_events(user_id, created_at desc);
create index if not exists login_events_ip_idx on public.login_events(ip, created_at desc);

alter table public.login_events enable row level security;

drop policy if exists "login_events_admin_select" on public.login_events;
create policy "login_events_admin_select" on public.login_events for select
  using (public.is_admin() or user_id = auth.uid());

drop policy if exists "login_events_admin_insert" on public.login_events;
create policy "login_events_admin_insert" on public.login_events for insert
  with check (true);

-- 2) RPC pra registrar (chamado da action signinAction)
create or replace function public.record_login_event(p_ip text, p_user_agent text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.login_events (user_id, ip, user_agent)
  values (
    auth.uid(),
    nullif(p_ip, '')::inet,
    nullif(p_user_agent, '')
  );
$$;

grant execute on function public.record_login_event(text, text) to authenticated;

-- 3) Atualiza run_fraud_scan pra incluir regra multiple_ips
create or replace function public.run_fraud_scan()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_visits int := 0;
  v_ips int := 0;
begin
  -- regra existente: visits_burst
  insert into public.fraud_signals_log (user_id, establishment_id, kind, severity, evidence)
  select
    user_id, establishment_id, 'visits_burst', 'medium',
    json_build_object('visits', visits_count, 'window_minutes', 60)
  from (
    select user_id, establishment_id, count(*) as visits_count
      from public.visits
     where created_at > now() - interval '30 days'
     group by user_id, establishment_id, date_trunc('hour', created_at)
    having count(*) > 5
  ) t
  where not exists (
    select 1 from public.fraud_signals_log
     where kind = 'visits_burst' and user_id = t.user_id
       and establishment_id = t.establishment_id
       and created_at > now() - interval '24 hours'
  );
  get diagnostics v_visits = row_count;

  -- regra existente: coupon_velocity
  insert into public.fraud_signals_log (user_id, kind, severity, evidence)
  select user_id, 'coupon_velocity', 'high',
         json_build_object('distinct_estabs', cnt, 'day', dt::text)
    from (
      select cr.user_id, date_trunc('day', cr.redeemed_at) as dt,
             count(distinct c.establishment_id) as cnt
        from public.coupon_redemptions cr
        join public.coupons c on c.id = cr.coupon_id
       where cr.redeemed_at > now() - interval '30 days'
       group by cr.user_id, date_trunc('day', cr.redeemed_at)
      having count(distinct c.establishment_id) >= 5
    ) t
   where not exists (
     select 1 from public.fraud_signals_log fsl
      where fsl.kind = 'coupon_velocity' and fsl.user_id = t.user_id
        and fsl.created_at > now() - interval '24 hours'
   );

  -- regra existente: rapid_signup_redemption
  insert into public.fraud_signals_log (user_id, kind, severity, evidence)
  select p.id, 'rapid_signup_redemption', 'low',
         json_build_object('signup_at', p.created_at, 'first_redeem_at', min_r)
    from public.profiles p
    join (
      select user_id, min(redeemed_at) as min_r
        from public.coupon_redemptions
       group by user_id
    ) cr on cr.user_id = p.id
   where cr.min_r - p.created_at < interval '1 hour'
     and p.created_at > now() - interval '30 days'
     and not exists (
       select 1 from public.fraud_signals_log fsl
        where fsl.kind = 'rapid_signup_redemption' and fsl.user_id = p.id
     );

  -- regra NOVA: multiple_ips (>2 IPs distintos em < 1h)
  insert into public.fraud_signals_log (user_id, kind, severity, evidence)
  select user_id, 'multiple_ips', 'high',
         json_build_object('distinct_ips', cnt, 'window_minutes', 60)
    from (
      select user_id, count(distinct ip) as cnt
        from public.login_events
       where created_at > now() - interval '24 hours'
         and ip is not null
       group by user_id, date_trunc('hour', created_at)
      having count(distinct ip) > 2
    ) t
   where not exists (
     select 1 from public.fraud_signals_log fsl
      where fsl.kind = 'multiple_ips' and fsl.user_id = t.user_id
        and fsl.created_at > now() - interval '24 hours'
   );
  get diagnostics v_ips = row_count;

  return json_build_object(
    'ok', true,
    'new_visits_burst', v_visits,
    'new_multiple_ips', v_ips
  );
end $$;

grant execute on function public.run_fraud_scan() to authenticated;

-- 4) Tabela pra ledger de webhooks Efí (preparação pra integração real)
create table if not exists public.efi_webhook_events (
  id uuid primary key default uuid_generate_v4(),
  txid text not null,
  end_to_end_id text,
  amount_brl text,
  paid_at timestamptz,
  info_pagador text,
  raw_payload jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists efi_webhook_txid_idx on public.efi_webhook_events(txid);
create index if not exists efi_webhook_recent_idx on public.efi_webhook_events(created_at desc);

alter table public.efi_webhook_events enable row level security;

drop policy if exists "efi_webhook_admin_only" on public.efi_webhook_events;
create policy "efi_webhook_admin_only" on public.efi_webhook_events for all
  using (public.is_admin()) with check (public.is_admin());
