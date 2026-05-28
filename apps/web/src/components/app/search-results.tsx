"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PROMO_LABELS } from "@/lib/format";
import { useLocation, haversineKm } from "./location-context";
import { CategoryPickerDialog } from "@/components/ui/category-picker-dialog";

export interface SearchEstab {
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  cover: string | null;
  promo: string | null;
  categorySlug: string | null;
  categoryName?: string | null;
  categoryPriceCents?: number | null;
  accessible?: boolean;
  hasActiveCoupons?: boolean;
  hasLoyalty?: boolean;
  rating?: number | null;
}

interface Props {
  items: SearchEstab[];
  categorias: { slug: string; name: string }[];
  initialQ?: string;
  initialCategoria?: string;
  initialTipo?: string;
}

export function SearchResults({ items, categorias, initialQ = "", initialCategoria = "", initialTipo = "" }: Props) {
  const { location, requestLocation } = useLocation();
  const [q, setQ] = useState(initialQ);
  const [cats, setCats] = useState<string[]>(initialCategoria ? initialCategoria.split(",").filter(Boolean) : []);
  const [promo, setPromo] = useState<string>(initialTipo);
  const [sort, setSort] = useState<"distance" | "name" | "rating">(location ? "distance" : "name");
  const [onlyCoupon, setOnlyCoupon] = useState(false);
  const [onlyLoyalty, setOnlyLoyalty] = useState(false);
  const [minStar, setMinStar] = useState(0);
  const [maxKm, setMaxKm] = useState<number | "">("");

  const filtered = useMemo(() => {
    type EstabWithDistance = SearchEstab & { distance?: number };
    let r: EstabWithDistance[] = items.filter((e) => {
      if (q && !`${e.name} ${e.tagline ?? ""} ${e.city ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cats.length > 0 && (!e.categorySlug || !cats.includes(e.categorySlug))) return false;
      if (promo && e.promo !== PROMO_LABELS[promo]) return false;
      if (onlyCoupon && !e.hasActiveCoupons) return false;
      if (onlyLoyalty && !e.hasLoyalty) return false;
      if (minStar > 0 && (e.rating ?? 0) < minStar) return false;
      return true;
    });

    if (location) {
      r = r.map((e) => ({
        ...e,
        distance: e.lat != null && e.lng != null
          ? haversineKm({ lat: location.lat, lng: location.lng }, { lat: e.lat, lng: e.lng })
          : Infinity,
      }));
      if (maxKm !== "" && maxKm > 0) {
        r = r.filter((e) => (e.distance ?? Infinity) <= maxKm);
      }
    }

    if (sort === "distance" && location) {
      r = [...r].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else if (sort === "rating") {
      r = [...r].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
      r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    }
    return r;
  }, [items, q, cats, promo, sort, location, onlyCoupon, onlyLoyalty, minStar, maxKm]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busque por nome, bairro, tipo…"
            className="w-full rounded-full border border-brava-border bg-brava-card px-5 py-3.5 pl-12 text-base outline-none transition focus:border-brava-yellow focus:shadow-md"
          />
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brava-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-2xl bg-brava-card p-1">
          <button
            onClick={() => {
              if (!location) requestLocation();
              setSort("distance");
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${sort === "distance" ? "bg-brava-blue text-white" : "text-brava-muted"}`}
          >
            Mais perto
          </button>
          <button
            onClick={() => setSort("rating")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${sort === "rating" ? "bg-brava-blue text-white" : "text-brava-muted"}`}
          >
            Mais bem avaliados
          </button>
          <button
            onClick={() => setSort("name")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${sort === "name" ? "bg-brava-blue text-white" : "text-brava-muted"}`}
          >
            A → Z
          </button>
        </div>

        {/* Filtros avançados */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-brava-card p-3">
          <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" checked={onlyCoupon} onChange={(e) => setOnlyCoupon(e.target.checked)} className="h-4 w-4 accent-brava-yellow" />
            🎟️ Com cupom ativo
          </label>
          <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" checked={onlyLoyalty} onChange={(e) => setOnlyLoyalty(e.target.checked)} className="h-4 w-4 accent-brava-yellow" />
            ⭐ Tem fidelidade
          </label>
          <label className="inline-flex items-center gap-1.5 text-xs">
            Nota mín:
            <select value={minStar} onChange={(e) => setMinStar(parseInt(e.target.value, 10))} className="rounded border border-brava-border bg-brava-paper px-2 py-0.5 text-xs">
              <option value={0}>Qualquer</option>
              <option value={3}>3⭐</option>
              <option value={4}>4⭐</option>
              <option value={4.5}>4.5⭐</option>
            </select>
          </label>
          {location && (
            <label className="inline-flex items-center gap-1.5 text-xs">
              Raio máx:
              <select value={maxKm} onChange={(e) => setMaxKm(e.target.value === "" ? "" : parseFloat(e.target.value))} className="rounded border border-brava-border bg-brava-paper px-2 py-0.5 text-xs">
                <option value="">Qualquer</option>
                <option value={1}>1km</option>
                <option value={3}>3km</option>
                <option value={5}>5km</option>
                <option value={10}>10km</option>
                <option value={25}>25km</option>
              </select>
            </label>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">Categoria</p>
        <CategoryPickerDialog
          categorias={categorias}
          selected={cats}
          onChange={setCats}
          triggerLabel="Navegue as categorias"
          triggerClassName="inline-flex items-center gap-2 rounded-full border border-brava-border bg-brava-card px-4 py-2 text-xs font-bold text-brava-ink shadow-sm transition hover:border-brava-blue"
        />
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cats.map((slug) => {
              const c = categorias.find((x) => x.slug === slug);
              if (!c) return null;
              return (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brava-blue px-2.5 py-1 text-[11px] font-bold text-white"
                >
                  {c.name}
                  <button
                    type="button"
                    onClick={() => setCats((cur) => cur.filter((s) => s !== slug))}
                    aria-label={`Remover ${c.name}`}
                    className="grid h-4 w-4 place-items-center rounded-full bg-white/20 hover:bg-white/30"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brava-muted">Tipo de promoção</p>
        <div className="-mx-4 overflow-x-auto sm:-mx-0">
          <div className="flex gap-2 px-4 pb-2 sm:px-0 sm:flex-wrap">
            <Chip variant="yellow" active={!promo} onClick={() => setPromo("")}>Todas</Chip>
            {Object.entries(PROMO_LABELS).map(([k, label]) => (
              <Chip variant="yellow" key={k} active={promo === k} onClick={() => setPromo(k === promo ? "" : k)}>
                {label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-brava-muted">
        {filtered.length} {filtered.length === 1 ? "parceiro" : "parceiros"}
      </p>

      <div className="space-y-3">
        {filtered.map((e, i) => (
          <motion.div
            key={e.slug}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.02, duration: 0.35 }}
          >
            <Link
              href={`/app/estabelecimento/${e.slug}`}
              className={`group flex items-center gap-3 rounded-3xl border p-3 transition hover:-translate-y-0.5 hover:shadow-lg ${
                e.accessible === false
                  ? "border-brava-border bg-brava-card/60 opacity-70 grayscale-[40%]"
                  : "border-brava-border bg-brava-card"
              }`}
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brava-paper">
                {e.cover && (
                  <Image src={e.cover} alt="" fill sizes="80px" className="object-cover transition-transform group-hover:scale-110" />
                )}
                {e.accessible === false && (
                  <div className="absolute inset-0 flex items-center justify-center bg-brava-black/40 text-2xl">🔒</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 font-bold text-brava-ink">{e.name}</p>
                  {"distance" in e && typeof (e as { distance?: number }).distance === "number" && (e as { distance: number }).distance !== Infinity && (
                    <span className="shrink-0 rounded-full bg-brava-blue/10 px-2 py-0.5 text-[11px] font-bold text-brava-blue">
                      {((e as { distance: number }).distance).toFixed(1)} km
                    </span>
                  )}
                </div>
                {e.tagline && <p className="line-clamp-1 text-xs text-brava-muted">{e.tagline}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {e.promo && (
                    <span className="rounded-full bg-brava-yellow px-2 py-0.5 text-[10px] font-bold text-brava-black">{e.promo}</span>
                  )}
                  {e.accessible === false && e.categoryName && e.categoryPriceCents !== null && e.categoryPriceCents !== undefined && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      + R$ {(e.categoryPriceCents / 100).toFixed(2)}/mês pra usar
                    </span>
                  )}
                  {e.city && <span className="text-[11px] text-brava-muted">{e.city}/{e.state ?? ""}</span>}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Nenhum parceiro com esses filtros.
          </p>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, variant = "blue" }: { active: boolean; onClick: () => void; children: React.ReactNode; variant?: "blue" | "yellow" }) {
  const activeCls = variant === "yellow" ? "bg-brava-yellow text-brava-black border-brava-yellow" : "bg-brava-blue text-white border-brava-blue";
  const idle = "bg-brava-card text-brava-ink border-brava-border";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? activeCls : idle}`}
    >
      {children}
    </button>
  );
}
