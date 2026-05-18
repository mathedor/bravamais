-- ============================================================
-- Onboarding tours por role
-- ============================================================
-- Cada user marca quais tours já viu (tutorials_completed.<role> = timestamp ISO)
-- Auto-open na primeira vez que o user entra na área daquele role.
-- Reset = remove a chave do jsonb (re-abre o tour).

alter table public.profiles
  add column if not exists tutorials_completed jsonb not null default '{}'::jsonb;

comment on column public.profiles.tutorials_completed is
  'Mapa role->iso_timestamp dos tours já completados. Ex: {"usuario":"2026-05-18T12:00:00Z"}';
