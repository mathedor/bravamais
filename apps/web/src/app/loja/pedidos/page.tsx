import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Pedidos" };

interface Order {
  id: string;
  status: string;
  total_cents: number;
  subtotal_cents: number;
  discount_cents: number;
  payment_method: string | null;
  created_at: string;
  paid_at: string | null;
}

export default async function PedidosPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_cents, subtotal_cents, discount_cents, payment_method, created_at, paid_at")
    .eq("establishment_id", establishment.id)
    .order("created_at", { ascending: false });

  const list = (orders as Order[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Pedidos online</h1>
      <p className="mt-1 text-brava-muted">Compras feitas pelos assinantes BRAVA+ no seu catálogo.</p>

      <div className="mt-8 overflow-hidden rounded-3xl border border-brava-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3 text-right">Desconto</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brava-border">
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brava-muted">
                  Nenhum pedido ainda.
                </td>
              </tr>
            ) : (
              list.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brava-paper px-2 py-0.5 text-xs">{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-brava-muted">{o.payment_method ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-brava-muted">
                    {o.discount_cents > 0 ? `-${formatBRL(o.discount_cents)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-brava-ink">{formatBRL(o.total_cents)}</td>
                  <td className="px-4 py-3 text-right text-xs text-brava-muted">
                    {new Date(o.created_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
