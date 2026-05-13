"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function claimChallengeAction(challengeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Faça login." };

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_challenge_reward", { p_challenge_id: challengeId });
  if (error) return { ok: false, message: error.message };

  type Row = { ok: boolean; message: string; coins_granted: number };
  const result = (Array.isArray(data) ? data[0] : data) as Row | null;

  revalidatePath("/app/desafios");
  revalidatePath("/app/carteira");

  return { ok: result?.ok ?? false, message: result?.message ?? "Erro" };
}
