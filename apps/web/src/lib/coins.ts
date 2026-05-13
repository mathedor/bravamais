import { createAdminClient } from "@/lib/supabase/admin";

export const COIN_REWARDS = {
  visit: 5,
  coupon_redeemed: 10,
  order_paid_per_real: 1, // 1 coin a cada R$ 10 (1% cashback aproximado)
  referral_bonus: 50,
  birthday_gift: 100,
} as const;

export type CoinReason =
  | "visit"
  | "coupon_redeemed"
  | "order_paid"
  | "referral_bonus"
  | "referral_welcome"
  | "birthday_gift"
  | "redeem_reward";

export async function grantCoins(args: {
  userId: string;
  delta: number;
  reason: CoinReason;
  entityType?: string;
  entityId?: string;
}): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("grant_coins", {
    p_user_id: args.userId,
    p_delta: args.delta,
    p_reason: args.reason,
    p_entity_type: args.entityType ?? null,
    p_entity_id: args.entityId ?? null,
  });
  if (error) {
    console.error("grant_coins failed", error);
    return 0;
  }
  return Number(data ?? 0);
}

export function coinsToBRL(coins: number): string {
  // 100 coins = R$ 5,00 (1 coin = R$ 0,05)
  return (coins * 0.05).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const COIN_TO_CENTS = 5; // 1 coin = 5 centavos
