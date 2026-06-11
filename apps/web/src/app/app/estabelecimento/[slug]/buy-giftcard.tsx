"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createGiftCardPix, createGiftCardCard } from "./actions";
import { PayModal } from "@/components/payments/pay-modal";

const PRESETS = [50, 100, 200, 500];

export function BuyGiftCardButton({
  establishmentSlug,
  establishmentName,
}: {
  establishmentSlug: string;
  establishmentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(100);
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [payOpen, setPayOpen] = useState(false);

  const args = {
    establishmentSlug,
    valueCents: Math.round(value * 100),
    recipientName: recipientName || null,
    message: message || null,
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value < 10) return;
    setOpen(false);
    setPayOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-brava-yellow px-5 py-3 text-sm font-bold text-brava-black shadow-md hover:scale-105 transition"
      >
        🎁 Comprar vale-presente
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-[2rem] bg-brava-card p-6 sm:rounded-3xl"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <header>
                  <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">Vale-presente</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">{establishmentName}</h2>
                </header>

                <div>
                  <label className="block text-sm font-medium text-brava-ink">Valor (R$)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setValue(p)}
                        className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                          value === p
                            ? "border-brava-blue bg-brava-blue text-white"
                            : "border-brava-border bg-brava-card text-brava-ink"
                        }`}
                      >
                        R$ {p}
                      </button>
                    ))}
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(parseInt(e.target.value || "0", 10))}
                      min={10}
                      max={5000}
                      className="w-24 rounded-full border border-brava-border bg-brava-card px-3 py-2 text-sm font-bold outline-none focus:border-brava-yellow"
                    />
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-brava-ink">Para quem (opcional)</span>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nome do presenteado"
                    className="mt-1 w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-brava-ink">Mensagem</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    placeholder="Feliz aniversário, parabéns…"
                    className="mt-1 w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full border border-brava-border bg-brava-card py-3 text-sm font-bold text-brava-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={value < 10}
                    className="flex-1 rounded-full bg-brava-yellow py-3 text-sm font-bold text-brava-black disabled:opacity-60"
                  >
                    Pagar R$ {value}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PayModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title={`Vale-presente — ${establishmentName}`}
        amountCents={args.valueCents}
        successUrl="/app/presentes"
        createPixAction={() => createGiftCardPix(args)}
        createCardAction={() => createGiftCardCard(args)}
      />
    </>
  );
}
