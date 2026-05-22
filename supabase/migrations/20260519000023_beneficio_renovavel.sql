-- ============================================================
-- BENEFÍCIO RENOVÁVEL
-- ============================================================
-- Toda loja DEVE ter um benefício ativo pra dar aos membros.
-- Mensal (ou X dias), reabastecido automaticamente, NÃO ACUMULATIVO:
-- o usuário tem 1 grant ativo por loja. Se não usar até renovar,
-- perde e recebe outro automaticamente.
-- ============================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'renewable_kind') then
    create type public.renewable_kind as enum ('percent', 'voucher');
  end if;
  if not exists (select 1 from pg_type where typname = 'renewable_audience') then
    create type public.renewable_audience as enum ('clientes', 'cidade', 'todos');
  end if;
  if not exists (select 1 from pg_type where typname = 'grant_status') then
    create type public.grant_status as enum ('ativo', 'usado', 'expirado');
  end if;
end $$;

-- ============================================================
-- 1) Config do benefício (1 ativo por estabelecimento)
-- ============================================================
create table if not exists public.renewable_benefits (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  kind public.renewable_kind not null default 'percent',
  -- se percent: 1-100 (% off). se voucher: valor em centavos
  value numeric(12,2) not null,
  headline text,                          -- "20% off no almoço" (auto-gerado se vazio)
  description text,
  renew_days int not null default 30 check (renew_days between 7 and 90),
  audience public.renewable_audience not null default 'clientes',
  min_order_cents bigint,                 -- pedido mínimo opcional
  is_active boolean not null default true,
  total_granted int not null default 0,
  total_used int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rb_estab_idx on public.renewable_benefits (establishment_id, is_active);

drop trigger if exists rb_updated_trg on public.renewable_benefits;
create trigger rb_updated_trg before update on public.renewable_benefits
  for each row execute function public.set_updated_at();

alter table public.renewable_benefits enable row level security;
drop policy if exists "rb_public_select" on public.renewable_benefits;
create policy "rb_public_select" on public.renewable_benefits for select
  using (is_active or public.owns_establishment(establishment_id) or public.is_admin());
drop policy if exists "rb_lojista_write" on public.renewable_benefits;
create policy "rb_lojista_write" on public.renewable_benefits for all
  using (public.owns_establishment(establishment_id) or public.is_admin())
  with check (public.owns_establishment(establishment_id) or public.is_admin());

-- ============================================================
-- 2) Grants (1 ativo por user × benefício; não acumulativo)
-- ============================================================
create table if not exists public.renewable_benefit_grants (
  id uuid primary key default uuid_generate_v4(),
  benefit_id uuid not null references public.renewable_benefits(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.renewable_kind not null,
  value numeric(12,2) not null,
  headline text not null,
  code text not null default upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8)),
  status public.grant_status not null default 'ativo',
  cycle int not null default 1,          -- nº de renovações que esse user já recebeu
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  min_order_cents bigint
);

create index if not exists rbg_user_idx on public.renewable_benefit_grants (user_id, status);
create index if not exists rbg_benefit_idx on public.renewable_benefit_grants (benefit_id, status);
create index if not exists rbg_expires_idx on public.renewable_benefit_grants (expires_at) where status = 'ativo';
-- garante NÃO-ACUMULATIVO: só 1 grant ATIVO por (user, benefit)
create unique index if not exists rbg_one_active_per_user
  on public.renewable_benefit_grants (benefit_id, user_id)
  where status = 'ativo';

alter table public.renewable_benefit_grants enable row level security;
drop policy if exists "rbg_visible" on public.renewable_benefit_grants;
create policy "rbg_visible" on public.renewable_benefit_grants for select
  using (user_id = auth.uid() or public.owns_establishment(establishment_id) or public.is_admin());
drop policy if exists "rbg_user_update" on public.renewable_benefit_grants;
create policy "rbg_user_update" on public.renewable_benefit_grants for update
  using (user_id = auth.uid() or public.owns_establishment(establishment_id) or public.is_admin());

-- ============================================================
-- 3) RPC: dispatch — renova + cria + expira (idempotente, batelado)
-- ============================================================
-- Chamado pelo cron diário. Para cada benefício ativo:
--   a) expira grants vencidos não-usados (status ativo, expires_at < now)
--   b) cria novo grant pros users elegíveis SEM grant ativo
--      (audience: clientes = quem favoritou/visitou/comprou; cidade = mesma cidade; todos = qualquer assinante ativo)
--   c) limita p_limit grants por execução (anti-explosão)
-- Retorna quantos criou/expirou.
create or replace function public.dispatch_renewable_benefits(p_limit int default 1000)
returns table (created_count int, expired_count int)
language plpgsql security definer as $$
declare
  v_created int := 0;
  v_expired int := 0;
  b record;
  u record;
  v_headline text;
