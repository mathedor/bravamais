"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface PickerCategory {
  slug: string;
  name: string;
  icon?: string | null;
}

interface Props {
  categorias: PickerCategory[];
  selected: string[];
  onChange: (next: string[]) => void;
  triggerLabel?: string;
  triggerClassName?: string;
}

/**
 * Botão "Navegue as categorias" + modal centralizado com multi-select.
 * Selected é controlado pelo parent (array de slugs).
 */
export function CategoryPickerDialog({
  categorias,
  selected,
  onChange,
  triggerLabel = "Navegue as categorias",
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);
  const [search, setSearch] = useState("");

  // Sincroniza draft com selected sempre que abrir
  useEffect(() => {
    if (open) setDraft(selected);
  }, [open, selected]);

  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Trava scroll do body enquanto aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categorias;
    return categorias.filter((c) => c.name.toLowerCase().includes(q));
  }, [categorias, search]);

  function toggle(slug: string) {
    setDraft((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
  }

  function apply() {
    onChange(draft);
    setOpen(false);
  }

  function clearAll() {
    setDraft([]);
  }

  const triggerBase =
    "inline-flex items-center gap-2 rounded-full border border-brava-border bg-white px-5 py-2.5 text-sm font-bold text-brava-ink shadow-sm transition hover:border-brava-blue hover:shadow-md";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName ?? triggerBase}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        {triggerLabel}
        {selected.length > 0 && (
          <span className="ml-1 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brava-blue px-1.5 text-[11px] font-black text-white">
            {selected.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Selecione categorias"
              className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-brava-border bg-white shadow-2xl"
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="flex items-center justify-between border-b border-brava-border bg-gradient-to-r from-brava-yellow/30 via-amber-100/40 to-brava-yellow/20 px-6 py-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-blue">Filtrar</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-brava-ink">Categorias</h2>
                  <p className="mt-0.5 text-xs text-brava-muted">Selecione uma ou mais. Vai filtrar mapa e lista.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-brava-ink transition hover:bg-white"
                  aria-label="Fechar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </header>

              <div className="border-b border-brava-border px-6 py-3">
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar categoria…"
                    className="w-full rounded-full border border-brava-border bg-brava-paper px-4 py-2.5 pl-10 text-sm outline-none focus:border-brava-blue"
                  />
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brava-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {visible.length === 0 ? (
                  <p className="py-10 text-center text-sm text-brava-muted">Nenhuma categoria encontrada.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {visible.map((c) => {
                      const checked = draft.includes(c.slug);
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => toggle(c.slug)}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                            checked
                              ? "border-brava-blue bg-brava-blue/10 shadow-sm"
                              : "border-brava-border bg-white hover:border-brava-blue/40"
                          }`}
                          aria-pressed={checked}
                        >
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                              checked ? "border-brava-blue bg-brava-blue text-white" : "border-brava-border bg-white"
                            }`}
                          >
                            {checked ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : null}
                          </span>
                          <span className="flex-1 text-sm font-bold text-brava-ink">{c.name}</span>
                          {c.icon && <span className="text-lg">{c.icon}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <footer className="flex items-center justify-between gap-3 border-t border-brava-border bg-brava-paper px-6 py-4">
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm font-bold text-brava-muted underline-offset-2 hover:text-brava-ink hover:underline disabled:opacity-50"
                  disabled={draft.length === 0}
                >
                  Limpar seleção
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-brava-border bg-white px-4 py-2 text-sm font-bold text-brava-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={apply}
                    className="rounded-full bg-brava-black px-5 py-2 text-sm font-bold text-white shadow-md transition hover:scale-105"
                  >
                    Aplicar
                    {draft.length > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brava-yellow px-1 text-[10px] font-black text-brava-black">
                        {draft.length}
                      </span>
                    )}
                  </button>
                </div>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
