"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";

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
  const { error } = await admin.from("gift_cards").insert({
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
  });
  if (error) return { error: error.message };

  await logActivity({
    userId: user.id,
    entityType: "establishment",
    entityId: estab.id,
    action: "gift_card_purchased",
  });

  return {
    ok: true,
    code,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/presente/${code}`,
  };
}
