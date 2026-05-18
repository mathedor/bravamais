import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { fdCreateOuting, joinOutingAction, leaveOutingAction } from "@/app/api/tools/actions";

export default async function GruposPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: outings } = await supabase
    .from("group_outings")
    .select("*, establishment:establishment_id(name, slug), members:group_outing_members(user_id)")
    .or(`organizer_id.eq.${profile.id},members.user_id.eq.${profile.id}`)
    .order("planned_at", { ascending: true, nullsFirst: false })
    .limit(50);

  const { data: estabs } = await supabase.from("establishments").select("id, name, city").eq("is_active", true).order("name").limit(100);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">modo grupo</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Rolês em grupo</h1>
        <p className="text-sm text-brava-muted">Combine um rolê, todo mundo entra, todo mundo ganha bônus por ir junto.</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Criar novo rolê</summary>
        <form action={fdCreateOuting} className="mt-3 grid gap-3 sm:grid-cols-2">
          <Input label="Título *" name="title" required />
          <Input label="Quando" name="planned_at" type="datetime-local" />
          <Select label="Onde" name="establishment_id">
            <option value="">— qualquer lugar —</option>
            {(estabs ?? []).map((e) => <option key={e.id} value={e.id}>{e.name} · {e.city}</option>)}
          </Select>
          <Input label="Máx pessoas" name="max_members" type="number" defaultValue={10} />
          <Textarea label="Descrição" name="description" className="sm:col-span-2" />
          <div className="sm:col-span-2"><button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar rolê</button></div>
        </form>
      </details>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Seus rolês ({outings?.length ?? 0})</h2>
        {outings && outings.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {outings.map((o: any) => {
              const isMember = o.members?.some((m: any) => m.user_id === profile.id);
              const isOrg = o.organizer_id === profile.id;
              return (
                <div key={o.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold">{o.title}</div>
                      <div className="text-xs text-brava-muted">{o.establishment?.name ?? "Local livre"}</div>
                      {o.planned_at && <div className="text-xs text-brava-blue">📅 {new Date(o.planned_at).toLocaleString("pt-BR")}</div>}
                    </div>
                    <span className="rounded bg-brava-yellow/20 px-2 py-0.5 text-[9px] font-bold uppercase">{o.status}</span>
                  </div>
                  <div className="mt-2 text-xs text-brava-muted">{o.members?.length ?? 0} / {o.max_members} pessoas</div>
                  {!isOrg && (
                    <form action={isMember ? leaveOutingAction.bind(null, o.id) : joinOutingAction.bind(null, o.id)} className="mt-2">
                      <button className={`w-full rounded-lg px-3 py-1.5 text-xs font-bold ${isMember ? "border border-brava-border text-brava-muted" : "bg-brava-blue text-white"}`}>
                        {isMember ? "Sair do rolê" : "Entrar no rolê"}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">
            Nenhum rolê. Crie o primeiro!
          </div>
        )}
      </section>
    </div>
  );
}

function Input({ label, className = "", ...p }: any) {
  return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>;
}
function Select({ label, children, className = "", ...p }: any) {
  return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span><select {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select></label>;
}
function Textarea({ label, className = "", ...p }: any) {
  return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span><textarea {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>;
}
