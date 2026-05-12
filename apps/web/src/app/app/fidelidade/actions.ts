"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { sendRewardClaimedEmail } from "@/lib/email";

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
       loyalty_clubs(id, visits_required, benefit_description, reward_type,
         reward_discount_percent, reward_discount_cents, reward_value_cents,
         establishments(id, slug, name))`,
    )
    .eq("id", progressId)
    .maybeSingle();

  if (!progress || progress.user_id !== user.id) return;
  if (progress.claimed_at) return; // já resgatado
  if (!progress.completed_at) return; // ainda não pronto

  type Club = {
    id: string;
    visits_required: number;
    benefit_description: string;
    reward_type?: string | null;
    reward_discount_percent?: number | null;
    reward_discount_cents?: number | null;
    reward_value_cents?: number | null;
    establishments: { id: string; slug: string; name: string } | null;
  };
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

  // Geração automática de coupon ou gift_card conforme reward_type
  if (club.reward_type === "coupon") {
    const couponCode = `LOYAL-${makeCode().slice(7)}`;
    await admin.from("coupons").insert({
      establishment_id: club.establishments.id,
      code: couponCode,
      description: `Recompensa fidelidade: ${club.benefit_description}`,
      discount_percent: club.reward_discount_percent ?? null,
      discount_cents: club.reward_discount_cents ?? null,
      max_uses: 1,
      max_uses_per_user: 1,
      is_active: true,
      valid_until: new Date(Date.now() + 60 * 86400000).toISOString(), // 60 dias pra usar
    });
  } else if (club.reward_type === "gift_card" && club.reward_value_cents) {
    const giftCode = `GIFT-${makeCode().slice(7)}`;
    await admin.from("gift_cards").insert({
      establishment_id: club.establishments.id,
      code: giftCode,
      value_cents: club.reward_value_cents,
      remaining_cents: club.reward_value_cents,
      buyer_user_id: user.id,
      granted_to_user_id: user.id,
      granted_by: "loyalty_reward",
      reason: `Recompensa do clube de fidelidade`,
      status: "paid",
      expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
    });
  }

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

  await logActivity({
    userId: user.id,
    entityType: "establishment",
    entityId: club.establishments.id,
    action: "reward_claimed",
  });

  // Email (fire and forget)
  if (user.email) {
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    sendRewardClaimedEmail({
      to: user.email,
      name: profile?.full_name ?? "amigo",
      establishmentName: club.establishments.name,
      benefit: club.benefit_description,
      code,
    }).catch(() => {});
  }

  revalidatePath("/app/fidelidade");
  revalidatePath("/app/premios");
  redirect(`/premio/${code}`);
}
