"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `REWARD-${s}`;
}

export async function claimRewardAction(formData: FormData) {
  const progressId = String(formData.get("progress_id") || "");
  if (!progressId) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();

  // Pega progress + club + establishment
  const { data: progress } = await admin
    .from("loyalty_progress")
    .select(
      `id, user_id, visits_count, completed_at, claimed_at,
       loyalty_clubs(id, visits_required, benefit_description,
         establishments(id, slug, name))`,
    )
    .eq("id", progressId)
    .maybeSingle();

  if (!progress || progress.user_id !== user.id) return;
  if (progress.claimed_at) return; // já resgatado
  if (!progress.completed_at) return; // ainda não pronto

  type Club = { id: string; visits_required: number; benefit_description: string; establishments: { id: string; slug: string; name: string } | null };
  const club = progress.loyalty_clubs as unknown as Club;
  if (!club || !club.establishments) return;

  const code = makeCode();

  // Cria o reward log
  await admin.from("loyalty_rewards").insert({
    user_id: user.id,
    establishment_id: club.establishments.id,
    club_id: club.id,
    benefit_description: club.benefit_description,
    reward_code: code,
  });

  // Marca claimed_at + RESET (visits_count = 0, completed_at = null)
  await admin
    .from("loyalty_progress")
    .update({
      claimed_at: new Date().toISOString(),
      visits_count: 0,
      completed_at: null,
    })
    .eq("id", progress.id);

  // Notification
  await admin.from("notifications").insert({
    user_id: user.id,
    type: "loyalty_reward",
    title: `🎉 Você ganhou uma recompensa na ${club.establishments.name}!`,
    body: club.benefit_description,
    link: `/premio/${code}`,
  });

  revalidatePath("/app/fidelidade");
  revalidatePath("/app/premios");
  redirect(`/premio/${code}`);
}
