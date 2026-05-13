import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const admin = createAdminClient();
  const [
    { data: profile },
    { data: subscription },
    { data: visits },
    { data: orders },
    { data: redemptions },
    { data: giftCards },
    { data: rewards },
    { data: coinTx },
    { data: notifications },
    { data: favorites },
    { data: reviews },
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    admin.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    admin.from("visits").select("id, establishment_id, source, created_at").eq("user_id", user.id),
    admin.from("orders").select("id, establishment_id, status, total_cents, created_at").eq("user_id", user.id),
    admin.from("coupon_redemptions").select("id, coupon_id, redeemed_at, discount_applied_cents").eq("user_id", user.id),
    admin.from("gift_cards").select("id, code, value_cents, remaining_cents, created_at").eq("granted_to_user_id", user.id),
    admin.from("loyalty_rewards").select("id, establishment_id, benefit_description, claimed_at, used_at").eq("user_id", user.id),
    admin.from("coin_transactions").select("delta, reason, created_at").eq("user_id", user.id),
    admin.from("notifications").select("type, title, body, link, created_at, read_at").eq("user_id", user.id),
    admin.from("favorites").select("establishment_id, created_at").eq("user_id", user.id),
    admin.from("reviews").select("establishment_id, rating, body, created_at").eq("user_id", user.id),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    profile,
    subscription,
    visits,
    orders,
    coupon_redemptions: redemptions,
    gift_cards: giftCards,
    loyalty_rewards: rewards,
    coin_transactions: coinTx,
    notifications,
    favorites,
    reviews,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="brava-dados-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
