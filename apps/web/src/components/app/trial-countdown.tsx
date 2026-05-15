"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  trialEndsAt: string;
  tier?: string | null;
  /** Variante de exibição. `pill` é compacto pra header; `card` é destacado pro topo da home. */
  variant?: "pill" | "card";
}

function diffToNow(target: Date) {
  const now = Date.now();
  const diffMs = target.getTime() - now;
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, expired: true, totalSeconds: 0 };
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return { days, hours, minutes, expired: false, totalSeconds };
}

/**
 * Countdown ao vivo do trial gratuito de 30 dias. Atualiza a cada minuto.
 * Some sozinho se já expirou.
 */
export function TrialCountdown({ trialEndsAt, tier, variant = "pill" }: Props) {
  const target = new Date(trialEndsAt);
  const [tick, setTick] = useState(() => diffToNow(target));

  useEffect(() => {
    const interval = setInterval(() => setTick(diffToNow(target)), 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialEndsAt]);

  if (tick.expired) return null;

  const urgent = tick.days <= 3;

  if (variant === "card") {
    return (
      <Link
        href="/assinar"
        className={`group relative block overflow-hidden rounded-3xl border p-5 transition hover:scale-[1.01] ${
          urgent
            ? "border-red-400/40 bg-red-500/10 text-white"
            : "border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brava-yellow text-2xl shadow-lg">
            🎁
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brava-yellow">
              {urgent ? "Trial acaba em" : "Trial gratuito"} {tier ? `· ${tier.toUpperCase()}` : ""}
            </p>
            <p className="mt-1 text-2xl font-black tracking-tight">
              {tick.days > 0 ? `${tick.days} dia${tick.days > 1 ? "s" : ""}` : `${tick.hours}h ${tick.minutes}m`}
              <span className="ml-2 text-sm font-normal text-white/70">
                restantes
              </span>
            </p>
            <p className="mt-0.5 text-xs text-white/70">
              {urgent ? "Faça upgrade pra não perder acesso →" : "Aproveite cupons, fidelidade e coins. Upgrade quando quiser."}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // pill (compact)
  return (
    <Link
      href="/assinar"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        urgent
          ? "border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
      }`}
      title="Trial gratuito BRAVA+"
    >
      <span>🎁</span>
      <span>
        {tick.days > 0
          ? `${tick.days}d ${tick.hours}h`
          : `${tick.hours}h ${tick.minutes}m`}
      </span>
      <span className="hidden text-white/60 sm:inline">restantes</span>
    </Link>
  );
}
