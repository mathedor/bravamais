"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { MapPin, UserLocation } from "./establishments-map";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";

const yellowIcon = L.divIcon({
  className: "brava-pin",
  html: `<div style="
    width:34px;height:34px;border-radius:50% 50% 50% 0;
    background:#FBBF24;border:3px solid #1E3A8A;
    transform:rotate(-45deg);
    box-shadow:0 4px 12px rgba(0,0,0,.3);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);color:#0A0A0A;font-weight:900;font-size:20px;line-height:1;">+</span></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

const userIcon = L.divIcon({
  className: "brava-user-pin",
  html: `<div style="position:relative;width:24px;height:24px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:#1E3A8A;border:3px solid #fff;box-shadow:0 0 0 4px rgba(30,58,138,.25),0 4px 12px rgba(0,0,0,.3);"></div>
    <div style="position:absolute;inset:-12px;border-radius:50%;background:rgba(30,58,138,.18);animation:bravaPulse 2.4s ease-out infinite;"></div>
  </div>
  <style>@keyframes bravaPulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.4);opacity:0}}</style>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DEFAULT_CENTER: [number, number] = [-23.5615, -46.671];

interface InnerProps {
  pins: MapPin[];
  height?: number | string;
  userLocation?: UserLocation | null;
  selectedCategorySlugs?: string[];
  realtime?: boolean;
}

/** Re-centra/zoom no userLocation quando ela vira disponível. */
function FlyToUser({ location }: { location: UserLocation | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    map.flyTo([location.lat, location.lng], 14, { duration: 0.8 });
  }, [location, map]);
  return null;
}

export default function EstablishmentsMapInner({
  pins: initialPins,
  userLocation,
  selectedCategorySlugs,
  realtime = false,
}: InnerProps) {
  const [pins, setPins] = useState<MapPin[]>(initialPins);
  const [pulse, setPulse] = useState(false);

  // Sincroniza quando o server passa novos pins (filtros mudaram lá fora)
  useEffect(() => {
    setPins(initialPins);
  }, [initialPins]);

  // Realtime: subscreve em mudanças de establishments e refaz a query
  useEffect(() => {
    if (!realtime) return;
    const sb = createBrowserClient();

    async function refetch() {
      const { data } = await sb
        .from("establishments")
        .select(
          `slug, name, city, state, lat, lng, cover_url, photos,
           establishment_categories(categories(slug))`,
        )
        .eq("is_active", true)
        .not("lat", "is", null)
        .not("lng", "is", null);
      const next: MapPin[] = (data ?? []).map((e) => {
        const raw = e as unknown as {
          slug: string;
          name: string;
          city: string | null;
          state: string | null;
          lat: number;
          lng: number;
          cover_url: string | null;
          photos: string[] | null;
          establishment_categories?: { categories: { slug: string } | null }[];
        };
        return {
          slug: raw.slug,
          name: raw.name,
          city: raw.city,
          state: raw.state,
          lat: raw.lat,
          lng: raw.lng,
          cover: raw.cover_url || raw.photos?.[0] || null,
          categorySlugs:
            raw.establishment_categories
              ?.map((ec) => ec.categories?.slug)
              .filter((s): s is string => Boolean(s)) ?? [],
        };
      });
      setPins(next);
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
    }

    const ch = sb
      .channel("brava-establishments-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "establishments" },
        () => {
          refetch();
        },
      )
      .subscribe();

    return () => {
      sb.removeChannel(ch);
    };
  }, [realtime]);

  // Filtra por categoria(s) selecionada(s)
  const filteredPins = useMemo(() => {
    if (!selectedCategorySlugs || selectedCategorySlugs.length === 0) return pins;
    return pins.filter((p) =>
      (p.categorySlugs ?? []).some((c) => selectedCategorySlugs.includes(c)),
    );
  }, [pins, selectedCategorySlugs]);

  const initialCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : filteredPins.length > 0
      ? [
          filteredPins.reduce((s, p) => s + p.lat, 0) / filteredPins.length,
          filteredPins.reduce((s, p) => s + p.lng, 0) / filteredPins.length,
        ]
      : DEFAULT_CENTER;

  const initialZoom = userLocation ? 14 : 12;

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToUser location={userLocation} />

      {userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={500}
            pathOptions={{ color: "#1E3A8A", fillColor: "#1E3A8A", fillOpacity: 0.06, weight: 1.5 }}
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <p className="font-bold text-sm">Você está aqui</p>
              {userLocation.city && <p className="text-xs text-zinc-500">{userLocation.city}</p>}
            </Popup>
          </Marker>
        </>
      )}

      {filteredPins.map((pin) => (
        <Marker key={pin.slug} position={[pin.lat, pin.lng]} icon={yellowIcon}>
          <Popup>
            <div className="w-48 space-y-2">
              {pin.cover && (
                <div className="relative h-20 w-full overflow-hidden rounded-lg bg-zinc-100">
                  <Image src={pin.cover} alt="" fill sizes="200px" className="object-cover" />
                </div>
              )}
              <p className="font-bold text-sm leading-tight">{pin.name}</p>
              {pin.city && (
                <p className="text-xs text-zinc-500">
                  {pin.city}/{pin.state ?? ""}
                </p>
              )}
              <Link
                href={`/app/estabelecimento/${pin.slug}`}
                className="inline-block rounded-full bg-brava-black px-3 py-1 text-xs font-bold text-white"
              >
                Ver detalhes →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}

      {realtime && (
        <div
          className={`pointer-events-none absolute bottom-3 right-3 z-[1000] inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
            pulse ? "bg-green-500 text-white" : "bg-white/85 text-brava-blue"
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              pulse ? "bg-white animate-pulse" : "bg-green-500"
            }`}
          />
          {pulse ? "Atualizando…" : "Ao vivo"}
        </div>
      )}
    </MapContainer>
  );
}
