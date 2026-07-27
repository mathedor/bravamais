-- Presença: last_seen_at em profiles, tocado pelo requireUser (throttle 5 min).
-- Usado pelo pulso da Ana: online_agora = last_seen_at OU login_event nos últimos 15 min.
alter table public.profiles add column if not exists last_seen_at timestamptz;
create index if not exists profiles_last_seen_idx on public.profiles(last_seen_at desc);
