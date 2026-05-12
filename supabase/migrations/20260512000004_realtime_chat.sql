-- ============================================================
-- BRAVA+ — Enable Realtime on messages + helper fields
-- ============================================================

-- Enable realtime broadcast on messages
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

-- Garantir um perfil mínimo visível pra outras pontas do chat
-- (RLS já filtra; basta liberar select de campos básicos)
