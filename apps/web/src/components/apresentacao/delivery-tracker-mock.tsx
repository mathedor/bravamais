"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Stage {
  label: string;
  emoji: string;
  time: string;
  done: boolean;
}

export function DeliveryTrackerMock() {
  // Posição do entregador no path (0 → 100%)
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0; // reinicia
        return p + 0.6;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [paused]);

  const stages: Stage[] = [
    { label: "Pedido recebido", emoji: "🛒", time: "19:02", done: progress > 0 },
    { label: "Em preparação", emoji: "👨‍🍳", time: "19:08", done: progress > 15 },
    { label: "Saiu pra entrega", emoji: "🛵", time: "19:21", done: progress > 35 },
    { label: "A caminho",         emoji: "📍", time: "agora", done: progress > 35 && progress < 95 },
    { label: "Entregue",          emoji: "✅", time: "—",     done: progress >= 95 },
  ];

  // Posição animada do entregador no mapa (path simples curvo)
  const x = 10 + progress * 0.8; // % horizontal
  const y = 80 - Math.sin((progress / 100) * Math.PI) * 50; // arco

  return (
    <div className="overflow-hidden rounded-3xl border border-brava-border bg-white shadow-2xl">
      <div className="border-b border-brava-border bg-gradient-to-r from-brava-yellow/15 to-amber-50/50 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-blue">Demo ao vivo</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
              Cliente acompanha cada minuto
            </h3>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="rounded-full bg-brava-black px-4 py-2 text-xs font-bold text-white"
          >
            {paused ? "▶ Continuar" : "⏸ Pausar"}
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        {/* MAPA simulado */}
        <div className="relative h-96 overflow-hidden bg-gradient-to-br from-blue-50 via-zinc-50 to-amber-50 lg:h-auto">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {/* Grid de ruas */}
            {[20, 40, 60, 80].map((v) => (
              <line key={`h${v}`} x1="0" x2="100" y1={v} y2={v} stroke="#e4e4e7" strokeWidth="0.2" />
            ))}
            {[20, 40, 60, 80].map((v) => (
              <line key={`v${v}`} x1={v} x2={v} y1="0" y2="100" stroke="#e4e4e7" strokeWidth="0.2" />
            ))}
            {/* Path do entregador */}
            <path d="M 10 80 Q 50 0, 90 80" stroke="#FBBF24" strokeWidth="0.6" strokeDasharray="1.5 1" fill="none" />
          </svg>

          {/* Pin da loja (origem) */}
          <div className="absolute bottom-[20%] left-[10%]">
            <div className="grid h-10 w-10 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full bg-brava-blue text-lg shadow-lg ring-4 ring-white">
              🏪
            </div>
            <p className="mt-1 ml-3 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-zinc-700">
              Café Mineiro
            </p>
          </div>

          {/* Pin do cliente (destino) */}
          <div className="absolute bottom-[20%] left-[90%]">
            <div className="grid h-10 w-10 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full bg-emerald-500 text-lg shadow-lg ring-4 ring-white">
              🏠
            </div>
            <p className="mt-1 -ml-12 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-zinc-700">
              Casa do cliente
            </p>
          </div>

          {/* Entregador animado */}
          <motion.div
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
            transition={{ duration: 0.05, ease: "linear" }}
          >
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-brava-yellow opacity-30" />
              <div className="relative grid h-12 w-12 place-items-center rounded-full border-4 border-brava-blue bg-brava-yellow text-2xl shadow-2xl">
                🛵
              </div>
            </div>
          </motion.div>

          {/* Badge "ao vivo" */}
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brava-blue shadow-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            GPS ao vivo
          </div>

          {/* ETA */}
          <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-2 shadow-md backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">ETA</p>
            <p className="text-base font-black text-zinc-900">
              {Math.max(0, Math.round(15 - (progress / 100) * 15))} min
            </p>
          </div>
        </div>

        {/* Timeline + código */}
        <aside className="bg-zinc-50 p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-blue">Status</p>
          <ul className="mt-4 space-y-3">
            {stages.map((s) => (
              <li key={s.label} className="flex items-center gap-3">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full transition ${
                    s.done ? "bg-brava-yellow text-brava-black" : "bg-zinc-200 text-zinc-400"
                  }`}
                >
                  {s.emoji}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${s.done ? "text-zinc-900" : "text-zinc-400"}`}>
                    {s.label}
                  </p>
                  <p className="text-[11px] text-zinc-500">{s.time}</p>
                </div>
              </li>
            ))}
          </ul>

          <AnimatePresence>
            {progress >= 95 && (
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-6 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50 p-4 text-center"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Código de confirmação
                </p>
                <p className="mt-1 font-mono text-3xl font-black text-emerald-700">4729</p>
                <p className="mt-2 text-[11px] text-emerald-700/70">
                  Cliente fala pro entregador. Só assim entrega marca como concluída.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Pedido</p>
            <p className="mt-1 text-sm font-bold text-zinc-900">2× Cappuccino + 1 Pão de queijo</p>
            <p className="text-xs text-zinc-500">R$ 28,50 + R$ 6 entrega</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
