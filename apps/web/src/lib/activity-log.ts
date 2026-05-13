import { createAdminClient } from "@/lib/supabase/admin";

export type LogAction =
  | "auth_signin"
  | "auth_signout"
  | "auth_signup"
  | "visit_registered"
  | "reward_claimed"
  | "reward_used"
  | "gift_card_purchased"
  | "gift_card_redeemed"
  | "story_posted"
  | "story_deleted"
  | "coupon_created"
  | "coupon_deleted"
  | "establishment_created"
  | "establishment_updated"
  | "admin_password_reset"
  | "admin_role_changed"
  | "admin_user_suspended"
  | "admin_establishment_suspended"
  | "admin_establishment_updated"
  | "admin_establishment_verified"
  | "ambassador_added"
  | "ambassador_removed"
  | "personal_coupon_sent"
  | "promo_blast_fired";

export type LogEntity = "user" | "establishment" | "coupon" | "gift_card" | "reward" | "story" | "subscription" | "order";

interface LogParams {
  userId: string | null;
  entityType: LogEntity;
  entityId: string;
  action: LogAction;
}

export async function logActivity({ userId, entityType, entityId, action }: LogParams): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("access_logs").insert({
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action,
    });
  } catch (err) {
    // fail silently — não pode quebrar a action principal
    console.warn("[activity-log] failed:", err);
  }
}
