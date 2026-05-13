"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createShareLinkAction(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Faça login." };

  const couponId = String(formData.get("coupon_id") || "");
  const recipientHint = String(formData.get("recipient_hint") || "").trim() || null;
  if (!couponId) return { ok: false, error: "Cupom inválido." };

  const admin = createAdminClient();
  const { data: share, error } = await admin.from("shared_coupons").insert({
    sender_user_id: user.id,
    coupon_id: couponId,
    recipient_hint: recipientHint,
  }).select("share_token").single();
  if (error || !share) return { ok: false, error: error?.message ?? "Falha" };

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://brava-mais.vercel.app";
  return { ok: true, url: `${base}/p/cupom/${share.share_token}` };
}
