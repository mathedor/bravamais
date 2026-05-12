"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLocation, haversineKm } from "./location-context";

export interface NearbyItem {
  slug: string;
  name: string;
  tagline: string | null;
  cover: string | null;
  logo: string | null;
  city: string | null;
  state: string | null;
  lat: number;
  lng: number;
  promo: string | null;
}

interface Props {
  items: NearbyItem[];
  limit?: number;
}

export function NearbyList({ items, limit = 6 }: Props) {
  const { location, requestLocation, loading } = useLocation();

  const enriched = useMemo(() => {
    if (!location) return items.slice(0, limit);
    return items
      .map((e) => ({
        ...e,
        distance: haversineKm({ lat: location.lat, lng: location.lng }, { lat: e.lat, lng: e.lng }),
      }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
      .slice(0, limit);
  }, [items, location, limit]);

  return (
    <div className="space-y-3">
      {!location && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={requestLocation}
          disabled={loading}
          className="flex w-full items-center justify-between rounded-3xl border-2 border-dashed border-brava-yellow bg-brava-yellow/10 px-5 py-4 text-left text-sm transition hover:bg-brava-yellow/15 disabled:opacity-60"
        >
          <div>
            <p className="font-bold text-brava-ink">Habilite sua localização</p>
            <p className="mt-1 text-xs text-brava-muted">Pra ordenar os parceiros mais perto de você</p>
          </div>
          <span className="inline-flex items-center justify-center rounded-full bg-brava-yellow px-4 py-2 text-xs font-bold text-brava-black">
            {loading ? "Localizando…" : "Habilitar"}
          </span>
        </motion.button>
      )}

      {enriched.map((e, i) => (
        <motion.div
          key={e.slug}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2 }}
        >
          <Link
            href={`/app/estabelecimento/${e.slug}`}
            className="group flex items-center gap-3 rounded-3xl border border-brava-border bg-brava-card p-3 transition hover:shadow-lg"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brava-paper">
              {e.cover ? (
                <Image
                  src={e.cover}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover transition-transform group-hover:scale-110"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-1 font-bold text-brava-ink">{e.name}</p>
                {"distance" in e && typeof (e as { distance?: number }).distance === "number" && (
                  <span className="shrink-0 rounded-full bg-brava-blue/10 px-2 py-0.5 text-[11px] font-bold text-brava-blue">
                    {((e as { distance: number }).distance).toFixed(1)} km
                  </span>
                )}
              </div>
              {e.tagline && <p className="line-clamp-1 text-xs text-brava-muted">{e.tagline}</p>}
              <div className="mt-1.5 flex items-center gap-1.5">
                {e.promo && (
                  <span className="rounded-full bg-brava-yellow px-2 py-0.5 text-[10px] font-bold text-brava-black">
                    {e.promo}
                  </span>
                )}
                {e.city && <span className="text-[11px] text-brava-muted">{e.city}/{e.state ?? ""}</span>}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
