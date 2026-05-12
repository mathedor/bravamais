-- ============================================================
-- BRAVA+ — Storage buckets + Withdrawals + Refund tickets + Loyalty config
-- ============================================================

-- =========================================================
-- STORAGE BUCKETS (públicos pra simplificar; uploads via service_role)
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('stories', 'stories', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog', 'catalog', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('establishments', 'establishments', true, 10485760, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Policies de leitura pública em buckets públicos
drop policy if exists "Public read public buckets" on storage.objects;
create policy "Public read public buckets" on storage.objects
  for select using (bucket_id in ('stories','catalog','establishments'));

-- Upload feito sempre via service_role; sem policy de insert pública

-- =========================================================
-- WITHDRAWALS (Saques de venda)
-- =========================================================
create table if not exists public.withdrawals (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  amount_cents int not null check (amount_cents >= 10000), -- min R$ 100,00
  status text not null default 'pending', -- pending, paid, rejected
  pix_key text,
  notes text,
  receipt_url text,
  rejected_reason text,
  requested_by_user_id uuid references public.profiles(id),
  processed_by_admin_user_id uuid references public.profiles(id),
  requested_at timestamptz not null default now(),
  paid_at timestamptz,
  rejected_at timestamptz
);

create index if not exists withdrawals_estab_idx on public.withdrawals (establishment_id, requested_at desc);
create index if not exists withdrawals_status_idx on public.withdrawals (status, requested_at desc);

alter table public.withdrawals enable row level security;

drop policy if exists "withdrawals_select" on public.withdrawals;
create policy "withdrawals_select" on public.withdrawals for select
  using (
    public.owns_establishment(establishment_id)
    or public.is_admin()
  );

drop policy if exists "withdrawals_insert" on public.withdrawals;
create policy "withdrawals_insert" on public.withdrawals for insert
  with check (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "withdrawals_update" on public.withdrawals;
create policy "withdrawals_update" on public.withdrawals for update
  using (public.is_admin());

-- Marca orders como "repassadas" quando saque vira "paid"
-- (não automático — gerenciado pela action ao mudar status)
alter table public.orders add column if not exists withdrawn_at timestamptz;

-- =========================================================
-- REFUND TICKETS (Extorno como ticket)
-- =========================================================
create table if not exists public.refund_tickets (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  status text not null default 'open',
  -- open = aguardando contestação do lojista
  -- contested = lojista contestou, aguardando admin
  -- approved = admin aprovou, refund pendente de transferência
  -- refunded = admin transferiu e marcou
  -- rejected = admin negou
  user_reason text not null,
  user_message text,
  establishment_contest text,
  admin_decision text,
  refund_amount_cents int,
  refund_receipt_url text,
  resolved_by_admin_user_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  contested_at timestamptz,
  resolved_at timestamptz
);

create index if not exists refund_tickets_user_idx on public.refund_tickets (user_id, created_at desc);
create index if not exists refund_tickets_estab_idx on public.refund_tickets (establishment_id, created_at desc);
create index if not exists refund_tickets_status_idx on public.refund_tickets (status, created_at desc);

alter table public.refund_tickets enable row level security;

drop policy if exists "refund_tickets_select" on public.refund_tickets;
create policy "refund_tickets_select" on public.refund_tickets for select
  using (
    user_id = auth.uid()
    or public.owns_establishment(establishment_id)
    or public.is_admin()
  );

drop policy if exists "refund_tickets_insert" on public.refund_tickets;
create policy "refund_tickets_insert" on public.refund_tickets for insert
  with check (user_id = auth.uid());

drop policy if exists "refund_tickets_update_estab" on public.refund_tickets;
create policy "refund_tickets_update_estab" on public.refund_tickets for update
  using (public.owns_establishment(establishment_id) or public.is_admin());

-- =========================================================
-- LOYALTY CLUBS — adicionar configuração de recompensa automática
-- =========================================================
alter table public.loyalty_clubs add column if not exists reward_type text default 'manual';
-- 'manual' = só descrição, lojista entrega manualmente (legacy)
-- 'coupon' = ao resgatar, gera cupom automaticamente
-- 'gift_card' = ao resgatar, gera vale-presente automaticamente

alter table public.loyalty_clubs add column if not exists reward_discount_percent int;
alter table public.loyalty_clubs add column if not exists reward_discount_cents int;
alter table public.loyalty_clubs add column if not exists reward_value_cents int;
-- coupon: usa reward_discount_percent OU reward_discount_cents
-- gift_card: usa reward_value_cents
