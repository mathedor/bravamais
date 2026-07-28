import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { PeriodFilter, periodToDate } from "@/components/admin/period-filter";
import { ReceitaPorDiaChart, type DiaDatum } from "./chart";

export const metadata = { title: "Financeiro Geral — Admin" };

interface Pay {
  method: string;
  gateway: string;
  amount_cents: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export default async function FinanceiroGeralPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireRole("admin");
  const { period } = await searchParams;
  const since = periodToDate(period);
  const admin = createAdminClient();

  let payQuery = admin
    .from("payments")
    .select("method, gateway, amount_cents, status, paid_at, created_at")
    .eq("status", "paid")
    .order("created_at", { ascending: true })
    .limit(20000);
  if (since) payQuery = payQuery.gte("created_at", since.toISOString());

  const [{ data: paysData }, { data: saquesData }, { data: retiradasData }, { data: blocksData }] =
    await Promise.all([
      payQuery,
      admin.from("withdrawals").select("amount_cents, status"),
      admin.from("retiradas").select("valor_centavos"),
      admin.from("financial_blocks").select("valor_centavos").eq("status", "ativo"),
    ]);

  const pays = (paysData as Pay[] | null) ?? [];

  // Série diária PIX × Cartão
  const porDia = new Map<string, { pix: number; cartao: number }>();
  // Breakdown método × gateway
  const cross = new Map<string, { cnt: number; cents: number }>();
  let totalRecebido = 0;
  for (const p of pays) {
    totalRecebido += p.amount_cents;
    const day = (p.paid_at ?? p.created_at).slice(0, 10);
    const d = porDia.get(day) ?? { pix: 0, cartao: 0 };
    if (p.method === "card") d.cartao += p.amount_cents;
    else d.pix += p.amount_cents;
    porDia.set(day, d);

    const key = `${p.method}|${p.gateway}`;
    const c = cross.get(key) ?? { cnt: 0, cents: 0 };
    c.cnt++;
    c.cents += p.amount_cents;
    cross.set(key, c);
  }
  const serie: DiaDatum[] = [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({ day, ...v }));

  // Conta corrente (sempre, sem filtro de período): o que DEVERÍAMOS ter em conta.
  const { data: allPaid } = await admin
    .from("payments")
    .select("amount_cents")
    .eq("status", "paid")
    .limit(50000);
  const entrouTotal = (allPaid ?? []).reduce((s, p) => s + p.amount_cents, 0);
  const repassado = (saquesData ?? [])
    .filter((w) => w.status === "paid")
    .reduce((s, w) => s + w.amount_cents, 0);
  const naFila = (saquesData ?? [])
    .filter((w) => w.status === "pending" || w.status === "approved")
    .reduce((s, w) => s + w.amount_cents, 0);
  const retirado = (retiradasData ?? []).reduce((s, r) => s + r.valor_centavos, 0);
  const debitosAtivos = (blocksData ?? []).reduce((s, b) => s + b.valor_centavos, 0);
  const deveriamosTer = entrouTotal - repassado - retirado;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Relatórios</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Financeiro Geral</h1>
          <p className="mt-1 text-sm text-brava-muted">
            Receita por dia, breakdown método × gateway e conta corrente da BRAVA+.
          </p>
        </div>
        <a
          href={`/api/admin/pagamentos/export${period ? `?period=${period}&status=paid` : "?status=paid"}`}
          className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-sm font-bold text-brava-ink"
        >
          ⬇️ Exportar CSV
        </a>
      </header>

      <div className="mb-4">
        <PeriodFilter />
      </div>

      {/* Gráfico antes da tabela */}
      <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="mb-3 text-base font-bold">
          Receita por dia — {formatBRL(totalRecebido)} no período
        </h2>
        <ReceitaPorDiaChart data={serie} />
      </section>

      {/* Breakdown método × gateway */}
      <section className="mt-6">
        <h2 className="mb-2 text-base font-bold text-brava-ink">Método × Gateway (período)</h2>
        <div className="overflow-x-auto rounded-2xl border border-brava-border">
          <table className="table-cards w-full min-w-[520px] text-sm">
            <thead className="bg-brava-paper text-left text-xs uppercase text-brava-muted">
              <tr>
                <th className="p-3">Método</th>
                <th className="p-3">Gateway</th>
                <th className="p-3 text-right">Transações</th>
                <th className="p-3 text-right">Recebido</th>
                <th className="p-3 text-right">% do total</th>
              </tr>
            </thead>
            <tbody>
              {[...cross.entries()]
                .sort(([, a], [, b]) => b.cents - a.cents)
                .map(([key, v]) => {
                  const [method, gateway] = key.split("|");
                  return (
                    <tr key={key} className="border-t border-brava-border">
                      <td data-label="Método" className="p-3 font-bold">
                        {method === "pix" ? "💠 PIX" : "💳 Cartão"}
                      </td>
                      <td data-label="Gateway" className="p-3">{gateway}</td>
                      <td data-label="Transações" className="p-3 text-right">{v.cnt}</td>
                      <td data-label="Recebido" className="p-3 text-right font-bold">
                        {formatBRL(v.cents)}
                      </td>
                      <td data-label="%" className="p-3 text-right text-brava-muted">
                        {totalRecebido > 0 ? ((v.cents / totalRecebido) * 100).toFixed(1) : "0"}%
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Conta corrente */}
      <section className="mt-8">
        <h2 className="mb-2 text-base font-bold text-brava-ink">Conta corrente (desde o início)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Kpi label="Entrou (pagamentos)" value={formatBRL(entrouTotal)} />
          <Kpi label="Repassado a lojistas" value={`−${formatBRL(repassado)}`} />
          <Kpi label="Retiradas BRAVA" value={`−${formatBRL(retirado)}`} />
          <Kpi label="Deveríamos ter" value={formatBRL(deveriamosTer)} highlight />
          <Kpi
            label="Compromissos"
            value={`${formatBRL(naFila)} fila · ${formatBRL(debitosAtivos)} débitos`}
          />
        </div>
        <p className="mt-2 text-xs text-brava-muted">
          &quot;Deveríamos ter&quot; = tudo que entrou − repasses pagos − retiradas. Compare com o
          extrato real das contas SyncPay/Stripe pra conciliar.
        </p>
      </section>
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const base = highlight ? "border-brava-yellow/50 bg-brava-yellow/10" : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border-2 p-4 ${base}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-base font-black text-brava-ink sm:text-lg">{value}</div>
    </div>
  );
}
