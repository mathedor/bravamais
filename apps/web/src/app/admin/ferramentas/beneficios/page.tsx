import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Admin · Benefício Renovável" };

export default async function AdminBeneficiosPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const { data } = await admin.rpc("renewable_admin_overview");
  const ov = (data ?? {}) as any;
  const t = ov.totais ?? {};
  const topLojas: any[] = ov.top_lojas ?? [];
  const semBeneficio: any[] = ov.sem_beneficio ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">ferramentas · monitor</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">♻️ Benefício Renovável</h1>
        <p className="text-sm text-brava-muted">
          Visão sistêmica das promoções obrigatórias. Cobertura, conversão global e quais lojas ainda não configuraram.
        </p>
      </header>

      {/* Cobertura — destaque (é obrigatório) */}
      <section className="rounded-2xl border-2 border-brava-yellow/40 bg-brava-yellow/5 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brava-muted">Cobertura (lojas com benefício ativo)</div>
            <div className="mt-1 text-4xl font-black">{ov.cobertura_pct ?? 0}%</div>
            <div className="text-sm text-brava-muted">{ov.beneficios_ativos ?? 0} de {ov.estabs_ativos ?? 0} lojas ativas</div>
          </div>
          <div className="text-right text-xs text-brava-muted max-w-xs">
            Meta: <strong className="text-brava-ink">100%</strong>. Benefício é obrigatório — lojas sem benefício recebem alerta no painel e perdem destaque no app.
          </div>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-brava-border">
          <div className="h-full rounded-full bg-brava-yellow" style={{ width: `${ov.cobertura_pct ?? 0}%` }} />
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Total entregue" value={String(t.total_grants ?? 0)} />
        <Kpi label="Ativos" value={String(t.ativos ?? 0)} tone="yellow" />
        <Kpi label="Usados" value={String(t.usados ?? 0)} tone="green" />
        <Kpi label="Expirados" value={String(t.expirados ?? 0)} />
        <Kpi label="Conversão global" value={`${t.conversao_global_pct ?? 0}%`} tone="green" />
        <Kpi label="Usuários alcançados" value={String(t.usuarios_alcancados ?? 0)} tone="blue" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {/* Top lojas */}
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Top lojas por uso</h2>
          {topLojas.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-brava-border">
              <table className="w-full text-sm table-cards">
                <thead className="bg-brava-paper text-xs uppercase">
                  <tr><th className="px-3 py-2 text-left">Loja</th><th className="px-3 py-2 text-center">Entregues</th><th className="px-3 py-2 text-center">Usados</th><th className="px-3 py-2 text-right">Conv.</th></tr>
                </thead>
                <tbody>
                  {topLojas.map((l, i) => (
                    <tr key={i} className="border-t border-brava-border bg-brava-card">
                      <td className="px-3 py-2"><div className="font-bold">{l.loja}</div><div className="text-xs text-brava-muted">{l.cidade}</div></td>
                      <td className="px-3 py-2 text-center">{l.entregues}</td>
                      <td className="px-3 py-2 text-center">{l.usados}</td>
                      <td className="px-3 py-2 text-right font-bold">{l.conversao}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty text="Sem dados de uso ainda." />}
        </div>

        {/* Lojas SEM benefício (precisam configurar) */}
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600">⚠ Lojas SEM benefício ({semBeneficio.length})</h2>
          {semBeneficio.length > 0 ? (
            <ul className="divide-y divide-brava-border rounded-2xl border-2 border-red-200 bg-red-50/50">
              {semBeneficio.map((l, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <div className="font-bold text-brava-ink">{l.loja}</div>
                    <div className="text-xs text-brava-muted">{l.cidade ?? "—"}</div>
                  </div>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">pendente</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center text-sm font-bold text-green-700">
              ✅ Todas as lojas ativas têm benefício configurado!
            </div>
          )}
        </div>
      </section>

      <div className="flex gap-2">
        <Link href="/admin/relatorios/ferramentas" className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-xs font-bold text-brava-ink hover:bg-brava-paper">
          ← Voltar pro relatório de ferramentas
        </Link>
      </div>
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
      <div className="mt-1 text-xl font-black sm:text-2xl">{value}</div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">{text}</div>;
}
