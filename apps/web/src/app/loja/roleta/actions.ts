"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";

type State = { error?: string; ok?: string } | undefined;

export async function saveDrawAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const name = String(formData.get("name") || "").trim();
  const prizesRaw = String(formData.get("prizes_json") || "[]");
  const maxSpins = parseInt(String(formData.get("max_spins") || "1"), 10);
  const isActive = formData.get("is_active") === "on";

  let prizes;
  try {
    prizes = JSON.parse(prizesRaw);
    if (!Array.isArray(prizes) || prizes.length === 0) throw new Error();
  } catch {
    return { error: "Configure ao menos um prêmio." };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("lucky_draws")
    .select("id")
    .eq("establishment_id", establishment.id)
    .maybeSingle();

  if (existing) {
    await admin
      .from("lucky_draws")
      .update({ name, prizes, max_spins_per_user_day: maxSpins, is_active: isActive })
      .eq("id", existing.id);
  } else {
    await admin.from("lucky_draws").insert({
      establishment_id: establishment.id,
      name,
      prizes,
      max_spins_per_user_day: maxSpins,
      is_active: isActive,
    });
  }

  revalidatePath("/loja/roleta");
  return { ok: "Roleta atualizada." };
}
