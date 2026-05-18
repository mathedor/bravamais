"use client";

import { useState, useTransition, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { markTourCompletedAction, type TourRole } from "@/app/api/onboarding-tour/actions";

export type TourStep = {
  emoji: string;
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  pontos?: string[];
  calculos?: string[];
  visual?: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
};

interface Props {
  role: TourRole;
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}

export function TourModal({ role, steps, open, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!open) return null;

  const total = steps.length;
  const cur = steps[step];
  const isLast = step === total - 1;
  const isFirst = step === 0;
  const progress = ((step + 1) / total) * 100;

  const handleClose = () => {
    startTransition(async () => {
      await markTourCompletedAction(role);
      onClose();
      router.refresh();
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-brava-black/70 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          key="md"
          initial={{ y: 24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-brava-yellow/40 bg-brava-card shadow-2xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brava-border bg-brava-card/95 px-5 py-3 backdrop-blur">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-brava-muted">
                {step + 1} de {total}
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brava-paper">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brava-yellow to-brava-yellow-deep"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={pending}
              className="shrink-0 font-mono text-xs text-brava-muted hover:text-brava-ink"
            >
              pular tour
            </button>
          </div>

          <div className="p-6 md:p-10">
            <div className="mb-3 text-5xl">{cur.emoji}</div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-brava-blue">
              {cur.eyebrow}
            </div>
            <h2 className="mb-1 text-2xl font-black tracking-tight text-brava-ink md:text-3xl">
              {cur.titulo}
            </h2>
            <p className="mb-5 text-base text-brava-muted">{cur.subtitulo}</p>
            <p className="mb-5 whitespace-pre-line text-sm leading-relaxed text-brava-ink">
              {cur.descricao}
            </p>

            {cur.visual && <div className="mb-5">{cur.visual}</div>}

            {cur.pontos && cur.pontos.length > 0 && (
              <ul className="mb-5 space-y-2">
                {cur.pontos.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brava-ink">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brava-yellow/20 text-[10px] font-black text-brava-blue">
                      ✓
                    </span>
                    <span className="whitespace-pre-line">{p}</span>
                  </li>
                ))}
              </ul>
            )}

            {cur.calculos && cur.calculos.length > 0 && (
              <ul className="mb-5 space-y-2">
                {cur.calculos.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-brava-border bg-brava-paper p-2.5 text-sm text-brava-ink"
                  >
                    <span className="shrink-0 text-brava-blue">∑</span>
                    <span className="whitespace-pre-line font-mono text-[12px]">{p}</span>
                  </li>
                ))}
              </ul>
            )}

            {cur.ctaHref && cur.ctaLabel && (
              <a
                href={cur.ctaHref}
                target="_blank"
                rel="noopener"
                className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-brava-yellow bg-brava-yellow/10 px-5 text-sm font-black uppercase tracking-wide text-brava-ink transition hover:bg-brava-yellow hover:text-brava-black"
              >
                {cur.ctaLabel} ↗
              </a>
            )}
          </div>

          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-brava-border bg-brava-card/95 px-5 py-4 backdrop-blur">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={isFirst}
              className="h-10 rounded-lg border border-brava-border px-4 text-sm font-medium text-brava-muted hover:text-brava-ink disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← anterior
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={handleClose}
                disabled={pending}
                className="h-10 rounded-lg bg-brava-blue px-5 text-sm font-black text-white shadow-lg shadow-brava-blue/30 hover:bg-brava-blue-bright disabled:opacity-50"
              >
                {pending ? "salvando…" : "🚀 Bora começar!"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                className="h-10 rounded-lg bg-brava-blue px-5 text-sm font-black text-white shadow-lg shadow-brava-blue/30 hover:bg-brava-blue-bright"
              >
                próximo →
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Mount client que escuta `open-onboarding-tour:<role>` e abre o modal. */
export function TourMount({
  role,
  steps,
  autoOpen = false,
}: {
  role: TourRole;
  steps: TourStep[];
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(autoOpen);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(`open-onboarding-tour:${role}`, handler);
    return () => window.removeEventListener(`open-onboarding-tour:${role}`, handler);
  }, [role]);

  return <TourModal role={role} steps={steps} open={open} onClose={() => setOpen(false)} />;
}
