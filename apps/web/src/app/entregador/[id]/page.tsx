import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireDeliverer } from "@/lib/deliverer-guard";
import { formatBRL } from "@/lib/format";
import { DeliveryMap } from "@/components/delivery-map";
import { acceptDeliveryAction, pickupDeliveryAction, startTransitAction } from "../actions";
import { ConfirmDeliveredForm } from "./confirm-form";
import type { DeliveryStatus } from "@/lib/supabase/types";

interface Detail {
  id: string;
  order_id: string;
  status: DeliveryStatus;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  distance_km: number | null;
  fee_cents: number;
  confirmation_code: string;
  notes: string | null;
  orders: {
    id: string;
    total_cents: number;
    delivery_notes: string | null;
    profiles: { full_name: string | null; phone: string | null } | null;
  };
}

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { deliverer } = await requireDeliverer();
  const supabase = await createClient();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select(`
      id, order_id, status, pickup_address, pickup_lat, pickup_lng,
      dropoff_address, dropoff_lat, dropoff_lng, recipient_name, recipient_phone,
      distance_km, fee_cents, confirmation_code, notes,
      orders!inner(id, total_cents, delivery_notes, profiles(full_name, phone))
    `)
    .eq("id", id)
    .eq("deliverer_id", deliverer.id)
    .maybeSingle<Detail>();

  if (!delivery) notFound();

  const canShowMap =
    delivery.pickup_lat != null &&
    delivery.pickup_lng != null &&
    delivery.dropoff_lat != null &&
    delivery.dropoff_lng != null;

  const isTracking = ["accepted", "picked_up", "in_transit"].includes(delivery.status);
  const customerPhone = delivery.recipient_phone ?? delivery.orders.profiles?.phone;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link href="/entregador" className="text-xs text-white/60 hover:underline">
        ← voltar
      </Link>

      <header className="mt-3 mb-5">
        <p className="text-xs uppercase tracking-wide text-white/50">
          Pedido #{delivery.order_id.slice(0, 8)} · {formatBRL(delivery.orders.total_cents)}
        </p>
        <h1 className="mt-1 text-2xl font-black">{delivery.orders.profiles?.full_name ?? "Cliente"}</h1>
      </header>

      {canShowMap && (
        <DeliveryMap
          pickup={{ lat: delivery.pickup_lat!, lng: delivery.pickup_lng!, label: delivery.pickup_address }}
          dropoff={{ lat: delivery.dropoff_lat!, lng: delivery.dropoff_lng!, label: delivery.dropoff_address }}
          trackingDeliveryId={isTracking ? delivery.id : undefined}
          trackingDelivererId={isTracking ? deliverer.id : undefined}
          height={320}
        />
      )}

      <section className="mt-5 space-y-3">
        <Stop icon="📦" title="Coleta" address={delivery.pickup_address} />
        <Stop
          icon="🏠"
          title="Entrega"
          address={delivery.dropoff_address}
          extra={customerPhone ? `📱 ${customerPhone}` : undefined}
        />
      </section>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <Pill label="Distância" value={delivery.distance_km ? `${Number(delivery.distance_km).toFixed(1)} km` : "—"} />
        <Pill label="Ganho" value={formatBRL(delivery.fee_cents)} />
        <Pill label="Código" value={delivery.confirmation_code} mono />
      </div>

      {(delivery.notes || delivery.orders.delivery_notes) && (
        <div className="mt-4 rounded-2xl border border-brava-yellow/30 bg-brava-yellow/10 p-3 text-sm text-brava-yellow">
          💬 {delivery.notes ?? delivery.orders.delivery_notes}
        </div>
      )}

      <section className="mt-6 space-y-3">
        {delivery.status === "assigned" && (
          <form action={acceptDeliveryAction}>
            <input type="hidden" name="delivery_id" value={delivery.id} />
            <BigButton>✅ Aceitar entrega</BigButton>
          </form>
        )}
        {delivery.status === "accepted" && (
          <form action={pickupDeliveryAction}>
            <input type="hidden" name="delivery_id" value={delivery.id} />
            <BigButton>📦 Confirmar coleta no estabelecimento</BigButton>
          </form>
        )}
        {delivery.status === "picked_up" && (
          <form action={startTransitAction}>
            <input type="hidden" name="delivery_id" value={delivery.id} />
            <BigButton>🛵 Saindo pra entrega</BigButton>
          </form>
        )}
        {(delivery.status === "picked_up" || delivery.status === "in_transit") && (
          <ConfirmDeliveredForm deliveryId={delivery.id} />
        )}
        {delivery.status === "delivered" && (
          <p className="rounded-3xl border border-green-400/30 bg-green-500/10 p-5 text-center text-base font-bold text-green-200">
            ✔️ Entrega concluída! Obrigado 🙌
          </p>
        )}
        {delivery.status === "canceled" && (
          <p className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5 text-center text-base font-bold text-red-200">
            ❌ Entrega cancelada
          </p>
        )}

        {customerPhone && delivery.status !== "delivered" && delivery.status !== "canceled" && (
          <a
            href={`https://wa.me/55${customerPhone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-full border border-white/15 bg-white/5 py-3 text-center text-sm font-bold text-white"
          >
            📲 WhatsApp do cliente
          </a>
        )}
      </section>

      <div className="h-12" />
    </div>
  );
}

function Stop({ icon, title, address, extra }: { icon: string; title: string; address: string; extra?: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-white/50">
        {icon} {title}
      </p>
      <p className="mt-1 text-sm font-bold">{address}</p>
      {extra && <p className="mt-1 text-xs text-white/60">{extra}</p>}
    </div>
  );
}

function Pill({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-wide text-white/50">{label}</p>
      <p className={`mt-0.5 text-base font-black ${mono ? "font-mono text-brava-yellow" : ""}`}>{value}</p>
    </div>
  );
}

function BigButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full rounded-full bg-brava-yellow py-4 text-base font-black text-brava-black shadow-xl shadow-brava-yellow/20 hover:scale-[1.01]"
    >
      {children}
    </button>
  );
}
