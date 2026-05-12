"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPixSubscription, chargeCardSubscription } from "@/lib/efi";

type Tier = "basico" | "premium" | "vip";
const TIER_PRICE_CENTS: Record<Tier, number> = { basico: 1990, premium: 3990, vip: 7990 };

type State = { error?: string; ok?: boolean; pix?: { qr: string; copia: string; chargeId: string } } | undefined;

export async function startPixAction(_: State, formData: FormData): Promise<State> {
  const tier = String(formData.get("tier") || "") as Tier;
  if (!TIER_PRICE_CENTS[tier]) return { error: "Plano inválido." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login pra assinar." };

  const amount = TIER_PRICE_CENTS[tier];
  const charge = await createPixSubscription({
    userId: user.id,
    tier,
    amountCents: amount,
    description: `BRAVA+ ${tier.toUpperCase()}`,
  });

  // Cria/atualiza subscription pendente
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const payload = {
    user_id: user.id,
    tier,
    status: "trial" as const,
    efi_subscription_id: charge.charge_id,
  };
  if (existing) {
    await admin.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    await admin.from("subscriptions").insert(payload);
  }

  return { ok: true, pix: { qr: charge.qr_code, copia: charge.copia_e_cola, chargeId: charge.charge_id } };
}

export async function chargeCardAction(_: State, formData: FormData): Promise<State> {
  const tier = String(formData.get("tier") || "") as Tier;
  const number = String(formData.get("card_number") || "").replace(/\s+/g, "");
  const installments = parseInt(String(formData.get("installments") || "1"), 10) || 1;
  if (!TIER_PRICE_CENTS[tier]) return { error: "Plano inválido." };
  if (number.length < 13) return { error: "Número de cartão inválido." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login pra assinar." };

  // No mock, "token" é o final do cartão
  const token = number.slice(-1);

  const result = await chargeCardSubscription({
    userId: user.id,
    tier,
    amountCents: TIER_PRICE_CENTS[tier],
    cardToken: token,
    installments,
  });

  if (result.status === "declined") {
    return { error: result.message ?? "Cartão recusado." };
  }

  // Ativa assinatura
  const admin = createAdminClient();
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const payload = {
    user_id: user.id,
    tier,
    status: "active" as const,
    current_period_start: start.toISOString(),
    current_period_end: end.toISOString(),
    efi_subscription_id: result.charge_id,
  };
  if (existing) {
    await admin.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    await admin.from("subscriptions").insert(payload);
  }

  await admin.from("notifications").insert({
    user_id: user.id,
    type: "subscription",
    title: `BRAVA+ ${tier.toUpperCase()} ativada!`,
    body: "Sua assinatura está ativa. Aproveite as vantagens.",
    link: "/app",
  });

  revalidatePath("/app");
  redirect("/assinar/sucesso");
}

export async function simulatePixPaid(chargeId: string, tier: Tier) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const payload = {
    user_id: user.id,
    tier,
    status: "active" as const,
    current_period_start: start.toISOString(),
    current_period_end: end.toISOString(),
    efi_subscription_id: chargeId,
  };

  if (existing) {
    await admin.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    await admin.from("subscriptions").insert(payload);
  }

  await admin.from("notifications").insert({
    user_id: user.id,
    type: "subscription",
    title: `BRAVA+ ${tier.toUpperCase()} ativada!`,
    body: "Pagamento PIX confirmado (simulação).",
    link: "/app",
  });

  revalidatePath("/app");
  redirect("/assinar/sucesso");
}
