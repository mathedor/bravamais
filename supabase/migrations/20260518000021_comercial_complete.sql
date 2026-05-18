-- ============================================================
-- COMERCIAL — representantes de campo (canal B2B + B2C)
-- ============================================================
-- Expande commercial_affiliates com config de comissão fina (fixo OU %,
-- por tipo: estabelecimento E por tier de assinante). Cria tabelas
-- complementares: subscriber_referrals, commercial_prospects (CRM),
-- commercial_invite_links (links de cadastro com tracking).
-- ============================================================

-- ============================================================
-- 1) Expandir commercial_affiliates com comissão fina
-- ============================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'commission_kind') then
    create type public.commission_kind as enum ('fixed', 'percent');
  end if;
end $$;

alter table public.commercial_affiliates
  add column if not exists establishment_commission_kind public.commission_kind not null default 'percent',
  add column if not exists establishment_commission_value numeric(12,4) not null default 0.20,
  add column if not exists establishment_commission_months int not null default 12,
  add column if not exists subscriber_commission_kind public.commission_kind not null default 'percent',
  add column if not exists subscriber_commission_basic_value numeric(12,4) not null default 0.30,
  add column if not exists subscriber_commission_premium_value numeric(12,4) not null default 0.20,
  add column if not exists subscriber_commission_vip_value numeric(12,4) not null default 0.15,
  add column if not exists subscriber_commission_months int not null default 6,
  add column if not exists territory text,
  add column if not exists onboarded_at timestamptz;

comment on column public.commercial_affiliates.establishment_commission_kind is
  'fixed = R$ pago uma vez no signup do estab. percent = % sobre receita por establishment_commission_months meses.';
comment on column public.commercial_affiliates.subscriber_commission_kind is
  'fixed = R$ pago uma vez no 1º pagamento do sub. percent = % sobre mensalidade por subscriber_commission_months meses.';
comment on column public.commercial_affiliates.subscriber_commission_basic_value is
  'Se fixed: R$ no signup. Se percent: fração da mensalidade (0.30 = 30%).';

-- ============================================================
-- 2) subscriber_referrals — vínculo assinante × comercial
-- ============================================================
create table if not exists public.subscriber_referrals (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.commercial_affiliates(id) on delete cascade,
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  signed_at timestamptz not null default now(),
  commission_until timestamptz not null default (now() + interval '6 months'),
  commission_kind public.commission_kind not null default 'percent',
  commission_basic_value numeric(12,4) not null default 0.30,
  commission_premium_value numeric(12,4) not null default 0.20,
  commission_vip_value numeric(12,4) not null default 0.15,
  total_paid_cents bigint not null default 0
);

create index if not exists sub_ref_aff_idx on public.subscriber_referrals (affiliate_id);
create index if not exists sub_ref_active_idx on public.subscriber_referrals (commission_until);

alter table public.subscriber_referrals enable row level security;

drop policy if exists "sub_ref_select" on public.subscriber_referrals;
create policy "sub_ref_select" on public.subscriber_referrals for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.commercial_affiliates a where a.id = affiliate_id and a.user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "sub_ref_admin_write" on public.subscriber_referrals;
create policy "sub_ref_admin_write" on public.subscriber_referrals for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 3) commercial_prospects — CRM kanban do comercial
-- ============================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'prospect_status') then
    create type public.prospect_status as enum (
      'novo', 'contato', 'visita', 'proposta', 'negociacao', 'fechado', 'perdido'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'prospect_kind') then
    create type public.prospect_kind as enum ('establishment', 'subscriber');
  end if;
  if not exists (select 1 from pg_type where typname = 'prospect_source') then
    create type public.prospect_source as enum ('gmaps', 'manual', 'imported');
  end if;
end $$;

