-- ============================================================
-- BRAVA+ — Financeiro completo (dinâmica GYT)
-- Adquirentes + taxas, contas bancárias do lojista, bloqueios
-- financeiros (gate de saque), retiradas do caixa BRAVA e
-- upgrade do fluxo de saques (aprovado, conta snapshot, taxa
-- de transferência, forma PIX/CARTAO).
-- ============================================================

-- =========================================================
-- ADQUIRENTES (gateways cadastráveis, com taxas por forma)
-- =========================================================
create table if not exists public.acquirers (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ativo boolean not null default true,
  observacao text,
  custo_transferencia_centavos int not null default 0,
  credenciais jsonb not null default '[]'::jsonb, -- [{chave,label,valor,secret}] (documentação; runtime usa env)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.acquirers enable row level security;

drop policy if exists "acquirers_admin_select" on public.acquirers;
create policy "acquirers_admin_select" on public.acquirers for select
  using (public.is_admin());
-- escrita só via service role

drop trigger if exists set_updated_at_acquirers on public.acquirers;
create trigger set_updated_at_acquirers before update on public.acquirers
  for each row execute function public.set_updated_at();

create table if not exists public.acquirer_fees (
  id uuid primary key default gen_random_uuid(),
  acquirer_id uuid not null references public.acquirers(id) on delete cascade,
  forma text not null check (forma in ('pix','credito','debito')),
  rotulo text,
  taxa_percentual numeric(6,3) not null default 0,
  taxa_fixa_centavos int not null default 0,
  parcelado boolean not null default false,
  taxa_parcela_percentual numeric(6,3) not null default 0,
  max_parcelas int not null default 1,
  prazo_liberacao_dias int not null default 0,
  ativo boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists acquirer_fees_acq_idx on public.acquirer_fees (acquirer_id, forma);

alter table public.acquirer_fees enable row level security;

drop policy if exists "acquirer_fees_admin_select" on public.acquirer_fees;
create policy "acquirer_fees_admin_select" on public.acquirer_fees for select
  using (public.is_admin());

drop trigger if exists set_updated_at_acquirer_fees on public.acquirer_fees;
create trigger set_updated_at_acquirer_fees before update on public.acquirer_fees
  for each row execute function public.set_updated_at();

-- Seed: SyncPay (PIX, libera D+2) e Stripe (cartão, libera D+30)
insert into public.acquirers (nome, slug, ativo, custo_transferencia_centavos, observacao)
values
  ('SyncPay', 'syncpay', true, 0, 'PIX de entrada. Liberação D+2.'),
  ('Stripe', 'stripe', true, 0, 'Cartão / Apple Pay / Google Pay. Liberação D+30.')
on conflict (slug) do nothing;

insert into public.acquirer_fees (acquirer_id, forma, rotulo, taxa_percentual, taxa_fixa_centavos, prazo_liberacao_dias)
select a.id, v.forma, v.rotulo, v.pct, v.fixa, v.prazo
from (values
  ('syncpay', 'pix', 'PIX à vista', 0.0, 0, 2),
  ('stripe', 'credito', 'Crédito à vista', 3.99, 39, 30)
) as v(slug, forma, rotulo, pct, fixa, prazo)
join public.acquirers a on a.slug = v.slug
where not exists (
  select 1 from public.acquirer_fees f where f.acquirer_id = a.id and f.forma = v.forma
);

-- =========================================================
-- CONTAS BANCÁRIAS do estabelecimento (múltiplas, com snapshot no saque)
-- =========================================================
create table if not exists public.establishment_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  apelido text,
  pix_chave text,
  banco text,
  agencia text,
  conta text,
  tipo_conta text not null default 'corrente' check (tipo_conta in ('corrente','poupanca')),
  titular text,
  doc_titular text,
  created_at timestamptz not null default now()
);

create index if not exists estab_bank_accounts_idx on public.establishment_bank_accounts (establishment_id, created_at desc);

alter table public.establishment_bank_accounts enable row level security;

drop policy if exists "bank_accounts_select" on public.establishment_bank_accounts;
create policy "bank_accounts_select" on public.establishment_bank_accounts for select
  using (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "bank_accounts_insert" on public.establishment_bank_accounts;
create policy "bank_accounts_insert" on public.establishment_bank_accounts for insert
  with check (public.owns_establishment(establishment_id) or public.is_admin());

drop policy if exists "bank_accounts_delete" on public.establishment_bank_accounts;
create policy "bank_accounts_delete" on public.establishment_bank_accounts for delete
  using (public.owns_establishment(establishment_id) or public.is_admin());

-- =========================================================
-- BLOQUEIOS FINANCEIROS (débitos que travam o saque)
-- Cobertura: os débitos são pagos primeiro pelo dinheiro que
-- ainda está na plataforma; só o excedente trava o disponível.
-- =========================================================
create table if not exists public.financial_blocks (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  valor_centavos int not null check (valor_centavos > 0),
  razao text not null default 'outro'
    check (razao in ('chargeback_cartao','contestacao_pix','reembolso','repasse_excedente','outro')),
  observacao text,
  status text not null default 'ativo' check (status in ('ativo','resolvido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists financial_blocks_estab_idx on public.financial_blocks (establishment_id, status);

alter table public.financial_blocks enable row level security;

drop policy if exists "financial_blocks_select" on public.financial_blocks;
create policy "financial_blocks_select" on public.financial_blocks for select
  using (public.owns_establishment(establishment_id) or public.is_admin());
-- escrita só via service role

drop trigger if exists set_updated_at_financial_blocks on public.financial_blocks;
create trigger set_updated_at_financial_blocks before update on public.financial_blocks
  for each row execute function public.set_updated_at();

-- =========================================================
-- RETIRADAS (saídas do caixa da própria BRAVA+ — despesas)
-- Reduzem o líquido BRAVA e a conta corrente. Não são saques de lojista.
-- =========================================================
create table if not exists public.retiradas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'despesa'
    check (tipo in ('despesa','pro_labore','imposto','fornecedor','outro')),
  descricao text not null,
  valor_centavos int not null check (valor_centavos > 0),
  observacao text,
  criado_por uuid references public.profiles(id),
  criado_por_nome text,
  created_at timestamptz not null default now()
);

create index if not exists retiradas_created_idx on public.retiradas (created_at desc);

alter table public.retiradas enable row level security;

drop policy if exists "retiradas_admin_select" on public.retiradas;
create policy "retiradas_admin_select" on public.retiradas for select
  using (public.is_admin());
-- escrita só via service role

-- =========================================================
-- WITHDRAWALS — upgrade pro fluxo completo
-- status: pending -> approved -> paid | rejected
-- =========================================================
alter table public.withdrawals add column if not exists forma text not null default 'PIX'
  check (forma in ('PIX','CARTAO'));
alter table public.withdrawals add column if not exists bank_account_id uuid
  references public.establishment_bank_accounts(id) on delete set null;
alter table public.withdrawals add column if not exists conta_snapshot jsonb;
alter table public.withdrawals add column if not exists taxa_transferencia_centavos int not null default 0;
alter table public.withdrawals add column if not exists origem text not null default 'solicitacao'
  check (origem in ('solicitacao','baixa_admin','saldo_admin'));
alter table public.withdrawals add column if not exists approved_at timestamptz;
alter table public.withdrawals add column if not exists observacao text;
