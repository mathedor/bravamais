"use client";

import { useState, useTransition } from "react";
import { submitReportAction } from "@/app/app/denunciar/actions";

interface Props {
  targetType: "story" | "establishment" | "review" | "message";
  targetId: string;
  label?: string;
}

export function ReportButton({ targetType, targetId, label = "🚩 Denunciar" }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function fire(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("target_type", targetType);
    fd.append("target_id", targetId);
    startTransition(async () => {
      const r = await submitReportAction(fd);
      if (r?.ok) setDone(true);
    });
  }

  if (done) {
    return <p className="text-[11px] text-emerald-700">✓ Denúncia enviada. Vamos analisar.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[10px] text-brava-muted hover:text-rose-600 hover:underline"
      >
        {label}
      </button>
    );
  }

  return (
    <form onSubmit={fire} className="mt-1 rounded-xl border border-rose-200 bg-rose-50 p-2">
      <select name="reason" required className="w-full rounded-md border border-rose-200 bg-white px-2 py-1 text-xs">
        <option value="">Motivo…</option>
        <option value="ofensivo">Conteúdo ofensivo</option>
        <option value="spam">Spam</option>
        <option value="fraude">Fraude/golpe</option>
        <option value="errado">Informação errada</option>
        <option value="outro">Outro</option>
      </select>
      <textarea name="detail" rows={2} placeholder="Detalhe (opcional)" className="mt-1 w-full rounded-md border border-rose-200 bg-white px-2 py-1 text-xs" />
      <div className="mt-1 flex gap-1">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold">
          Cancelar
        </button>
        <button type="submit" disabled={pending} className="flex-1 rounded-full bg-rose-600 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-60">
          {pending ? "..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
