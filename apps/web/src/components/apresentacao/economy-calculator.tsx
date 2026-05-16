"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

interface Habit {
  id: string;
  emoji: string;
  label: string;
  unitLabel: string;
  defaultUnitPriceCents: number;
  defaultFrequency: number; // por mês
  discountPercent: number;
  maxFrequency: number;
}

const HABITS: Habit[] = [
  { id: "cafe",       emoji: "☕",  label: "Café/lanche",       unitLabel: "lanches/mês",  defaultUnitPriceCents: 1800,  defaultFrequency: 16, discountPercent: 15, maxFrequency: 30 },
  { id: "almoco",     emoji: "🥗",  label: "Almoço fora",       unitLabel: "almoços/mês",  defaultUnitPriceCents: 5000,  defaultFrequency: 8,  discountPercent: 12, maxFrequency: 22 },
  { id: "jantar",     emoji: "🍝",  label: "Jantar / bar",      unitLabel: "vezes/mês",    defaultUnitPriceCents: 12000, defaultFrequency: 4,  discountPercent: 15, maxFrequency: 12 },
  { id: "academia",   emoji: "🏋️", label: "Academia / esporte", unitLabel: "mensalidade", defaultUnitPriceCents: 13000, defaultFrequency: 1,  discountPercent: 20, maxFrequency: 1  },
  { id: "beleza",     emoji: "💇",  label: "Corte / beleza",    unitLabel: "vezes/mês",    defaultUnitPriceCents: 6000,  defaultFrequency: 1,  discountPercent: 15, maxFrequency: 4  },
  { id: "pet",        emoji: "🐶",  label: "Pet shop",          unitLabel: "vezes/mês",    defaultUnitPriceCents: 8000,  defaultFrequency: 1,  discountPercent: 18, maxFrequency: 4  },
  { id: "delivery",   emoji: "🛵",  label: "Delivery em casa",  unitLabel: "pedidos/mês",  defaultUnitPriceCents: 4500,  defaultFrequency: 6,  discountPercent: 12, maxFrequency: 20 },
  { id: "presente",   emoji: "🎁",  label: "Presentes / vale",  unitLabel: "vezes/mês",    defaultUnitPriceCents: 8000,  defaultFrequency: 1,  discountPercent: 10, maxFrequency: 4  },
];

const PLAN_PRICES = [
  { tier: "Básico",  cents: 1990, color: "bg-zinc-100 text-zinc-900" },
  { tier: "Premium", cents: 3990, color: "bg-brava-blue text-white" },
  { tier: "VIP",     cents: 7990, color: "bg-brava-yellow text-brava-black" },
];

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function EconomyCalculator() {
  const [freq, setFreq] = useState<Record<string, number>>(
    () => Object.fromEntries(HABITS.map((h) => [h.id, h.defaultFrequency])),
  );

  const breakdown = useMemo(() => {
    return HABITS.map((h) => {
      const f = freq[h.id] ?? h.defaultFrequency;
      const gross = f * h.defaultUnitPriceCents;
      const savings = Math.round(gross * (h.discountPercent / 100));
      return { ...h, frequency: f, gross, savings };
    });
  }, [freq]);

  const totalGross = breakdown.reduce((s, b) => s + b.gross, 0);
  const totalSavings = breakdown.reduce((s, b) => s + b.savings, 0);

  const coinsCashback = Math.round(totalGross * 0.01); // 1% em coins ≈ valor em centavos como base
  const totalWithCoins = totalSavings + coinsCashback;
  const yearlySavings = totalWithCoins * 12;

  return (
    <div className="overflow-hidden rounded-3xl border border-brava-border bg-white shadow-2xl">
      {/* HEADER */}
      <div className="border-b border-brava-border bg-gradient-to-r from-brava-yellow/20 via-brava-yellow/10 to-transparent px-6 py-5 sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-blue">Calculadora real</p>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
          Quanto você economizaria por mês?
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          Ajuste a frequência de cada hábito. Os descontos médios são os praticados pelos parceiros BRAVA+.
        </p>
      </div>

      {/* GRID */}
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-brava-border">
          {breakdown.map((h) => (
            <div key={h.id} className="grid gap-2 px-6 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:px-8">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{h.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-zinc-900">{h.label}</p>
                    <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                      {formatBRL(h.defaultUnitPriceCents)} cada · -{h.discountPercent}% nos parceiros
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={h.maxFrequency}
                    value={h.frequency}
                    onChange={(e) => setFreq((c) => ({ ...c, [h.id]: parseInt(e.target.value, 10) }))}
                    className="flex-1 accent-brava-yellow"
                  />
                  <span className="w-28 shrink-0 text-right text-xs font-bold text-zinc-700">
                    {h.frequency} {h.unitLabel.split("/")[0]}
                  </span>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">economia/mês</p>
                <p className="font-mono text-xl font-black text-emerald-600">
                  {formatBRL(h.savings)}
                </p>
                <p className="text-[10px] text-zinc-500">
                  de {formatBRL(h.gross)} gastos
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL CARD */}
        <aside className="bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue p-6 text-white sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-yellow">Seu mês com BRAVA+</p>
          <p className="mt-3 text-4xl font-black sm:text-5xl">
            {formatBRL(totalSavings)}
          </p>
          <p className="text-xs text-white/60">de desconto direto</p>

          <div className="mt-5 rounded-2xl bg-white/5 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-white/70">+ 1% em BRAVA Coins</span>
              <span className="font-mono text-sm font-bold text-emerald-300">
                {formatBRL(coinsCashback)}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-2">
              <span className="text-sm font-bold text-white">Total economizado</span>
              <span className="font-mono text-xl font-black text-emerald-300">
                {formatBRL(totalWithCoins)}
              </span>
            </div>
          </div>

          <motion.div
            key={yearlySavings}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-5 rounded-2xl border border-brava-yellow/40 bg-brava-yellow/10 p-4 text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-brava-yellow">No ano</p>
            <p className="mt-1 text-3xl font-black text-brava-yellow">
              {formatBRL(yearlySavings)}
            </p>
            <p className="mt-1 text-[11px] text-white/60">de sobra no bolso</p>
          </motion.div>

          {/* Comparativo planos */}
          <div className="mt-6 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-white/60">
              vs. mensalidade BRAVA+
            </p>
            {PLAN_PRICES.map((p) => {
              const surplus = totalWithCoins - p.cents;
              const positive = surplus > 0;
              return (
                <div
                  key={p.tier}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"
                >
                  <span className="text-xs font-bold text-white">
                    {p.tier} · {formatBRL(p.cents)}
                  </span>
                  <span
                    className={`font-mono text-xs font-black ${
                      positive ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {positive ? "+" : ""}{formatBRL(surplus)}
                  </span>
                </div>
              );
            })}
            <p className="mt-3 text-[11px] leading-relaxed text-white/60">
              💡 O Básico já paga sozinho com 1-2 cupons no mês. O resto é
              lucro real no seu bolso.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
