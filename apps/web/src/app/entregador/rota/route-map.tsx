"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export interface RouteMapProps {
  origin: { lat: number; lng: number };
  stops: { lat: number; lng: number; label: string }[];
  polyline: [number, number][];
  height?: number | string;
}

const Inner = dynamic(() => import("./route-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brava-paper">
      <span className="text-sm text-brava-muted">Carregando mapa…</span>
    </div>
  ),
}) as ComponentType<RouteMapProps>;

export function RouteMap(props: RouteMapProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white"
      style={{ height: typeof props.height === "number" ? `${props.height}px` : props.height ?? "360px" }}
    >
      <Inner {...props} />
    </div>
  );
}
