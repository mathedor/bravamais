"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: string } | undefined;

export async function adminUpdatePlanAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const tier = String(formData.get("tier") || "");
  const monthlyStr = String(formData.get("monthly") || "").trim();
  const yearlyStr = String(formData.get("yearly") || "").trim();
  const name = String(formData.get("name") || "").trim();
  if (!["basico", "premium", "vip"].includes(tier)) return { error: "Tier inválido." };

  const monthly_cents = monthlyStr ? Math.round(parseFloat(monthlyStr.replace(",", ".")) * 100) : null;
  const yearly_cents = yearlyStr ? Math.round(parseFloat(yearlyStr.replace(",", ".")) * 100) : null;
  if (!monthly_cents || monthly_cents < 0) return { error: "Valor mensal inválido." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("subscription_plans")
    .update({ name, monthly_cents, yearly_cents })
    .eq("tier", tier);
  if (error) return { error: error.message };

  await logActivity({
    userId: admin.id,
    entityType: "subscription",
    entityId: tier,
    action: "admin_establishment_updated",
  });

  revalidatePath("/admin/planos");
  revalidatePath("/assinar");
  return { ok: "Plano atualizado." };
}
