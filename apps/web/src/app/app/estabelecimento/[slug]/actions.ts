"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { sendGiftCardEmail } from "@/lib/email";
import { grantCoins, COIN_REWARDS } from "@/lib/coins";

export interface GiftCardPurchaseResult {
  ok?: boolean;
  error?: string;
  code?: string;
  shareUrl?: string;
}

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `GIFT-${s}`;
}

export async function buyGiftCardAction(args: {
  establishmentSlug: string;
  valueCents: number;
  recipientName: string | null;
  message: string | null;
}): Promise<GiftCardPurchaseResult> {
  if (args.valueCents < 1000) return { error: "Valor mínimo R$ 10,00" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login pra comprar." };

  const { data: estab } = await supabase
    .from("establishments")
    .select("id, name")
    .eq("slug", args.establishmentSlug)
    .maybeSingle();
  if (!estab) return { error: "Estabelecimento não encontrado." };

  const admin = createAdminClient();
  const code = makeCode();
  const { data: insertedGift, error } = await admin.from("gift_cards").insert({
    establishment_id: estab.id,
    code,
    value_cents: args.valueCents,
    remaining_cents: args.valueCents,
    buyer_user_id: user.id,
    recipient_name: args.recipientName,
    recipient_message: args.message,
    granted_by: "purchase",
    granted_to_user_id: user.id,
    status: "paid", // modo simulação — já marca como pago
    efi_charge_id: `mock_${Date.now()}`,
  }).select("id").single();
  if (error) return { error: error.message };

  await logActivity({
    userId: user.id,
    entityType: "establishment",
    entityId: estab.id,
    action: "gift_card_purchased",
  });

  // BRAVA Coins: 1% cashback no valor do vale-presente
  if (insertedGift?.id) {
    const giftCoins = Math.max(1, Math.floor(args.valueCents / 1000));
    await grantCoins({
      userId: user.id,
      delta: giftCoins,
      reason: "order_paid",
      entityType: "gift_card",
      entityId: insertedGift.id,
    });
  }

  if (user.email) {
    const { data: profile } = await admin.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    const valueBRL = (args.valueCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    sendGiftCardEmail({
      to: user.email,
      buyerName: profile?.full_name ?? "amigo",
      recipientName: args.recipientName,
      establishmentName: estab.name,
      valueBRL,
      code,
    }).catch(() => {});
  }

  return {
    ok: true,
    code,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/presente/${code}`,
  };
}

export type UseCouponResult = { ok: true } | { ok: false; error: string };

export async function useCouponAction(couponId: string): Promise<UseCouponResult> {
  if (!couponId) return { ok: false, error: "Cupom inválido." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Faça login pra usar." };

  const admin = createAdminClient();

  const { data: coupon } = await admin
    .from("coupons")
    .select("id, code, is_active, valid_until, uses_count, max_uses, max_uses_per_user, tier_required, establishment_id, discount_cents, discount_percent")
    .eq("id", couponId)
    .maybeSingle();
  if (!coupon) return { ok: false, error: "Cupom não encontrado." };
  if (!coupon.is_active) return { ok: false, error: "Cupom inativo." };
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date())
    return { ok: false, error: "Cupom expirado." };
  if (coupon.max_uses && coupon.uses_count >= coupon.max_uses)
    return { ok: false, error: "Cupom esgotado." };

  // Check limit per user
  if (coupon.max_uses_per_user) {
    const { count } = await admin
      .from("coupon_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("user_id", user.id);
    if ((count ?? 0) >= coupon.max_uses_per_user) {
      return { ok: false, error: "Limite por usuário atingido pra esse cupom." };
    }
  }

  // Registra
  const { data: redemption } = await admin
    .from("coupon_redemptions")
    .insert({
      coupon_id: coupon.id,
      user_id: user.id,
      discount_applied_cents: coupon.discount_cents ?? null,
    })
    .select("id")
    .single();
  await admin
    .from("coupons")
    .update({ uses_count: (coupon.uses_count ?? 0) + 1 })
    .eq("id", coupon.id);

  await logActivity({
    userId: user.id,
    entityType: "establishment",
    entityId: coupon.establishment_id,
    action: "coupon_created", // reusing — could add "coupon_used"
  });

  // BRAVA Coins: +10 por cupom usado
  if (redemption?.id) {
    await grantCoins({
      userId: user.id,
      delta: COIN_REWARDS.coupon_redeemed,
      reason: "coupon_redeemed",
      entityType: "coupon",
      entityId: redemption.id,
    });
  }

  return { ok: true };
}
