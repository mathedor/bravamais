"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PROMO_LABELS } from "@/lib/format";
import { EstablishmentsMap, type MapPin } from "@/components/establishments-map";
import { LocationProvider, useLocation, haversineKm } from "@/components/app/location-context";
import { CategoryPickerDialog } from "@/components/ui/category-picker-dialog";
import type { LandingEstablishment } from "@/components/landing-establishments";

interface Props {
  estabs: LandingEstablishment[];
  pins: MapPin[];
  categorias: { slug: string; name: string; icon?: string | null }[];
  initialMapHeight?: number;
}

export function LandingExplorer(props: Props) {
  return (
    <LocationProvider>
      <ExplorerInner {...props} />
    </LocationProvider>
  );
}

function ExplorerInner({ estabs, pins, categorias, initialMapHeight = 520 }: Props) {
  const { location, requestLocation, loading: geoLoading, error: geoError } = useLocation();
  const [q, setQ] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedPromos, setSelectedPromos] = useState<string[]>([]);
  const [limit, setLimit] = useState(12);

  const filteredEstabs = useMemo(() => {
    type WithDist = LandingEstablishment & { distanceKm?: number; lat?: number | null; lng?: number | null };
    let arr: WithDist[] = estabs.filter((e) => {
      if (q && !`${e.name} ${e.tagline ?? ""} ${e.city ?? ""}`.toLowerCase().includes(q.toLowerCase())) {
        return false;
      }
      if (selectedCats.length > 0 && !e.categorySlugs.some((c) => selectedCats.includes(c))) {
        return false;
      }
      if (selectedPromos.length > 0 && !e.promos.some((p) => selectedPromos.includes(p))) {
        return false;
      }
      return true;
    });

    if (location) {
      arr = arr.map((e) => {
        const pin = pins.find((p) => p.slug === e.slug);
        const dist =
          pin?.lat != null && pin?.lng != null
            ? haversineKm({ lat: location.lat, lng: location.lng }, { lat: pin.lat, lng: pin.lng })
            : undefined;
        return { ...e, distanceKm: dist, lat: pin?.lat ?? null, lng: pin?.lng ?? null };
      });
      arr.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }
    return arr;
  }, [estabs, pins, q, selectedCats, selectedPromos, location]);

  const hasFilters = q.length > 0 || selectedCats.length > 0 || selectedPromos.length > 0;
  const visible = filteredEstabs.slice(0, limit);

  function togglePromo(slug: string) {
    setSelectedPromos((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
  }

  function reset() {
    setQ("");
    setSelectedCats([]);
    setSelectedPromos([]);
  }

  return (
    <div className="space-y-12">
      {/* BARRA DE FILTROS */}
      <div className="space-y-4 rounded-3xl border border-brava-border bg-white p-5 shadow-md">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busque por nome, bairro ou descrição…"
              className="w-full rounded-full border border-brava-border bg-white px-5 py-3 pl-12 text-base outline-none transition focus:border-brava-yellow focus:shadow-md"
            />
            <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brava-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          <CategoryPickerDialog
            categorias={categorias}
            selected={selectedCats}
            onChange={setSelectedCats}
          />

          {location ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-brava-blue/10 px-4 py-2.5 text-sm font-bold text-brava-blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location.city ?? "Você"}
            </span>
          ) : (
            <button
              type="button"
              onClick={requestLocation}
              disabled={geoLoading}
              className="inline-flex items-center gap-2 rounded-full bg-brava-blue px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:scale-[1.02] disabled:opacity-60"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {geoLoading ? "Localizando…" : "Usar minha localização"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">Promoção:</span>
          {Object.entries(PROMO_LABELS).map(([slug, label]) => {
            const active = selectedPromos.includes(slug);
            return (
              <button
                key={slug}
                type="button"
                onClick={() => togglePromo(slug)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-brava-yellow bg-brava-yellow text-brava-black"
                    : "border-brava-border bg-white text-brava-ink hover:border-brava-yellow"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {(selectedCats.length > 0 || selectedPromos.length > 0 || q || hasFilters) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-brava-border pt-3">
            <span className="text-xs text-brava-muted">
              {filteredEstabs.length} {filteredEstabs.length === 1 ? "parceiro" : "parceiros"} encontrados
            </span>
            {selectedCats.length > 0 && (
              <span className="rounded-full bg-brava-blue/10 px-2 py-0.5 text-[11px] font-bold text-brava-blue">
                {selectedCats.length} categoria{selectedCats.length > 1 ? "s" : ""}
              </span>
            )}
            {selectedPromos.length > 0 && (
              <span className="rounded-full bg-brava-yellow/20 px-2 py-0.5 text-[11px] font-bold text-brava-blue">
                {selectedPromos.length} promoçã{selectedPromos.length > 1 ? "es" : "o"}
              </span>
            )}
            <button onClick={reset} className="ml-auto text-xs font-bold text-brava-muted underline hover:text-brava-ink">
              Limpar tudo
            </button>
          </div>
        )}

        {geoError && (
          <p className="text-xs text-red-600">{geoError}</p>
        )}
      </div>

      {/* MAPA */}
      <div>
        <EstablishmentsMap
          pins={pins}
          userLocation={location ? { lat: location.lat, lng: location.lng, city: location.city ?? null } : null}
          selectedCategorySlugs={selectedCats}
          height={initialMapHeight}
          realtime
        />
        <p className="mt-3 text-center text-xs text-brava-muted">
          {location
            ? "Mapa centrado em você. Pinos atualizam em tempo real."
            : "Permita acesso à localização pra ver o que tá perto de você."}
        </p>
      </div>

      {/* GRID */}
      <div>
        <h3 className="text-xl font-black text-brava-ink">
          {location ? "Parceiros perto de você" : "Parceiros em destaque"}
        </h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((e, i) => {
            const dist = (e as { distanceKm?: number }).distanceKm;
            return (
              <motion.div
                key={e.slug}
                initial={{ y: 12, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
              >
                <Link
                  href={`/entrar?next=${encodeURIComponent(`/app/estabelecimento/${e.slug}`)}`}
                  className="group block overflow-hidden rounded-2xl border border-brava-border bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] bg-brava-paper">
                    {(e.cover_url || e.photos[0]) && (
                      <Image
                        src={e.cover_url || e.photos[0]}
                        alt={e.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    )}
                    {e.promos[0] && (
                      <span className="absolute left-3 top-3 rounded-full bg-brava-yellow px-2.5 py-1 text-[11px] font-bold text-brava-black">
                        {PROMO_LABELS[e.promos[0]] ?? e.promos[0]}
                      </span>
                    )}
                    {typeof dist === "number" && Number.isFinite(dist) && (
                      <span className="absolute right-3 top-3 rounded-full bg-brava-blue px-2.5 py-1 text-[11px] font-bold text-white">
                        {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="line-clamp-1 font-bold text-brava-ink">{e.name}</h4>
                    {e.tagline && <p className="line-clamp-2 mt-1 text-sm text-brava-muted">{e.tagline}</p>}
                    <p className="mt-2 text-xs text-brava-muted">
                      {e.city ? `${e.city}/${e.state ?? ""}` : ""}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filteredEstabs.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed border-brava-border bg-white p-12 text-center text-brava-muted">
            Nenhum parceiro com esses filtros. Tente outra combinação.
          </p>
        )}

        {filteredEstabs.length > limit && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setLimit((l) => l + 12)}
              className="rounded-full bg-brava-black px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105"
            >
              Mostrar mais ({filteredEstabs.length - limit} restantes)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
