"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { placeOrderAction, getDeliveryQuote } from "./actions";
import { formatBRL } from "@/lib/format";
import { PixPanel } from "@/components/payments/pix-panel";
import { StripeCardPanel } from "@/components/payments/stripe-card-panel";
import type { UserAddress } from "@/lib/supabase/types";

interface Props {
  productId: string;
  productName: string;
  unitPriceCents: number;
  establishmentId: string;
  establishmentName: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  addresses: UserAddress[];
}

export function CheckoutForm(props: Props) {
  const [state, action] = useActionState(placeOrderAction, undefined);
  const [qty, setQty] = useState(1);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">(props.deliveryEnabled ? "delivery" : "pickup");
  const [addressId, setAddressId] = useState<string>(props.addresses.find((a) => a.is_default)?.id ?? props.addresses[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [quote, setQuote] = useState<{ feeCents: number; distanceKm: number | null; outOfRange: boolean; freeShipping: boolean } | null>(null);
  const [quoteLoading, startQuote] = useTransition();

  const subtotal = props.unitPriceCents * qty;
  const fee = deliveryType === "delivery" ? quote?.feeCents ?? 0 : 0;
  const total = subtotal + fee;
  const blocked = deliveryType === "delivery" && (!addressId || quote?.outOfRange);

  function refreshQuote(addrId: string, q: number) {
    if (!addrId) return;
    startQuote(async () => {
      const r = await getDeliveryQuote(props.establishmentId, addrId, props.unitPriceCents * q);
      setQuote(r);
    });
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="product_id" value={props.productId} />

      {/* QTY */}
      <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-base font-bold text-brava-ink">{props.productName}</h2>
        <p className="text-xs text-brava-muted">de {props.establishmentName}</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => { const n = Math.max(1, qty - 1); setQty(n); refreshQuote(addressId, n); }}
            className="grid h-9 w-9 place-items-center rounded-full border border-brava-border bg-brava-paper text-lg"
          >
            −
          </button>
          <input type="hidden" name="qty" value={qty} />
          <span className="w-8 text-center text-lg font-black text-brava-ink">{qty}</span>
          <button
            type="button"
            onClick={() => { const n = Math.min(10, qty + 1); setQty(n); refreshQuote(addressId, n); }}
            className="grid h-9 w-9 place-items-center rounded-full border border-brava-border bg-brava-paper text-lg"
          >
            +
          </button>
          <span className="ml-auto text-lg font-black text-brava-blue">{formatBRL(subtotal)}</span>
        </div>
      </section>

      {/* Delivery type */}
      <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="mb-3 text-base font-bold text-brava-ink">Como você quer receber?</h2>
        <div className="grid grid-cols-2 gap-3">
          <Choice
            checked={deliveryType === "delivery"}
            onClick={() => { setDeliveryType("delivery"); refreshQuote(addressId, qty); }}
            disabled={!props.deliveryEnabled}
            title="🛵 Receber em casa"
            sub="Entrega na porta"
          />
          <Choice
            checked={deliveryType === "pickup"}
            onClick={() => setDeliveryType("pickup")}
            disabled={!props.pickupEnabled}
            title="🏪 Buscar na loja"
            sub="Retira sem taxa"
          />
        </div>
        <input type="hidden" name="delivery_type" value={deliveryType} />

        {deliveryType === "delivery" && (
          <div className="mt-4 space-y-3">
            {props.addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brava-border bg-brava-paper p-4 text-sm text-brava-muted">
                Você ainda não tem endereços. <Link href="/app/perfil/enderecos" className="font-bold text-brava-blue underline">Cadastrar agora</Link>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-brava-muted">Endereço de entrega</span>
                  <select
                    name="address_id"
                    value={addressId}
                    onChange={(e) => { setAddressId(e.target.value); refreshQuote(e.target.value, qty); }}
                    className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
                  >
                    {props.addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label} — {a.street}{a.number ? `, ${a.number}` : ""} ({a.city}/{a.state})
                      </option>
                    ))}
                  </select>
                </label>

                {quoteLoading && <p className="text-xs text-brava-muted">Calculando taxa...</p>}
                {quote && !quoteLoading && (
                  quote.outOfRange ? (
                    <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                      😕 Endereço fora do raio de entrega desta loja.
                    </p>
                  ) : (
                    <p className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                      📍 {quote.distanceKm} km · taxa {quote.freeShipping ? "GRÁTIS 🎉" : formatBRL(quote.feeCents)}
                    </p>
                  )
                )}

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-brava-muted">Observações (opcional)</span>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Sem cebola, troco pra 50, deixar na portaria..."
                    className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
                  />
                </label>
              </>
            )}
          </div>
        )}
      </section>

      {/* Pagamento */}
      <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="mb-3 text-base font-bold text-brava-ink">Pagamento</h2>
        <div className="grid grid-cols-2 gap-3">
          <Choice
            checked={paymentMethod === "pix"}
            onClick={() => setPaymentMethod("pix")}
            title="⚡ PIX"
            sub="Instantâneo"
          />
          <Choice
            checked={paymentMethod === "credit_card"}
            onClick={() => setPaymentMethod("credit_card")}
            title="💳 Cartão"
            sub="Crédito"
          />
        </div>
        <input type="hidden" name="payment_method" value={paymentMethod} />
        {paymentMethod === "credit_card" && (
          <p className="mt-3 text-xs text-brava-muted">
            💳 Cartão, Apple Pay e Google Pay aparecem no próximo passo, com segurança Stripe.
          </p>
        )}
      </section>

      {/* Resumo */}
      <section className="rounded-3xl border-2 border-brava-yellow bg-brava-yellow/10 p-5">
        <Row label="Subtotal" value={formatBRL(subtotal)} />
        {deliveryType === "delivery" && (
          <Row label="Entrega" value={quote?.freeShipping ? "GRÁTIS" : formatBRL(fee)} />
        )}
        <hr className="my-2 border-brava-yellow/40" />
        <Row label="Total" value={formatBRL(total)} bold />
      </section>

      {state?.error && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      {state?.ok && state.payment && state.orderId ? (
        state.payment.method === "pix" ? (
          <PixPanel
            paymentId={state.payment.paymentId}
            pixCode={state.payment.pixCode}
            qrBase64={state.payment.qrBase64}
            expiresAt={state.payment.expiresAt}
            successUrl={`/app/pedidos/${state.orderId}`}
          />
        ) : (
          <StripeCardPanel
            paymentId={state.payment.paymentId}
            clientSecret={state.payment.clientSecret}
            publishableKey={state.payment.publishableKey}
            successUrl={`/app/pedidos/${state.orderId}`}
          />
        )
      ) : (
        <SubmitButton disabled={blocked}>Finalizar pedido — {formatBRL(total)}</SubmitButton>
      )}
    </form>
  );
}

function Choice({ checked, onClick, disabled, title, sub }: { checked: boolean; onClick: () => void; disabled?: boolean; title: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border-2 p-3 text-left transition ${
        checked ? "border-brava-yellow bg-brava-yellow/15" : "border-brava-border bg-brava-paper"
      } ${disabled ? "cursor-not-allowed opacity-40" : "hover:border-brava-yellow/60"}`}
    >
      <p className="text-sm font-bold text-brava-ink">{title}</p>
      <p className="text-xs text-brava-muted">{sub}</p>
    </button>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${bold ? "text-base font-black" : "text-sm"}`}>
      <span className={bold ? "text-brava-ink" : "text-brava-muted"}>{label}</span>
      <span className={bold ? "text-brava-blue" : "text-brava-ink"}>{value}</span>
    </div>
  );
}

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-full bg-brava-blue px-6 py-4 text-base font-bold text-white shadow-xl shadow-brava-blue/20 transition hover:scale-[1.01] disabled:opacity-60"
    >
      {pending ? "Processando..." : children}
    </button>
  );
}

