"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

export async function redeemGiftCardAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  if (!code) return;
  const supabase = await createClient();
  const { data: gift } = await supabase
    .from("gift_cards")
    .select("id, status, redeemed_at, establishment_id")
    .eq("code", code)
    .eq("establishment_id", establishment.id)
    .maybeSingle();
  if (!gift) return;
  if (gift.redeemed_at) return;
  await supabase
    .from("gift_cards")
    .update({ redeemed_at: new Date().toISOString(), status: "redeemed", remaining_cents: 0 })
    .eq("id", gift.id);
  revalidatePath("/loja/vale-presente");
}
