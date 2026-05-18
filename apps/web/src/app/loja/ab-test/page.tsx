import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { fdAbTestCreate, abTestStartAction, abTestEndAction } from "@/app/api/tools/actions";

export default async function AbTestPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const { data: tests } = await supabase.from("coupon_ab_tests").select("*").eq("establishment_id", establishment.id).order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">a/b test</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Testar cupons antes de escalar</h1>
        <p className="text-sm text-brava-muted">Dispara 2 versões pra metades da base e veja qual converte mais.</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Novo teste</summary>
        <form action={fdAbTestCreate} className="mt-3 space-y-3">
          <In label="Hipótese (o que você quer descobrir) *" name="hypothesis" placeholder="ex: % off converte mais que R$ fixo?" required className="w-full" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-brava-border bg-brava-paper p-3">
              <h3 className="mb-2 text-xs font-bold text-brava-blue">Variante A</h3>
              <In label="Label" name="variant_a_label" defaultValue="A: 20% off" />
              <In label="Tipo" name="variant_a_kind" defaultValue="percent" />
              <In label="Valor" name="variant_a_value" type="number" defaultValue={20} />
            </div>
            <div className="rounded-lg border border-brava-border bg-brava-paper p-3">
              <h3 className="mb-2 text-xs font-bold text-brava-blue">Variante B</h3>
              <In label="Label" name="variant_b_label" defaultValue="B: R$ 10 off" />
              <In label="Tipo" name="variant_b_kind" defaultValue="fixed" />
              <In label="Valor" name="variant_b_value" type="number" defaultValue={10} />
            </div>
          </div>
          <In label="Audiência total" name="audience_size" type="number" defaultValue={100} />
          <button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar teste</button>
        </form>
      </details>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Seus testes ({tests?.length ?? 0})</h2>
        {tests && tests.length > 0 ? (
          <ul className="space-y-3">
            {tests.map((t) => (
              <li key={t.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold">{t.hypothesis}</div>
                  <span className="rounded bg-brava-paper px-2 py-0.5 text-[10px] font-bold uppercase">{t.status}</span>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Stat label={t.variant_a_label} count={t.variant_a_redeemed ?? 0} of={t.audience_a_count ?? 0} revenue_cents={t.variant_a_revenue_cents} />
                  <Stat label={t.variant_b_label} count={t.variant_b_redeemed ?? 0} of={t.audience_b_count ?? 0} revenue_cents={t.variant_b_revenue_cents} />
                </div>
                <div className="mt-2 flex gap-2">
                  {t.status === "rascunho" && <form action={abTestStartAction.bind(null, t.id)}><button className="rounded bg-green-600 px-3 py-1 text-xs font-bold text-white">▶ Iniciar</button></form>}
                  {t.status === "rodando" && (
                    <>
                      <form action={abTestEndAction.bind(null, t.id, "a")}><button className="rounded bg-brava-blue px-3 py-1 text-xs font-bold text-white">Encerrar — A vence</button></form>
                      <form action={abTestEndAction.bind(null, t.id, "b")}><button className="rounded bg-brava-blue px-3 py-1 text-xs font-bold text-white">Encerrar — B vence</button></form>
                      <form action={abTestEndAction.bind(null, t.id, "tie")}><button className="rounded bg-zinc-500 px-3 py-1 text-xs font-bold text-white">Empate</button></form>
                    </>
                  )}
                  {t.status === "concluido" && t.winner && <div className="text-xs font-bold text-green-700">🏆 Vencedor: {t.winner.toUpperCase()}</div>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">
            Sem testes. Crie o primeiro pra descobrir o que funciona melhor.
          </div>
        )}
      </section>
    </div>
  );
}

function In({ label, className = "", ...p }: any) { return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Stat({ label, count, of, revenue_cents }: any) {
  const pct = of > 0 ? Math.round((count / of) * 100) : 0;
  return (
    <div className="rounded-lg bg-brava-paper p-3 text-xs">
      <div className="font-bold">{label}</div>
      <div className="mt-1">{count} / {of} usaram ({pct}%)</div>
      <div className="text-brava-muted">Receita: R$ {((revenue_cents ?? 0) / 100).toFixed(2)}</div>
    </div>
  );
}
