"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface UserMenuLink {
  href: string;
  label: string;
  emoji?: string;
}

interface Props {
  initials: string;
  name: string;
  email?: string | null;
  badge?: string;
  links: UserMenuLink[];
  signOutAction: () => Promise<void>;
  variant?: "light" | "dark";
}

export function UserMenu({ initials, name, email, badge, links, signOutAction, variant = "light" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDark = variant === "dark";

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
        className={`flex items-center gap-2 rounded-full px-2 py-1.5 transition ${
          isDark
            ? "border border-white/15 bg-white/5 hover:bg-white/10"
            : "border border-brava-border bg-brava-card hover:bg-brava-paper"
        }`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brava-yellow to-amber-500 text-xs font-black text-brava-blue">
          {initials}
        </span>
        <span className={`hidden text-xs font-bold sm:inline-block ${isDark ? "text-white" : "text-brava-ink"}`}>
          {name}
        </span>
        {badge && (
          <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold uppercase sm:inline-flex ${
            isDark ? "bg-brava-yellow text-brava-black" : "bg-brava-blue text-white"
          }`}>
            {badge}
          </span>
        )}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`hidden transition-transform sm:block ${open ? "rotate-180" : ""} ${isDark ? "text-white/60" : "text-brava-muted"}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-brava-border bg-brava-card shadow-2xl"
          >
            <div className="border-b border-brava-border bg-brava-paper px-4 py-3">
              <p className="text-sm font-bold text-brava-ink">{name}</p>
              {email && <p className="truncate text-xs text-brava-muted">{email}</p>}
            </div>
            <ul className="py-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-brava-ink hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {l.emoji && <span>{l.emoji}</span>}
                    <span className="flex-1">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <form action={signOutAction} className="border-t border-brava-border">
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15"
              >
                <span>🚪</span>
                <span>Sair</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
