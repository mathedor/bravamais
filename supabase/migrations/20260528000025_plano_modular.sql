-- ============================================================
-- 20260528000025_plano_modular.sql
-- Plano modular do estabelecimento:
-- substitui os 3 tiers fixos por marketplace de features.
-- ============================================================

-- 1) Catálogo de features (admin define preço e disponibilidade)
create table if not exists public.establishment_features (
  slug text primary key,
  name text not null,
  short_desc text not null,
  sales_pitch text,
  category text not null check (category in ('base','vendas','engajamento','bi','operacao','crescimento')),
  monthly_cents int not null default 0,
  is_base boolean not null default false,
  is_active boolean not null default true,
  depends_on text[] not null default '{}',
  display_order int not null default 100,
  pricing_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.establishment_features enable row level security;

drop policy if exists "estab_features_select" on public.establishment_features;
create policy "estab_features_select" on public.establishment_features for select using (true);

drop policy if exists "estab_features_admin_write" on public.establishment_features;
create policy "estab_features_admin_write" on public.establishment_features for all
  using (public.is_admin()) with check (public.is_admin());

-- 2) Grants (features ativas por estabelecimento)
create table if not exists public.establishment_feature_grants (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  feature_slug text not null references public.establishment_features(slug) on delete cascade,
  activated_at timestamptz not null default now(),
  ends_at timestamptz, -- null = vitalício até desativar
  source text not null default 'self' check (source in ('self','admin','migration','trial')),
  notes text,
  created_at timestamptz not null default now(),
  unique (establishment_id, feature_slug)
);

create index if not exists efg_estab_idx on public.establishment_feature_grants(establishment_id);

alter table public.establishment_feature_grants enable row level security;

drop policy if exists "efg_estab_select" on public.establishment_feature_grants;
create policy "efg_estab_select" on public.establishment_feature_grants for select using (
  public.is_admin() or exists (
    select 1 from public.establishments e
    where e.id = establishment_feature_grants.establishment_id and e.owner_id = auth.uid()
  )
);

drop policy if exists "efg_admin_write" on public.establishment_feature_grants;
create policy "efg_admin_write" on public.establishment_feature_grants for all
  using (public.is_admin()) with check (public.is_admin());

-- 3) Tickets de remoção (downgrade)
create table if not exists public.establishment_feature_requests (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  feature_slug text not null references public.establishment_features(slug) on delete cascade,
  kind text not null default 'remove' check (kind in ('remove')),
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','denied')),
  thread_id uuid references public.conversations(id) on delete set null,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists efr_estab_idx on public.establishment_feature_requests(establishment_id);
create index if not exists efr_status_idx on public.establishment_feature_requests(status);

alter table public.establishment_feature_requests enable row level security;

drop policy if exists "efr_select" on public.establishment_feature_requests;
create policy "efr_select" on public.establishment_feature_requests for select using (
  public.is_admin() or exists (
    select 1 from public.establishments e
    where e.id = establishment_feature_requests.establishment_id and e.owner_id = auth.uid()
  )
);

drop policy if exists "efr_estab_insert" on public.establishment_feature_requests;
create policy "efr_estab_insert" on public.establishment_feature_requests for insert with check (
  exists (
    select 1 from public.establishments e
    where e.id = establishment_feature_requests.establishment_id and e.owner_id = auth.uid()
  )
);

drop policy if exists "efr_admin_update" on public.establishment_feature_requests;
create policy "efr_admin_update" on public.establishment_feature_requests for update
  using (public.is_admin()) with check (public.is_admin());

-- 4) Coluna base + freeze migration na assinatura existente
alter table public.establishment_subscriptions
  add column if not exists base_cents int not null default 4900;

alter table public.establishment_subscriptions
  add column if not exists features_total_cents int not null default 0;

alter table public.establishment_subscriptions
  add column if not exists migration_freeze_until timestamptz;

alter table public.establishment_subscriptions
  add column if not exists legacy_tier establishment_plan_tier;

