"use client";

import { useState } from "react";

export function LinkRow({
  url,
  label,
  meta,
  tone,
  deleteAction,
}: {
  url: string;
  label: string;
  meta?: string;
  tone?: "yellow" | "blue";
  deleteAction?: () => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const cls = tone === "yellow"
    ? "border-brava-yellow/50 bg-brava-yellow/5"
    : tone === "blue"
    ? "border-brava-blue/40 bg-brava-blue/5"
    : "border-brava-border bg-brava-card";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Oi! Te mandei o link pra você se cadastrar no BRAVA+: ${url}`)}`, "_blank");
  };

  return (
    <div className={`rounded-xl border ${cls} p-3`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-brava-ink">{label}</div>
          <div className="truncate font-mono text-[11px] text-brava-muted">{url}</div>
          {meta && <div className="mt-0.5 text-[10px] text-brava-muted">{meta}</div>}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-brava-border bg-brava-card px-2 py-1 text-[10px] font-bold text-brava-ink hover:bg-brava-paper"
          >
            {copied ? "✓ copiado" : "Copiar"}
          </button>
          <button
            type="button"
            onClick={handleWA}
            className="rounded-lg bg-green-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-green-700"
          >
            WhatsApp
          </button>
          {deleteAction && (
            <form action={deleteAction}>
              <button type="submit" className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-100">
                ✕
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
