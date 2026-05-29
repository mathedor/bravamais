-- ============================================================
-- 20260528000034_sprint_admin_growth.sql
-- Sprint admin & growth:
--  - fraud_signals (tabela persistente + RPC run_fraud_scan)
--  - campaigns + campaign_recipients (admin envia campanha segmentada)
--  - retention_offers (cron de churn registra cupons disparados)
--  - admin_ltv_summary RPC (LTV médio, top 10%, por tier, por categoria)
--  - dispatch_churn_retention RPC (cria cupom retenção + grant)
--  - dispatch_campaign RPC (cria notifs + ledger em campaign_recipients)
-- ============================================================

-- 1) Tabela fraud_signals (substitui RPC ad-hoc — agora persiste histórico)
create table if not exists public.fraud_signals_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  establishment_id uuid references public.establishments(id) on delete cascade,
  kind text not null check (kind in (
    'multiple_ips','rapid_signup_redemption','coupon_velocity','duplicate_qr','visits_burst'
  )),
  severity text not null default 'medium' check (severity in ('low','medium','high')),
  evidence jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists fraud_signals_log_user_idx on public.fraud_signals_log(user_id);
create index if not exists fraud_signals_log_open_idx on public.fraud_signals_log(created_at desc) where resolved_at is null;

alter table public.fraud_signals_log enable row level security;
drop policy if exists "fsl_admin_only" on public.fraud_signals_log;
create policy "fsl_admin_only" on public.fraud_signals_log for all
  using (public.is_admin()) with check (public.is_admin());

-- 2) Tabela campaigns + campaign_recipients
create table if not exists public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  title text not null,
  body text not null,
  link text,
  segment jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','scheduled','sending','sent','failed','cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count int not null default 0,
  send_email boolean not null default false,
  send_push boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_status_idx on public.campaigns(status);
create index if not exists campaigns_sched_idx on public.campaigns(scheduled_at) where status = 'scheduled';

alter table public.campaigns enable row level security;
drop policy if exists "campaigns_admin_only" on public.campaigns;
create policy "campaigns_admin_only" on public.campaigns for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.campaign_recipients (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_id uuid references public.notifications(id) on delete set null,
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  unique (campaign_id, user_id)
);

create index if not exists campaign_recipients_camp_idx on public.campaign_recipients(campaign_id);

alter table public.campaign_recipients enable row level security;
drop policy if exists "cr_self_or_admin" on public.campaign_recipients;
create policy "cr_self_or_admin" on public.campaign_recipients for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "cr_admin_write" on public.campaign_recipients;
create policy "cr_admin_write" on public.campaign_recipients for all
  using (public.is_admin()) with check (public.is_admin());

-- 3) Tabela retention_offers (ledger do cron de churn)
create table if not exists public.retention_offers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coupon_id uuid references public.coupons(id) on delete set null,
  reason text not null default 'churn_30d',
  sent_at timestamptz not null default now(),
  notification_id uuid references public.notifications(id) on delete set null,
  email_sent boolean not null default false,
  redeemed_at timestamptz,
  unique (user_id, reason, sent_at)
);

create index if not exists ro_user_idx on public.retention_offers(user_id, sent_at desc);

alter table public.retention_offers enable row level security;
drop policy if exists "ro_self_or_admin" on public.retention_offers;
create policy "ro_self_or_admin" on public.retention_offers for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "ro_admin_write" on public.retention_offers;
create policy "ro_admin_write" on public.retention_offers for all
  using (public.is_admin()) with check (public.is_admin());