-- 5) Seed do catálogo de features
insert into public.establishment_features (slug, name, short_desc, sales_pitch, category, monthly_cents, is_base, depends_on, display_order, pricing_note) values
  -- BASE (incluso no R$ 49)
  ('perfil', 'Perfil da loja', 'Identidade, fotos, endereço, contato, horário, categoria', 'Sua loja na vitrine do BRAVA+ com tudo o que o cliente precisa pra te encontrar.', 'base', 0, true, '{}', 10, null),
  ('catalogo_basico', 'Catálogo (até 20 produtos)', 'CRUD de produtos com foto, preço, descrição', 'Mostra teu portfólio direto no app — produto bonito vira venda mais rápido.', 'base', 0, true, '{}', 11, null),
  ('qr_scanner', 'Carteirinha QR', 'Câmera do navegador valida QR do assinante, marca visita', 'Cliente passa o QR, tu valida visita e fidelidade em segundos.', 'base', 0, true, '{}', 12, null),
  ('cupom_unico', '1 Cupom ativo', 'Cria 1 cupom de desconto por vez', 'Sempre algo pra atrair cliente, mesmo no plano base.', 'base', 0, true, '{}', 13, null),
  ('beneficio_renovavel', '1 Benefício Renovável', 'O pináculo do BRAVA+: 1 benefício renovável obrigatório por loja', 'A urgência recorrente que traz cliente de volta toda renovação. Não-acumulativo.', 'base', 0, true, '{}', 14, null),
  ('chat_basico', 'Chat com cliente', 'Conversa 1:1 com assinante', 'Tira dúvida, fecha venda, atende reclamação — tudo num lugar só.', 'base', 0, true, '{}', 15, null),
  ('dashboard_kpis', 'Painel básico', '4 KPIs + últimos pedidos + últimas visitas', 'Visão diária do que tá acontecendo na tua loja, sem complicação.', 'base', 0, true, '{}', 16, null),
  ('onboarding', 'Tour + page-helps', 'Tour guiado em cada tela + ajuda contextual', 'Sua equipe entende o BRAVA+ sem precisar de treinamento externo.', 'base', 0, true, '{}', 17, null),

  -- VENDAS
  ('cupons_ilimitados', 'Cupons ilimitados', 'Mais de 1 cupom ativo simultâneo + segmentação por tier', 'Cupom certo, cliente certo, no momento certo. Crie quantos quiser.', 'vendas', 1900, false, '{cupom_unico}', 20, null),
  ('vale_presente', 'Vale-presente', 'Cliente compra um vale e dá pra alguém usar na loja', 'Vira dinheiro novo: o presenteado nunca tinha visitado tua loja.', 'vendas', 1900, false, '{}', 21, null),
  ('vale_compras', 'Vale-compras', 'Cliente carrega saldo pra usar depois (pré-pago da loja)', 'Caixa adiantado + cliente cativo. Pré-pagamento é o melhor cashflow.', 'vendas', 1900, false, '{}', 22, null),
  ('fidelidade', 'Clube de Fidelidade', 'X visitas/compras = benefício configurável', 'Hábito vira recorrência. O cliente volta pra fechar a cartela.', 'vendas', 2900, false, '{}', 23, null),
  ('cross_sell', 'Cross-sell automático', 'Recibo já gera cupom pra outro produto da loja', 'Aumenta o ticket sem o cliente nem perceber. Conversão alta.', 'vendas', 2900, false, '{}', 24, null),
  ('mesa_qr', 'Mesa QR', 'Cliente lê QR da mesa, pede direto pelo celular', 'Reduz fila no caixa, libera atendente, ticket médio sobe.', 'vendas', 4900, false, '{catalogo_basico}', 25, null),
  ('catalogo_ilimitado', 'Catálogo ilimitado', 'Acima de 20 produtos, fotos múltiplas, categorias', 'Sem teto pro portfólio. Pra quem tem muita variedade.', 'vendas', 2900, false, '{catalogo_basico}', 26, null),

  -- ENGAJAMENTO
  ('beneficios_extras', 'Benefícios Extras', 'Múltiplos Benefícios Renováveis simultâneos (até 5 slots)', 'Segmenta promoção por público — cidade, ticket, frequência — tudo ativo ao mesmo tempo.', 'engajamento', 3900, false, '{beneficio_renovavel}', 30, null),
  ('promo_blast', 'Promo Blast / Hora Vazia', 'Tô vazio, dispara cupom flash pras próximas 2h', 'Salva a noite morta: notifica a base que já visitou com cupom de urgência.', 'engajamento', 3900, false, '{}', 31, null),
  ('stories_interativos', 'Stories Interativos', 'Enquetes + sticker resgatar agora direto da story', 'Engajamento de rede social com conversão de cupom no mesmo toque.', 'engajamento', 4900, false, '{}', 32, null),
  ('roleta_sorte', 'Roleta da Sorte', 'Cliente roda no check-in e ganha cupom aleatório', 'Gamifica a visita — todo mundo gosta de "ganhar algo" inesperado.', 'engajamento', 2900, false, '{}', 33, null),
  ('geo_push', 'Geo Push', 'Notif quando user passa < 500m da loja com promo ativa', 'O killer do clube físico: o cliente recebe oferta exatamente quando podia entrar.', 'engajamento', 4900, false, '{}', 34, null),
  ('aniversariante', 'Aniversariante automático', 'Cupom premium no aniversário do cliente, automático', 'Detalhe pessoal vira fidelização barata. Cliente lembra de quem lembrou dele.', 'engajamento', 1900, false, '{}', 35, null),

  -- BI & CRM
  ('crm_top_clientes', 'CRM Top 50', 'Ranking, último check-in, ticket médio, cupom personalizado', 'Sabe quem realmente sustenta tua loja, e fala diretamente com cada um.', 'bi', 3900, false, '{}', 40, null),
  ('benchmark_regional', 'Benchmark Anônimo', 'Você está no top 20% da categoria/região', 'Compara teu desempenho com pares sem expor ninguém. Posicionamento real.', 'bi', 4900, false, '{}', 41, null),
  ('ab_test', 'A/B Test de Cupons', 'Testa 2 versões e mede conversão', 'Para de chutar oferta. Mede qual cupom vende mais, com método.', 'bi', 3900, false, '{cupons_ilimitados}', 42, null),
  ('receita_incremental', 'Receita Incremental', 'BRAVA+ trouxe R$ X, sendo R$ Y de novos clientes', 'Prova clara do ROI do BRAVA+ — pra decisão consciente sobre marketing.', 'bi', 2900, false, '{}', 43, null),
  ('embaixadores', 'Embaixadores VIP', 'Marca 5-10 clientes top como VIP, dispara perks exclusivos', 'Cria casta de fãs que viraliza tua loja pelos amigos. Marketing orgânico premium.', 'bi', 1900, false, '{crm_top_clientes}', 44, null),
  ('calendario_promo', 'Calendário de Promos', 'Agenda + sugestões sazonais (dia das mães, etc)', 'Nunca mais esqueça uma data comercial. Promoção planejada vende mais.', 'bi', 1900, false, '{}', 45, null),

  -- OPERAÇÃO
  ('kitchen_display', 'Kitchen Display', 'TV na cozinha com pedidos em tempo real', 'Cozinha sincronizada, menos erro, mais velocidade na entrega.', 'operacao', 4900, false, '{mesa_qr}', 50, null),
  ('chat_bot', 'Chat Bot', 'Auto-resposta de FAQ + escalonamento pra humano', 'Atende 80% das dúvidas sozinho. Tua equipe foca no que importa.', 'operacao', 3900, false, '{chat_basico}', 51, null),
  ('vou_ai', 'Vou Aí', 'Cliente avisa que tá vindo, loja dá cortesia automática', 'Acolhe o cliente antes dele chegar — efeito wow garantido.', 'operacao', 1900, false, '{}', 52, null),
  ('lista_espera', 'Lista de Espera', 'Fila virtual com notificação SMS/push da vez', 'Cliente espera sem ficar parado na porta. Reduz desistência.', 'operacao', 3900, false, '{}', 53, null),
  ('cfo_backup', 'CFO Backup', 'Email semanal/mensal pra contadora com extrato', 'Contadora recebe tudo formatado, sem tu ter que mandar nada.', 'operacao', 2900, false, '{}', 54, null),
  ('treinamento', 'Treinamento In-App', 'Biblioteca de vídeos pra equipe do estab', 'Sua equipe nova aprende sozinha em 1 dia, sem tomar teu tempo.', 'operacao', 1900, false, '{}', 55, null),
  ('multiplas_filiais', 'Múltiplas Filiais', 'Gestão de várias filiais sob 1 conta gestora', 'Visão consolidada + filial individual. Pra rede que cresce.', 'operacao', 2900, false, '{}', 56, 'R$ 29 por filial extra'),

  -- CRESCIMENTO
  ('aceita_tag', 'Aceitar BRAVA Tag', 'Estab aceita pagamento via Saldo Tag (futuro)', 'Capta cliente do programa Tag — quem já tem saldo prefere gastar onde aceita.', 'crescimento', 0, false, '{}', 60, '0 mensal + 8-10% por transação'),
  ('delivery_proprio', 'Delivery & Entregadores', 'PWA entregador + vitrine freelancers + tracking', 'Delivery próprio sem depender de iFood. Tu controla a experiência.', 'crescimento', 7900, false, '{}', 61, null),
  ('destaque_pago', 'Slot de Destaque', 'Aparecer no topo da categoria/região por X dias', 'Comprar visibilidade quando precisar de pico de demanda.', 'crescimento', 4900, false, '{}', 62, 'R$ 49 por campanha (one-shot)'),
  ('parcerias', 'Parcerias entre lojas', 'Combos cruzados com outras lojas BRAVA+', 'Cliente compra na tua loja, ganha cupom da loja parceira. Rede gera rede.', 'crescimento', 2900, false, '{}', 63, null)

