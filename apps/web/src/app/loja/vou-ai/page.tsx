import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { fdArrivalCourtesyRule } from "@/app/api/tools/actions";

export default async function LojaVouAiPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const [{ data: rules }, { data: intents }] = await Promise.all([
    supabase.from("arrival_courtesy_rules").select("*").eq("establishment_id", establishment.id),
    supabase.from("arrival_intents").select("*, profile:user_id(full_name)").eq("establishment_id", establishment.id).eq("status", "a_caminho").order("declared_at", { ascending: false }).limit(20),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">vou aí — recebimento</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Clientes a caminho</h1>
        <p className="text-sm text-brava-muted">Clientes que avisaram que vêm aí. Configure cortesias automáticas pra aumentar conversão e WOW.</p>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">🟡 Em rota agora ({intents?.length ?? 0})</h2>
        {intents && intents.length > 0 ? (
          <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
            {intents.map((i: any) => (
              <li key={i.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{i.profile?.full_name ?? "Cliente"}</div>
                    <div className="text-xs text-brava-muted">Chega em {i.eta_minutes} min · avisou {new Date(i.declared_at).toLocaleTimeString("pt-BR")}</div>
                  </div>
                  {i.courtesy_message && <span className="rounded bg-brava-yellow/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">cortesia ativada</span>}
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty text="Ninguém a caminho no momento." />}
      </section>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Nova regra de cortesia</summary>
        <form action={fdArrivalCourtesyRule} className="mt-3 grid gap-3 sm:grid-cols-2">
          <In label="ETA mínimo (min)" name="min_eta_minutes" type="number" defaultValue={15} />
          <Sel label="Tier mínimo" name="tier_required"><option value="">qualquer tier</option><option value="basico">Básico+</option><option value="premium">Premium+</option><option value="vip">Só VIP</option></Sel>
          <Tx label="Mensagem de cortesia *" name="courtesy_text" className="sm:col-span-2" rows={2} required placeholder="ex: Te esperamos com uma bebida cortesia!" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> ativa</label>
          <div className="sm:col-span-2"><button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar regra</button></div>
        </form>
      </details>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Suas regras de cortesia ({rules?.length ?? 0})</h2>
        {rules && rules.length > 0 ? (
          <ul className="space-y-2">
            {rules.map((r) => (
              <li key={r.id} className="rounded-xl border border-brava-border bg-brava-card p-3 text-sm">
                <div className="font-bold">"{r.courtesy_text}"</div>
                <div className="text-xs text-brava-muted">ETA ≥{r.min_eta_minutes}min · tier {r.tier_required ?? "qualquer"} · {r.is_active ? "ativa" : "pausada"}</div>
              </li>
            ))}
          </ul>
        ) : <Empty text="Sem regras de cortesia. Crie uma pra surpreender clientes." />}
      </section>
    </div>
  );
}

function In({ label, className = "", ...p }: any) { return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Sel({ label, children, className = "", ...p }: any) { return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><select {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select></label>; }
function Tx({ label, className = "", ...p }: any) { return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><textarea {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">{text}</div>; }
