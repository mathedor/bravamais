import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { RealtimeTracker } from "./realtime-tracker";
import { RateDelivererForm } from "./rate-form";
import type { OrderStatus, DeliveryStatus } from "@/lib/supabase/types";

export const metadata = { title: "Pedido" };

interface Detail {
  id: string;
  status: OrderStatus;
  subtotal_cents: number;
  discount_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  payment_method: string | null;
  efi_pix_qr: string | null;
  delivery_type: "pickup" | "delivery" | null;
  delivery_distance_km: number | null;
  delivery_notes: string | null;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
  establishments: { name: string; slug: string; phone: string | null; whatsapp: string | null } | null;
  order_items: { qty: number; unit_price_cents: number; products: { name: string } | null }[];
  deliveries: {
    id: string;
    status: DeliveryStatus;
    deliverer_id: string | null;
    confirmation_code: string;
    pickup_address: string;
    pickup_lat: number | null;
    pickup_lng: number | null;
    dropoff_address: string;
    dropoff_lat: number | null;
    dropoff_lng: number | null;
    deliverers: { full_name: string; phone: string; current_lat: number | null; current_lng: number | null; rating_avg: number | null } | null;
  }[];
  delivery_ratings: { stars: number }[];
}

const TIMELINE: { status: OrderStatus; label: string; emoji: string }[] = [
  { status: "pending_payment", label: "Pedido criado", emoji: "📝" },
  { status: "paid", label: "Pagamento confirmado", emoji: "💳" },
  { status: "preparing", label: "Em preparação", emoji: "👨‍🍳" },
  { status: "ready", label: "Saiu pra entrega", emoji: "🛵" },
  { status: "completed", label: "Entregue", emoji: "✔️" },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  cart: 0,
  pending_payment: 1,
  paid: 2,
  preparing: 3,
  ready: 4,
  completed: 5,
  canceled: -1,
  refunded: -1,
};

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, status, subtotal_cents, discount_cents, delivery_fee_cents, total_cents,
      payment_method, efi_pix_qr, delivery_type, delivery_distance_km, delivery_notes,
      created_at, paid_at, completed_at,
      establishments(name, slug, phone, whatsapp),
      order_items(qty, unit_price_cents, products(name)),
      deliveries(id, status, deliverer_id, confirmation_code, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, deliverers(full_name, phone, current_lat, current_lng, rating_avg)),
      delivery_ratings(stars)
    `)
    .eq("id", id)
    .eq("user_id", profile.id)
    .maybeSingle<Detail>();

  if (!order) notFound();

  const orderProgress = STATUS_ORDER[order.status] ?? 0;
  const delivery = order.deliveries[0];
  const hasRating = order.delivery_ratings.length > 0;
  const canRate =
    delivery &&
    delivery.status === "delivered" &&
    !hasRating;
  const isTracking =
    delivery &&
    delivery.dropoff_lat != null &&
    delivery.dropoff_lng != null &&
    delivery.pickup_lat != null &&
    delivery.pickup_lng != null &&
    ["accepted", "picked_up", "in_transit"].includes(delivery.status);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link href="/app/pedidos" className="text-xs text-brava-blue hover:underline">
        ← Meus pedidos
      </Link>

      <header className="mt-3">
        <p className="text-xs uppercase text-brava-muted">
          #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleString("pt-BR")}
        </p>
        <h1 className="mt-1 text-2xl font-black text-brava-ink">{order.establishments?.name ?? "—"}</h1>
      </header>

      {/* PIX pendente */}
      {order.status === "pending_payment" && order.efi_pix_qr && (
        <section className="mt-6 rounded-3xl border-2 border-brava-yellow bg-brava-yellow/10 p-5">
          <h2 className="text-base font-black text-brava-ink">⚡ Pagamento PIX pendente</h2>
          <p className="mt-1 text-sm text-brava-muted">
            Copie o código abaixo e pague no app do seu banco. A confirmação é automática.
          </p>
          <textarea readOnly value={order.efi_pix_qr} rows={3} className="mt-3 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-xs font-mono" />
        </section>
      )}

      {/* Timeline */}
      <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-base font-bold text-brava-ink">Status</h2>
        <ol className="mt-3 space-y-2">
          {TIMELINE.map((step, idx) => {
            const stepOrder = STATUS_ORDER[step.status];
            const reached = orderProgress >= stepOrder;
            return (
              <li
                key={step.status}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                  reached ? "bg-brava-yellow/10" : "bg-brava-paper/50"
                }`}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-full text-base ${reached ? "bg-brava-yellow text-brava-black" : "bg-brava-border/50 text-brava-muted"}`}>
                  {step.emoji}
                </span>
                <span className={`text-sm ${reached ? "font-bold text-brava-ink" : "text-brava-muted"}`}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Mapa realtime */}
      {isTracking && delivery && (
        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold text-brava-ink">📍 Acompanhe ao vivo</h2>
          <RealtimeTracker
            deliveryId={delivery.id}
            delivererId={delivery.deliverer_id}
            pickup={{ lat: delivery.pickup_lat!, lng: delivery.pickup_lng!, label: delivery.pickup_address }}
            dropoff={{ lat: delivery.dropoff_lat!, lng: delivery.dropoff_lng!, label: delivery.dropoff_address }}
            initialDelivererPos={
              delivery.deliverers?.current_lat != null && delivery.deliverers?.current_lng != null
                ? { lat: delivery.deliverers.current_lat, lng: delivery.deliverers.current_lng }
                : null
            }
          />
        </section>
      )}

      {/* Entregador + código */}
      {delivery && delivery.deliverers && (
        <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-5">
          <h2 className="text-base font-bold text-brava-ink">🛵 Seu entregador</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brava-yellow/20 font-black text-brava-blue">
              {delivery.deliverers.full_name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-brava-ink">{delivery.deliverers.full_name}</p>
              <p className="text-xs text-brava-muted">
                {delivery.deliverers.phone}
                {delivery.deliverers.rating_avg ? ` · ⭐ ${Number(delivery.deliverers.rating_avg).toFixed(1)}` : ""}
              </p>
            </div>
            <a
              href={`https://wa.me/55${delivery.deliverers.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white"
            >
              WhatsApp
            </a>
          </div>
          {!["delivered", "canceled"].includes(delivery.status) && (
            <div className="mt-4 rounded-2xl border-2 border-brava-yellow bg-brava-yellow/10 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-brava-muted">Código de confirmação</p>
              <p className="mt-1 font-mono text-4xl font-black tracking-[0.4em] text-brava-blue">
                {delivery.confirmation_code}
              </p>
              <p className="mt-1 text-xs text-brava-muted">Mostre ao entregador na hora da entrega.</p>
            </div>
          )}
        </section>
      )}

      {/* Avaliação */}
      {canRate && delivery && (
        <section className="mt-6">
          <RateDelivererForm deliveryId={delivery.id} />
        </section>
      )}

      {/* Resumo financeiro */}
      <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="mb-3 text-base font-bold text-brava-ink">Resumo</h2>
        {order.order_items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1 text-sm">
            <span>
              {item.qty}× {item.products?.name ?? "Item"}
            </span>
            <span>{formatBRL(item.unit_price_cents * item.qty)}</span>
          </div>
        ))}
        <hr className="my-2 border-brava-border/50" />
        <Row label="Subtotal" value={formatBRL(order.subtotal_cents)} />
        {order.delivery_fee_cents > 0 && <Row label="Entrega" value={formatBRL(order.delivery_fee_cents)} />}
        <Row label="Total" value={formatBRL(order.total_cents)} bold />
        {order.delivery_distance_km && (
          <p className="mt-2 text-xs text-brava-muted">📏 {Number(order.delivery_distance_km).toFixed(1)} km</p>
        )}
      </section>

      <div className="h-12" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-0.5 ${bold ? "text-base font-black" : "text-sm"}`}>
      <span className={bold ? "text-brava-ink" : "text-brava-muted"}>{label}</span>
      <span className={bold ? "text-brava-blue" : "text-brava-ink"}>{value}</span>
    </div>
  );
}
