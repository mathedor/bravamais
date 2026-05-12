"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { buyGiftCardAction, type GiftCardPurchaseResult } from "./actions";

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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GiftCardPurchaseResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value < 10) return;
    setLoading(true);
    try {
      const r = await buyGiftCardAction({
        establishmentSlug,
        valueCents: Math.round(value * 100),
        recipientName: recipientName || null,
        message: message || null,
      });
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setOpen(false);
    setTimeout(() => {
      setResult(null);
      setValue(100);
      setRecipientName("");
      setMessage("");
    }, 300);
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
            onClick={reset}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-[2rem] bg-white p-6 sm:rounded-3xl"
            >
              {result?.ok ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brava-yellow text-4xl">🎉</div>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-brava-ink">Vale-presente criado!</h2>
                  <p className="mt-2 text-sm text-brava-muted">
                    Compartilhe o link com {recipientName || "quem você quer presentear"}.
                  </p>
                  <div className="mt-5 rounded-2xl bg-brava-paper p-4 text-left">
                    <p className="text-[11px] uppercase tracking-wider text-brava-muted">Código</p>
                    <p className="mt-1 font-mono text-xl font-black tracking-wider text-brava-blue">{result.code}</p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Te dei um vale-presente da ${establishmentName} no BRAVA+! Resgata aqui: ${result.shareUrl}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-full bg-green-500 px-4 py-2.5 text-center text-sm font-bold text-white"
                    >
                      Enviar no WhatsApp
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(`Vale-presente ${establishmentName}`)}&body=${encodeURIComponent(`Você ganhou um vale-presente no BRAVA+! Resgate: ${result.shareUrl}`)}`}
                      className="flex-1 rounded-full bg-brava-blue px-4 py-2.5 text-center text-sm font-bold text-white"
                    >
                      Enviar por email
                    </a>
                  </div>
                  <Link
                    href={result.shareUrl ?? "/app/presentes"}
                    className="mt-3 inline-flex items-center justify-center w-full rounded-full border border-brava-border px-4 py-2.5 text-sm font-medium text-brava-ink"
                  >
                    Ver arte
                  </Link>
                  <Link
                    href="/app/presentes"
                    className="mt-3 inline-block text-xs text-brava-muted hover:underline"
                  >
                    Ver todos meus vale-presentes →
                  </Link>
                </div>
              ) : (
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
                              : "border-brava-border bg-white text-brava-ink"
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
                        className="w-24 rounded-full border border-brava-border bg-white px-3 py-2 text-sm font-bold outline-none focus:border-brava-yellow"
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
                      className="mt-1 w-full rounded-xl border border-brava-border bg-white px-4 py-2.5 outline-none focus:border-brava-yellow"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-brava-ink">Mensagem</span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      placeholder="Feliz aniversário, parabéns…"
                      className="mt-1 w-full rounded-xl border border-brava-border bg-white px-4 py-2.5 outline-none focus:border-brava-yellow"
                    />
                  </label>

                  {result?.error && (
                    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{result.error}</p>
                  )}

                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    ⚠️ Modo simulação — sem cobrança real. Em breve com pagamento Efí.
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={reset}
                      className="flex-1 rounded-full border border-brava-border bg-white py-3 text-sm font-bold text-brava-ink"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || value < 10}
                      className="flex-1 rounded-full bg-brava-yellow py-3 text-sm font-bold text-brava-black disabled:opacity-60"
                    >
                      {loading ? "Processando…" : `Pagar R$ ${value}`}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
