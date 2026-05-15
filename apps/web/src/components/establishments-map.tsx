"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export interface MapPin {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  city?: string | null;
  state?: string | null;
  categorySlugs?: string[];
  cover?: string | null;
}

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string | null;
}

interface MapProps {
  pins: MapPin[];
  height?: number | string;
  userLocation?: UserLocation | null;
  selectedCategorySlugs?: string[];
  realtime?: boolean;
}

const MapInner = dynamic(() => import("./establishments-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brava-paper">
      <span className="text-sm text-brava-muted">Carregando mapa…</span>
    </div>
  ),
}) as ComponentType<MapProps>;

export function EstablishmentsMap({
  pins,
  height = 480,
  userLocation,
  selectedCategorySlugs,
  realtime,
}: MapProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-brava-border bg-white"
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <MapInner
        pins={pins}
        height={height}
        userLocation={userLocation}
        selectedCategorySlugs={selectedCategorySlugs}
        realtime={realtime}
      />
    </div>
  );
}
