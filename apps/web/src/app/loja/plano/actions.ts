"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { createPayment, type CreatePixResult, type CreateCardResult } from "@/lib/payments";
import { getPayer } from "@/lib/payer";

async function startPlan(tier: string, method: "pix" | "card") {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("establishment_plans_catalog")
    .select("monthly_cents, name")
    .eq("tier", tier)
    .maybeSingle<{ monthly_cents: number; name: string }>();
  const amount = plan?.monthly_cents ?? 0;
  if (amount <= 0) return { error: "Plano gratuito não precisa de pagamento." };

  const payer = await getPayer();
  if (!payer) return { error: "Faça login pra assinar." };

  return createPayment({
    kind: "establishment_plan",
    refId: tier,
    refMeta: { establishment_id: establishment.id },
    method,
    amountCents: amount,
    description: `BRAVA+ plano lojista ${tier.toUpperCase()}`,
    statementSuffix: "BRAVAMAIS",
    payer,
    recurring: true,
  });
}

export async function createEstablishmentPlanPix(tier: string): Promise<CreatePixResult | { error: string }> {
  return (await startPlan(tier, "pix")) as CreatePixResult | { error: string };
}

export async function createEstablishmentPlanCard(tier: string): Promise<CreateCardResult | { error: string }> {
  return (await startPlan(tier, "card")) as CreateCardResult | { error: string };
}

/**
 * Mudança de plano lojista.
 * Planos pagos (PRO/Enterprise) passam pelo checkout real (createEstablishmentPlanPix/Card → PayModal).
 * Esta action é o caminho gratuito: downgrade pro Básico (sem cobrança) e encerra a recorrência.
 */
export async function upgradePlanAction(formData: FormData): Promise<{ message: string }> {
  const { establishment, user } = await requireEstablishment();
  const tier = String(formData.get("tier") || "basico") as "basico" | "pro" | "enterprise";

  const admin = createAdminClient();

  // TODO(efí): quando conta estiver ativa, criar charge/subscription e redirecionar
  // pro checkout-url. Por enquanto, ativa direto pra liberar testes.
  await admin
    .from("establishment_subscriptions")
    .upsert(
      {
        establishment_id: establishment.id,
        tier,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
      { onConflict: "establishment_id" },
    );

  await admin.from("establishments").update({ plan_tier: tier }).eq("id", establishment.id);

  // downgrade pro gratuito encerra a renovação automática do plano pago
  if (tier === "basico") {
    await admin
      .from("recurring_subscriptions")
      .update({ status: "canceled", cancel_at_period_end: false })
      .eq("user_id", user.id)
      .eq("kind", "establishment_plan");
  }

  revalidatePath("/loja/plano");
  revalidatePath("/loja");

  return {
    message: tier === "basico"
      ? "Plano alterado pra Básico. Renovação automática encerrada."
      : `Plano ${tier.toUpperCase()} ativado.`,
  };
}
