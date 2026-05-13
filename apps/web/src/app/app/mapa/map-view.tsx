"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-3xl border border-brava-border bg-brava-card">
      <p className="text-sm text-brava-muted">Carregando mapa…</p>
    </div>
  ),
});

export interface MapEstab {
  slug: string;
  name: string;
  tagline: string | null;
  lat: number;
  lng: number;
  cover_url: string | null;
  logo_url: string | null;
  average_rating: number | null;
}

export function MapView({ items }: { items: MapEstab[] }) {
  return <LeafletMap items={items} />;
}
