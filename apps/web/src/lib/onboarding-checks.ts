import { createAdminClient } from "@/lib/supabase/admin";
import { grantCoins, COIN_REWARDS } from "@/lib/coins";

/**
 * Roda checagens passivas a cada visita ao /app:
 *   - Brinde de aniversário (uma vez por ano)
 *   - Confirma referral pendente quando o indicado já tem subscription ativa/trial
 */
export async function runOnboardingChecks(userId: string): Promise<void> {
  const admin = createAdminClient();

  try {
    // ---- BIRTHDAY ----
    const { data: profile } = await admin
      .from("profiles")
      .select("birthdate, last_birthday_gift_at, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.birthdate) {
      const today = new Date();
      const birth = new Date(profile.birthdate);
      const isBirthday =
        birth.getUTCMonth() === today.getUTCMonth() &&
        birth.getUTCDate() === today.getUTCDate();

      const lastGiftYear = profile.last_birthday_gift_at
        ? new Date(profile.last_birthday_gift_at).getUTCFullYear()
        : 0;

      if (isBirthday && lastGiftYear !== today.getUTCFullYear()) {
        await grantCoins({
          userId,
          delta: COIN_REWARDS.birthday_gift,
          reason: "birthday_gift",
          entityType: "birthday",
          entityId: undefined,
        });
        await admin.from("profiles").update({ last_birthday_gift_at: today.toISOString() }).eq("id", userId);
        await admin.from("notifications").insert({
          user_id: userId,
          type: "system",
          title: "🎂 Feliz aniversário!",
          body: `Te demos ${COIN_REWARDS.birthday_gift} BRAVA Coins de presente. Aproveita o dia!`,
          link: "/app/carteira",
        });
      }
    }

    // ---- REFERRAL CONFIRM ----
    // Se este user foi indicado e sua subscription já é ativa/trial, confirma o bônus.
    const { data: pendingRef } = await admin
      .from("referrals")
      .select("id")
      .eq("referred_user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingRef) {
      const { data: sub } = await admin
        .from("subscriptions")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();
      if (sub && ["active", "trial"].includes(sub.status)) {
        await admin.rpc("confirm_referral", { p_referred_user_id: userId });
      }
    }
  } catch (err) {
    console.error("runOnboardingChecks failed", err);
  }
}
