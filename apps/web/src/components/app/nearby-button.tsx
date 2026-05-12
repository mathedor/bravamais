"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { useLocation } from "./location-context";

export function NearbyButton() {
  const { location, loading, requestLocation } = useLocation();
  const router = useRouter();
  const [pending, start] = useTransition();

  async function handleClick(e: React.MouseEvent) {
    if (location) return; // deixa o Link agir naturalmente
    e.preventDefault();
    await requestLocation();
    start(() => router.push("/app/proximos"));
  }

  const ready = !!location;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Link
        href="/app/proximos"
        onClick={handleClick}
        className="relative flex items-center justify-between gap-3 overflow-hidden rounded-3xl bg-gradient-to-br from-brava-yellow via-amber-400 to-brava-yellow-deep p-5 text-brava-black shadow-xl shadow-brava-yellow/30 transition"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brava-card/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-brava-blue/20 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <motion.span
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={loading ? { duration: 1.5, repeat: Infinity, ease: "linear" } : {}}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brava-black/80 text-3xl text-brava-yellow shadow-lg"
          >
            📍
          </motion.span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brava-blue">
              {ready ? "Pronto" : pending ? "Indo…" : "Em segundos"}
            </p>
            <p className="mt-0.5 text-xl font-black leading-tight">Próximo a mim</p>
            <p className="text-xs text-brava-black/70">
              {ready ? "Toque pra ver perto" : "Liberar localização + ver mais perto"}
            </p>
          </div>
        </div>

        <span className="relative shrink-0 rounded-full bg-brava-black px-4 py-2 text-xs font-bold text-brava-yellow shadow-md">
          {loading || pending ? "…" : "Ver →"}
        </span>
      </Link>
    </motion.div>
  );
}
