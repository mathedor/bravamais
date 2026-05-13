"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { spinAction } from "./actions";

interface Prize {
  id: string;
  label: string;
  kind: "coupon" | "coins" | "nothing";
  weight: number;
  value?: number;
}

export function Roleta({
  drawId,
  prizes,
  canSpin: initialCanSpin,
  establishmentSlug,
}: {
  drawId: string;
  prizes: Prize[];
  canSpin: boolean;
  establishmentSlug: string;
}) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ label: string; kind: string; couponCode?: string; coins?: number } | null>(null);
  const [canSpin, setCanSpin] = useState(initialCanSpin);
  const [error, setError] = useState<string | null>(null);

  const slice = 360 / Math.max(1, prizes.length);
  const colors = ["#FFD400", "#0B6BFF", "#FF8A1E", "#1B1B1F", "#FF4D6D", "#10B981", "#9333EA", "#06B6D4"];

  function fire() {
    if (!canSpin || spinning || pending) return;
    setError(null);
    setSpinning(true);
    setResult(null);

    startTransition(async () => {
      const res = await spinAction(drawId);
      if (!res.ok) {
        setError(res.error);
        setSpinning(false);
        return;
      }
      // animate roulette to the prize slice
      const winIdx = prizes.findIndex((p) => p.id === res.prizeId);
      const targetMid = winIdx * slice + slice / 2;
      // 5 full rotations + arrive at top (-targetMid - 90 normalization)
      const finalAngle = 360 * 5 + (360 - targetMid - 90 + 360) % 360;
      setAngle((prev) => prev + finalAngle);

      setTimeout(() => {
        setResult({ label: res.prizeLabel, kind: res.prizeKind, couponCode: res.couponCode, coins: res.coinsGranted });
        setSpinning(false);
        setCanSpin(false);
      }, 4200);
    });
  }

  return (
    <div className="mt-6">
      <div className="relative mx-auto aspect-square w-full max-w-xs">
        {/* Pointer */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-2">
          <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-brava-black drop-shadow" />
        </div>
        {/* Wheel */}
        <div
          className="relative h-full w-full overflow-hidden rounded-full border-[6px] border-brava-black shadow-2xl shadow-brava-yellow/30 transition-transform duration-[4000ms] ease-out"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {prizes.map((p, i) => {
            const rot = i * slice;
            const color = colors[i % colors.length];
            return (
              <div
                key={p.id + i}
                className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-bottom-left"
                style={{
                  transform: `rotate(${rot}deg) skewY(${slice - 90}deg)`,
                  background: color,
                }}
              >
                <span
                  className="absolute left-2 top-2 max-w-[80px] truncate text-[10px] font-black uppercase"
                  style={{ color: i % 2 === 0 ? "#1B1B1F" : "#fff", transform: `skewY(${90 - slice}deg) rotate(${slice / 2}deg)` }}
                >
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Center hub */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-brava-black bg-brava-yellow p-3 shadow-xl">
          <span className="text-3xl">🎰</span>
        </div>
      </div>

      <button
        type="button"
        onClick={fire}
        disabled={!canSpin || spinning || pending}
        className="mt-6 w-full rounded-full bg-gradient-to-br from-brava-yellow to-amber-500 px-6 py-4 text-base font-black text-brava-black shadow-xl shadow-brava-yellow/40 disabled:opacity-60"
      >
        {spinning || pending ? "Girando..." : canSpin ? "🚀 Girar a roleta" : "Volte amanhã 🌅"}
      </button>

      {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-center text-xs text-rose-700">{error}</p>}

      {result && (
        <div className="mt-5 rounded-3xl border-2 border-brava-yellow bg-gradient-to-br from-brava-yellow/30 to-amber-100 p-5 text-center">
          <p className="text-6xl">{result.kind === "nothing" ? "🥲" : "🎉"}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-brava-blue">Resultado</p>
          <p className="mt-1 text-2xl font-black text-brava-ink">{result.label}</p>
          {result.couponCode && (
            <p className="mt-3 inline-block rounded-lg bg-brava-black px-3 py-1.5 font-mono text-sm font-bold text-brava-yellow">
              {result.couponCode}
            </p>
          )}
          {result.coins ? (
            <p className="mt-2 text-sm text-brava-ink">+{result.coins} 🪙 BRAVA Coins creditados</p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Link href="/app/carteira" className="flex-1 rounded-full bg-brava-blue px-3 py-2 text-xs font-bold text-white">
              Ver na carteira
            </Link>
            <Link href={`/app/estabelecimento/${establishmentSlug}`} className="flex-1 rounded-full border border-brava-border bg-brava-card px-3 py-2 text-xs font-bold">
              Voltar pra loja
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
