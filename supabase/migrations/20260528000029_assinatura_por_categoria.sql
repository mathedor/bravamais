-- ============================================================
-- 20260528000029_assinatura_por_categoria.sql
-- Assinatura do USUÁRIO agora é modular por categoria de estab.
-- Cada categoria tem preço mensal (admin define), user escolhe quais
-- quer participar e a soma vira a mensalidade dele.
--
-- Trials:
--  - Usuário: 7 dias do "plano top" (acesso a tudo)
--  - Estabelecimento: 30 dias do "plano top" (todas features grátis)
-- ============================================================

-- 1) Preço por categoria
alter table public.categories add column if not exists monthly_cents int not null default 290;
alter table public.categories add column if not exists pitch text;

-- Seed inicial de preços (valor agregado percebido)
update public.categories set monthly_cents = 990, pitch = 'Academias e centros esportivos com benefício forte' where slug = 'esportes';
update public.categories set monthly_cents = 790, pitch = 'Clínicas, terapias, bem-estar' where slug = 'saude';
update public.categories set monthly_cents = 790, pitch = 'Cinemas, parques, shows e eventos' where slug = 'lazer';
update public.categories set monthly_cents = 590, pitch = 'Casas noturnas, baladas, shows ao vivo' where slug = 'casas-de-show';
update public.categories set monthly_cents = 490, pitch = 'Bares e pubs com cupom toda semana' where slug = 'bares';
update public.categories set monthly_cents = 490, pitch = 'Restaurantes parceiros pra rotina e ocasiões' where slug = 'restaurantes';
update public.categories set monthly_cents = 490, pitch = 'Beleza e estética com cashback' where slug = 'beleza';
update public.categories set monthly_cents = 290, pitch = 'Cafés e padarias do dia a dia' where slug = 'cafes';
update public.categories set monthly_cents = 290, pitch = 'Pet shops, vacinas e banho/tosa' where slug = 'petshop';
update public.categories set monthly_cents = 190, pitch = 'Moda e vestuário com cupom sazonal' where slug = 'moda';
update public.categories set monthly_cents = 190, pitch = 'Casa e decoração com benefícios pontuais' where slug = 'decoracao';
update public.categories set monthly_cents = 190, pitch = 'Floriculturas e arranjos' where slug = 'floriculturas';
update public.categories set monthly_cents = 190, pitch = 'Presentes e papelarias' where slug = 'presentes';
update public.categories set monthly_cents = 190, pitch = 'Papelarias e gráficas' where slug = 'papelarias';
update public.categories set monthly_cents = 190, pitch = 'Serviços gerais (chaveiro, técnico, etc)' where slug = 'servicos';

