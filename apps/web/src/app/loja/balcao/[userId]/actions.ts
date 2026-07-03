"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

export interface PosSaleResult {
  ok: boolean;
  error?: string;
  sale_id?: string;
  gross_cents?: number;
  discount_cents?: number;
  net_cents?: number;
  benefit_kind?: string;
  benefit_label?: string | null;
  user_name?: string | null;
  min_order_cents?: number;
}

export async function recordPosSaleAction(formData: FormData): Promise<PosSaleResult> {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const userId = String(formData.get("user_id") ?? "");
  const grossReais = Number(formData.get("gross_reais") ?? 0);
  const benefitKind = (String(formData.get("benefit_kind") ?? "none") || "none") as
    | "coupon"
    | "gift_card"
    | "loyalty_reward"
    | "renewable"
    | "none";
  const benefitRefIdRaw = String(formData.get("benefit_ref_id") ?? "").trim();
  const benefitRefId = benefitRefIdRaw && benefitRefIdRaw !== "null" ? benefitRefIdRaw : null;

  if (!userId) return { ok: false, error: "Cliente não identificado." };
  if (!Number.isFinite(grossReais) || grossReais < 0) {
    return { ok: false, error: "Valor da venda inválido." };
  }

  const grossCents = Math.round(grossReais * 100);

  const { data, error } = await supabase.rpc("record_pos_sale", {
    p_estab_id: establishment.id,
    p_user_id: userId,
    p_gross_cents: grossCents,
    p_benefit_kind: benefitKind,
    p_benefit_ref_id: benefitRefId,
  });

  if (error) return { ok: false, error: error.message };

  {
    const { trackEvent } = await import("@/lib/observability");
    trackEvent({
      userId,
      event: "benefit_redeemed",
      properties: { kind: benefitKind ?? "none", gross_cents: grossCents, source: "balcao" },
    }).catch(() => {});
  }

  revalidatePath(`/loja/balcao/${userId}`);
  revalidatePath("/loja");
  revalidatePath("/loja/receita");

  return (data ?? { ok: false, error: "sem retorno" }) as PosSaleResult;
}

export async function sendFollowUpCouponAction(formData: FormData): Promise<{ ok: boolean; error?: string; code?: string }> {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const userId = String(formData.get("user_id") ?? "");
  const userName = String(formData.get("user_name") ?? "");
  if (!userId) return { ok: false, error: "missing_user" };

  // Cria cupom de fidelização — 10% off, 7 dias
  const discount = 10;
  const days = 7;
  const initials = userName.replace(/[^A-Z]/gi, "").slice(0, 4).toUpperCase() || "PROX";
  const code = `RETORNO-${initials}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const validUntil = new Date(Date.now() + days * 86400000).toISOString();

  const { data: coupon, error: cErr } = await supabase
    .from("coupons")
    .insert({
      establishment_id: establishment.id,
      code,
      description: `Cupom de retorno (pós-visita) — ${discount}% off`,
      discount_percent: discount,
      max_uses: 1,
      max_uses_per_user: 1,
      valid_until: validUntil,
      is_active: true,
    })
    .select("id")
    .single();

  if (cErr || !coupon) return { ok: false, error: cErr?.message ?? "Falha." };

  await supabase
    .from("coupon_grants")
    .upsert(
      { user_id: userId, coupon_id: coupon.id, source: "personal" },
      { onConflict: "user_id,coupon_id" },
    );

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "system",
    title: `🎁 Volte logo na ${establishment.name}`,
    body: `Cupom de ${discount}% off pros próximos ${days} dias. Código ${code}.`,
    link: "/app/cupons",
  });

  return { ok: true, code };
}
