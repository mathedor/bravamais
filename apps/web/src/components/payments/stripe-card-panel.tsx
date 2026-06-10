"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface Props {
  paymentId: string;
  clientSecret: string;
  publishableKey: string;
  successUrl: string;
}

// cache do loadStripe por publishable key
const stripeCache = new Map<string, Promise<Stripe | null>>();
function getStripePromise(pk: string): Promise<Stripe | null> {
  if (!stripeCache.has(pk)) stripeCache.set(pk, loadStripe(pk));
  return stripeCache.get(pk)!;
}

function isMock(clientSecret: string, pk: string) {
  return clientSecret.includes("_mock") || pk === "pk_mock" || !pk.startsWith("pk_");
}

export function StripeCardPanel(props: Props) {
  const router = useRouter();
  const mock = isMock(props.clientSecret, props.publishableKey);

  const options = useMemo(
    () => ({
      clientSecret: props.clientSecret,
      appearance: {
        theme: "flat" as const,
        variables: {
          colorPrimary: "#facc15",
          colorBackground: "#ffffff",
          colorText: "#0a0a0a",
          colorDanger: "#ef4444",
          fontFamily: "Inter, system-ui, sans-serif",
          borderRadius: "12px",
        },
      },
      locale: "pt-BR" as const,
    }),
    [props.clientSecret],
  );

  // modo mock: sem chaves reais → botão de simulação que cai no fluxo de retorno
  if (mock) {
    const returnUrl = buildReturnUrl(props.paymentId, props.successUrl);
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-brava-ink">Modo simulação (sem chaves Stripe)</p>
        <p className="mt-1 text-xs text-brava-muted">
          As chaves reais ativam cartão + Apple Pay + Google Pay automaticamente.
        </p>
        <button
          type="button"
          onClick={() => router.push(returnUrl)}
          className="mt-4 w-full rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black"
        >
          Simular pagamento no cartão
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={getStripePromise(props.publishableKey)} options={options}>
      <InnerForm {...props} />
    </Elements>
  );
}

function buildReturnUrl(paymentId: string, successUrl: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const u = new URL("/pagamento/retorno", origin || "https://www.bravamais.com.br");
  u.searchParams.set("pid", paymentId);
  u.searchParams.set("next", successUrl);
  return u.toString();
}

function InnerForm({ paymentId, successUrl }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expressReady, setExpressReady] = useState(false);

  const returnUrl = buildReturnUrl(paymentId, successUrl);

  async function confirm() {
    if (!stripe || !elements) return;
    setLoading(true);
    setMsg(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });
    // se chegou aqui, deu erro (sucesso redireciona pro return_url)
    setLoading(false);
    setMsg(error?.message ?? "Não foi possível processar o pagamento.");
  }

  async function onExpressConfirm() {
    if (!stripe || !elements) return;
    setMsg(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });
    if (error) setMsg(error.message ?? "Falha no pagamento.");
  }

  return (
    <div className="space-y-4">
      {/* Apple Pay / Google Pay / Link */}
      <div className={expressReady ? "block" : "hidden"}>
        <ExpressCheckoutElement
          onReady={(e) => {
            const a = e.availablePaymentMethods;
            setExpressReady(Boolean(a && (a.applePay || a.googlePay || a.link)));
          }}
          onConfirm={onExpressConfirm}
          options={{
            buttonHeight: 48,
            buttonType: { applePay: "buy", googlePay: "buy" },
          }}
        />
        <div className="my-2 flex items-center gap-3 text-xs text-brava-muted">
          <span className="h-px flex-1 bg-brava-border" />
          ou pague com cartão
          <span className="h-px flex-1 bg-brava-border" />
        </div>
      </div>

      <PaymentElement options={{ layout: "tabs" }} />

      {msg && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p>}

      <button
        type="button"
        onClick={confirm}
        disabled={loading || !stripe}
        className="w-full rounded-full bg-brava-yellow px-6 py-3.5 text-base font-bold text-brava-black disabled:opacity-60"
      >
        {loading ? "Processando…" : "Pagar agora"}
      </button>
    </div>
  );
}
