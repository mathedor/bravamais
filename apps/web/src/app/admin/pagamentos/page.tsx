import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { PeriodFilter, periodToDate } from "@/components/admin/period-filter";

export const metadata = { title: "Pagamentos — Admin" };

const KIND_LABEL: Record<string, string> = {
  subscription: "Assinatura",
  category_subscription: "Categorias",
  tag_recharge: "Recarga Tag",
  tag_monthly: "Tag mensal",
  establishment_plan: "Plano lojista",
  gift_card: "Vale-presente",
  wallet_deposit: "Depósito Wallet",
  b2b_invoice: "Fatura B2B",
  order: "Pedido",
};

const STATUS_TONE: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  expired: "bg-zinc-200 text-zinc-700",
  refunded: "bg-blue-100 text-blue-800",
};

interface Pay {
  id: string;
  kind: string;
  method: string;
  gateway: string;
  gateway_charge_id: string | null;
  amount_cents: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  profile: { full_name: string | null } | null;
}

interface Filters {
  status?: string;
  gateway?: string;
  method?: string;
  kind?: string;
  period?: string;
}

export default async function AdminPagamentosPage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  await requireRole("admin");
  const filters = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("payments")
    .select(
      "id, kind, method, gateway, gateway_charge_id, amount_cents, status, created_at, paid_at, profile:user_id(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.gateway) query = query.eq("gateway", filters.gateway);
  if (filters.method) query = query.eq("method", filters.method);
  if (filters.kind) query = query.eq("kind", filters.kind);
  const since = periodToDate(filters.period);
  if (since) query = query.gte("created_at", since.toISOString());

  const { data } = await query;
  const pays = ((data ?? []) as unknown as Pay[]);

  const paid = pays.filter((p) => p.status === "paid");
  const totalPago = paid.reduce((s, p) => s + p.amount_cents, 0);
  const porGateway = new Map<string, { cnt: number; cents: number }>();
  const porMetodo = new Map<string, { cnt: number; cents: number }>();
  for (const p of paid) {
    const g = porGateway.get(p.gateway) ?? { cnt: 0, cents: 0 };
    g.cnt++;
    g.cents += p.amount_cents;
    porGateway.set(p.gateway, g);
    const m = porMetodo.get(p.method) ?? { cnt: 0, cents: 0 };
    m.cnt++;
    m.cents += p.amount_cents;
    porMetodo.set(p.method, m);
  }

  const exportQs = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][],
  ).toString();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Financeiro</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Pagamentos</h1>
          <p className="mt-1 text-sm text-brava-muted">
            Todas as cobranças da plataforma, com filtros e export.
          </p>
        </div>
        <a
          href={`/api/admin/pagamentos/export${exportQs ? `?${exportQs}` : ""}`}
          className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-sm font-bold text-brava-ink"
        >
          ⬇️ Exportar CSV
        </a>
      </header>

      {/* Cards de resumo (do filtro atual) */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Recebido (filtro)" value={formatBRL(totalPago)} highlight />
        <Kpi label="Transações pagas" value={String(paid.length)} />
        <Kpi
          label="PIX"
          value={`${porMetodo.get("pix")?.cnt ?? 0} · ${formatBRL(porMetodo.get("pix")?.cents ?? 0)}`}
        />
        <Kpi
          label="Cartão"
          value={`${porMetodo.get("card")?.cnt ?? 0} · ${formatBRL(porMetodo.get("card")?.cents ?? 0)}`}
        />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...porGateway.entries()].map(([g, v]) => (
          <Kpi key={g} label={`Gateway: ${g}`} value={`${v.cnt} · ${formatBRL(v.cents)}`} />
        ))}
      </section>

      {/* Filtros */}
      <section className="mt-6 space-y-3">
        <PeriodFilter />
        <div className="flex flex-wrap gap-1.5">
          <FilterChip current={filters} field="status" value="" label="Todos status" />
          {["paid", "pending", "failed", "expired", "refunded"].map((s) => (
            <FilterChip key={s} current={filters} field="status" value={s} label={s} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip current={filters} field="gateway" value="" label="Todos gateways" />
          {["syncpay", "stripe", "mock"].map((g) => (
            <FilterChip key={g} current={filters} field="gateway" value={g} label={g} />
          ))}
          <span className="mx-1" />
          <FilterChip current={filters} field="method" value="" label="PIX+Cartão" />
          <FilterChip current={filters} field="method" value="pix" label="PIX" />
          <FilterChip current={filters} field="method" value="card" label="Cartão" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip current={filters} field="kind" value="" label="Todos tipos" />
          {Object.entries(KIND_LABEL).map(([k, l]) => (
            <FilterChip key={k} current={filters} field="kind" value={k} label={l} />
          ))}
        </div>
      </section>

      {/* Tabela */}
      <section className="mt-6">
        {pays.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">
            Nenhum pagamento com esses filtros.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brava-border">
            <table className="table-cards w-full min-w-[760px] text-sm">
              <thead className="bg-brava-paper text-left text-xs uppercase text-brava-muted">
                <tr>
                  <th className="p-3">Quando</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Método</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pays.map((p) => (
                  <tr key={p.id} className="border-t border-brava-border">
                    <td data-label="Quando" className="p-3 text-xs text-brava-muted">
                      {new Date(p.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td data-label="Cliente" className="p-3 font-bold text-brava-ink">
                      {p.profile?.full_name ?? "—"}
                    </td>
                    <td data-label="Tipo" className="p-3">{KIND_LABEL[p.kind] ?? p.kind}</td>
                    <td data-label="Método" className="p-3">{p.method === "pix" ? "PIX" : "Cartão"}</td>
                    <td data-label="Gateway" className="p-3 text-xs">{p.gateway}</td>
                    <td data-label="Valor" className="p-3 text-right font-bold">
                      {formatBRL(p.amount_cents)}
                    </td>
                    <td data-label="Status" className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[p.status] ?? "bg-zinc-200 text-zinc-700"}`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pays.length === 500 && (
          <p className="mt-2 text-xs text-brava-muted">
            Mostrando as 500 mais recentes — refine o filtro ou use o CSV pra ver tudo.
          </p>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const base = highlight ? "border-brava-yellow/50 bg-brava-yellow/10" : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border-2 p-4 ${base}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-lg font-black text-brava-ink sm:text-xl">{value}</div>
    </div>
  );
}

function FilterChip({
  current,
  field,
  value,
  label,
}: {
  current: Filters;
  field: keyof Filters;
  value: string;
  label: string;
}) {
  const next = { ...current } as Record<string, string>;
  if (value) next[field] = value;
  else delete next[field];
  const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v)).toString();
  const active = (current[field] ?? "") === value;
  return (
    <Link
      href={`/admin/pagamentos${qs ? `?${qs}` : ""}`}
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? "border-brava-blue bg-brava-blue text-white"
          : "border-brava-border bg-brava-card text-brava-ink"
      }`}
    >
      {label}
    </Link>
  );
}
