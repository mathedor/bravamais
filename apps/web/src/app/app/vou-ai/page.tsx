import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { fdArrivalIntent } from "@/app/api/tools/actions";

export default async function VouAiPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: intents } = await supabase
    .from("arrival_intents")
    .select("*, establishment:establishment_id(name, slug, city)")
    .eq("user_id", profile.id)
    .order("declared_at", { ascending: false })
    .limit(20);

  const { data: estabs } = await supabase.from("establishments").select("id, name, city").eq("is_active", true).order("name").limit(100);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">vou aí agora</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Avisar que vou chegar</h1>
        <p className="text-sm text-brava-muted">Loja se prepara, mesa reservada, às vezes uma cortesia te espera.</p>
      </header>

      <form action={fdArrivalIntent} className="grid gap-3 rounded-2xl border border-brava-border bg-brava-card p-4 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">Onde *</span>
          <select name="establishment_id" required className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">
            {(estabs ?? []).map((e) => <option key={e.id} value={e.id}>{e.name} · {e.city}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">Chego em (min)</span>
          <select name="eta_minutes" defaultValue="15" className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">
            <option value="10">10 min</option><option value="15">15 min</option><option value="30">30 min</option><option value="60">1 hora</option>
          </select>
        </label>
        <div className="sm:col-span-3"><button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">📍 Avisar que vou chegar</button></div>
      </form>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Histórico de avisos</h2>
        {intents && intents.length > 0 ? (
          <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
            {intents.map((i: any) => (
              <li key={i.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{i.establishment?.name}</div>
                    <div className="text-xs text-brava-muted">{new Date(i.declared_at).toLocaleString("pt-BR")} · chego em {i.eta_minutes}min</div>
                  </div>
                  <span className="rounded bg-brava-paper px-2 py-0.5 text-[10px] font-bold uppercase">{i.status}</span>
                </div>
                {i.courtesy_message && (
                  <div className="mt-2 rounded-lg bg-brava-yellow/10 p-2 text-xs text-brava-ink">🎁 {i.courtesy_message}</div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">
            Sem avisos enviados ainda.
          </div>
        )}
      </section>
    </div>
  );
}
