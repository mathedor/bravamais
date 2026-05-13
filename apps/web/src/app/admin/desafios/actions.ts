"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

export async function createChallengeAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const kind = String(formData.get("kind") || "visits_in_category");
  const categorySlug = String(formData.get("target_category_slug") || "").trim() || null;
  const targetN = parseInt(String(formData.get("target_n") || "5"), 10);
  const rewardCoins = parseInt(String(formData.get("reward_coins") || "200"), 10);
  const startsAt = String(formData.get("starts_at") || "");
  const endsAt = String(formData.get("ends_at") || "");
  const emoji = String(formData.get("cover_emoji") || "🏆").trim();
  if (!title || !startsAt || !endsAt || targetN < 1 || rewardCoins < 1) return { error: "Preencha os campos obrigatórios." };

  const admin = createAdminClient();
  const { error } = await admin.from("monthly_challenges").insert({
    title,
    description,
    kind,
    target_category_slug: kind === "visits_in_category" ? categorySlug : null,
    target_n: targetN,
    reward_coins: rewardCoins,
    starts_at: startsAt,
    ends_at: endsAt + "T23:59:59",
    cover_emoji: emoji,
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/desafios");
  return { ok: "Desafio criado." };
}

export async function toggleChallengeActiveAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("monthly_challenges").update({ is_active: !active }).eq("id", id);
  revalidatePath("/admin/desafios");
}

export async function deleteChallengeAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("monthly_challenges").delete().eq("id", id);
  revalidatePath("/admin/desafios");
}
