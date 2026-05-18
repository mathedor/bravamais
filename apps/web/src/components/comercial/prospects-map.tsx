"use client";

import dynamic from "next/dynamic";

// Carrega o map inner client-only (Leaflet quebra em SSR)
const Inner = dynamic(() => import("./prospects-map-inner").then((m) => m.ProspectsMapInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-2xl border border-brava-border bg-brava-card">
      <span className="text-sm text-brava-muted">Carregando mapa…</span>
    </div>
  ),
});

export function ProspectsMapClient(props: any) {
  return <Inner {...props} />;
}
