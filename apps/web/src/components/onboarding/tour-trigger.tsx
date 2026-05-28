"use client";

import { motion } from "framer-motion";
import type { TourRole } from "@/app/api/onboarding-tour/actions";

/** Botão "🎓 Tour" pra dropdown do usuário ou header. */
export function TourTrigger({
  role,
  variant = "icon",
}: {
  role: TourRole;
  variant?: "icon" | "menuItem";
}) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent(`open-onboarding-tour:${role}`));
  };

  if (variant === "menuItem") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-brava-ink hover:bg-brava-yellow/15"
      >
        <span>🎓</span>
        <span className="flex-1">Tour completo</span>
        <span className="text-[10px] text-brava-muted">REABRIR</span>
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={handleClick}
      title="Reabrir tour completo"
      aria-label="Reabrir tour completo"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-brava-border bg-brava-card text-brava-muted transition hover:border-brava-yellow hover:bg-brava-yellow/10 hover:text-brava-ink sm:h-9 sm:w-9"
    >
      <span className="text-base">🎓</span>
    </motion.button>
  );
}
