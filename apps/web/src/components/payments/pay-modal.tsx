"use client";

import { CheckoutPanel } from "./checkout-panel";

type PixResult = { paymentId: string; method: "pix"; pixCode: string; qrBase64: string; expiresAt: string };
type CardResult = { paymentId: string; method: "card"; clientSecret: string; publishableKey: string };
type ActionResult<T> = T | { error: string };

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  amountCents: number;
  successUrl: string;
  createPixAction: () => Promise<ActionResult<PixResult>>;
  createCardAction: () => Promise<ActionResult<CardResult>>;
  defaultMethod?: "pix" | "card";
}

/** Modal de pagamento reutilizável (controlado). Usa o CheckoutPanel (PIX + cartão). */
export function PayModal({
  open,
  onClose,
  title,
  amountCents,
  successUrl,
  createPixAction,
  createCardAction,
  defaultMethod,
}: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-brava-card p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black text-brava-ink">{title}</h3>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-brava-muted hover:text-brava-ink"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <CheckoutPanel
          amountCents={amountCents}
          successUrl={successUrl}
          createPixAction={createPixAction}
          createCardAction={createCardAction}
          defaultMethod={defaultMethod}
        />
      </div>
    </div>
  );
}
