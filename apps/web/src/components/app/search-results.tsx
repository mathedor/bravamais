"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PROMO_LABELS } from "@/lib/format";
import { useLocation, haversineKm } from "./location-context";

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
  const [cat, setCat] = useState<string>(initialCategoria);
  const [promo, setPromo] = useState<string>(initialTipo);
  const [sort, setSort] = useState<"distance" | "name">(location ? "distance" : "name");

  const filtered = useMemo(() => {
    let r = items.filter((e) => {
      if (q && !`${e.name} ${e.tagline ?? ""} ${e.city ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat && e.categorySlug !== cat) return false;
      if (promo && e.promo !== PROMO_LABELS[promo]) return false;
      return true;
    });

    if (sort === "distance" && location) {
      r = r
        .map((e) => ({
          ...e,
          distance: e.lat != null && e.lng != null
            ? haversineKm({ lat: location.lat, lng: location.lng }, { lat: e.lat, lng: e.lng })
            : Infinity,
        }))
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    }
    return r;
  }, [items, q, cat, promo, sort, location]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busque por nome, bairro, tipo…"
            className="w-full rounded-full border border-brava-border bg-white px-5 py-3.5 pl-12 text-base outline-none transition focus:border-brava-yellow focus:shadow-md"
          />
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brava-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-2xl bg-white p-1">
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
            onClick={() => setSort("name")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${sort === "name" ? "bg-brava-blue text-white" : "text-brava-muted"}`}
          >
            A → Z
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brava-muted">Categoria</p>
        <div className="-mx-4 overflow-x-auto sm:-mx-0">
          <div className="flex gap-2 px-4 pb-2 sm:px-0 sm:flex-wrap">
            <Chip active={!cat} onClick={() => setCat("")}>Todas</Chip>
            {categorias.map((c) => (
              <Chip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug === cat ? "" : c.slug)}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>
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
              className="group flex items-center gap-3 rounded-3xl border border-brava-border bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brava-paper">
                {e.cover && (
                  <Image src={e.cover} alt="" fill sizes="80px" className="object-cover transition-transform group-hover:scale-110" />
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
                  {e.city && <span className="text-[11px] text-brava-muted">{e.city}/{e.state ?? ""}</span>}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <p className="rounded-3xl border border-dashed border-brava-border bg-white p-10 text-center text-sm text-brava-muted">
            Nenhum parceiro com esses filtros.
          </p>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, variant = "blue" }: { active: boolean; onClick: () => void; children: React.ReactNode; variant?: "blue" | "yellow" }) {
  const activeCls = variant === "yellow" ? "bg-brava-yellow text-brava-black border-brava-yellow" : "bg-brava-blue text-white border-brava-blue";
  const idle = "bg-white text-brava-ink border-brava-border";
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
