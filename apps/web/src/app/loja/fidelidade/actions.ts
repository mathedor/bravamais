"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

type State = { error?: string; ok?: boolean } | undefined;

export async function upsertLoyaltyAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const visitsRequired = parseInt(String(formData.get("visits_required") || "5"), 10);
  const benefit = String(formData.get("benefit_description") || "").trim();

  if (!name || !benefit || !visitsRequired || visitsRequired < 1) {
    return { error: "Nome, número de visitas e benefício são obrigatórios." };
  }

  const { data: existing } = await supabase
    .from("loyalty_clubs")
    .select("id")
    .eq("establishment_id", establishment.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("loyalty_clubs")
      .update({ name, description, visits_required: visitsRequired, benefit_description: benefit, is_active: true })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("loyalty_clubs").insert({
      establishment_id: establishment.id,
      name,
      description,
      visits_required: visitsRequired,
      benefit_description: benefit,
      is_active: true,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/loja/fidelidade");
  return { ok: true };
}
