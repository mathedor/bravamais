"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useRenewableGrantAction } from "@/app/api/renewable/actions";

type Grant = {
  id: string;
  kind: "percent" | "voucher";
  value: number;
  headline: string;
  code: string;
  status: string;
  expires_at: string;
  min_order_cents: number | null;
  establishment: { name: string; slug: string; logo_url: string | null; city: string | null } | null;
};

export function BenefitCard({ grant }: { grant: Grant }) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [pending, startTransition] = useTransition();

  const bigValue = grant.kind === "percent" ? `${Number(grant.value)}%` : `R$ ${(Number(grant.value) / 100).toFixed(0)}`;
  const diasRestantes = Math.max(0, Math.ceil((new Date(grant.expires_at).getTime() - Date.now()) / 86400000));
  const artUrl = `/api/renewable/art/${grant.id}`;

  const handleUse = () => {
    if (!confirm("Marcar como usado? Só faça isso ao apresentar pro lojista no caixa.")) return;
    startTransition(async () => {
      await useRenewableGrantAction(grant.id);
      router.refresh();
    });
  };

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-brava-yellow/50 bg-brava-card shadow-lg">
      {/* arte gerada automaticamente */}
      <div className="relative aspect-square w-full bg-gradient-to-br from-brava-black to-brava-blue">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artUrl} alt={grant.headline} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute right-3 top-3 rounded-full bg-brava-yellow px-2.5 py-1 text-[10px] font-black text-brava-black">
          renova em {diasRestantes}d
        </div>
      </div>

      <div className="p-4">
        <div className="text-lg font-black text-brava-ink">{grant.headline}</div>
        <div className="text-xs text-brava-muted">{grant.establishment?.name} {grant.establishment?.city && `· ${grant.establishment.city}`}</div>
        {grant.min_order_cents && (
          <div className="mt-1 text-[11px] text-brava-muted">Pedido mínimo: R$ {(grant.min_order_cents / 100).toFixed(2)}</div>
        )}

        {revealed ? (
          <div className="mt-3 rounded-xl border-2 border-dashed border-brava-yellow bg-brava-yellow/10 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-brava-muted">apresente este código</div>
            <div className="font-mono text-2xl font-black tracking-widest text-brava-ink">{grant.code}</div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-3 w-full rounded-xl bg-brava-blue px-4 py-2.5 text-sm font-black text-white hover:bg-brava-blue-bright"
          >
            🎁 Usar benefício ({bigValue})
          </button>
        )}

        {revealed && (
          <button
            type="button"
            onClick={handleUse}
            disabled={pending}
            className="mt-2 w-full rounded-xl border-2 border-green-500 bg-green-50 px-4 py-2 text-sm font-black text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            {pending ? "marcando…" : "✓ Já usei (marcar como resgatado)"}
          </button>
        )}

        <a
          href={artUrl}
          target="_blank"
          rel="noopener"
          className="mt-2 block text-center text-[11px] text-brava-muted hover:text-brava-blue"
        >
          ↓ baixar arte pra compartilhar
        </a>
      </div>
    </div>
  );
}
