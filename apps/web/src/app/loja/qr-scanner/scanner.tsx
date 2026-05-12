"use client";

import { useState, useCallback } from "react";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { scanCodeAction, type ScanResult } from "./actions";

export function QRScanner() {
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manual, setManual] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = useCallback(async (codes: IDetectedBarcode[]) => {
    if (paused || loading || !codes[0]?.rawValue) return;
    setPaused(true);
    setLoading(true);
    try {
      const r = await scanCodeAction(codes[0].rawValue);
      setResult(r);
    } finally {
      setLoading(false);
    }
  }, [paused, loading]);

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manual.trim()) return;
    setLoading(true);
    try {
      const r = await scanCodeAction(manual.trim());
      setResult(r);
      setPaused(true);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setManual("");
    setPaused(false);
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border-2 border-brava-yellow bg-black" style={{ aspectRatio: "1/1" }}>
        {!paused ? (
          <Scanner
            onScan={handleScan}
            onError={(err) => console.error(err)}
            constraints={{ facingMode: "environment" }}
            scanDelay={500}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-brava-black p-8 text-center text-white">
            {loading ? (
              <p className="text-lg">Validando…</p>
            ) : result?.ok && result.kind === "visit" ? (
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-4xl">✓</div>
                <p className="text-lg font-bold">Visita registrada</p>
                <p className="text-white/80">{result.user.name ?? "Assinante"}</p>
                {result.loyalty && (
                  <div className="rounded-2xl bg-white/10 p-4 text-sm">
                    <p className="text-brava-yellow">Clube de fidelidade</p>
                    <p className="mt-1 text-2xl font-black">{result.loyalty.current} / {result.loyalty.required}</p>
                    {result.loyalty.just_completed && (
                      <p className="mt-2 font-bold text-brava-yellow">🎉 Cliente completou o ciclo!</p>
                    )}
                  </div>
                )}
              </div>
            ) : result?.ok && result.kind === "reward" ? (
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brava-yellow text-4xl text-brava-blue">🎁</div>
                <p className="text-lg font-bold">Prêmio validado</p>
                <p className="text-white/80">{result.user.name ?? "Cliente"}</p>
                <div className="rounded-2xl bg-brava-yellow/10 border border-brava-yellow/40 p-4 text-sm">
                  <p className="text-brava-yellow">Recompensa</p>
                  <p className="mt-1 text-base font-bold">{result.benefit}</p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-3">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-4xl">✗</div>
                <p className="text-lg font-bold">Erro</p>
                <p className="text-white/80">{result.error}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {paused && (
        <button onClick={reset} className="w-full rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black">
          Ler outro
        </button>
      )}

      <p className="rounded-2xl bg-brava-paper px-4 py-3 text-xs text-brava-muted">
        💡 Aceita carteirinha do cliente (visita) <strong>e</strong> código de prêmio (REWARD-...) no mesmo lugar.
      </p>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-ink">
          Digitar código manualmente
        </summary>
        <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value.toUpperCase())}
            placeholder="QR da carteirinha ou REWARD-..."
            className="flex-1 rounded-xl border border-brava-border bg-brava-card px-3 py-2 text-sm uppercase outline-none focus:border-brava-yellow"
          />
          <button type="submit" disabled={loading || !manual.trim()} className="rounded-xl bg-brava-blue px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            Validar
          </button>
        </form>
      </details>
    </div>
  );
}
