import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Recalcula o progresso de TODOS os desafios ativos do usuário.
 * Chamado depois de eventos relevantes (visit, coupon, gift card).
 * Idempotente e fire-and-forget.
 */
export async function recomputeChallengeProgress(userId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: active } = await admin
    .from("monthly_challenges")
    .select("id, kind, target_category_slug, target_n, starts_at, ends_at")
    .eq("is_active", true)
    .gte("ends_at", new Date().toISOString());

  if (!active || active.length === 0) return;

  for (const c of active) {
    let count = 0;

    if (c.kind === "visits_in_category") {
      if (!c.target_category_slug) continue;
      const { data } = await admin
        .from("visits")
        .select("establishment_id, created_at, establishments!inner(establishment_categories!inner(categories!inner(slug)))")
        .eq("user_id", userId)
        .gte("created_at", c.starts_at)
        .lte("created_at", c.ends_at);
      type Row = { establishments: { establishment_categories: { categories: { slug: string } }[] } };
      const rows = (data as unknown as Row[] | null) ?? [];
      count = rows.filter((r) => r.establishments?.establishment_categories?.some((ec) => ec.categories?.slug === c.target_category_slug)).length;
    } else if (c.kind === "coupons_redeemed") {
      const { count: n } = await admin
        .from("coupon_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("redeemed_at", c.starts_at)
        .lte("redeemed_at", c.ends_at);
      count = n ?? 0;
    } else if (c.kind === "distinct_estabs_visited") {
      const { data } = await admin
        .from("visits")
        .select("establishment_id")
        .eq("user_id", userId)
        .gte("created_at", c.starts_at)
        .lte("created_at", c.ends_at);
      const distinct = new Set((data ?? []).map((v) => v.establishment_id));
      count = distinct.size;
    } else if (c.kind === "gift_cards_purchased") {
      const { count: n } = await admin
        .from("gift_cards")
        .select("*", { count: "exact", head: true })
        .eq("buyer_user_id", userId)
        .gte("created_at", c.starts_at)
        .lte("created_at", c.ends_at);
      count = n ?? 0;
    }

    const completed = count >= c.target_n;

    const { data: existing } = await admin
      .from("challenge_progress")
      .select("id, count, completed_at")
      .eq("challenge_id", c.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      if (existing.count === count && !!existing.completed_at === completed) continue;
      await admin
        .from("challenge_progress")
        .update({
          count,
          completed_at: completed && !existing.completed_at ? new Date().toISOString() : existing.completed_at,
        })
        .eq("id", existing.id);
    } else if (count > 0) {
      await admin.from("challenge_progress").insert({
        challenge_id: c.id,
        user_id: userId,
        count,
        completed_at: completed ? new Date().toISOString() : null,
      });
    }
  }
}
