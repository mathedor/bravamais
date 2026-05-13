"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: string } | undefined;

export async function toggleAmbassadorAction(formData: FormData): Promise<void> {
  const { establishment, user } = await requireEstablishment();
  const userId = String(formData.get("user_id") || "");
  const currentlyIs = String(formData.get("currently_is") || "") === "true";
  if (!userId) return;

  const admin = createAdminClient();
  if (currentlyIs) {
    await admin.from("ambassadors").delete().eq("establishment_id", establishment.id).eq("user_id", userId);
    await logActivity({ userId: user.id, entityType: "establishment", entityId: establishment.id, action: "ambassador_removed" });
  } else {
    await admin
      .from("ambassadors")
      .upsert(
        { establishment_id: establishment.id, user_id: userId },
        { onConflict: "establishment_id,user_id" },
      );
    await logActivity({ userId: user.id, entityType: "establishment", entityId: establishment.id, action: "ambassador_added" });

    // Notifica o cliente
    await admin.from("notifications").insert({
      user_id: userId,
      type: "system",
      title: `⭐ Você é embaixador da ${establishment.name}!`,
      body: "Status VIP no balcão. A loja vai te mimar com promoções exclusivas.",
      link: `/app/estabelecimento/${establishment.slug}`,
    });
  }

  revalidatePath("/loja/clientes");
}

export async function sendPersonalCouponAction(_: State, formData: FormData): Promise<State> {
  const { establishment, user } = await requireEstablishment();
  const userId = String(formData.get("user_id") || "");
  const userName = String(formData.get("user_name") || "");
  const discount = parseInt(String(formData.get("discount_percent") || "10"), 10);
  const days = parseInt(String(formData.get("days") || "7"), 10);
  const note = String(formData.get("note") || "").trim();
  if (!userId || !discount) return { error: "Faltam campos." };

  const admin = createAdminClient();
  const code = `VIP-${userName.replace(/[^A-Z]/gi, "").slice(0, 4).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const validUntil = new Date(Date.now() + days * 86400000).toISOString();

  const { data: coupon, error } = await admin
    .from("coupons")
    .insert({
      establishment_id: establishment.id,
      code,
      description: note || `Cupom personalizado pra ${userName}`,
      discount_percent: discount,
      max_uses: 1,
      max_uses_per_user: 1,
      valid_until: validUntil,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !coupon) return { error: error?.message ?? "Falha." };

  await admin.from("notifications").insert({
    user_id: userId,
    type: "system",
    title: `🎁 Cupom exclusivo da ${establishment.name}`,
    body: `${discount}% off, válido por ${days} dias. Código ${code}.${note ? " — " + note : ""}`,
    link: `/app/estabelecimento/${establishment.slug}`,
  });

  await logActivity({
    userId: user.id,
    entityType: "establishment",
    entityId: establishment.id,
    action: "personal_coupon_sent",
  });

  revalidatePath("/loja/clientes");
  return { ok: `Cupom ${code} enviado pra ${userName}.` };
}
