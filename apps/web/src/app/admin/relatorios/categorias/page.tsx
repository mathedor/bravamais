import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Admin · Relatório de categorias" };

interface CategoryStat {
  id: string;
  slug: string;
  name: string;
  monthly_cents: number;
  is_active: boolean;
  estabs_count: number;
  subscribers_count: number;
  mrr_cents: number;
  sales_count_90d: number;
  gross_90d: number;
  discount_90d: number;
  net_90d: number;
  sales_with_benefit_90d: number;
}

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminCategoryReportPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data } = await supabase.rpc("admin_category_stats");
  const rows = (data as CategoryStat[] | null) ?? [];

  const totals = rows.reduce(
    (acc, r) => ({
      mrr: acc.mrr + r.mrr_cents,
      subs: acc.subs + r.subscribers_count,
      estabs: acc.estabs + r.estabs_count,
      gross: acc.gross + r.gross_90d,
      saved: acc.saved + r.discount_90d,
    }),
    { mrr: 0, subs: 0, estabs: 0, gross: 0, saved: 0 },
  );

  const maxMrr = Math.max(1, ...rows.map((r) => r.mrr_cents));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brava-muted">Relatórios</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Categorias — MRR, vendas e uso</h1>
        <p className="mt-1 text-brava-muted">Visão consolidada do que cada categoria está gerando.</p>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="MRR total" value={centsToBRL(totals.mrr)} highlight />
        <Kpi label="Assinaturas" value={String(totals.subs)} />
        <Kpi label="Estabs cobertos" value={String(totals.estabs)} />
        <Kpi label="Vendas (90d) bruto" value={centsToBRL(totals.gross)} />
        <Kpi label="Economia (90d)" value={centsToBRL(totals.saved)} tone="green" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">Ranking de categorias por MRR</h2>
        <div className="overflow-hidden rounded-3xl border border-brava-border bg-brava-card">
          <table className="w-full text-sm table-cards">
            <thead className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
              <tr>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">R$/mês</th>
                <th className="px-4 py-3 text-right">Assinantes</th>
                <th className="px-4 py-3 text-right">MRR</th>
                <th className="px-4 py-3 text-right">Estabs</th>
                <th className="px-4 py-3 text-right">Vendas 90d</th>
                <th className="px-4 py-3 text-right">Bruto 90d</th>
                <th className="px-4 py-3 text-right">Economia 90d</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brava-border">
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-brava-muted">Sem dados ainda.</td></tr>
              ) : rows.map((r) => {
                const mrrPct = (r.mrr_cents / maxMrr) * 100;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-brava-ink">{r.name}</p>
                      <div className="mt-1 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-brava-paper">
                        <div className="h-full bg-brava-yellow" style={{ width: `${mrrPct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{centsToBRL(r.monthly_cents)}</td>
                    <td className="px-4 py-3 text-right">{r.subscribers_count}</td>
                    <td className="px-4 py-3 text-right font-black text-brava-blue">{centsToBRL(r.mrr_cents)}</td>
                    <td className="px-4 py-3 text-right">{r.estabs_count}</td>
                    <td className="px-4 py-3 text-right">{r.sales_count_90d}</td>
                    <td className="px-4 py-3 text-right">{centsToBRL(r.gross_90d)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-300">
                      {centsToBRL(r.discount_90d)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs text-brava-muted">
        Vendas e economia consideram os últimos 90 dias. MRR é uma fotografia atual: assinantes × preço da categoria.
      </p>
    </div>
  );
}

function Kpi({ label, value, highlight, tone }: { label: string; value: string; highlight?: boolean; tone?: "green" }) {
  const color = tone === "green" ? "text-emerald-700 dark:text-emerald-300" : "text-brava-ink";
  return (
    <div className={`rounded-3xl border p-5 ${highlight ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-brava-card"}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</p>
      <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
