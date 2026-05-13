"use client";

import { useState } from "react";

export function CopyShareBlock({ shareUrl, shareText }: { shareUrl: string; shareText: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Entra no BRAVA+ comigo", text: shareText, url: shareUrl });
      } catch {}
    } else {
      copy();
    }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-2xl bg-brava-black/10 px-3 py-2 backdrop-blur">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 min-w-0 bg-transparent font-mono text-xs text-brava-black outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-brava-black px-3 py-1.5 text-[11px] font-bold text-brava-yellow"
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-emerald-500 px-3 py-2 text-center text-xs font-bold text-white shadow hover:bg-emerald-600"
        >
          📱 WhatsApp
        </a>
        <button
          type="button"
          onClick={nativeShare}
          className="rounded-full bg-brava-blue px-3 py-2 text-xs font-bold text-white shadow hover:opacity-90"
        >
          📤 Compartilhar
        </button>
      </div>
    </div>
  );
}
