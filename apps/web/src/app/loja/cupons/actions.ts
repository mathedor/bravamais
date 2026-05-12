"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

type State = { error?: string; ok?: boolean } | undefined;

export async function createCouponAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim();
  const discountPercent = parseInt(String(formData.get("discount_percent") || "0"), 10);
  const discountValueStr = String(formData.get("discount_value") || "").trim();
  const validUntilStr = String(formData.get("valid_until") || "").trim();
  const tierRequired = String(formData.get("tier_required") || "").trim() || null;

  if (!code) return { error: "Código é obrigatório." };
  if (!discountPercent && !discountValueStr) return { error: "Informe um % ou R$ de desconto." };

  const supabase = await createClient();
  const payload: Record<string, unknown> = {
    establishment_id: establishment.id,
    code,
    description: description || null,
    discount_percent: discountPercent || null,
    discount_cents: discountValueStr ? Math.round(parseFloat(discountValueStr.replace(",", ".")) * 100) : null,
    valid_until: validUntilStr ? new Date(validUntilStr).toISOString() : null,
    is_active: true,
    tier_required: tierRequired,
  };
  const { error } = await supabase.from("coupons").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/loja/cupons");
  return { ok: true };
}

export async function deleteCouponAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("coupons").delete().eq("id", id).eq("establishment_id", establishment.id);
  revalidatePath("/loja/cupons");
}

export async function toggleCouponAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("id") || "");
  const isActive = String(formData.get("is_active") || "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("coupons").update({ is_active: !isActive }).eq("id", id).eq("establishment_id", establishment.id);
  revalidatePath("/loja/cupons");
}
