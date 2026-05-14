"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export interface DeliveryMapProps {
  pickup: { lat: number; lng: number; label: string };
  dropoff: { lat: number; lng: number; label: string };
  currentDeliverer?: { lat: number; lng: number; label?: string } | null;
  routePolyline?: [number, number][];
  height?: number | string;
  /** Se passar, o componente vai trackear watchPosition e publicar pings via supabase realtime / action */
  trackingDeliveryId?: string;
  trackingDelivererId?: string;
}

const Inner = dynamic(() => import("./delivery-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brava-paper">
      <span className="text-sm text-brava-muted">Carregando mapa…</span>
    </div>
  ),
}) as ComponentType<DeliveryMapProps>;

export function DeliveryMap(props: DeliveryMapProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white"
      style={{ height: typeof props.height === "number" ? `${props.height}px` : props.height ?? "320px" }}
    >
      <Inner {...props} />
    </div>
  );
}
