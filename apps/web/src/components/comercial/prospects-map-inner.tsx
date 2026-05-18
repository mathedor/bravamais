"use client";

import { useMemo, useState, useTransition } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import {
  searchGooglePlaces, saveProspectFromGoogle, geocodeAddress,
  type GooglePlaceItem,
} from "@/app/comercial/places-actions";

type Prospect = {
  id: string;
  name: string;
  status: string;
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  category_slug: string | null;
  phone: string | null;
  kind: string;
  source: string;
};

type Category = { slug: string; name: string; icon: string | null };

const STATUS_COLOR: Record<string, string> = {
  novo: "#3b82f6", contato: "#f59e0b", visita: "#8b5cf6", proposta: "#a855f7",
  negociacao: "#eab308", fechado: "#16a34a", perdido: "#94a3b8",
};

function pinIcon(color: string, label = "") {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:white;font-size:11px;font-weight:bold;">${label}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function placeIcon(jaProspect: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${jaProspect ? "#94a3b8" : "#FBBF24"};width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.3);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function FlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  if (center) map.flyTo(center, 15);
  return null;
}

export function ProspectsMapInner({
  affiliateId,
  initialProspects,
  categories,
  googleMapsKey,
}: {
  affiliateId: string;
  initialProspects: Prospect[];
  categories: Category[];
  googleMapsKey: string;
}) {
  const router = useRouter();
  const [center, setCenter] = useState<[number, number]>([-23.55, -46.63]); // SP default
  const [flyCenter, setFlyCenter] = useState<[number, number] | null>(null);
  const [searchAddr, setSearchAddr] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [radius, setRadius] = useState(1500);
  const [places, setPlaces] = useState<GooglePlaceItem[]>([]);
  const [busy, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const myProspects = useMemo(() => initialProspects, [initialProspects]);

  const handleGeocode = async () => {
    if (!searchAddr.trim()) return;
    setMsg(null);
    startTransition(async () => {
      const r = await geocodeAddress(searchAddr);
      if (r.ok && r.lat && r.lng) {
        setCenter([r.lat, r.lng]);
        setFlyCenter([r.lat, r.lng]);
        setMsg(`📍 Centralizado em: ${r.formatted ?? searchAddr}`);
      } else {
        setMsg(`❌ ${r.error ?? "Endereço não encontrado"}`);
      }
    });
  };

  const handleSearchPlaces = async () => {
    setMsg(null);
    startTransition(async () => {
      const r = await searchGooglePlaces({
        lat: center[0], lng: center[1], radius,
        categorySlug: categorySlug || undefined,
      });
      if (r.ok) {
        setPlaces(r.items);
        setMsg(`🔍 ${r.items.length} estabelecimentos encontrados na área`);
      } else {
        setMsg(`❌ ${r.error}`);
      }
    });
  };

  const handleSaveProspect = async (p: GooglePlaceItem) => {
    startTransition(async () => {
      const r = await saveProspectFromGoogle({
        placeId: p.placeId, name: p.name, address: p.address,
        lat: p.lat, lng: p.lng, rating: p.rating,
        categorySlug: categorySlug || undefined,
      });
      if (r.ok) {
        setPlaces((arr) => arr.map((x) => x.placeId === p.placeId ? { ...x, jaProspect: true } : x));
        setMsg(`✅ "${p.name}" adicionado ao seu CRM`);
        router.refresh();
      } else {
        setMsg(`❌ ${r.error}`);
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="grid gap-2 rounded-2xl border border-brava-border bg-brava-card p-3 sm:grid-cols-[1fr_180px_120px_auto_auto]">
        <input
          type="text"
          placeholder="Endereço, bairro ou cidade…"
          value={searchAddr}
          onChange={(e) => setSearchAddr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGeocode()}
          className="rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm"
        />
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm"
        >
          <option value="">Qualquer categoria</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.icon ?? ""} {c.name}
            </option>
          ))}
        </select>
        <select
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm"
        >
          <option value={500}>500 m</option>
          <option value={1000}>1 km</option>
          <option value={1500}>1.5 km</option>
          <option value={2500}>2.5 km</option>
          <option value={5000}>5 km</option>
        </select>
        <button
          type="button"
          onClick={handleGeocode}
          disabled={busy}
          className="rounded-lg border border-brava-border bg-brava-paper px-4 py-2 text-sm font-bold text-brava-ink hover:bg-brava-paper/80"
        >
          📍 Buscar endereço
        </button>
        <button
          type="button"
          onClick={handleSearchPlaces}
          disabled={busy}
          className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white hover:bg-brava-blue-bright"
        >
          🔍 Buscar lojas
        </button>
      </div>

      {msg && (
        <div className="rounded-lg border border-brava-yellow/40 bg-brava-yellow/10 px-3 py-2 text-sm text-brava-ink">
          {msg}
        </div>
      )}

      <div className="h-[600px] overflow-hidden rounded-2xl border border-brava-border">
        <MapContainer center={center} zoom={14} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap'
          />
          <FlyTo center={flyCenter} />

          {/* Meus prospects (já no CRM) */}
          {myProspects.map((p) => (
            <Marker key={`me-${p.id}`} position={[p.lat, p.lng]} icon={pinIcon(STATUS_COLOR[p.status] ?? "#3b82f6", p.status[0].toUpperCase())}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-bold text-brava-ink">{p.name}</div>
                  <div className="text-xs text-brava-muted">{p.address ?? ""}</div>
                  <div className="text-xs">Status: <b>{p.status}</b></div>
                  <a href={`/comercial/crm?prospect=${p.id}`} className="block text-xs font-bold text-brava-blue hover:underline">
                    Abrir no CRM →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Google Places encontrados */}
          {places.map((p) => (
            <Marker key={`g-${p.placeId}`} position={[p.lat, p.lng]} icon={placeIcon(p.jaProspect)}>
              <Popup>
                <div className="space-y-2 text-sm">
                  <div className="font-bold text-brava-ink">{p.name}</div>
                  <div className="text-xs text-brava-muted">{p.address}</div>
                  {p.rating && (
                    <div className="text-xs">⭐ {p.rating} ({p.userRatingsTotal ?? 0})</div>
                  )}
                  {p.jaProspect ? (
                    <span className="inline-block rounded bg-brava-muted/20 px-2 py-1 text-[10px] font-bold uppercase text-brava-muted">
                      já está no seu CRM
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveProspect(p)}
                      disabled={busy}
                      className="w-full rounded bg-brava-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-brava-blue-bright"
                    >
                      ➕ Adicionar ao meu CRM
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-brava-muted">
        <span className="flex items-center gap-1"><span className="inline-block size-3 rounded-full bg-brava-yellow" /> Google Places</span>
        <span className="flex items-center gap-1"><span className="inline-block size-3 rounded-full bg-[#3b82f6]" /> Meus prospects</span>
        <span className="flex items-center gap-1"><span className="inline-block size-3 rounded-full bg-[#16a34a]" /> Fechado</span>
      </div>
    </div>
  );
}