on conflict (slug) do update set
  name = excluded.name,
  short_desc = excluded.short_desc,
  sales_pitch = excluded.sales_pitch,
  category = excluded.category,
  monthly_cents = excluded.monthly_cents,
  is_base = excluded.is_base,
  depends_on = excluded.depends_on,
  display_order = excluded.display_order,
  pricing_note = excluded.pricing_note,
  updated_at = now();

-- 6) Garante grants das features base pra todos estabs existentes (idempotente)
insert into public.establishment_feature_grants (establishment_id, feature_slug, source, notes)
select e.id, f.slug, 'migration', 'auto-grant base na migração modular'
from public.establishments e
cross join public.establishment_features f
where f.is_base = true
on conflict (establishment_id, feature_slug) do nothing;

-- 7) Migração tier → pacote equivalente (uma vez)
do $$
declare
  estab_record record;
  pkg_basico text[] := array['cupons_ilimitados','fidelidade','aniversariante'];
  pkg_pro    text[] := array['cupons_ilimitados','fidelidade','aniversariante','cross_sell','crm_top_clientes','receita_incremental','chat_bot','promo_blast'];
  pkg_ent    text[] := array['cupons_ilimitados','fidelidade','aniversariante','cross_sell','crm_top_clientes','receita_incremental','chat_bot','promo_blast','mesa_qr','catalogo_ilimitado','benchmark_regional','ab_test','embaixadores','calendario_promo','beneficios_extras','stories_interativos','roleta_sorte','kitchen_display','vou_ai','lista_espera','cfo_backup','treinamento','multiplas_filiais','parcerias'];
  features_to_grant text[];
  slug_iter text;
