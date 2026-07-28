import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Repasses — Admin" };

interface Linha {
  id: string;
  name: string;
  faturadoPix: number;
  faturadoCartao: number;
  sacado: number;
  emAndamento: number;
  debitos: number;
  saldo: number;
}

export default async function RepassesPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: estabs }, { data: orders }, { data: withdrawals }, { data: blocks }] =
    await Promise.all([
      admin.from("establishments").select("id, name").order("name"),
      admin
        .from("orders")
        .select("establishment_id, total_cents, payment_method, status")
        .in("status", ["paid", "completed"]),
      admin.from("withdrawals").select("establishment_id, amount_cents, status"),
      admin
        .from("financial_blocks")
        .select("establishment_id, valor_centavos")
        .eq("status", "ativo"),
    ]);

  const map = new Map<string, Linha>();
  for (const e of estabs ?? []) {
    map.set(e.id, {
      id: e.id,
      name: e.name,
      faturadoPix: 0,
      faturadoCartao: 0,
      sacado: 0,
      emAndamento: 0,
      debitos: 0,
      saldo: 0,
    });
  }
  for (const o of orders ?? []) {
    const l = map.get(o.establishment_id);
    if (!l) continue;
    if (o.payment_method === "credit_card") l.faturadoCartao += o.total_cents;
    else l.faturadoPix += o.total_cents;
  }
  for (const w of withdrawals ?? []) {
    const l = map.get(w.establishment_id);
    if (!l) continue;
    if (w.status === "paid") l.sacado += w.amount_cents;
    if (w.status === "pending" || w.status === "approved") l.emAndamento += w.amount_cents;
  }
  for (const b of blocks ?? []) {
    const l = map.get(b.establishment_id);
    if (!l) continue;
    l.debitos += b.valor_centavos;
  }

  const linhas = [...map.values()]
    .map((l) => ({
      ...l,
      saldo: l.faturadoPix + l.faturadoCartao - l.sacado - l.emAndamento - l.debitos,
    }))
    .filter((l) => l.faturadoPix + l.faturadoCartao + l.sacado + l.emAndamento + l.debitos > 0)
    .sort((a, b) => b.saldo - a.saldo);

  const tot = linhas.reduce(
    (acc, l) => {
      acc.faturado += l.faturadoPix + l.faturadoCartao;
      acc.sacado += l.sacado;
      acc.emAndamento += l.emAndamento;
      acc.debitos += l.debitos;
      acc.saldo += l.saldo;
      return acc;
    },
    { faturado: 0, sacado: 0, emAndamento: 0, debitos: 0, saldo: 0 },
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Financeiro</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Repasses</h1>
          <p className="mt-1 text-sm text-brava-muted">
            Conta corrente de cada lojista: faturado, repassado e o que a BRAVA+ ainda deve.
          </p>
        </div>
        <a
          href="/api/admin/repasses/export"
          className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-sm font-bold text-brava-ink"
        >
          ⬇️ Exportar CSV
        </a>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label="Faturado (lojistas)" value={formatBRL(tot.faturado)} />
        <Kpi label="Repassado" value={formatBRL(tot.sacado)} />
        <Kpi label="Em andamento" value={formatBRL(tot.emAndamento)} />
        <Kpi label="Débitos ativos" value={formatBRL(tot.debitos)} tone={tot.debitos > 0 ? "rose" : undefined} />
        <Kpi label="A repassar" value={formatBRL(tot.saldo)} highlight />
      </section>

      <section className="mt-6">
        {linhas.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">
            Nenhum lojista com movimento financeiro ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brava-border">
            <table className="table-cards w-full min-w-[860px] text-sm">
              <thead className="bg-brava-paper text-left text-xs uppercase text-brava-muted">
                <tr>
                  <th className="p-3">Lojista</th>
                  <th className="p-3 text-right">Faturado PIX</th>
                  <th className="p-3 text-right">Faturado Cartão</th>
                  <th className="p-3 text-right">Repassado</th>
                  <th className="p-3 text-right">Em andamento</th>
                  <th className="p-3 text-right">Débitos</th>
                  <th className="p-3 text-right">Saldo a repassar</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.id} className="border-t border-brava-border">
                    <td data-label="Lojista" className="p-3 font-bold text-brava-ink">{l.name}</td>
                    <td data-label="Faturado PIX" className="p-3 text-right">{formatBRL(l.faturadoPix)}</td>
                    <td data-label="Faturado Cartão" className="p-3 text-right">{formatBRL(l.faturadoCartao)}</td>
                    <td data-label="Repassado" className="p-3 text-right text-green-700">{formatBRL(l.sacado)}</td>
                    <td data-label="Em andamento" className="p-3 text-right text-amber-700">{formatBRL(l.emAndamento)}</td>
                    <td data-label="Débitos" className={`p-3 text-right ${l.debitos > 0 ? "font-bold text-red-600" : ""}`}>
                      {l.debitos > 0 ? `−${formatBRL(l.debitos)}` : "—"}
                    </td>
                    <td data-label="Saldo" className={`p-3 text-right font-black ${l.saldo < 0 ? "text-red-600" : "text-brava-blue"}`}>
                      {formatBRL(l.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs text-brava-muted">
          Saldo = faturado − repassado − em andamento − débitos. Saldo negativo indica repasse
          excedente (gera bloqueio automático).
        </p>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "rose";
}) {
  const base =
    tone === "rose"
      ? "border-rose-200 bg-rose-50"
      : highlight
        ? "border-brava-yellow/50 bg-brava-yellow/10"
        : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border-2 p-4 ${base}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-lg font-black text-brava-ink sm:text-xl">{value}</div>
    </div>
  );
}
