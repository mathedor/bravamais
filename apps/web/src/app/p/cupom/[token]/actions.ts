"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantCoins, COIN_REWARDS } from "@/lib/coins";

export async function claimSharedCouponAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const token = String(formData.get("token") || "");
  if (!user || !token) redirect("/entrar");

  const admin = createAdminClient();
  const { data: share } = await admin
    .from("shared_coupons")
    .select("id, coupon_id, sender_user_id, redeemed_by_user_id, expires_at")
    .eq("share_token", token)
    .maybeSingle();
  if (!share) redirect("/");
  if (share.sender_user_id === user.id) redirect(`/p/cupom/${token}`);
  if (share.redeemed_by_user_id) redirect(`/p/cupom/${token}`);
  if (new Date(share.expires_at) < new Date()) redirect(`/p/cupom/${token}`);

  // Marca como usado e cria uma redemption normal
  const { data: coupon } = await admin
    .from("coupons")
    .select("id, uses_count, discount_cents, establishment_id, establishments(slug, name)")
    .eq("id", share.coupon_id)
    .maybeSingle();
  if (!coupon) redirect("/");

  await admin.from("shared_coupons")
    .update({ redeemed_by_user_id: user.id, redeemed_at: new Date().toISOString() })
    .eq("id", share.id);

  const { data: redemption } = await admin.from("coupon_redemptions").insert({
    coupon_id: share.coupon_id,
    user_id: user.id,
    discount_applied_cents: coupon.discount_cents ?? null,
  }).select("id").single();

  await admin.from("coupons").update({ uses_count: (coupon.uses_count ?? 0) + 1 }).eq("id", share.coupon_id);

  if (redemption?.id) {
    await grantCoins({
      userId: user.id,
      delta: COIN_REWARDS.coupon_redeemed,
      reason: "coupon_redeemed",
      entityType: "coupon",
      entityId: redemption.id,
    });
  }

  // Notifica quem enviou
  await admin.from("notifications").insert({
    user_id: share.sender_user_id,
    type: "system",
    title: "🎉 Seu amigo usou o cupom!",
    body: "Valeu por trazer mais gente pro clube.",
    link: "/app/carteira",
  });

  const estabSlug = (coupon.establishments as unknown as { slug: string } | null)?.slug ?? "";
  redirect(`/app/estabelecimento/${estabSlug}?ok=cupom-aplicado`);
}