create table if not exists public.commercial_prospects (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.commercial_affiliates(id) on delete cascade,
  kind public.prospect_kind not null default 'establishment',
  status public.prospect_status not null default 'novo',
  source public.prospect_source not null default 'manual',

  -- Identificação
  name text not null,
  cnpj text,
  category_slug text references public.categories(slug) on delete set null,
  address text,
  city text,
  uf text,
  lat double precision,
  lng double precision,
  location geography(point, 4326),

  -- Contato
  phone text,
  email text,
  contact_name text,

  -- Pipeline
  notes text,
  next_action_at timestamptz,
  next_action_label text,
  estimated_value_cents bigint,  -- valor estimado de ticket pro estab; pra sub é vazio

  -- Vínculo quando vira cliente (status = fechado)
  converted_establishment_id uuid references public.establishments(id) on delete set null,
  converted_user_id uuid references public.profiles(id) on delete set null,
  converted_at timestamptz,

  -- Origem Google Places (se source = gmaps)
  gmaps_place_id text,
  gmaps_rating numeric(2,1),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prospects_aff_idx on public.commercial_prospects (affiliate_id, status);
create index if not exists prospects_geo_idx on public.commercial_prospects using gist (location);
create index if not exists prospects_next_idx on public.commercial_prospects (affiliate_id, next_action_at) where next_action_at is not null;

create or replace function public.commercial_prospect_set_location()
returns trigger language plpgsql as $$
begin
  if new.lat is not null and new.lng is not null then
    new.location := st_setsrid(st_makepoint(new.lng, new.lat), 4326)::geography;
  end if;
  return new;
end;
$$;

drop trigger if exists prospects_location_trg on public.commercial_prospects;
create trigger prospects_location_trg before insert or update of lat, lng on public.commercial_prospects
  for each row execute function public.commercial_prospect_set_location();

drop trigger if exists prospects_updated_trg on public.commercial_prospects;
create trigger prospects_updated_trg before update on public.commercial_prospects
  for each row execute function public.set_updated_at();

alter table public.commercial_prospects enable row level security;

drop policy if exists "prospects_owner_all" on public.commercial_prospects;
create policy "prospects_owner_all" on public.commercial_prospects for all
  using (
    exists (select 1 from public.commercial_affiliates a where a.id = affiliate_id and a.user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    exists (select 1 from public.commercial_affiliates a where a.id = affiliate_id and a.user_id = auth.uid())
    or public.is_admin()
  );

-- ============================================================
-- 4) commercial_invite_links — links de cadastro com tracking
-- ============================================================
-- O comercial gera link único pra mandar a um prospect. Quando o prospect
-- se cadastra via esse link, o vínculo affiliate fica criado AUTOMATICAMENTE.
-- Cada comercial tem seu CÓDIGO permanente (commercial_affiliates.code) que
-- vale como ref padrão; estes links são variantes (campanhas, prospects
-- específicos) com tracking refinado.

create table if not exists public.commercial_invite_links (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.commercial_affiliates(id) on delete cascade,
  kind public.prospect_kind not null default 'establishment',
  token text not null unique default replace(uuid_generate_v4()::text, '-', ''),
  label text,                   -- "Restaurante Z", "Campanha Set/26"
  prospect_id uuid references public.commercial_prospects(id) on delete set null,
  clicks int not null default 0,
  signups int not null default 0,
  last_click_at timestamptz,
  last_signup_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists invite_links_aff_idx on public.commercial_invite_links (affiliate_id, created_at desc);
create index if not exists invite_links_token_idx on public.commercial_invite_links (token);

alter table public.commercial_invite_links enable row level security;

drop policy if exists "invite_links_owner_all" on public.commercial_invite_links;
create policy "invite_links_owner_all" on public.commercial_invite_links for all
  using (
    exists (select 1 from public.commercial_affiliates a where a.id = affiliate_id and a.user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    exists (select 1 from public.commercial_affiliates a where a.id = affiliate_id and a.user_id = auth.uid())
    or public.is_admin()
  );

-- RPC pública pra resolver token (sem RLS pra função de signup-pendente)
create or replace function public.resolve_commercial_ref(p_ref text)
returns table (
  affiliate_id uuid,
  affiliate_name text,
  affiliate_code text,
  via_link boolean,
  link_id uuid,
  link_kind public.prospect_kind
)
language sql stable security definer as $$
  -- Match exato em token de link
  select a.id, a.name, a.code, true, l.id, l.kind
  from public.commercial_invite_links l
  join public.commercial_affiliates a on a.id = l.affiliate_id
  where l.token = p_ref
    and (l.expires_at is null or l.expires_at > now())
    and a.is_active
  union all
  -- Match no código do comercial (CODE-XXXX)
  select a.id, a.name, a.code, false, null::uuid, null::public.prospect_kind
  from public.commercial_affiliates a
  where a.code = p_ref
    and a.is_active
  limit 1;
$$;

-- ============================================================
-- 5) RPC: KPIs do comercial pra dashboard
-- ============================================================
create or replace function public.commercial_dashboard(p_affiliate_id uuid, p_month date default current_date)
returns table (
  -- Pipeline
  prospects_total int,
  prospects_novo int,
  prospects_contato int,
  prospects_visita int,
  prospects_proposta int,
  prospects_negociacao int,
  prospects_fechado int,
  prospects_perdido int,
  -- Realizado
  estabs_ativos int,
  subs_ativos int,
  estabs_no_mes int,
  subs_no_mes int,
  -- Receita acumulada (histórico)
  total_estab_revenue_cents bigint,
  total_sub_revenue_cents bigint,
  -- Comissão do mês (projeção baseada em config)
  commission_estab_month_cents bigint,
  commission_sub_month_cents bigint
)
language sql stable security definer as $$
  with bounds as (
    select date_trunc('month', p_month)::timestamptz as p_start,
           (date_trunc('month', p_month) + interval '1 month')::timestamptz as p_end
  ),
  config as (
    select * from public.commercial_affiliates where id = p_affiliate_id
  ),
  -- Pipeline counts
  p_counts as (
    select
      count(*) filter (where status = 'novo')::int as novo,
      count(*) filter (where status = 'contato')::int as contato,
      count(*) filter (where status = 'visita')::int as visita,
      count(*) filter (where status = 'proposta')::int as proposta,
      count(*) filter (where status = 'negociacao')::int as negociacao,
      count(*) filter (where status = 'fechado')::int as fechado,
      count(*) filter (where status = 'perdido')::int as perdido,
      count(*)::int as total
    from public.commercial_prospects
    where affiliate_id = p_affiliate_id
  ),
  -- Estabs e subs ativos referenciados a esse comercial
  e_active as (
    select count(*)::int as cnt
    from public.affiliate_referrals
    where affiliate_id = p_affiliate_id and commission_until > now()
  ),
  s_active as (
    select count(*)::int as cnt
    from public.subscriber_referrals
    where affiliate_id = p_affiliate_id and commission_until > now()
  ),
  e_month as (
    select count(*)::int as cnt
    from public.affiliate_referrals, bounds
    where affiliate_id = p_affiliate_id and signed_at >= p_start and signed_at < p_end
  ),
  s_month as (
    select count(*)::int as cnt
    from public.subscriber_referrals, bounds
    where affiliate_id = p_affiliate_id and signed_at >= p_start and signed_at < p_end
  ),
  -- Receita dos estabs no mês (pra comissão %)
  e_rev_month as (
    select coalesce(sum(o.total_cents), 0)::bigint as rev
    from public.affiliate_referrals ar
    join public.orders o on o.establishment_id = ar.establishment_id
    cross join bounds
    where ar.affiliate_id = p_affiliate_id
      and ar.commission_until > now()
      and o.status in ('paid', 'completed')
      and o.created_at >= p_start and o.created_at < p_end
  ),
  -- Receita mensal dos subs (mensalidade × ativos)
  s_rev_month as (
    select
      coalesce(sum(case when sub.tier = 'basico' then sp.monthly_cents else 0 end), 0)::bigint as basic_rev,
      coalesce(sum(case when sub.tier = 'premium' then sp.monthly_cents else 0 end), 0)::bigint as premium_rev,
      coalesce(sum(case when sub.tier = 'vip' then sp.monthly_cents else 0 end), 0)::bigint as vip_rev
    from public.subscriber_referrals sr
    join public.subscriptions sub on sub.user_id = sr.user_id and sub.status = 'active'
    join public.subscription_plans sp on sp.tier = sub.tier
    where sr.affiliate_id = p_affiliate_id
      and sr.commission_until > now()
  )
  select
    (select total from p_counts),
    (select novo from p_counts),
    (select contato from p_counts),
    (select visita from p_counts),
    (select proposta from p_counts),
    (select negociacao from p_counts),
    (select fechado from p_counts),
    (select perdido from p_counts),
    (select cnt from e_active),
    (select cnt from s_active),
    (select cnt from e_month),
    (select cnt from s_month),
    (select rev from e_rev_month),
    ((select basic_rev + premium_rev + vip_rev from s_rev_month))::bigint,
    -- Comissão estab no mês
    case
      when (select establishment_commission_kind from config) = 'percent'
        then floor((select rev from e_rev_month) * (select establishment_commission_value from config))::bigint
      else
        -- fixed: R$ por estab cadastrado no mês
        ((select cnt from e_month) * floor((select establishment_commission_value from config) * 100))::bigint
    end,
    -- Comissão sub no mês
    case
      when (select subscriber_commission_kind from config) = 'percent'
        then floor(
          (select basic_rev from s_rev_month) * (select subscriber_commission_basic_value from config)
          + (select premium_rev from s_rev_month) * (select subscriber_commission_premium_value from config)
          + (select vip_rev from s_rev_month) * (select subscriber_commission_vip_value from config)
        )::bigint
      else
        -- fixed: R$ por sub novo no mês (peso médio entre tiers)
        ((select cnt from s_month) * floor((select subscriber_commission_basic_value from config) * 100))::bigint
    end;
$$;

-- ============================================================
-- 6) Trigger: ao criar estab/sub via signup com ref, criar referral
-- ============================================================
-- (esse pedaço é feito via server action, pra ter controle do fluxo —
-- aqui só garantimos a estrutura. Server actions usam service_role.)
