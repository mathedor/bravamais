"use server";

import { createPayment, type CreatePixResult, type CreateCardResult } from "@/lib/payments";
import { getPayer } from "@/lib/payer";

const TIER_PRICE_CENTS = { basico: 1990, premium: 3990, vip: 7990 } as const;
type Tier = keyof typeof TIER_PRICE_CENTS;

async function start(tier: Tier, method: "pix" | "card") {
  if (!TIER_PRICE_CENTS[tier]) return { error: "Plano inválido." };
  const payer = await getPayer();
  if (!payer) return { error: "Faça login pra assinar." };
  return createPayment({
    kind: "subscription",
    refId: tier,
    method,
    amountCents: TIER_PRICE_CENTS[tier],
    description: `BRAVA+ ${tier.toUpperCase()}`,
    statementSuffix: "BRAVAMAIS",
    payer,
  });
}

export async function createSubscriptionPix(tier: Tier): Promise<CreatePixResult | { error: string }> {
  return (await start(tier, "pix")) as CreatePixResult | { error: string };
}

export async function createSubscriptionCard(tier: Tier): Promise<CreateCardResult | { error: string }> {
  return (await start(tier, "card")) as CreateCardResult | { error: string };
}
