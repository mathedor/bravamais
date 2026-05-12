"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { PROMO_LABELS } from "@/lib/format";

interface Props {
  categorias: { slug: string; name: string }[];
}

export function SearchFilters({ categorias }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const q = params.get("q") ?? "";
  const categoria = params.get("categoria") ?? "";
  const tipo = params.get("tipo") ?? "";

  function navigate(next: URLSearchParams) {
    const qs = next.toString();
    start(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    navigate(next);
  }

  function reset() {
    navigate(new URLSearchParams());
  }

  const hasFilter = q || categoria || tipo;

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setParam("q", String(fd.get("q") ?? ""));
        }}
      >
        <label className="block text-sm font-medium text-brava-ink">Buscar</label>
        <div className="mt-1 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nome do estabelecimento, descrição..."
            className="flex-1 rounded-xl border border-brava-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brava-yellow"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-brava-black px-4 py-2.5 text-sm font-bold text-white hover:bg-brava-ink disabled:opacity-60"
          >
            Buscar
          </button>
        </div>
      </form>

      <div>
        <span className="block text-sm font-medium text-brava-ink">Categoria</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {categorias.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setParam("categoria", c.slug === categoria ? "" : c.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                categoria === c.slug
                  ? "bg-brava-blue text-white"
                  : "bg-white border border-brava-border text-brava-ink hover:border-brava-blue"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-brava-ink">Tipo de promoção</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Object.entries(PROMO_LABELS).map(([slug, label]) => (
            <button
              key={slug}
              type="button"
              onClick={() => setParam("tipo", slug === tipo ? "" : slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                tipo === slug
                  ? "bg-brava-yellow text-brava-black"
                  : "bg-white border border-brava-border text-brava-ink hover:border-brava-yellow"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {hasFilter && (
        <button
          type="button"
          onClick={reset}
          className="text-sm text-brava-muted underline hover:text-brava-ink"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
