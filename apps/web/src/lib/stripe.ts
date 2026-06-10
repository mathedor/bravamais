// BRAVA+ — Stripe client (cartão + Apple Pay + Google Pay via Payment Element)
//
// 2 modos:
//  - MOCK (sem STRIPE_SECRET_KEY): devolve um client_secret fake; o status
//    poll/return finge "succeeded" (dev/staging sem chaves).
//  - REAL: PaymentIntent com automatic_payment_methods → o Payment Element /
//    Express Checkout no front mostra cartão + Apple Pay + Google Pay + Link.
//
// Espelha o fluxo Stripe do GYT (createStripePaymentIntent + webhook).
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function stripeIsMock(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY ausente");
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });
  }
  return _stripe;
}

export function stripePublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    process.env.STRIPE_PUBLISHABLE_KEY ??
    ""
  );
}

export interface StripeIntent {
  clientSecret: string;
  paymentIntentId: string;
  publishableKey: string;
  isMock: boolean;
}

export async function createPaymentIntent(args: {
  amountCents: number;
  description: string;
  metadata: Record<string, string>;
  statementSuffix?: string;
}): Promise<StripeIntent> {
  if (stripeIsMock()) {
    const id = `pi_mock_${Date.now()}`;
    return {
      clientSecret: `${id}_secret_mock`,
      paymentIntentId: id,
      publishableKey: stripePublishableKey() || "pk_mock",
      isMock: true,
    };
  }

  const stripe = getStripe();
  const params: Stripe.PaymentIntentCreateParams = {
    amount: Math.max(50, Math.round(args.amountCents)),
    currency: "brl",
    description: args.description.slice(0, 200),
    metadata: args.metadata,
    automatic_payment_methods: { enabled: true },
    payment_method_options: { card: { installments: { enabled: true } } },
  };
  if (args.statementSuffix) {
    params.statement_descriptor_suffix = args.statementSuffix
      .replace(/[^A-Za-z0-9 ]/g, "")
      .slice(0, 22);
  }
  // Payment Method Configuration opcional (preset de Apple/Google Pay no dashboard)
  const pmc = process.env.STRIPE_PMC_ID?.trim();
  if (pmc) {
    params.payment_method_configuration = pmc;
    delete params.automatic_payment_methods;
  }

  const intent = await stripe.paymentIntents.create(params);
  return {
    clientSecret: intent.client_secret ?? "",
    paymentIntentId: intent.id,
    publishableKey: stripePublishableKey(),
    isMock: false,
  };
}

export async function retrievePaymentIntent(id: string): Promise<{
  status: string;
  metadata: Record<string, string>;
  raw: unknown;
}> {
  if (id.startsWith("pi_mock_")) {
    return { status: "succeeded", metadata: {}, raw: { mock: true } };
  }
  const pi = await getStripe().paymentIntents.retrieve(id);
  return { status: pi.status, metadata: pi.metadata ?? {}, raw: pi };
}

export function verifyWebhook(payload: string, signature: string): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return null;
  try {
    return getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return null;
  }
}

// Registra domínio pra Apple Pay / Google Pay no Payment Element.
export async function registerPaymentMethodDomain(domain: string): Promise<unknown> {
  const stripe = getStripe();
  // idempotente: se já existe, reativa
  const existing = await stripe.paymentMethodDomains.list({ domain_name: domain, limit: 1 });
  if (existing.data[0]) {
    return stripe.paymentMethodDomains.validate(existing.data[0].id);
  }
  return stripe.paymentMethodDomains.create({ domain_name: domain, enabled: true });
}