begin
  for estab_record in select e.id, s.tier from public.establishments e
    join public.establishment_subscriptions s on s.establishment_id = e.id loop

    features_to_grant := case estab_record.tier
      when 'basico'::establishment_plan_tier     then pkg_basico
      when 'pro'::establishment_plan_tier        then pkg_pro
      when 'enterprise'::establishment_plan_tier then pkg_ent
      else array[]::text[]
    end;

    foreach slug_iter in array features_to_grant loop
      insert into public.establishment_feature_grants (establishment_id, feature_slug, source, notes)
      values (estab_record.id, slug_iter, 'migration', 'auto-grant migração tier→pacote')
      on conflict (establishment_id, feature_slug) do nothing;
    end loop;

    update public.establishment_subscriptions
       set legacy_tier = estab_record.tier,
           migration_freeze_until = (now() + interval '60 days')
     where establishment_id = estab_record.id
       and legacy_tier is null;
  end loop;
end $$;

-- 8) RPC: total mensal de um estabelecimento
create or replace function public.estab_monthly_total(p_estab_id uuid)
returns int
language sql stable
as $$
  select coalesce(
    (select base_cents from public.establishment_subscriptions where establishment_id = p_estab_id),
    4900
  ) + coalesce(
    (select sum(ef.monthly_cents)::int
       from public.establishment_feature_grants g
       join public.establishment_features ef on ef.slug = g.feature_slug
      where g.establishment_id = p_estab_id
        and ef.is_base = false
        and ef.monthly_cents > 0),
    0
  );
$$;

