import { NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/stripe";
import { fulfillPayment, fulfillByChargeId } from "@/lib/payments";

/**
 * Webhook Stripe (cartão / Apple Pay / Google Pay).
 * Valida a assinatura e confirma em payment_intent.succeeded.
 *
 * Configurar no Stripe: https://www.bravamais.com.br/api/stripe/webhook
 * Evento: payment_intent.succeeded   (envs: STRIPE_WEBHOOK_SECRET)
 */
export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const event = verifyWebhook(payload, sig);
  if (!event) return NextResponse.json({ ok: false, error: "invalid-signature" }, { status: 400 });

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as { id: string; metadata?: Record<string, string> };
    const paymentId = pi.metadata?.payment_id;
    try {
      if (paymentId) await fulfillPayment(paymentId);
      else await fulfillByChargeId("stripe", pi.id);
    } catch (e) {
      console.error("[stripe webhook]", e);
    }
  }

  return NextResponse.json({ ok: true });
}
