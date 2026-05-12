"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { blastPromoAction } from "@/app/loja/promocoes/actions";

export function PromoTrigger() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok?: string; error?: string } | null>(null);
  const router = useRouter();

  async function submit(formData: FormData) {
    start(async () => {
      const r = await blastPromoAction(undefined, formData);
      setResult(r ?? null);
      if (r?.ok) {
        setTimeout(() => {
          setOpen(false);
          setResult(null);
          router.refresh();
        }, 1200);
      }
    });
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Disparar promoção pra todos os assinantes"
        aria-label="Nova promoção"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brava-yellow to-amber-500 text-brava-blue shadow-md ring-2 ring-brava-card transition"
      >
        📣
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              <header className="border-b border-brava-border px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brava-blue">
                  📣 Disparar promoção
                </p>
                <h2 className="mt-1 text-xl font-black text-brava-ink">Notificar todos os assinantes</h2>
              </header>

              <form action={submit} className="space-y-3 p-5">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-brava-ink">Título</span>
                  <input
                    name="title"
                    required
                    maxLength={100}
                    placeholder="Ex: 30% off só hoje em todo o cardápio"
                    className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-brava-ink">Detalhes (opcional)</span>
                  <textarea
                    name="body"
                    rows={3}
                    placeholder="Mais informações…"
                    className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
                  />
                </label>

                {result?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{result.error}</p>}
                {result?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{result.ok}</p>}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full border border-brava-border bg-brava-card py-3 text-sm font-bold text-brava-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 rounded-full bg-brava-yellow py-3 text-sm font-bold text-brava-black disabled:opacity-60"
                  >
                    {pending ? "Enviando…" : "📣 Disparar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
