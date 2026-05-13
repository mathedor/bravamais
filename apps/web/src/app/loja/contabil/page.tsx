import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Contábil — Loja" };

interface Statement {
  period_month: string;
  gross_revenue_cents: number;
  orders_count: number;
  refunded_cents: number;
  refunds_count: number;
  net_revenue_cents: number;
  withdrawn_cents: number;
  withdrawals_count: number;
  balance_pending_cents: number;
}

interface Line {
  occurred_at: string;
  kind: string;
  description: string;
  amount_cents: number;
}

export default async function ContabilPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { establishment } = await requireEstablishment();
  const { month } = await searchParams;
  const admin = createAdminClient();

  const periodDate = month ? new Date(month + "-01") : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const periodIso = periodDate.toISOString().slice(0, 10);
  const periodKey = periodIso.slice(0, 7);

  const [{ data: stmt }, { data: lines }] = await Promise.all([
    admin.rpc("estab_monthly_statement", { p_estab_id: establishment.id, p_month: periodIso }),
    admin.rpc("estab_monthly_lines", { p_estab_id: establishment.id, p_month: periodIso }),
  ]);

  const s = (Array.isArray(stmt) ? stmt[0] : stmt) as Statement | null;
  const ll = (lines as Line[] | null) ?? [];

  // 12 meses para seletor
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  const csvUrl = `/api/loja/contabil/export?month=${periodKey}`;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Contábil</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Extrato mensal</h1>
          <p className="mt-1 text-sm text-brava-muted">Movimentação financeira do BRAVA+ na sua loja.</p>
        </div>
        <div className="flex gap-2">
          <form>
            <select name="month" defaultValue={periodKey} className="rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm">
              {months.map((m) => (
                <option key={m} value={m}>
                  {new Date(m + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </option>
              ))}
            </select>
            <button type="submit" className="ml-1 rounded-full bg-brava-blue px-3 py-2 text-xs font-bold text-white">Filtrar</button>
          </form>
          <a href={csvUrl} className="rounded-full border border-brava-border bg-brava-card px-3 py-2 text-xs font-bold text-brava-ink">
            ⬇️ CSV
          </a>
        </div>
      </header>

      {/* Summary */}
      <section className="rounded-3xl bg-gradient-to-br from-brava-black via-brava-blue to-brava-blue-bright p-6 text-white shadow-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-yellow">
          {new Date(periodKey + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <p className="mt-2 text-5xl font-black tracking-tight">{formatBRL(s?.net_revenue_cents ?? 0)}</p>
        <p className="mt-1 text-xs text-white/65">Receita líquida (bruto - estornos)</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="Bruto" value={formatBRL(s?.gross_revenue_cents ?? 0)} hint={`${s?.orders_count ?? 0} pedidos`} />
          <Mini label="Estornos" value={`-${formatBRL(s?.refunded_cents ?? 0)}`} hint={`${s?.refunds_count ?? 0} tickets`} />
          <Mini label="Saques pagos" value={formatBRL(s?.withdrawn_cents ?? 0)} hint={`${s?.withdrawals_count ?? 0} transferências`} />
          <Mini label="Saldo pendente" value={formatBRL(s?.balance_pending_cents ?? 0)} hint="A sacar" highlight />
        </div>
      </section>

      {/* Lines */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-brava-border bg-brava-card">
        <table className="w-full text-sm">
          <thead className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brava-border">
            {ll.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-brava-muted">Sem lançamentos nesse mês.</td></tr>
            ) : (
              ll.map((l, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-xs text-brava-muted">{new Date(l.occurred_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${kindStyle(l.kind)}`}>
                      {kindLabel(l.kind)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brava-ink">{l.description}</td>
                  <td className={`px-4 py-3 text-right font-bold ${l.amount_cents < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                    {l.amount_cents < 0 ? "-" : "+"}{formatBRL(Math.abs(l.amount_cents))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-center text-xs text-brava-muted">
        <Link href="/loja/receita" className="text-brava-blue hover:underline">← Painel de receita</Link>
        {" · "}
        <Link href="/loja/saques" className="text-brava-blue hover:underline">Pedir saque</Link>
      </p>
    </div>
  );
}

function Mini({ label, value, hint, highlight }: { label: string; value: string; hint: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 backdrop-blur ${highlight ? "border border-brava-yellow/40 bg-brava-yellow/15" : "border border-white/10 bg-white/5"}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-brava-yellow">{label}</p>
      <p className="mt-1 text-base font-black">{value}</p>
      <p className="text-[10px] text-white/55">{hint}</p>
    </div>
  );
}

function kindLabel(k: string): string {
  return { order: "Venda", refund: "Estorno", withdrawal: "Saque" }[k] ?? k;
}

function kindStyle(k: string): string {
  return {
    order: "bg-emerald-100 text-emerald-700",
    refund: "bg-rose-100 text-rose-700",
    withdrawal: "bg-blue-100 text-blue-700",
  }[k] ?? "bg-brava-paper text-brava-ink";
}
