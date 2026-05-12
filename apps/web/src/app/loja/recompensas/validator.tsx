"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRewardAction, type UseRewardResult } from "./actions";

export function RewardValidator() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<UseRewardResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const r = await useRewardAction(code.trim());
      setResult(r);
      if (r.ok) setCode("");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Código do prêmio</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="REWARD-XXXXXXXXXX"
            className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-3 font-mono uppercase outline-none focus:border-brava-yellow"
          />
        </label>
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full rounded-full bg-brava-yellow px-5 py-3 text-sm font-bold text-brava-black disabled:opacity-60"
        >
          {loading ? "Validando…" : "Validar prêmio"}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-3xl border p-5 ${
              result.ok
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            {result.ok ? (
              <>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-2xl text-white">
                  ✓
                </div>
                <p className="text-lg font-black text-green-900">Prêmio validado</p>
                <p className="mt-1 text-sm text-green-800">
                  Para: <strong>{result.user_name ?? "cliente BRAVA+"}</strong>
                </p>
                <p className="mt-3 rounded-xl bg-brava-card px-3 py-2 text-sm text-green-900">
                  🎁 {result.benefit}
                </p>
                <p className="mt-3 text-xs text-green-700">Notificação enviada ao cliente.</p>
                <button
                  onClick={reset}
                  className="mt-4 inline-flex rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white"
                >
                  Validar outro
                </button>
              </>
            ) : (
              <>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-2xl text-white">
                  ✗
                </div>
                <p className="text-lg font-black text-red-900">Erro</p>
                <p className="mt-1 text-sm text-red-800">{result.error}</p>
                <button
                  onClick={reset}
                  className="mt-4 inline-flex rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white"
                >
                  Tentar de novo
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