begin
  -- (a) expira vencidos
  with exp as (
    update public.renewable_benefit_grants
    set status = 'expirado'
    where status = 'ativo' and expires_at < now()
    returning 1
  )
  select count(*) into v_expired from exp;

  -- (b) cria pros elegíveis sem grant ativo
  for b in
    select rb.*, e.city as estab_city, e.name as estab_name
    from public.renewable_benefits rb
    join public.establishments e on e.id = rb.establishment_id
    where rb.is_active = true and e.is_active = true
  loop
    v_headline := coalesce(
      nullif(b.headline, ''),
      case when b.kind = 'percent'
        then b.value::int || '% de desconto'
        else 'R$ ' || trim(to_char(b.value, 'FM999G999D00')) || ' em compras'
      end
    );

    for u in
      select distinct p.id as user_id
      from public.profiles p
      join public.subscriptions s on s.user_id = p.id and s.status in ('active', 'trialing', 'trial')
      where p.role = 'subscriber'
        -- audience
        and (
          b.audience = 'todos'
          or (b.audience = 'cidade' and p.city is not distinct from b.estab_city)
          or (b.audience = 'clientes' and (
                exists (select 1 from public.favorites f where f.user_id = p.id and f.establishment_id = b.establishment_id)
             or exists (select 1 from public.visits v where v.user_id = p.id and v.establishment_id = b.establishment_id)
             or exists (select 1 from public.orders o where o.user_id = p.id and o.establishment_id = b.establishment_id)
          ))
        )
        -- não tem grant ativo desse benefício
        and not exists (
          select 1 from public.renewable_benefit_grants g
          where g.benefit_id = b.id and g.user_id = p.id and g.status = 'ativo'
        )
      limit p_limit
    loop
      insert into public.renewable_benefit_grants
        (benefit_id, establishment_id, user_id, kind, value, headline, expires_at, min_order_cents, cycle)
      values (
        b.id, b.establishment_id, u.user_id, b.kind, b.value, v_headline,
        now() + (b.renew_days || ' days')::interval, b.min_order_cents,
        coalesce((select max(cycle) + 1 from public.renewable_benefit_grants g
                  where g.benefit_id = b.id and g.user_id = u.user_id), 1)
      )
      on conflict do nothing;

      -- notifica
      insert into public.notifications (user_id, type, title, body, link, metadata)
      values (
        u.user_id, 'establishment_news',
        '🎁 Novo benefício de ' || b.estab_name,
        v_headline || ' · use antes de renovar (não acumula!)',
        '/app/beneficios',
        jsonb_build_object('benefit_id', b.id, 'establishment_id', b.establishment_id)
      );

      v_created := v_created + 1;
    end loop;

    -- atualiza contador
    update public.renewable_benefits set total_granted = total_granted + v_created where id = b.id;
  end loop;

  return query select v_created, v_expired;
end;
$$;

-- ============================================================
-- 4) RPC: marcar grant como usado (resgate)
-- ============================================================
create or replace function public.use_renewable_grant(p_grant_id uuid)
returns boolean
language plpgsql security definer as $$
declare v_ok boolean;
begin
  update public.renewable_benefit_grants
  set status = 'usado', used_at = now()
  where id = p_grant_id and status = 'ativo'
    and (user_id = auth.uid() or public.owns_establishment(establishment_id) or public.is_admin())
  returning true into v_ok;

  if v_ok then
    update public.renewable_benefits rb
    set total_used = total_used + 1
    from public.renewable_benefit_grants g
    where g.id = p_grant_id and g.benefit_id = rb.id;
  end if;

  return coalesce(v_ok, false);
end;
$$;

-- ============================================================
-- 5) KPIs do benefício pro lojista
-- ============================================================
create or replace function public.renewable_benefit_stats(p_estab_id uuid)
returns table (
  active_grants int,
  used_grants int,
  expired_grants int,
  conversion_pct numeric
)
language sql stable security definer as $$
  select
    count(*) filter (where status = 'ativo')::int,
    count(*) filter (where status = 'usado')::int,
    count(*) filter (where status = 'expirado')::int,
    case when count(*) > 0
      then round(100.0 * count(*) filter (where status = 'usado') / count(*), 1)
      else 0 end
  from public.renewable_benefit_grants
  where establishment_id = p_estab_id;
$$;
