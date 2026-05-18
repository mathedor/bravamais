import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

export const dynamic = "force-dynamic";

export default async function KitchenDisplayPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_cents, created_at, mesa_token, customer_name, items:order_items(name, quantity)")
    .eq("establishment_id", establishment.id)
    .in("status", ["paid", "preparing", "ready"])
    .order("created_at", { ascending: true })
    .limit(40);

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-brava-yellow">kitchen display</div>
          <h1 className="text-2xl font-black">{establishment.name}</h1>
        </div>
        <div className="font-mono text-sm">{new Date().toLocaleTimeString("pt-BR")}</div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(orders ?? []).map((o: any) => (
          <div key={o.id} className={`rounded-xl border-l-4 p-3 ${o.status === "paid" ? "border-amber-400 bg-amber-900/30" : o.status === "preparing" ? "border-blue-400 bg-blue-900/30" : "border-green-400 bg-green-900/30"}`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase">{o.status}</span>
              <span className="font-mono">{new Date(o.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="mt-2 text-sm font-bold">{o.mesa_token ? `🪑 Mesa (token ${o.mesa_token.slice(0, 6)})` : `📦 Delivery/Retirada`}</div>
            <div className="text-xs text-zinc-300">{o.customer_name ?? "—"}</div>
            <ul className="mt-2 space-y-1 text-sm">
              {(o.items ?? []).map((it: any, i: number) => <li key={i}>• {it.quantity}× {it.name}</li>)}
            </ul>
            <div className="mt-2 text-right font-mono text-xs text-zinc-400">R$ {(o.total_cents / 100).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {orders?.length === 0 && (
        <div className="grid h-[60vh] place-items-center text-2xl text-zinc-600">Sem pedidos no momento 🛌</div>
      )}

      <footer className="mt-6 text-center text-xs text-zinc-500">
        Página otimizada pra TV/tablet. Atualiza a cada 30s (recarregue a página se necessário).
      </footer>
    </main>
  );
}
