-- ============================================================
-- BRAVA+ — Trial gratuito de 30 dias no cadastro
-- 2026-05-15
--
-- Antes: usuário ganhava 7 dias de trial (handle_new_user trigger).
-- Agora: 30 dias do plano Básico.
-- ============================================================

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
  values (new.id, 'basico', 'trial', now() + interval '30 days')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Backfill: usuários em trial criados nos últimos 7 dias ganham os 30 dias
-- completos (corrige quem cadastrou com a regra antiga).
update public.subscriptions
   set trial_ends_at = created_at + interval '30 days',
       updated_at = now()
 where status = 'trial'
   and trial_ends_at = created_at + interval '7 days';
