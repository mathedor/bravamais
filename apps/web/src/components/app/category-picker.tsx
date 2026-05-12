"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  categorias: { slug: string; name: string }[];
}

const EMOJI: Record<string, string> = {
  restaurantes: "🍴",
  bares: "🍺",
  cafes: "☕",
  beleza: "💅",
  moda: "👗",
  saude: "❤️",
  esportes: "💪",
  lazer: "🎉",
  petshop: "🐾",
  servicos: "💼",
  floricultura: "🌸",
  decoracao: "🛋️",
  "casas-de-show": "🎵",
  presentes: "🎁",
  papelaria: "📚",
};

export function CategoryPicker({ categorias }: Props) {
  const [open, setOpen] = useState(false);

  // Bloqueia scroll do body quando aberto
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-between gap-3 rounded-3xl border border-brava-border bg-brava-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brava-yellow hover:shadow-md"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brava-yellow to-amber-500 text-2xl text-brava-blue shadow-md">
            🗂️
          </span>
          <span>
            <span className="block text-base font-black text-brava-ink">Categorias</span>
            <span className="block text-xs text-brava-muted">
              {categorias.length} tipos de estabelecimento
            </span>
          </span>
        </span>
        <svg
          className="text-brava-muted transition-transform group-hover:translate-x-1"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 80, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 80, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-[2rem] bg-brava-card shadow-2xl"
            >
              <header className="relative flex items-center justify-between border-b border-brava-border px-6 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brava-blue">
                    Explorar
                  </p>
                  <h2 className="mt-0.5 text-xl font-black text-brava-ink">Categorias</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brava-paper text-brava-muted transition hover:bg-brava-border"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </header>

              <div className="max-h-[60vh] overflow-y-auto p-4">
                <div className="grid grid-cols-3 gap-3">
                  {categorias.map((c, i) => (
                    <motion.div
                      key={c.slug}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.025, duration: 0.3 }}
                    >
                      <Link
                        href={`/app/buscar?categoria=${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-brava-border bg-brava-card p-3 text-center transition hover:-translate-y-1 hover:border-brava-yellow hover:bg-brava-yellow/10 hover:shadow-md"
                      >
                        <span className="text-3xl transition-transform duration-300 group-hover:scale-125">
                          {EMOJI[c.slug] ?? "🏷️"}
                        </span>
                        <span className="text-xs font-bold text-brava-ink leading-tight">
                          {c.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              <footer className="border-t border-brava-border px-6 py-3 text-center">
                <Link
                  href="/app/buscar"
                  onClick={() => setOpen(false)}
                  className="text-xs font-bold text-brava-blue hover:underline"
                >
                  Ver todos os parceiros →
                </Link>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
