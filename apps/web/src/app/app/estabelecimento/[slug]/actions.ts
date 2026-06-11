"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { grantCoins, COIN_REWARDS } from "@/lib/coins";
import { recomputeChallengeProgress } from "@/lib/challenges";
import { createPayment, type CreatePixResult, type CreateCardResult } from "@/lib/payments";
import { getPayer } from "@/lib/payer";

export interface GiftCardArgs {
  establishmentSlug: string;
  valueCents: number;
  recipientName: string | null;
  message: string | null;
}

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `GIFT-${s}`;
}

async function startGiftCard(args: GiftCardArgs, method: "pix" | "card") {
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

  const payer = await getPayer();
  if (!payer) return { error: "Faça login pra comprar." };

  const code = makeCode();
  return createPayment({
    kind: "gift_card",
    refId: estab.id,
    refMeta: {
      establishment_id: estab.id,
      establishment_name: estab.name,
      code,
      recipient_name: args.recipientName,
      message: args.message,
    },
    method,
    amountCents: args.valueCents,
    description: `Vale-presente ${estab.name}`,
    statementSuffix: "BRAVAMAIS",
    payer,
  });
}

export async function createGiftCardPix(args: GiftCardArgs): Promise<CreatePixResult | { error: string }> {
  return (await startGiftCard(args, "pix")) as CreatePixResult | { error: string };
}

export async function createGiftCardCard(args: GiftCardArgs): Promise<CreateCardResult | { error: string }> {
  return (await startGiftCard(args, "card")) as CreateCardResult | { error: string };
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

  recomputeChallengeProgress(user.id).catch(() => {});

  return { ok: true };
}
