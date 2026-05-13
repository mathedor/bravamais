"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantCoins } from "@/lib/coins";

interface Prize {
  id: string;
  label: string;
  kind: "coupon" | "coins" | "nothing";
  weight: number;
  value?: number;
  coupon_id?: string;
}

export type SpinResult =
  | {
      ok: true;
      prizeId: string;
      prizeLabel: string;
      prizeKind: string;
      couponCode?: string;
      coinsGranted?: number;
    }
  | { ok: false; error: string };

export async function spinAction(drawId: string): Promise<SpinResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Faça login pra girar." };

  const admin = createAdminClient();

  const { data: draw } = await admin
    .from("lucky_draws")
    .select("id, establishment_id, prizes, max_spins_per_user_day, is_active")
    .eq("id", drawId)
    .maybeSingle();
  if (!draw || !draw.is_active) return { ok: false, error: "Roleta indisponível." };

  // Limite por dia
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count } = await admin
    .from("lucky_draw_spins")
    .select("*", { count: "exact", head: true })
    .eq("draw_id", drawId)
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  if ((count ?? 0) >= draw.max_spins_per_user_day) {
    return { ok: false, error: "Você já girou hoje. Volte amanhã 🌅" };
  }

  const prizes = (draw.prizes as Prize[]) ?? [];
  if (prizes.length === 0) return { ok: false, error: "Sem prêmios configurados." };

  // Weighted random
  const totalWeight = prizes.reduce((s, p) => s + Math.max(1, p.weight), 0);
  let roll = Math.random() * totalWeight;
  let picked: Prize = prizes[0];
  for (const p of prizes) {
    roll -= Math.max(1, p.weight);
    if (roll <= 0) {
      picked = p;
      break;
    }
  }

  // Aplicar prêmio
  let couponId: string | null = null;
  let couponCode: string | undefined;
  let coinsGranted = 0;

  if (picked.kind === "coupon") {
    // gera cupom one-shot
    couponCode = `LUCK${Math.floor(Math.random() * 90000 + 10000)}`;
    const { data: coupon } = await admin
      .from("coupons")
      .insert({
        establishment_id: draw.establishment_id,
        code: couponCode,
        description: picked.label,
        discount_percent: picked.value ?? 10,
        max_uses: 1,
        max_uses_per_user: 1,
        valid_until: new Date(Date.now() + 14 * 86400000).toISOString(),
        is_active: true,
      })
      .select("id")
      .single();
    couponId = coupon?.id ?? null;
  } else if (picked.kind === "coins") {
    coinsGranted = picked.value ?? 10;
    await grantCoins({
      userId: user.id,
      delta: coinsGranted,
      reason: "redeem_reward",
      entityType: "lucky_draw",
      entityId: drawId,
    });
  }

  await admin.from("lucky_draw_spins").insert({
    draw_id: drawId,
    establishment_id: draw.establishment_id,
    user_id: user.id,
    prize_id: picked.id,
    prize_label: picked.label,
    prize_kind: picked.kind,
    coupon_id: couponId,
    coins_granted: coinsGranted,
  });

  return {
    ok: true,
    prizeId: picked.id,
    prizeLabel: picked.label,
    prizeKind: picked.kind,
    couponCode,
    coinsGranted,
  };
}
