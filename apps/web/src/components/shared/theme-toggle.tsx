"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTheme, type ThemeMode } from "./theme-provider";

const OPTIONS: { value: ThemeMode; label: string; emoji: string }[] = [
  { value: "light", label: "Claro", emoji: "☀️" },
  { value: "dark", label: "Escuro", emoji: "🌙" },
  { value: "system", label: "Sistema", emoji: "💻" },
];

interface Props {
  variant?: "light" | "dark";
}

export function ThemeToggle({ variant = "light" }: Props) {
  const { theme, setTheme, resolved } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDarkVar = variant === "dark";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Trocar tema"
        className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition sm:h-9 sm:w-9 ${
          isDarkVar
            ? "border-white/15 bg-white/5 hover:bg-white/10"
            : "border-brava-border bg-brava-card hover:bg-brava-paper"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={resolved}
            initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-base"
          >
            {resolved === "dark" ? "🌙" : "☀️"}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-brava-border bg-brava-card shadow-2xl"
          >
            <ul className="py-1">
              {OPTIONS.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition ${
                      theme === opt.value
                        ? "bg-brava-yellow/30 font-bold text-brava-ink"
                        : "text-brava-ink hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="text-base">{opt.emoji}</span>
                    <span className="flex-1">{opt.label}</span>
                    {theme === opt.value && <span className="text-brava-blue">✓</span>}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
