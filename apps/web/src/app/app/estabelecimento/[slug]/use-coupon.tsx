"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCouponAction, type UseCouponResult } from "./actions";

interface Props {
  couponId: string;
  code: string;
  description: string | null;
  discountLabel: string;
}

export function UseCouponButton({ couponId, code, description, discountLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UseCouponResult | null>(null);

  async function handleUse() {
    setLoading(true);
    try {
      const r = await useCouponAction(couponId);
      setResult(r);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleUse}
        disabled={loading}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brava-black px-4 py-2 text-xs font-bold text-white transition hover:scale-105 disabled:opacity-60"
      >
        {loading ? "..." : "🎟️ Usar cupom"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 80, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 80, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-brava-yellow via-amber-300 to-brava-yellow-deep p-8 text-brava-black shadow-2xl"
            >
              <div className="pointer-events-none absolute -right-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-paper" />
              <div className="pointer-events-none absolute -left-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-paper" />

              {result?.ok ? (
                <>
                  <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">
                    Seu cupom
                  </p>
                  <p className="mt-4 text-center text-5xl font-black">{discountLabel}</p>
                  {description && <p className="mt-2 text-center text-sm text-brava-black/75">{description}</p>}
                  <button
                    onClick={copyCode}
                    className="mt-6 w-full rounded-2xl border-2 border-dashed border-brava-black/30 bg-white/40 p-4 text-center transition hover:bg-white/60"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-brava-blue">Código (clique pra copiar)</p>
                    <p className="mt-1 font-mono text-3xl font-black tracking-widest">{code}</p>
                  </button>
                  <p className="mt-4 text-center text-xs text-brava-black/75">
                    ✓ Registrado em &quot;Meus cupons usados&quot;. Apresente no checkout ou caixa.
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-5 w-full rounded-full bg-brava-black px-5 py-3 text-sm font-bold text-white"
                  >
                    Fechar
                  </button>
                </>
              ) : (
                <>
                  <p className="text-center text-xl font-black">Ops</p>
                  <p className="mt-2 text-center text-sm">{result?.error ?? "Erro ao usar cupom"}</p>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-5 w-full rounded-full bg-brava-black px-5 py-3 text-sm font-bold text-white"
                  >
                    Fechar
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
