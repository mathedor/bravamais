import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireDeliverer } from "@/lib/deliverer-guard";
import { optimizeRoute, type RouteStop } from "@/lib/route-optimizer";
import { formatBRL } from "@/lib/format";
import { RouteMap } from "./route-map";
import type { DeliveryStatus } from "@/lib/supabase/types";

export const metadata = { title: "Rota otimizada" };

interface Row {
  id: string;
  status: DeliveryStatus;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  fee_cents: number;
  confirmation_code: string;
}

export default async function RotaPage() {
  const { deliverer } = await requireDeliverer();
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("deliveries")
    .select("id, status, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, fee_cents, confirmation_code")
    .eq("deliverer_id", deliverer.id)
    .gte("created_at", todayStart.toISOString())
    .in("status", ["accepted", "picked_up", "in_transit"]);

  const list = (data as Row[] | null) ?? [];
  const ready = list.filter((r) => r.dropoff_lat != null && r.dropoff_lng != null);

  // origem: localização atual do entregador (ou primeira coleta se não tiver)
  const origin =
    deliverer.current_lat != null && deliverer.current_lng != null
      ? { lat: deliverer.current_lat, lng: deliverer.current_lng }
      : ready[0]?.pickup_lat != null && ready[0]?.pickup_lng != null
        ? { lat: ready[0].pickup_lat, lng: ready[0].pickup_lng }
        : null;

  const stops: RouteStop[] = ready.map((r) => ({
    id: r.id,
    lat: r.dropoff_lat!,
    lng: r.dropoff_lng!,
    label: r.dropoff_address,
  }));

  const route = origin ? await optimizeRoute(origin, stops) : null;
  const orderedMap = new Map(stops.map((s) => [s.id, s]));
  const ordered = (route?.orderedStopIds ?? stops.map((s) => s.id))
    .map((id) => ready.find((r) => r.id === id))
    .filter(Boolean) as Row[];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link href="/entregador" className="text-xs text-white/60 hover:underline">
        ← voltar
      </Link>
      <h1 className="mt-3 text-3xl font-black">🗺️ Rota otimizada</h1>
      <p className="text-sm text-white/60">{ready.length} entregas ativas hoje</p>

      {route && route.polyline.length > 1 && origin && (
        <div className="mt-4">
          <RouteMap
            origin={origin}
            stops={ordered.map((r) => ({ lat: r.dropoff_lat!, lng: r.dropoff_lng!, label: r.dropoff_address }))}
            polyline={route.polyline}
          />
        </div>
      )}

      {route && !route.isMock && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-wide text-white/50">Distância total</p>
            <p className="mt-0.5 text-base font-black">{(route.totalDistanceM / 1000).toFixed(1)} km</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-wide text-white/50">Tempo estimado</p>
            <p className="mt-0.5 text-base font-black">{Math.ceil(route.totalDurationS / 60)} min</p>
          </div>
        </div>
      )}

      {route?.isMock && origin && (
        <p className="mt-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-200">
          ⚠️ Otimização Google Directions indisponível — exibindo ordem padrão.
        </p>
      )}

      <section className="mt-5 space-y-3">
        {ordered.map((r, i) => (
          <Link
            key={r.id}
            href={`/entregador/${r.id}`}
            className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-brava-yellow"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brava-yellow text-base font-black text-brava-black">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">🏠 {r.dropoff_address}</p>
                <p className="mt-0.5 text-xs text-white/50">de {r.pickup_address}</p>
              </div>
              <span className="text-xs font-bold text-brava-yellow">{formatBRL(r.fee_cents)}</span>
            </div>
          </Link>
        ))}
      </section>

      <div className="h-12" />
    </div>
  );
}
