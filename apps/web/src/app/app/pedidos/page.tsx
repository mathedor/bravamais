import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import type { OrderStatus, DeliveryStatus } from "@/lib/supabase/types";

export const metadata = { title: "Meus pedidos" };

interface OrderRow {
  id: string;
  status: OrderStatus;
  total_cents: number;
  delivery_type: "pickup" | "delivery" | null;
  created_at: string;
  establishments: { name: string; slug: string; logo_url: string | null } | null;
  deliveries: { status: DeliveryStatus }[] | null;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  cart: "Carrinho",
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  preparing: "Em preparação",
  ready: "Pronto / saiu pra entrega",
  completed: "Concluído",
  canceled: "Cancelado",
  refunded: "Reembolsado",
};

export default async function PedidosListPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(`
      id, status, total_cents, delivery_type, created_at,
      establishments(name, slug, logo_url),
      deliveries(status)
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const list = (data as unknown as OrderRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-black text-brava-ink">Meus pedidos</h1>
      <p className="mt-1 text-sm text-brava-muted">Acompanhe entregas em tempo real.</p>

      <div className="mt-6 space-y-3">
        {list.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">
            Você ainda não fez pedidos.
          </p>
        ) : (
          list.map((o) => (
            <Link
              key={o.id}
              href={`/app/pedidos/${o.id}`}
              className="block rounded-2xl border border-brava-border bg-brava-card p-4 transition hover:border-brava-yellow"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brava-paper text-xl">🛒</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-brava-ink">{o.establishments?.name ?? "—"}</p>
                  <p className="text-xs text-brava-muted">
                    {new Date(o.created_at).toLocaleString("pt-BR")} · {o.delivery_type === "delivery" ? "Entrega" : "Retirada"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-brava-blue">{formatBRL(o.total_cents)}</p>
                  <p className="text-[10px] uppercase text-brava-muted">{STATUS_LABEL[o.status]}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
