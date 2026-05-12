"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PROMO_LABELS } from "@/lib/format";

export interface LandingEstablishment {
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  cover_url: string | null;
  photos: string[];
  categorySlugs: string[];
  promos: string[];
}

interface Props {
  estabs: LandingEstablishment[];
  categorias: { slug: string; name: string }[];
  limit?: number;
}

export function LandingEstablishments({ estabs, categorias, limit = 12 }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [promo, setPromo] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return estabs.filter((e) => {
      if (q && !`${e.name} ${e.tagline ?? ""} ${e.city ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat && !e.categorySlugs.includes(cat)) return false;
      if (promo && !e.promos.includes(promo)) return false;
      return true;
    });
  }, [estabs, q, cat, promo]);

  const visible = filtered.slice(0, limit);

  return (
    <div>
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque por nome, bairro ou tipo de estabelecimento…"
          className="rounded-full border border-brava-border bg-white px-5 py-3 text-base outline-none transition focus:border-brava-yellow focus:shadow-lg"
        />
        <p className="self-center text-sm text-brava-muted">
          {filtered.length} {filtered.length === 1 ? "parceiro" : "parceiros"}
          {filtered.length > limit ? ` · mostrando ${limit}` : ""}
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Chip active={cat === null} onClick={() => setCat(null)}>Todas</Chip>
        {categorias.map((c) => (
          <Chip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug === cat ? null : c.slug)}>
            {c.name}
          </Chip>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Chip active={promo === null} variant="yellow" onClick={() => setPromo(null)}>
          Todas as promoções
        </Chip>
        {Object.entries(PROMO_LABELS).map(([slug, label]) => (
          <Chip
            key={slug}
            variant="yellow"
            active={promo === slug}
            onClick={() => setPromo(slug === promo ? null : slug)}
          >
            {label}
          </Chip>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((e) => (
          <Link
            key={e.slug}
            href={`/entrar?next=${encodeURIComponent(`/app/estabelecimento/${e.slug}`)}`}
            className="group overflow-hidden rounded-2xl border border-brava-border bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
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
            </div>
            <div className="p-4">
              <h3 className="line-clamp-1 font-bold text-brava-ink">{e.name}</h3>
              {e.tagline && <p className="line-clamp-2 mt-1 text-sm text-brava-muted">{e.tagline}</p>}
              <p className="mt-2 text-xs text-brava-muted">
                {e.city ? `${e.city}/${e.state ?? ""}` : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-brava-border bg-white p-12 text-center text-brava-muted">
          Nenhum estabelecimento encontrado. Tente outro filtro.
        </p>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  variant = "blue",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "blue" | "yellow";
}) {
  const base =
    "rounded-full px-3 py-1.5 text-xs font-medium transition border";
  const activeCls =
    variant === "yellow"
      ? "bg-brava-yellow text-brava-black border-brava-yellow"
      : "bg-brava-blue text-white border-brava-blue";
  const idle =
    "bg-white text-brava-ink border-brava-border hover:border-brava-blue";
  return (
    <button type="button" onClick={onClick} className={`${base} ${active ? activeCls : idle}`}>
      {children}
    </button>
  );
}
