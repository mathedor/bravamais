"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: string } | undefined;

export async function fireBlastAction(_: State, formData: FormData): Promise<State> {
  const { establishment, user } = await requireEstablishment();
  const audience = String(formData.get("audience") || "recent_visitors");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const discountPct = parseInt(String(formData.get("discount_percent") || "0"), 10);
  const hours = parseInt(String(formData.get("hours") || "2"), 10);
  if (!title || !body) return { error: "Título e mensagem são obrigatórios." };

  const admin = createAdminClient();

  // Resolve audience → user_ids
  let userIds: Set<string> = new Set();
  if (audience === "ambassadors") {
    const { data } = await admin.from("ambassadors").select("user_id").eq("establishment_id", establishment.id);
    userIds = new Set((data ?? []).map((d) => d.user_id));
  } else {
    const sinceFilter = audience === "recent_visitors"
      ? new Date(Date.now() - 90 * 86400000).toISOString()
      : null;
    let q = admin.from("visits").select("user_id").eq("establishment_id", establishment.id);
    if (sinceFilter) q = q.gte("created_at", sinceFilter);
    const { data } = await q;
    userIds = new Set((data ?? []).map((d) => d.user_id));
  }

  if (userIds.size === 0) return { error: "Sem público na audiência selecionada." };

  // Cria cupom flash se houver desconto
  let couponId: string | null = null;
  let couponCode: string | null = null;
  const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
  if (discountPct > 0) {
    couponCode = `FLASH${Math.floor(Math.random() * 9000 + 1000)}`;
    const { data: coupon, error } = await admin
      .from("coupons")
      .insert({
        establishment_id: establishment.id,
        code: couponCode,
        description: `Flash · ${hours}h · ${body}`,
        discount_percent: discountPct,
        max_uses: userIds.size,
        max_uses_per_user: 1,
        valid_until: expiresAt,
        is_active: true,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    couponId = coupon?.id ?? null;
  }

  // Insert blast row
  const { data: blast } = await admin
    .from("promo_blasts")
    .insert({
      establishment_id: establishment.id,
      fired_by_user_id: user.id,
      title,
      body,
      coupon_id: couponId,
      audience,
      sent_count: userIds.size,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  // Cria notificações em lote
  const notifsRows = Array.from(userIds).map((uid) => ({
    user_id: uid,
    type: "establishment_news" as const,
    title,
    body: couponCode ? `${body}\nCódigo: ${couponCode}` : body,
    link: `/app/estabelecimento/${establishment.slug}`,
  }));

  // Chunk de 500
  for (let i = 0; i < notifsRows.length; i += 500) {
    await admin.from("notifications").insert(notifsRows.slice(i, i + 500));
  }

  await logActivity({
    userId: user.id,
    entityType: "establishment",
    entityId: establishment.id,
    action: "promo_blast_fired",
  });

  revalidatePath("/loja/blast");
  revalidatePath("/loja");

  return {
    ok: `${userIds.size} pessoas notificadas${couponCode ? ` · cupom ${couponCode}` : ""}. Blast #${(blast?.id ?? "").slice(0, 8)} disparado.`,
  };
}
