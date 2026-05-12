"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "./location-context";

export function LocationPill() {
  const { location, loading, requestLocation, error } = useLocation();

  return (
    <AnimatePresence mode="wait">
      {location ? (
        <motion.button
          key="set"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          onClick={requestLocation}
          className="inline-flex items-center gap-2 rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-xs font-medium text-brava-ink shadow-sm transition hover:border-brava-blue hover:bg-brava-paper"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-brava-blue opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-brava-blue" />
          </span>
          <span className="max-w-[140px] truncate">
            {location.city ? `${location.city}/${location.state ?? ""}` : "Localização ativa"}
          </span>
        </motion.button>
      ) : (
        <motion.button
          key="enable"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          onClick={requestLocation}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-brava-blue px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brava-blue-bright disabled:opacity-60"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s-8-8-8-13a8 8 0 1 1 16 0c0 5-8 13-8 13Z" />
            <circle cx="12" cy="9" r="3" />
          </svg>
          {loading ? "Localizando…" : error ? "Tentar de novo" : "Localização"}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
