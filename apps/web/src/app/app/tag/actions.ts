"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function rechargeTagAction(formData: FormData): Promise<{ ok: boolean; error?: string; balance_cents?: number; bonus_cents?: number }> {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();
  const packId = String(formData.get("pack_id") ?? "");
  if (!packId) return { ok: false, error: "missing_pack" };

  const { data, error } = await supabase.rpc("tag_recharge", { p_pack_id: packId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/tag");
  return data as { ok: boolean; balance_cents?: number; bonus_cents?: number };
}

export async function subscribeMonthlyAction(): Promise<{ ok: boolean; error?: string; balance_cents?: number }> {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tag_subscribe_monthly");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/tag");
  return data as { ok: boolean; balance_cents?: number };
}

export async function cancelMonthlyAction(): Promise<{ ok: boolean }> {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();
  await supabase.rpc("tag_cancel_monthly");
  revalidatePath("/app/tag");
  return { ok: true };
}
