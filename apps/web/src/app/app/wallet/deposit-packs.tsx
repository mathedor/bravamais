"use client";

import { useState } from "react";
import { createWalletDepositPix, createWalletDepositCard } from "@/app/api/tools/actions";
import { PayModal } from "@/components/payments/pay-modal";

interface Pack {
  id: string;
  label: string;
  deposit_cents: number;
  bonus_cents: number;
}

function brl(c: number) {
  return `R$ ${(c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function DepositPacks({ packs }: { packs: Pack[] }) {
  const [selected, setSelected] = useState<Pack | null>(null);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {packs.map((p) => {
          const bonusPct = ((p.bonus_cents / p.deposit_cents) * 100).toFixed(0);
          return (
            <div
              key={p.id}
              className="rounded-2xl border-2 border-brava-border bg-brava-card p-4 transition hover:border-brava-yellow"
            >
              <div className="text-xs font-bold uppercase text-brava-blue">{p.label}</div>
              <div className="mt-2 text-2xl font-black">{brl(p.deposit_cents + p.bonus_cents)}</div>
              <div className="text-xs text-brava-muted">
                Você paga {brl(p.deposit_cents)} · <span className="font-bold text-green-700">+{bonusPct}% bônus</span>
              </div>
              <button
                type="button"
                onClick={() => setSelected(p)}
                className="mt-3 w-full rounded-lg bg-brava-blue px-3 py-2 text-sm font-bold text-white hover:bg-brava-blue-bright"
              >
                Recarregar
              </button>
            </div>
          );
        })}
      </div>

      <PayModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Depositar — ${selected.label}` : "Depositar"}
        amountCents={selected?.deposit_cents ?? 0}
        successUrl="/app/wallet"
        createPixAction={() => createWalletDepositPix(selected!.id)}
        createCardAction={() => createWalletDepositCard(selected!.id)}
      />
    </>
  );
}