-- 9) RPC: ativar feature (lojista; self-service)
create or replace function public.activate_estab_feature(p_estab_id uuid, p_feature_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  feat record;
  missing_deps text[];
begin
  -- valida ownership
  if not exists (select 1 from public.establishments where id = p_estab_id and owner_id = auth.uid())
     and not public.is_admin() then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  select * into feat from public.establishment_features where slug = p_feature_slug;
  if not found then
    return json_build_object('ok', false, 'error', 'feature_not_found');
  end if;

  if not feat.is_active then
    return json_build_object('ok', false, 'error', 'feature_inactive');
  end if;

  -- valida dependências
  select array_agg(dep)
    into missing_deps
    from unnest(feat.depends_on) dep
   where not exists (
     select 1 from public.establishment_feature_grants
      where establishment_id = p_estab_id and feature_slug = dep
   );
  if missing_deps is not null and array_length(missing_deps,1) > 0 then
    return json_build_object('ok', false, 'error', 'missing_dependencies', 'deps', missing_deps);
  end if;

  insert into public.establishment_feature_grants (establishment_id, feature_slug, source)
  values (p_estab_id, p_feature_slug, case when public.is_admin() then 'admin' else 'self' end)
  on conflict (establishment_id, feature_slug) do nothing;

  -- recalcula total
  update public.establishment_subscriptions
     set features_total_cents = public.estab_monthly_total(p_estab_id) - base_cents,
         updated_at = now()
   where establishment_id = p_estab_id;

  return json_build_object('ok', true, 'feature', p_feature_slug, 'total', public.estab_monthly_total(p_estab_id));
end $$;

-- 10) RPC: solicitar remoção (lojista) — não desativa, abre ticket
create or replace function public.request_feature_removal(p_estab_id uuid, p_feature_slug text, p_reason text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  feat record;
  req_id uuid;
begin
  if not exists (select 1 from public.establishments where id = p_estab_id and owner_id = auth.uid()) then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  select * into feat from public.establishment_features where slug = p_feature_slug;
  if not found then
    return json_build_object('ok', false, 'error', 'feature_not_found');
  end if;

  if feat.is_base then
    return json_build_object('ok', false, 'error', 'base_feature_cannot_be_removed');
  end if;

  if exists (
    select 1 from public.establishment_feature_requests
     where establishment_id = p_estab_id
       and feature_slug = p_feature_slug
       and status = 'pending'
  ) then
    return json_build_object('ok', false, 'error', 'request_already_pending');
  end if;

  insert into public.establishment_feature_requests (establishment_id, feature_slug, reason, status)
  values (p_estab_id, p_feature_slug, p_reason, 'pending')
  returning id into req_id;

  return json_build_object('ok', true, 'request_id', req_id);
end $$;

-- 11) RPC: admin aprova / nega remoção
create or replace function public.resolve_feature_request(p_request_id uuid, p_approve boolean, p_admin_note text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
begin
  if not public.is_admin() then
    return json_build_object('ok', false, 'error', 'forbidden');
  end if;

  select * into req from public.establishment_feature_requests where id = p_request_id and status = 'pending';
  if not found then
    return json_build_object('ok', false, 'error', 'request_not_found_or_resolved');
  end if;

  update public.establishment_feature_requests
     set status = case when p_approve then 'approved' else 'denied' end,
         resolved_at = now(),
         resolved_by = auth.uid(),
         admin_note = p_admin_note
   where id = p_request_id;

  if p_approve then
    delete from public.establishment_feature_grants
     where establishment_id = req.establishment_id
       and feature_slug = req.feature_slug;

    update public.establishment_subscriptions
       set features_total_cents = public.estab_monthly_total(req.establishment_id) - base_cents,
           updated_at = now()
     where establishment_id = req.establishment_id;
  end if;

  return json_build_object('ok', true, 'approved', p_approve);
end $$;

-- 12) RPC pra dashboard admin (MRR por feature, count de tickets, etc)
create or replace function public.admin_modular_kpis()
returns json
language sql stable
as $$
  select json_build_object(
    'mrr_base_cents', coalesce((select sum(base_cents) from public.establishment_subscriptions where status = 'active'), 0),
    'mrr_features_cents', coalesce((select sum(features_total_cents) from public.establishment_subscriptions where status = 'active'), 0),
    'pending_requests', coalesce((select count(*) from public.establishment_feature_requests where status = 'pending'), 0),
    'top_features', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select ef.slug, ef.name, count(g.id) as estabs, ef.monthly_cents, (count(g.id) * ef.monthly_cents) as mrr_cents
          from public.establishment_features ef
          left join public.establishment_feature_grants g on g.feature_slug = ef.slug
         where ef.is_base = false
         group by ef.slug, ef.name, ef.monthly_cents
         order by mrr_cents desc
         limit 8
      ) t
    )
  );
$$;

grant execute on function public.activate_estab_feature(uuid, text) to authenticated;
grant execute on function public.request_feature_removal(uuid, text, text) to authenticated;
grant execute on function public.resolve_feature_request(uuid, boolean, text) to authenticated;
grant execute on function public.estab_monthly_total(uuid) to authenticated;
grant execute on function public.admin_modular_kpis() to authenticated;

-- 13) Inicializa features_total_cents pra todos
update public.establishment_subscriptions s
   set features_total_cents = public.estab_monthly_total(s.establishment_id) - s.base_cents
 where features_total_cents is null or features_total_cents = 0;
