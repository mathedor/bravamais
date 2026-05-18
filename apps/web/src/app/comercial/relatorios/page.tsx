import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";

export default async function ComercialRelatoriosPage() {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();

  // Funil de conversão
  const { data: kpis } = await supabase.rpc("commercial_dashboard", { p_affiliate_id: affiliate.id });
  const k = kpis?.[0] ?? null;

  const totalProspects = k?.prospects_total ?? 0;
  const fechado = k?.prospects_fechado ?? 0;
  const perdido = k?.prospects_perdido ?? 0;
  const ativo = totalProspects - fechado - perdido;
  const conv = totalProspects > 0 ? ((fechado / totalProspects) * 100).toFixed(1) : "0";

  // Cadastros por mês (últimos 6)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: estabsHist } = await supabase
    .from("affiliate_referrals")
    .select("signed_at")
    .eq("affiliate_id", affiliate.id)
    .gte("signed_at", sixMonthsAgo.toISOString());

  const { data: subsHist } = await supabase
    .from("subscriber_referrals")
    .select("signed_at")
    .eq("affiliate_id", affiliate.id)
    .gte("signed_at", sixMonthsAgo.toISOString());

  const byMonth: Record<string, { estabs: number; subs: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const k = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    byMonth[k] = { estabs: 0, subs: 0 };
  }
  (estabsHist ?? []).forEach((e: any) => {
    const k = new Date(e.signed_at).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (byMonth[k]) byMonth[k].estabs += 1;
  });
  (subsHist ?? []).forEach((s: any) => {
    const k = new Date(s.signed_at).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (byMonth[k]) byMonth[k].subs += 1;
  });

  const maxBar = Math.max(1, ...Object.values(byMonth).map((v) => v.estabs + v.subs));

  // Sugestões (heurística)
  const sugestoes: string[] = [];
  if ((k?.prospects_novo ?? 0) > 10) sugestoes.push(`⚠️ Você tem ${k.prospects_novo} prospects em 'Novo' — comece o contato em algum essa semana.`);
  if ((k?.prospects_visita ?? 0) > 5) sugestoes.push(`🎯 ${k.prospects_visita} visitas em andamento — converse na cada um pra avançar pra Proposta.`);
  if (totalProspects > 0 && parseFloat(conv) < 15) sugestoes.push(`📉 Conversão em ${conv}%. Revise a abordagem: qualifique melhor antes de chamar pra proposta.`);
  if ((k?.estabs_no_mes ?? 0) === 0 && (k?.subs_no_mes ?? 0) === 0) sugestoes.push(`🚀 Mês sem cadastros novos. Bata a meta: cadastre pelo menos 1 estab essa semana.`);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">desempenho</div>
        <h1 className="text-2xl font-black tracking-tight">Relatórios</h1>
        <p className="text-sm text-brava-muted">Funil, evolução mensal e sugestões pra você fazer mais.</p>
      </header>

      {sugestoes.length > 0 && (
        <section className="rounded-2xl border-2 border-brava-yellow/40 bg-brava-yellow/10 p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-ink">Sugestões pra esta semana</h2>
          <ul className="space-y-1 text-sm">
            {sugestoes.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Funil de conversão</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <FunnelStep label="Total no funil" value={totalProspects} />
          <FunnelStep label="Em andamento" value={ativo} tone="yellow" />
          <FunnelStep label="Fechado" value={fechado} tone="green" />
          <FunnelStep label={`Conversão: ${conv}%`} value={`${fechado}/${totalProspects}`} tone="blue" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Cadastros nos últimos 6 meses</h2>
        <div className="rounded-2xl border border-brava-border bg-brava-card p-4">
          <div className="grid grid-cols-6 gap-3">
            {Object.entries(byMonth).map(([label, v]) => {
              const total = v.estabs + v.subs;
              const pct = (total / maxBar) * 100;
              return (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="text-[10px] font-bold text-brava-ink">{total}</div>
                  <div className="flex h-32 w-full items-end gap-0.5">
                    <div className="flex-1 rounded-t bg-brava-yellow" style={{ height: `${(v.estabs / maxBar) * 100}%` }} title={`${v.estabs} estabs`} />
                    <div className="flex-1 rounded-t bg-brava-blue" style={{ height: `${(v.subs / maxBar) * 100}%` }} title={`${v.subs} subs`} />
                  </div>
                  <div className="text-[10px] text-brava-muted">{label}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-center gap-4 text-[10px] text-brava-muted">
            <span className="flex items-center gap-1"><span className="inline-block size-3 rounded bg-brava-yellow" /> Estabs</span>
            <span className="flex items-center gap-1"><span className="inline-block size-3 rounded bg-brava-blue" /> Subs</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function FunnelStep({ label, value, tone }: { label: string; value: number | string; tone?: "yellow" | "blue" | "green" }) {
  const cls = tone === "yellow" ? "border-brava-yellow/40 bg-brava-yellow/5"
    : tone === "blue" ? "border-brava-blue/30 bg-brava-blue/5"
    : tone === "green" ? "border-green-300 bg-green-50"
    : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border ${cls} p-4 text-center`}>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-brava-muted">{label}</div>
    </div>
  );
}
