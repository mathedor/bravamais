import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { fdPartnership, partnershipAcceptAction } from "@/app/api/tools/actions";

function brl(c: number | null | undefined) { return `R$ ${((c ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`; }

export default async function ParceriasPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const [{ data: partnerships }, { data: nearby }] = await Promise.all([
    supabase.from("partnerships").select("*, a:estab_a(name, slug), b:estab_b(name, slug)").or(`estab_a.eq.${establishment.id},estab_b.eq.${establishment.id}`),
    supabase.from("establishments").select("id, name, city").eq("city", establishment.city ?? "").neq("id", establishment.id).eq("is_active", true).order("name").limit(50),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">parcerias</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Parcerias com vizinhos</h1>
        <p className="text-sm text-brava-muted">Crie combos com outras lojas. Aumenta ticket médio e cria network entre parceiros.</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Propor nova parceria</summary>
        <form action={fdPartnership} className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-bold uppercase text-brava-muted">Parceiro (mesma cidade) *</span>
            <select name="partner_estab_id" required className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">
              {(nearby ?? []).map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </label>
          <In label="Label do combo" name="combo_label" placeholder="ex: Almoço + Café" />
          <In label="Preço sugerido (R$)" name="combo_price_brl" type="number" step="0.01" />
          <div className="sm:col-span-2"><button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Propor parceria</button></div>
        </form>
      </details>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Suas parcerias ({partnerships?.length ?? 0})</h2>
        {partnerships && partnerships.length > 0 ? (
          <ul className="space-y-2">
            {partnerships.map((p: any) => {
              const isMine = p.proposed_by === establishment.id;
              const other = p.estab_a === establishment.id ? p.b : p.a;
              return (
                <li key={p.id} className="rounded-2xl border border-brava-border bg-brava-card p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{other?.name} {p.combo_label && <span className="text-brava-muted">· {p.combo_label}</span>}</div>
                      {p.combo_price_cents && <div className="text-xs text-brava-blue">Combo: {brl(p.combo_price_cents)} · split {p.split_percent_a}/{p.split_percent_b}</div>}
                    </div>
                    <span className="rounded bg-brava-paper px-2 py-0.5 text-[10px] font-bold uppercase">{p.status}</span>
                  </div>
                  {!isMine && p.status === "proposta" && (
                    <form action={partnershipAcceptAction.bind(null, p.id)} className="mt-2"><button className="rounded bg-green-600 px-3 py-1 text-xs font-bold text-white">✓ Aceitar parceria</button></form>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">
            Sem parcerias ainda. Procure vizinhos complementares (café + padaria, pizzaria + sorveteria).
          </div>
        )}
      </section>
    </div>
  );
}

function In({ label, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
