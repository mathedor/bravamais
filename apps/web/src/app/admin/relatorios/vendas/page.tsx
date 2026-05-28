import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { SalesByDayChart } from "./sales-chart";

export const metadata = { title: "Admin · Relatório de vendas" };

interface SalesSummary {
  totals: { total_sales: number; gross: number; discount: number; net: number; with_benefit: number };
  by_kind: Array<{ benefit_kind: string; cnt: number; gross: number; discount: number }>;
  by_day: Array<{ day: string; cnt: number; gross: number; discount: number; net: number }>;
}

interface TopEstab {
  id: string;
  slug: string;
  name: string;
  sales_count: number;
  gross_cents: number;
  discount_cents: number;
  net_cents: number;
}

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const KIND_LABEL: Record<string, { label: string; emoji: string }> = {
  coupon: { label: "Cupom", emoji: "🎟️" },
  gift_card: { label: "Vale-presente", emoji: "🎁" },
  loyalty_reward: { label: "Fidelidade", emoji: "🏆" },
  renewable: { label: "Renovável", emoji: "♻️" },
  none: { label: "Sem benefício", emoji: "💵" },
};

export default async function AdminSalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();

  const sp = await searchParams;
  const days = Math.max(1, Math.min(365, Number(sp.days ?? "30") || 30));

  const [{ data: summary }, { data: topEstabs }] = await Promise.all([
    supabase.rpc("admin_sales_summary", { p_days: days }),
    supabase.rpc("admin_top_establishments", { p_days: days, p_limit: 10 }),
  ]);

  const s = (summary as SalesSummary | null) ?? {
    totals: { total_sales: 0, gross: 0, discount: 0, net: 0, with_benefit: 0 },
    by_kind: [],
    by_day: [],
  };
  const tops = (topEstabs as TopEstab[] | null) ?? [];

  const benefitRate = s.totals.total_sales > 0
    ? Math.round((s.totals.with_benefit / s.totals.total_sales) * 100)
    : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brava-muted">Relatórios</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Vendas no balcão</h1>
          <p className="mt-1 text-brava-muted">Últimos {days} dias.</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/admin/relatorios/vendas?days=${d}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                d === days ? "border-brava-yellow bg-brava-yellow text-brava-black" : "border-brava-border bg-brava-card text-brava-ink"
              }`}
            >
              {d} dias
            </Link>
          ))}
        </div>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Vendas registradas" value={String(s.totals.total_sales)} />
        <Kpi label="Bruto" value={centsToBRL(s.totals.gross)} />
        <Kpi label="Economia gerada" value={centsToBRL(s.totals.discount)} tone="green" />
        <Kpi label="Líquido recebido" value={centsToBRL(s.totals.net)} highlight />
        <Kpi label="Com benefício" value={`${benefitRate}%`} />
      </section>

      <section className="mb-8 rounded-3xl border border-brava-border bg-brava-card p-6">
        <h2 className="mb-3 text-base font-bold text-brava-ink">Vendas por dia</h2>
        <SalesByDayChart data={s.by_day} />
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <h2 className="mb-4 text-base font-bold text-brava-ink">Vendas por tipo de benefício</h2>
          {s.by_kind.length === 0 ? (
            <p className="text-sm text-brava-muted">Sem dados.</p>
          ) : (
            <ul className="space-y-3">
              {s.by_kind.map((k) => {
                const total = s.totals.total_sales || 1;
                const pct = Math.round((k.cnt / total) * 100);
                const meta = KIND_LABEL[k.benefit_kind] ?? { label: k.benefit_kind, emoji: "•" };
                return (
                  <li key={k.benefit_kind}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-bold text-brava-ink">{meta.emoji} {meta.label}</span>
                      <span className="font-mono text-xs text-brava-muted">
                        {k.cnt} venda{k.cnt === 1 ? "" : "s"} · desconto {centsToBRL(k.discount)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-brava-paper">
                      <div className="h-full bg-brava-blue" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <h2 className="mb-4 text-base font-bold text-brava-ink">Top 10 estabelecimentos</h2>
          {tops.length === 0 ? (
            <p className="text-sm text-brava-muted">Sem dados.</p>
          ) : (
            <ol className="space-y-2">
              {tops.map((e, i) => (
                <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-brava-paper px-3 py-2 text-sm">
                  <span className="w-6 text-xs font-bold text-brava-muted">{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-brava-ink">{e.name}</p>
                    <p className="text-xs text-brava-muted">
                      {e.sales_count} venda{e.sales_count === 1 ? "" : "s"} · economia {centsToBRL(e.discount_cents)}
                    </p>
                  </div>
                  <p className="font-black text-brava-blue">{centsToBRL(e.gross_cents)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <p className="text-xs text-brava-muted">
        Vendas registradas via balcão (/loja/balcao). Não inclui pedidos online (esses ficam em /admin/relatorios/ferramentas).
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
