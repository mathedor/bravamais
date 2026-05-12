"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { logActivity } from "@/lib/activity-log";

export type UseRewardResult =
  | { ok: true; benefit: string; user_name: string | null; reward_id: string }
  | { ok: false; error: string };

export async function useRewardAction(code: string): Promise<UseRewardResult> {
  const cleaned = code.replace(/^REWARD-/i, "").trim().toUpperCase();
  if (!cleaned) return { ok: false, error: "Código vazio." };
  const fullCode = cleaned.startsWith("REWARD-") ? cleaned : `REWARD-${cleaned}`;

  const { establishment, user: scanner } = await requireEstablishment();
  const supabase = await createClient();
  const admin = createAdminClient();

  // RLS permite o owner ver rewards do estabelecimento dele
  const { data: reward } = await supabase
    .from("loyalty_rewards")
    .select("id, user_id, benefit_description, used_at, establishment_id")
    .eq("reward_code", fullCode)
    .maybeSingle();

  if (!reward) return { ok: false, error: "Código não encontrado." };
  if (reward.establishment_id !== establishment.id) {
    return { ok: false, error: "Esse prêmio é de outro estabelecimento." };
  }
  if (reward.used_at) return { ok: false, error: "Esse prêmio já foi utilizado." };

  // Marca como usado
  const { error: updateErr } = await admin
    .from("loyalty_rewards")
    .update({ used_at: new Date().toISOString(), used_by_establishment_user_id: scanner.id })
    .eq("id", reward.id);
  if (updateErr) return { ok: false, error: updateErr.message };

  // Pega nome do cliente
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", reward.user_id)
    .maybeSingle();

  // Notifica cliente
  await admin.from("notifications").insert({
    user_id: reward.user_id,
    type: "loyalty_reward",
    title: `Recompensa resgatada na ${establishment.name}!`,
    body: reward.benefit_description,
    link: "/app/premios",
  });

  await logActivity({
    userId: scanner.id,
    entityType: "reward",
    entityId: reward.id,
    action: "reward_used",
  });

  revalidatePath("/loja/recompensas");

  return {
    ok: true,
    benefit: reward.benefit_description,
    user_name: profile?.full_name ?? null,
    reward_id: reward.id,
  };
}
