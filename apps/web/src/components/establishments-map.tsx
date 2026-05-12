"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export interface MapPin {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  category?: string | null;
  city?: string | null;
  state?: string | null;
}

const MapInner = dynamic(() => import("./establishments-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brava-paper">
      <span className="text-sm text-brava-muted">Carregando mapa…</span>
    </div>
  ),
}) as ComponentType<{ pins: MapPin[]; height?: number | string }>;

export function EstablishmentsMap({ pins, height = 480 }: { pins: MapPin[]; height?: number | string }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-brava-border bg-white"
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <MapInner pins={pins} height={height} />
    </div>
  );
}
