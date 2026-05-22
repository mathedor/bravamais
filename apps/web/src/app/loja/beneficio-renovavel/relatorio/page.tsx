import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";

export const metadata = { title: "Relatório — Benefício Renovável" };

export default async function BeneficioRelatorioPage() {
  const { establishment } = await requireEstablishment();
  const admin = createAdminClient();
  const { data } = await admin.rpc("renewable_lojista_report", { p_estab_id: establishment.id });
  const report = (data ?? {}) as any;
  const resumo = report.resumo ?? {};
  const mensal: any[] = report.mensal ?? [];
  const porCiclo: any[] = report.por_ciclo ?? [];
  const topClientes: any[] = report.top_clientes ?? [];

  const maxMensal = Math.max(1, ...mensal.map((m) => m.entregues));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">relatório de uso</div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Benefício Renovável — desempenho</h1>
          <p className="text-sm text-brava-muted">Quanto seu benefício está convertendo e trazendo cliente de volta.</p>
        </div>
        <Link href="/loja/beneficio-renovavel" className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-xs font-bold text-brava-ink hover:bg-brava-paper">
          ⚙ Editar benefício
        </Link>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label="Total entregue" value={String(resumo.total ?? 0)} />
        <Kpi label="Ativos agora" value={String(resumo.ativos ?? 0)} tone="yellow" />
        <Kpi label="Usados" value={String(resumo.usados ?? 0)} tone="green" />
        <Kpi label="Clientes alcançados" value={String(resumo.clientes_alcancados ?? 0)} tone="blue" />
        <Kpi label="Conversão" value={`${resumo.conversao_pct ?? 0}%`} tone="green" />
      </section>

      <div className="rounded-2xl border border-brava-blue/30 bg-brava-blue/5 p-4 text-sm text-brava-ink">
        <strong>Como ler a conversão:</strong> de cada 100 benefícios que chegaram ao fim do ciclo (usados + expirados),
        quantos foram efetivamente usados. Acima de 20% é ótimo. Abaixo de 10%, aumente o valor ou reduza o pedido mínimo.
      </div>

      {/* Evolução mensal */}
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Evolução mensal (6 meses)</h2>
        {mensal.length > 0 ? (
          <div className="rounded-2xl border border-brava-border bg-brava-card p-4">
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${mensal.length}, 1fr)` }}>
              {mensal.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="text-[10px] font-bold text-brava-ink">{m.usados}/{m.entregues}</div>
                  <div className="flex h-32 w-full items-end gap-0.5">
                    <div className="flex-1 rounded-t bg-brava-border" style={{ height: `${(m.entregues / maxMensal) * 100}%` }} title={`${m.entregues} entregues`} />
                    <div className="flex-1 rounded-t bg-green-500" style={{ height: `${(m.usados / maxMensal) * 100}%` }} title={`${m.usados} usados`} />
                  </div>
                  <div className="text-[10px] text-brava-muted">{m.mes}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-4 text-[10px] text-brava-muted">
              <span className="flex items-center gap-1"><span className="inline-block size-3 rounded bg-brava-border" /> Entregues</span>
              <span className="flex items-center gap-1"><span className="inline-block size-3 rounded bg-green-500" /> Usados</span>
            </div>
          </div>
        ) : <Empty text="Sem dados ainda. Entregue o benefício pra começar a medir." />}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {/* Por ciclo */}
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Conversão por ciclo de renovação</h2>
          {porCiclo.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-brava-border">
              <table className="w-full text-sm">
                <thead className="bg-brava-paper text-xs uppercase">
                  <tr><th className="px-3 py-2 text-left">Ciclo</th><th className="px-3 py-2 text-center">Entregues</th><th className="px-3 py-2 text-center">Usados</th><th className="px-3 py-2 text-right">%</th></tr>
                </thead>
                <tbody>
                  {porCiclo.map((c, i) => {
                    const pct = c.entregues > 0 ? Math.round((c.usados / c.entregues) * 100) : 0;
                    return (
                      <tr key={i} className="border-t border-brava-border bg-brava-card">
                        <td className="px-3 py-2 font-bold">#{c.cycle}</td>
                        <td className="px-3 py-2 text-center">{c.entregues}</td>
                        <td className="px-3 py-2 text-center">{c.usados}</td>
                        <td className="px-3 py-2 text-right font-bold">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <Empty text="Sem ciclos completados ainda." />}
        </div>

        {/* Top clientes */}
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Quem mais usa seu benefício</h2>
          {topClientes.length > 0 ? (
            <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
              {topClientes.map((t, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="font-bold text-brava-ink">{i + 1}. {t.nome ?? "—"}</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">{t.usos} usos</span>
                </li>
              ))}
            </ul>
          ) : <Empty text="Ninguém usou ainda. Capriche no valor do benefício!" />}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "yellow" | "blue" | "green" }) {
  const cls = tone === "yellow" ? "border-brava-yellow/40 bg-brava-yellow/5"
    : tone === "blue" ? "border-brava-blue/30 bg-brava-blue/5"
    : tone === "green" ? "border-green-300 bg-green-50"
    : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border ${cls} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">{text}</div>;
}
