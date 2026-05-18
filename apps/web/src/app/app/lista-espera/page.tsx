import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export default async function ListaEsperaPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("waitlist_entries")
    .select("*, establishment:establishment_id(name, slug, city)")
    .eq("user_id", profile.id)
    .order("joined_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">lista de espera</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Minhas filas virtuais</h1>
        <p className="text-sm text-brava-muted">Restaurante cheio? Entre na fila pelo app — receba aviso quando chegar sua vez.</p>
      </header>

      {entries && entries.length > 0 ? (
        <ul className="space-y-3">
          {entries.map((e: any) => (
            <li key={e.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{e.establishment?.name}</div>
                  <div className="text-xs text-brava-muted">{e.establishment?.city} · {e.party_size} pessoas · entrou {new Date(e.joined_at).toLocaleTimeString("pt-BR")}</div>
                </div>
                <StatusPill status={e.status} />
              </div>
              {e.status === "chamado" && (
                <div className="mt-2 rounded-lg bg-green-100 p-2 text-xs font-bold text-green-900">
                  📣 SUA VEZ! Apresente seu nome no balcão.
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Sem filas ativas. Quando entrar em alguma (via QR ou no app do parceiro), aparece aqui.
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    aguardando: { label: "Aguardando", cls: "bg-amber-100 text-amber-900" },
    chamado: { label: "Chamado!", cls: "bg-green-100 text-green-900 animate-pulse" },
    sentado: { label: "Sentado", cls: "bg-blue-100 text-blue-900" },
    desistiu: { label: "Desistiu", cls: "bg-zinc-100 text-zinc-700" },
  };
  const s = map[status] ?? map.aguardando;
  return <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${s.cls}`}>{s.label}</span>;
}
