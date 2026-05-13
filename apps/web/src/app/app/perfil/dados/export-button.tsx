"use client";

import { useState } from "react";

export function ExportButton() {
  const [busy, setBusy] = useState(false);

  async function fire() {
    setBusy(true);
    try {
      const res = await fetch("/api/user-export");
      if (!res.ok) throw new Error("falhou");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brava-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Falha ao exportar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={fire}
      disabled={busy}
      className="rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
    >
      {busy ? "Gerando..." : "📥 Baixar meus dados (JSON)"}
    </button>
  );
}
