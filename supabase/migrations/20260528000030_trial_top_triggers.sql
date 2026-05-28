-- ============================================================
-- 20260528000030_trial_top_triggers.sql
-- Atualiza triggers de signup:
--  - Usuário novo: 7 dias de "trial top" (acesso total a todas categorias)
--    durante o trial; ao expirar, força escolha de categorias
--  - Estabelecimento novo: 30 dias de "trial top" — tier=enterprise + todas
--    features destravadas via establishment_feature_grants
-- ============================================================

-- 1) User signup — mesma lógica de 7d mas mensagem mais clara
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_code text;
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;

  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  insert into public.qr_cards (user_id, code) values (new.id, v_code)
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, tier, status, trial_ends_at)
  values (new.id, 'vip', 'trial', now() + interval '7 days')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- 2) Estab signup — agora cria com trial top de 30 dias + todas features
create or replace function public.handle_new_establishment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.establishment_subscriptions (
    establishment_id, tier, status, trial_ends_at, current_period_end
  )
  values (
    new.id,
    'enterprise',
    'trial',
    now() + interval '30 days',
    now() + interval '30 days'
  )
  on conflict (establishment_id) do nothing;

  -- Concede TODAS as features ativas durante o trial top
  insert into public.establishment_feature_grants (establishment_id, feature_slug, source, notes)
  select new.id, ef.slug, 'trial', 'auto-grant trial 30d top'
    from public.establishment_features ef
   where ef.is_active = true
  on conflict (establishment_id, feature_slug) do nothing;

  return new;
end;
$$;

-- 3) Backfill: subscriptions atuais com status='trial' viram tier='vip' pra
-- refletir o "trial top" — quem ainda está em trial valido
update public.subscriptions
   set tier = 'vip'
 where status = 'trial' and trial_ends_at > now();

-- 4) Para signup de usuário recém-criado via signUpAction (que faz upsert manual
-- depois da trigger), garantir que ele também ganha o tier=vip e categorias zero.
-- Não precisa nada extra aqui — o upsert do código já vai casar com a trigger.

comment on function public.handle_new_user() is 'BRAVA+: cria profile + qr_card + subscription com 7d de trial top (tier=vip, status=trial)';
comment on function public.handle_new_establishment() is 'BRAVA+: cria establishment_subscriptions com 30d de trial top (enterprise) e concede todas features ativas via grants';
