"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";

/**
 * Upgrade de plano lojista.
 * Hoje (sem Efí): marca direto como ativo no tier escolhido.
 * Quando a conta Efí estiver pronta: redireciona pro checkout PIX/cartão.
 */
export async function upgradePlanAction(formData: FormData): Promise<{ message: string }> {
  const { establishment } = await requireEstablishment();
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

  revalidatePath("/loja/plano");
  revalidatePath("/loja");

  return {
    message: tier === "basico"
      ? "Plano alterado pra Básico."
      : `Plano ${tier.toUpperCase()} ativado (modo teste — cobrança Efí será ativada quando a conta estiver pronta).`,
  };
}
