import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { waitlistCallAction, waitlistSeatAction } from "@/app/api/tools/actions";

export default async function LojaListaEsperaPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("waitlist_entries")
    .select("*, profile:user_id(full_name)")
    .eq("establishment_id", establishment.id)
    .in("status", ["aguardando", "chamado"])
    .order("joined_at");

  const aguardando = (entries ?? []).filter((e) => e.status === "aguardando");
  const chamados = (entries ?? []).filter((e) => e.status === "chamado");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">lista de espera</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Fila virtual</h1>
        <p className="text-sm text-brava-muted">Cliente entra na fila pelo app, recebe push quando chega a vez. Use em horários cheios.</p>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">📣 Chamados aguardando chegar ({chamados.length})</h2>
        {chamados.length > 0 ? <Lista items={chamados} onSeat /> : <Empty text="Ninguém chamado." />}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">⏳ Aguardando ({aguardando.length})</h2>
        {aguardando.length > 0 ? <Lista items={aguardando} onCall /> : <Empty text="Fila vazia." />}
      </section>
    </div>
  );
}

function Lista({ items, onCall, onSeat }: { items: any[]; onCall?: boolean; onSeat?: boolean }) {
  return (
    <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
      {items.map((e) => (
        <li key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
          <div>
            <div className="font-bold">{e.profile?.full_name ?? e.guest_name ?? "Cliente"}</div>
            <div className="text-xs text-brava-muted">{e.party_size} pessoas · entrou {new Date(e.joined_at).toLocaleTimeString("pt-BR")}</div>
          </div>
          {onCall && (
            <form action={waitlistCallAction.bind(null, e.id)}>
              <button className="rounded bg-brava-yellow px-3 py-1 text-xs font-bold text-brava-black">📣 Chamar</button>
            </form>
          )}
          {onSeat && (
            <form action={waitlistSeatAction.bind(null, e.id)}>
              <button className="rounded bg-green-600 px-3 py-1 text-xs font-bold text-white">✓ Sentou</button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}

function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">{text}</div>; }
