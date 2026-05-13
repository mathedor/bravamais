"use client";

import { useState, useTransition } from "react";
import { createShareLinkAction } from "./share-coupon-actions";

export function ShareCouponFriendButton({ couponId, couponCode }: { couponId: string; couponCode: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");

  function fire() {
    const fd = new FormData();
    fd.append("coupon_id", couponId);
    fd.append("recipient_hint", recipient);
    startTransition(async () => {
      const r = await createShareLinkAction(fd);
      if (r.ok && r.url) setShareUrl(r.url);
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-[11px] font-bold text-brava-ink hover:bg-brava-paper">
        🎁 Enviar pra um amigo
      </button>
    );
  }

  if (shareUrl) {
    const waText = `Te mandei um cupom do BRAVA+! 🎁 Resgata aqui: ${shareUrl}`;
    return (
      <div className="rounded-2xl bg-brava-yellow/15 p-3">
        <p className="text-xs font-bold text-brava-ink">Link gerado · expira em 14 dias</p>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-brava-card p-2">
          <input readOnly value={shareUrl} className="flex-1 bg-transparent font-mono text-[10px] text-brava-ink outline-none" />
          <button type="button" onClick={() => navigator.clipboard.writeText(shareUrl)} className="rounded-full bg-brava-blue px-3 py-1 text-[10px] font-bold text-white">
            Copiar
          </button>
        </div>
        <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noreferrer" className="mt-2 block w-full rounded-full bg-emerald-500 px-4 py-2 text-center text-xs font-bold text-white">
          📱 Enviar pelo WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-brava-paper p-3">
      <p className="text-xs font-bold text-brava-ink">Quer mandar o cupom <code>{couponCode}</code> pra alguém?</p>
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Nome do amigo (opcional)"
        className="mt-2 w-full rounded-lg border border-brava-border bg-brava-card px-2 py-1.5 text-xs outline-none"
      />
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-[11px] font-bold">
          Cancelar
        </button>
        <button type="button" onClick={fire} disabled={pending} className="flex-1 rounded-full bg-brava-blue px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60">
          {pending ? "..." : "Gerar link"}
        </button>
      </div>
    </div>
  );
}
