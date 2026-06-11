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
  customerId?: string;
  savePaymentMethod?: boolean;
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

  // recorrência: vincula ao customer e salva o cartão pra cobrança off-session futura
  if (args.savePaymentMethod && args.customerId) {
    params.customer = args.customerId;
    params.setup_future_usage = "off_session";
    // parcelamento é incompatível com salvar p/ MIT — desliga
    params.payment_method_options = { card: { installments: { enabled: false } } };
  }
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

// ---------- Recorrência ----------
export async function createCustomer(args: {
  email: string;
  name: string;
  userId: string;
}): Promise<string> {
  const customer = await getStripe().customers.create({
    email: args.email || undefined,
    name: args.name || undefined,
    metadata: { user_id: args.userId },
  });
  return customer.id;
}

// Lê o payment_method + customer salvos de um PaymentIntent confirmado.
export async function getSavedPaymentMethod(
  paymentIntentId: string,
): Promise<{ paymentMethodId: string | null; customerId: string | null }> {
  if (paymentIntentId.startsWith("pi_mock_")) {
    return { paymentMethodId: "pm_mock", customerId: "cus_mock" };
  }
  const pi = await getStripe().paymentIntents.retrieve(paymentIntentId);
  const pm = pi.payment_method;
  const cust = pi.customer;
  return {
    paymentMethodId: typeof pm === "string" ? pm : (pm?.id ?? null),
    customerId: typeof cust === "string" ? cust : (cust?.id ?? null),
  };
}

// Cobrança automática (merchant-initiated, sem o usuário presente).
export async function chargeOffSession(args: {
  customerId: string;
  paymentMethodId: string;
  amountCents: number;
  description: string;
  metadata: Record<string, string>;
}): Promise<{ status: "succeeded" | "failed"; paymentIntentId: string; error?: string }> {
  if (stripeIsMock()) {
    return { status: "succeeded", paymentIntentId: `pi_mock_${Date.now()}` };
  }
  try {
    const pi = await getStripe().paymentIntents.create({
      amount: Math.max(50, Math.round(args.amountCents)),
      currency: "brl",
      customer: args.customerId,
      payment_method: args.paymentMethodId,
      off_session: true,
      confirm: true,
      description: args.description.slice(0, 200),
      metadata: args.metadata,
    });
    return {
      status: pi.status === "succeeded" ? "succeeded" : "failed",
      paymentIntentId: pi.id,
      error: pi.status !== "succeeded" ? pi.status : undefined,
    };
  } catch (e) {
    const err = e as { code?: string; message?: string; raw?: { payment_intent?: { id?: string } } };
    return {
      status: "failed",
      paymentIntentId: err.raw?.payment_intent?.id ?? "",
      error: err.code ?? err.message ?? "charge_failed",
    };
  }
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