-- 4) RPC admin_ltv_summary
create or replace function public.admin_ltv_summary()
returns json
language sql stable
security definer
set search_path = public
as $$
  with
  user_lifetime as (
    select
      ps.user_id,
      sum(ps.gross_cents)::bigint as total_spent,
      count(ps.id)::bigint as compras,
      (extract(epoch from (max(ps.created_at) - min(ps.created_at))) / 86400.0 + 1) as days_active
    from public.pos_sales ps
    group by ps.user_id
  ),
  ranked as (
    select *, ntile(10) over (order by total_spent desc) as decile from user_lifetime
  ),
  ltv_global as (
    select
      count(*)::bigint as ltv_users,
      coalesce(avg(total_spent), 0)::bigint as avg_ltv,
      coalesce(percentile_disc(0.5) within group (order by total_spent), 0)::bigint as median_ltv,
      coalesce(max(total_spent), 0)::bigint as max_ltv
    from user_lifetime
  ),
  ltv_top10 as (
    select coalesce(avg(total_spent), 0)::bigint as top10_avg from ranked where decile = 1
  ),
  ltv_by_tier as (
    select s.tier, count(distinct ul.user_id)::bigint as users,
           coalesce(avg(ul.total_spent), 0)::bigint as avg_ltv
      from user_lifetime ul
      join public.subscriptions s on s.user_id = ul.user_id
     group by s.tier
  ),
  ltv_by_category as (
    select c.id, c.slug, c.name,
           count(distinct ps.user_id)::bigint as users,
           coalesce(sum(ps.gross_cents), 0)::bigint as gross_total,
           coalesce(avg(ps.gross_cents), 0)::bigint as avg_ticket
      from public.pos_sales ps
      join public.establishment_categories ec on ec.establishment_id = ps.establishment_id
      join public.categories c on c.id = ec.category_id
     group by c.id, c.slug, c.name
     order by gross_total desc
     limit 10
  )
  select json_build_object(
    'global', (select row_to_json(t) from ltv_global t),
    'top10_avg', (select top10_avg from ltv_top10),
    'by_tier', (select coalesce(json_agg(row_to_json(t)), '[]'::json) from ltv_by_tier t),
    'by_category', (select coalesce(json_agg(row_to_json(t)), '[]'::json) from ltv_by_category t)
  );
$$;

grant execute on function public.admin_ltv_summary() to authenticated;

-- 5) RPC run_fraud_scan: roda 3 regras e popula fraud_signals_log
create or replace function public.run_fraud_scan()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_created int := 0;
begin
  -- 5a) visits_burst: mesmo user no mesmo estab > 5 vezes em < 1h
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
  get diagnostics v_created = row_count;

  -- 5b) coupon_velocity: mesmo user usou cupons de >= 5 estabs distintos no mesmo dia
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

  -- 5c) rapid_signup_redemption: user redeem em < 1h depois de criar conta
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

  return json_build_object('ok', true, 'new_signals_visits_burst', v_created);
end $$;

grant execute on function public.run_fraud_scan() to authenticated;

-- 6) RPC dispatch_churn_retention
-- Detecta users em status='active' sem visita há 30+ dias e ainda sem oferta nas
-- últimas 21 dias. Cria coupon retenção (20% off), grant pro user, notif e ledger.
create or replace function public.dispatch_churn_retention(p_limit int default 200)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_coupon_id uuid;
  v_estab_id uuid;
  v_notif_id uuid;
  v_count int := 0;
  v_code text;
begin
  for r in
    select p.id as user_id, p.full_name
      from public.profiles p
      join public.subscriptions s on s.user_id = p.id
     where p.role = 'subscriber'
       and s.status in ('active','trial')
       and not exists (
         select 1 from public.visits v where v.user_id = p.id and v.created_at > now() - interval '30 days'
       )
       and not exists (
         select 1 from public.retention_offers ro
          where ro.user_id = p.id and ro.sent_at > now() - interval '21 days'
       )
     limit p_limit
  loop
    -- Escolhe um estab ativo aleatório (preferencialmente um que o user já visitou)
    select e.id into v_estab_id
      from public.establishments e
      left join public.visits v on v.establishment_id = e.id and v.user_id = r.user_id
     where e.is_active = true
     group by e.id
     order by count(v.id) desc nulls last, random()
     limit 1;

    if v_estab_id is null then continue; end if;

    v_code := 'VOLTA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

    insert into public.coupons (
      establishment_id, code, description, discount_percent,
      max_uses, max_uses_per_user, valid_until, is_active
    ) values (
      v_estab_id, v_code,
      'Cupom de retenção — volta logo! 20% off',
      20, 1, 1, now() + interval '14 days', true
    )
    returning id into v_coupon_id;

    insert into public.coupon_grants (user_id, coupon_id, source)
    values (r.user_id, v_coupon_id, 'admin') on conflict do nothing;

    insert into public.notifications (user_id, type, title, body, link)
    values (
      r.user_id, 'system',
      '🥺 A gente sente sua falta!',
      'Volta no BRAVA+ com 20% off pros próximos 14 dias. Cupom ' || v_code || ' já tá na sua carteira.',
      '/app/cupons'
    ) returning id into v_notif_id;

    insert into public.retention_offers (user_id, coupon_id, notification_id, reason)
    values (r.user_id, v_coupon_id, v_notif_id, 'churn_30d');

    v_count := v_count + 1;
  end loop;

  return json_build_object('ok', true, 'sent', v_count);