-- 2) M2M user_subscription_categories
create table if not exists public.user_subscription_categories (
  id uuid primary key default uuid_generate_v4(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (subscription_id, category_id)
);

create index if not exists usc_sub_idx on public.user_subscription_categories(subscription_id);

alter table public.user_subscription_categories enable row level security;

drop policy if exists "usc_user_select" on public.user_subscription_categories;
create policy "usc_user_select" on public.user_subscription_categories for select using (
  exists (select 1 from public.subscriptions s where s.id = subscription_id and (s.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists "usc_user_write" on public.user_subscription_categories;
create policy "usc_user_write" on public.user_subscription_categories for all using (
  exists (select 1 from public.subscriptions s where s.id = subscription_id and (s.user_id = auth.uid() or public.is_admin()))
) with check (
  exists (select 1 from public.subscriptions s where s.id = subscription_id and (s.user_id = auth.uid() or public.is_admin()))
);

-- 3) Colunas novas em subscriptions
alter table public.subscriptions add column if not exists categories_total_cents int not null default 0;
alter table public.subscriptions add column if not exists custom_categories_set boolean not null default false;
-- trial_ends_at já existe; vamos reaproveitar como "top trial" (acesso liberado a tudo)

-- 4) RPC compute_user_monthly_total
create or replace function public.compute_user_monthly_total(p_sub_id uuid)
returns int
language sql stable
as $$
  select coalesce(sum(c.monthly_cents)::int, 0)
    from public.user_subscription_categories usc
    join public.categories c on c.id = usc.category_id
   where usc.subscription_id = p_sub_id and c.is_active = true;
$$;

grant execute on function public.compute_user_monthly_total(uuid) to authenticated;

-- 5) RPC set_user_categories: troca a lista (substitui) + recalcula total
create or replace function public.set_user_categories(p_category_ids uuid[])
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub_id uuid;
  v_total int;
begin
  select id into v_sub_id from public.subscriptions where user_id = auth.uid() limit 1;
  if not found then
    return json_build_object('ok', false, 'error', 'subscription_not_found');
  end if;

  delete from public.user_subscription_categories where subscription_id = v_sub_id;

  if array_length(p_category_ids, 1) is not null then
    insert into public.user_subscription_categories (subscription_id, category_id)
    select v_sub_id, unnest(p_category_ids)
    on conflict do nothing;
  end if;

  v_total := public.compute_user_monthly_total(v_sub_id);

  update public.subscriptions
     set categories_total_cents = v_total,
         custom_categories_set = true,
         updated_at = now()
   where id = v_sub_id;

  return json_build_object('ok', true, 'total_cents', v_total);
end $$;

grant execute on function public.set_user_categories(uuid[]) to authenticated;

-- 6) RPC user_can_access_category — true durante trial OU se categoria contratada
create or replace function public.user_can_access_category(p_user_id uuid, p_category_id uuid)
returns boolean
language sql stable
as $$
  select coalesce(
    (select trial_ends_at > now() from public.subscriptions where user_id = p_user_id),
    false
  )
  or exists (
    select 1
      from public.user_subscription_categories usc
      join public.subscriptions s on s.id = usc.subscription_id
     where s.user_id = p_user_id and usc.category_id = p_category_id
  );
$$;

grant execute on function public.user_can_access_category(uuid, uuid) to authenticated;

-- 7) Garante 7 dias de trial top pra novos signups (default DB)
alter table public.subscriptions
  alter column trial_ends_at set default (now() + interval '7 days');

-- Backfill: usuários sem trial_ends_at recebem 7 dias a partir de agora
update public.subscriptions
   set trial_ends_at = greatest(coalesce(trial_ends_at, now() + interval '7 days'), now() + interval '7 days'),
       status = case when status is null or status = '' then 'trial' else status end
 where trial_ends_at is null;

-- 8) Estabs novos ganham 30 dias de trial top — fix do default
alter table public.establishment_subscriptions
  alter column trial_ends_at set default (now() + interval '30 days');

-- Recompute features_total_cents pra estabs que já tenham todas features ativas
-- (não vamos alterar quem já existe, só novos)

-- 9) Helper: RPC user_subscription_summary (pra UI mostrar trial/total/categorias)
create or replace function public.user_subscription_summary(p_user_id uuid)
returns json
language sql stable
as $$
  select json_build_object(
    'subscription_id', s.id,
    'status', s.status,
    'tier', s.tier,
    'trial_ends_at', s.trial_ends_at,
    'in_trial', s.trial_ends_at > now(),
    'custom_categories_set', s.custom_categories_set,
    'categories_total_cents', s.categories_total_cents,
    'categories', (
      select coalesce(json_agg(json_build_object(
        'id', c.id, 'slug', c.slug, 'name', c.name, 'monthly_cents', c.monthly_cents
      ) order by c.display_order), '[]'::json)
        from public.user_subscription_categories usc
        join public.categories c on c.id = usc.category_id
       where usc.subscription_id = s.id
    )
  )
    from public.subscriptions s
   where s.user_id = p_user_id
   limit 1;
$$;

grant execute on function public.user_subscription_summary(uuid) to authenticated;
