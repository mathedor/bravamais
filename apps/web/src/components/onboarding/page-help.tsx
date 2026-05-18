"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PAGE_HELPS, type PageHelpKey } from "@/lib/page-helps";
import type { TourRole } from "@/app/api/onboarding-tour/actions";

/**
 * Botão discreto "Como eu utilizo essa área?" + drawer lateral direito
 * com mini-tutorial específico da tela. Botão pra reabrir o tour completo
 * do role no rodapé do drawer.
 */
export function PageHelp({ pageKey }: { pageKey: PageHelpKey }) {
  const [open, setOpen] = useState(false);
  const data = PAGE_HELPS[pageKey];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open]);

  if (!data) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-1.5 rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-brava-muted shadow-sm transition hover:border-brava-yellow hover:bg-brava-yellow/10 hover:text-brava-ink"
        aria-label="Como eu utilizo essa área?"
      >
        <span className="grid size-4 place-items-center rounded-full border border-current text-[9px] font-black">
          ?
        </span>
        Como eu utilizo essa área?
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[55] bg-brava-black/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              key="dr"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-md flex-col border-l-2 border-brava-yellow/40 bg-brava-card shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={`Como utilizar: ${data.titulo}`}
            >
              <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-brava-border bg-brava-card/95 px-5 py-4 backdrop-blur">
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-brava-blue">
                    ajuda rápida
                  </div>
                  <h2 className="mt-0.5 truncate text-lg font-black tracking-tight text-brava-ink">
                    {data.titulo}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-8 shrink-0 place-items-center rounded-lg border border-brava-border text-lg leading-none text-brava-muted transition hover:border-brava-yellow hover:text-brava-ink"
                  aria-label="Fechar"
                >
                  ×
                </button>
              </header>

              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {data.resumo && (
                  <p className="text-sm leading-relaxed text-brava-ink">{data.resumo}</p>
                )}

                {data.visual && (
                  <div className="rounded-xl border-2 border-brava-yellow/40 bg-brava-yellow/10 p-3 font-mono text-[11px]">
                    {data.visual}
                  </div>
                )}

                {data.oQueFaz && data.oQueFaz.length > 0 && (
                  <Section titulo="O que essa tela faz">
                    <ul className="space-y-2">
                      {data.oQueFaz.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-brava-ink">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brava-yellow" />
                          <span className="whitespace-pre-line">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {data.comoUsar && data.comoUsar.length > 0 && (
                  <Section titulo="Como usar (passo a passo)">
                    <ol className="space-y-2">
                      {data.comoUsar.map((p, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-brava-ink">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brava-blue text-[10px] font-black text-white">
                            {i + 1}
                          </span>
                          <span className="whitespace-pre-line">{p}</span>
                        </li>
                      ))}
                    </ol>
                  </Section>
                )}

                {data.campos && data.campos.length > 0 && (
                  <Section titulo="Campos do formulário">
                    <ul className="space-y-2">
                      {data.campos.map((c, i) => (
                        <li
                          key={i}
                          className="rounded-lg border border-brava-border bg-brava-paper p-2.5 text-sm text-brava-ink"
                        >
                          <span className="font-bold text-brava-blue">{c.nome}</span>
                          {c.obrigatorio && (
                            <span className="ml-1 rounded bg-red-100 px-1.5 text-[9px] font-bold uppercase text-red-700 dark:bg-red-500/20 dark:text-red-300">
                              obrigatório
                            </span>
                          )}
                          <span className="ml-1.5 text-brava-muted">— {c.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {data.calculos && data.calculos.length > 0 && (
                  <Section titulo="O que o sistema calcula">
                    <ul className="space-y-2">
                      {data.calculos.map((p, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 rounded-lg border border-brava-border bg-brava-paper p-2.5 text-sm text-brava-ink"
                        >
                          <span className="shrink-0 text-brava-blue">∑</span>
                          <span className="whitespace-pre-line font-mono text-[12px]">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {data.objetivoRelatorio && (
                  <Section titulo="Objetivo deste relatório">
                    <p className="rounded-lg border border-brava-blue/30 bg-brava-blue/5 p-3 text-sm leading-relaxed text-brava-ink">
                      🎯 {data.objetivoRelatorio}
                    </p>
                  </Section>
                )}

                {data.dicas && data.dicas.length > 0 && (
                  <Section titulo="Dicas">
                    <ul className="space-y-2">
                      {data.dicas.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-brava-ink">
                          <span className="mt-0.5 shrink-0">💡</span>
                          <span className="whitespace-pre-line">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {data.tourRole && (
                  <div className="mt-2 border-t border-brava-border pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent(`open-onboarding-tour:${data.tourRole}`),
                        );
                        setOpen(false);
                      }}
                      className="h-11 w-full rounded-xl border-2 border-brava-yellow bg-brava-yellow/10 px-4 text-sm font-black uppercase tracking-wide text-brava-ink transition hover:bg-brava-yellow hover:text-brava-black"
                    >
                      🎓 Abrir tour completo do seu perfil
                    </button>
                    <p className="mt-2 text-center text-[10px] text-brava-muted">
                      Esse mini-help cobre só essa tela. O tour completo passa por todas as áreas do seu perfil.
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-brava-muted">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

/**
 * Renderiza PageHelp automaticamente baseado no pathname atual.
 * Casa o pathname com a chave correta do catálogo via prefixo-mais-longo.
 */
export function PageHelpAuto({ tourRole }: { tourRole?: TourRole }) {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    setPath(window.location.pathname);
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);

  if (!path) return null;
  const key = resolvePageHelpKey(path, tourRole);
  if (!key) return null;
  return (
    <div className="sticky top-[68px] z-20 -mt-px flex justify-end border-b border-brava-border bg-brava-paper/85 px-4 py-2 backdrop-blur sm:px-6">
      <PageHelp pageKey={key} />
    </div>
  );
}

function resolvePageHelpKey(pathname: string, tourRole?: TourRole): PageHelpKey | null {
  // Procura match exato primeiro, depois match por prefixo mais longo.
  const keys = Object.keys(PAGE_HELPS) as PageHelpKey[];
  const exact = keys.find((k) => PAGE_HELPS[k].path === pathname);
  if (exact) return exact;
  let best: { key: PageHelpKey; len: number } | null = null;
  for (const k of keys) {
    const entry = PAGE_HELPS[k];
    const p = entry.path;
    if (!p) continue;
    if (pathname.startsWith(p) && p.length > (best?.len ?? 0)) {
      best = { key: k, len: p.length };
    }
  }
  if (best) return best.key;
  // Fallback: pega o "home" do role (path raiz)
  if (tourRole) {
    const homeMap: Record<TourRole, PageHelpKey | null> = {
      usuario: "app-home",
      lojista: "loja-home",
      entregador: "entregador-home",
      admin: "admin-home",
    };
    return homeMap[tourRole];
  }
  return null;
}