end $$;

grant execute on function public.dispatch_churn_retention(int) to authenticated;

-- 7) RPC estimate_campaign_audience: dado segment_json, retorna count
create or replace function public.estimate_campaign_audience(p_segment jsonb)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_categories text[] := coalesce((select array_agg(value::text) from jsonb_array_elements_text(p_segment->'categories')), '{}');
  v_cities text[] := coalesce((select array_agg(value::text) from jsonb_array_elements_text(p_segment->'cities')), '{}');
  v_tiers text[] := coalesce((select array_agg(value::text) from jsonb_array_elements_text(p_segment->'tiers')), '{}');
  v_min_visits int := coalesce((p_segment->>'min_visits')::int, 0);
  v_only_active boolean := coalesce((p_segment->>'only_active')::boolean, true);
  v_count int;
begin
  with eligible as (
    select distinct p.id
      from public.profiles p
      join public.subscriptions s on s.user_id = p.id
     where p.role = 'subscriber'
       and (not v_only_active or s.status in ('active','trial'))
       and (array_length(v_tiers,1) is null or s.tier::text = any(v_tiers))
       and (v_min_visits = 0 or (
         select count(*) from public.visits v where v.user_id = p.id
       ) >= v_min_visits)
       and (array_length(v_categories,1) is null or exists (
         select 1 from public.user_subscription_categories usc
         join public.categories c on c.id = usc.category_id
         where usc.subscription_id = s.id and c.slug = any(v_categories)
       ))
       and (array_length(v_cities,1) is null or exists (
         select 1 from public.user_addresses ua
         where ua.user_id = p.id and lower(ua.city) = any(select lower(c) from unnest(v_cities) c)
       ))
  )
  select count(*) into v_count from eligible;

  return json_build_object('count', v_count);
end $$;

grant execute on function public.estimate_campaign_audience(jsonb) to authenticated;

-- 8) RPC dispatch_campaign: envia campanha pros recipients elegíveis
create or replace function public.dispatch_campaign(p_campaign_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
  v_count int := 0;
begin
  if not public.is_admin() then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  select * into c from public.campaigns where id = p_campaign_id;
  if not found then return json_build_object('ok', false, 'error', 'campaign_not_found'); end if;
  if c.status not in ('draft','scheduled') then
    return json_build_object('ok', false, 'error', 'invalid_status', 'status', c.status);
  end if;

  update public.campaigns set status = 'sending', updated_at = now() where id = p_campaign_id;

  with eligible as (
    select distinct p.id as user_id
      from public.profiles p
      join public.subscriptions s on s.user_id = p.id
     where p.role = 'subscriber'
       and s.status in ('active','trial')
       and (
         (c.segment->'tiers') is null
         or jsonb_array_length(c.segment->'tiers') = 0
         or s.tier::text = any(array(select jsonb_array_elements_text(c.segment->'tiers')))
       )
  ),
  inserted as (
    insert into public.notifications (user_id, type, title, body, link, metadata)
    select e.user_id, 'campaign', c.title, c.body, c.link, jsonb_build_object('campaign_id', c.id)
      from eligible e
    returning id, user_id
  ),
  log as (
    insert into public.campaign_recipients (campaign_id, user_id, notification_id)
    select c.id, i.user_id, i.id from inserted i
    on conflict (campaign_id, user_id) do nothing
    returning 1
  )
  select count(*) into v_count from log;

  update public.campaigns
     set status = 'sent', sent_at = now(),
         recipients_count = v_count, updated_at = now()
   where id = p_campaign_id;

  return json_build_object('ok', true, 'recipients_count', v_count);
end $$;

grant execute on function public.dispatch_campaign(uuid) to authenticated;
