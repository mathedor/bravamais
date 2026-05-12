"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

type State = { error?: string; ok?: boolean } | undefined;

function parseCents(s: string): number | null {
  const v = s.trim().replace(",", ".");
  if (!v) return null;
  const n = Math.round(parseFloat(v) * 100);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function upsertLoyaltyAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const visitsRequired = parseInt(String(formData.get("visits_required") || "5"), 10);
  const benefit = String(formData.get("benefit_description") || "").trim();
  const rewardType = String(formData.get("reward_type") || "manual");
  const rewardDiscountPercent = parseInt(String(formData.get("reward_discount_percent") || "0"), 10);
  const rewardDiscountCents = parseCents(String(formData.get("reward_discount_value") || ""));
  const rewardValueCents = parseCents(String(formData.get("reward_value") || ""));

  if (!name || !benefit || !visitsRequired || visitsRequired < 1) {
    return { error: "Nome, número de visitas e benefício são obrigatórios." };
  }
  if (rewardType === "coupon" && !rewardDiscountPercent && !rewardDiscountCents) {
    return { error: "Pra cupom, informe % ou R$ de desconto." };
  }
  if (rewardType === "gift_card" && !rewardValueCents) {
    return { error: "Pra vale-presente, informe o valor em R$." };
  }

  const payload = {
    name,
    description,
    visits_required: visitsRequired,
    benefit_description: benefit,
    is_active: true,
    reward_type: rewardType,
    reward_discount_percent: rewardType === "coupon" && rewardDiscountPercent ? rewardDiscountPercent : null,
    reward_discount_cents: rewardType === "coupon" && rewardDiscountCents && !rewardDiscountPercent ? rewardDiscountCents : null,
    reward_value_cents: rewardType === "gift_card" && rewardValueCents ? rewardValueCents : null,
  };

  const { data: existing } = await supabase
    .from("loyalty_clubs")
    .select("id")
    .eq("establishment_id", establishment.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("loyalty_clubs").update(payload).eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("loyalty_clubs").insert({
      establishment_id: establishment.id,
      ...payload,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/loja/fidelidade");
  return { ok: true };
}
