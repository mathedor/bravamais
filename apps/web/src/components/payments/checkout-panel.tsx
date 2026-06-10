"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { PixPanel } from "./pix-panel";
import { StripeCardPanel } from "./stripe-card-panel";

type PixResult = {
  paymentId: string;
  method: "pix";
  pixCode: string;
  qrBase64: string;
  expiresAt: string;
};
type CardResult = {
  paymentId: string;
  method: "card";
  clientSecret: string;
  publishableKey: string;
};
type ActionResult<T> = T | { error: string };

interface Props {
  amountCents: number;
  successUrl: string;
  createPixAction: () => Promise<ActionResult<PixResult>>;
  createCardAction: () => Promise<ActionResult<CardResult>>;
  defaultMethod?: "pix" | "card";
}

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CheckoutPanel({
  amountCents,
  successUrl,
  createPixAction,
  createCardAction,
  defaultMethod = "pix",
}: Props) {
  const [method, setMethod] = useState<"pix" | "card">(defaultMethod);
  const [pix, setPix] = useState<PixResult | null>(null);
  const [card, setCard] = useState<CardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loadPix() {
    if (pix) return;
    startTransition(async () => {
      const r = await createPixAction();
      if ("error" in r) setError(r.error);
      else setPix(r);
    });
  }

  function loadCard() {
    if (card) return;
    startTransition(async () => {
      const r = await createCardAction();
      if ("error" in r) setError(r.error);
      else setCard(r);
    });
  }

  function selectPix() {
    setMethod("pix");
    setError(null);
    loadPix();
  }

  function selectCard() {
    setMethod("card");
    setError(null);
    loadCard();
  }

  // carrega o método padrão ao montar (só o loader assíncrono, sem setState síncrono)
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (defaultMethod === "card") loadCard();
    else loadPix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-brava-border bg-brava-paper p-1">
        <Tab active={method === "pix"} onClick={selectPix} label="PIX" sub="na hora" />
        <Tab active={method === "card"} onClick={selectCard} label="Cartão" sub="Apple / Google Pay" />
      </div>

      <p className="text-center text-sm text-brava-muted">
        Total: <span className="font-black text-brava-ink">{brl(amountCents)}</span>
      </p>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {pending && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-brava-border bg-brava-paper p-8 text-sm text-brava-muted">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brava-yellow border-t-transparent" />
          Preparando pagamento…
        </div>
      )}

      {!pending && method === "pix" && pix && (
        <PixPanel
          paymentId={pix.paymentId}
          pixCode={pix.pixCode}
          qrBase64={pix.qrBase64}
          expiresAt={pix.expiresAt}
          successUrl={successUrl}
        />
      )}

      {!pending && method === "card" && card && (
        <StripeCardPanel
          paymentId={card.paymentId}
          clientSecret={card.clientSecret}
          publishableKey={card.publishableKey}
          successUrl={successUrl}
        />
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-center transition ${
        active ? "bg-brava-black text-white" : "text-brava-ink hover:bg-white"
      }`}
    >
      <span className="block text-sm font-bold">{label}</span>
      <span className={`block text-[10px] ${active ? "text-white/70" : "text-brava-muted"}`}>{sub}</span>
    </button>
  );
}
