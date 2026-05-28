"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function updateTagSettingsAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();

  const commission = Number(formData.get("commission_pct") ?? 9);
  const monthly = Math.round(Number(formData.get("monthly_plan_reais") ?? 49) * 100);
  const credit = Math.round(Number(formData.get("monthly_credit_reais") ?? 60) * 100);
  const bonus = Number(formData.get("recharge_bonus_pct") ?? 10);

  await supabase.from("tag_settings").update({
    commission_pct: commission,
    monthly_plan_cents: monthly,
    monthly_plan_credit_cents: credit,
    recharge_bonus_pct: bonus,
    updated_at: new Date().toISOString(),
  }).eq("id", 1);

  revalidatePath("/admin/tag");
}

export async function upsertPackAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const amount = Math.round(Number(formData.get("amount_reais") ?? 0) * 100);
  const bonus = Math.round(Number(formData.get("bonus_reais") ?? 0) * 100);
  const order = Number(formData.get("display_order") ?? 100);

  if (!name || amount <= 0) throw new Error("Nome e valor obrigatórios");

  if (id) {
    await supabase.from("tag_recharge_packs").update({
      name, amount_cents: amount, bonus_cents: bonus, display_order: order,
    }).eq("id", id);
  } else {
    await supabase.from("tag_recharge_packs").insert({
      name, amount_cents: amount, bonus_cents: bonus, display_order: order,
    });
  }

  revalidatePath("/admin/tag");
}

export async function deletePackAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("tag_recharge_packs").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/tag");
}
