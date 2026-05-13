"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { MapEstab } from "./map-view";

const yellowIcon = L.divIcon({
  className: "brava-marker",
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#FFD400;border:3px solid #1B1B1F;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 10px rgba(0,0,0,0.25);">🏪</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function FitBounds({ items }: { items: MapEstab[] }) {
  const map = useMap();
  useEffect(() => {
    if (items.length === 0) return;
    const bounds = L.latLngBounds(items.map((i) => [i.lat, i.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [items, map]);
  return null;
}

export function LeafletMap({ items }: { items: MapEstab[] }) {
  const center = useMemo<[number, number]>(() => {
    if (items.length === 0) return [-23.561, -46.6557]; // SP fallback
    const avgLat = items.reduce((s, i) => s + i.lat, 0) / items.length;
    const avgLng = items.reduce((s, i) => s + i.lng, 0) / items.length;
    return [avgLat, avgLng];
  }, [items]);

  return (
    <div className="h-[70vh] overflow-hidden rounded-3xl border border-brava-border">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds items={items} />
        {items.map((e) => (
          <Marker key={e.slug} position={[e.lat, e.lng]} icon={yellowIcon}>
            <Popup>
              <div className="min-w-[180px] text-sm">
                <p className="font-bold text-brava-ink">{e.name}</p>
                {e.tagline && <p className="text-xs text-brava-muted">{e.tagline}</p>}
                {e.average_rating && <p className="mt-1 text-xs">⭐ {e.average_rating.toFixed(1)}</p>}
                <Link
                  href={`/app/estabelecimento/${e.slug}`}
                  className="mt-2 inline-block rounded-full bg-brava-blue px-3 py-1 text-xs font-bold text-white"
                >
                  Abrir loja →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
