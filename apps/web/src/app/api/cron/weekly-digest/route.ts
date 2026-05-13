import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWeeklyDigestEstabEmail } from "@/lib/email";
import { formatBRL } from "@/lib/format";

/**
 * Cron semanal (acionar toda segunda-feira via Vercel Cron):
 *   path: /api/cron/weekly-digest
 *   schedule: 0 9 * * 1   (toda segunda 9h UTC)
 *
 * Bater segurança via header Authorization: Bearer ${CRON_SECRET}
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const periodEnd = new Date(now);
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 7);
  const periodStartIso = periodStart.toISOString();
  const periodLabel = `semana de ${periodStart.toLocaleDateString("pt-BR")} a ${periodEnd.toLocaleDateString("pt-BR")}`;
  const periodKey = periodStart.toISOString().slice(0, 10);

  // Estabs ativos com owner email
  const { data: estabs } = await admin
    .from("establishments")
    .select("id, slug, name, owner_id")
    .eq("is_active", true);

  let sent = 0;

  for (const e of (estabs ?? [])) {
    // Já enviou pra essa semana? pula
    const { data: existing } = await admin
      .from("weekly_digests_log")
      .select("id")
      .eq("establishment_id", e.id)
      .eq("period_start", periodKey)
      .maybeSingle();
    if (existing) continue;

    // Stats da semana
    const [{ count: visits }, { count: coupons }, { data: paid }, { data: firstOrders }] = await Promise.all([
      admin.from("visits").select("*", { count: "exact", head: true }).eq("establishment_id", e.id).gte("created_at", periodStartIso),
      admin.from("coupon_redemptions")
        .select("id, coupons!inner(establishment_id)", { count: "exact", head: true })
        .eq("coupons.establishment_id", e.id)
        .gte("redeemed_at", periodStartIso),
      admin.from("orders").select("total_cents").eq("establishment_id", e.id).in("status", ["paid", "completed"]).gte("created_at", periodStartIso),
      admin.from("visits").select("user_id, created_at").eq("establishment_id", e.id).gte("created_at", periodStartIso),
    ]);

    type Order = { total_cents: number };
    const revenue = ((paid as Order[] | null) ?? []).reduce((s, o) => s + o.total_cents, 0);

    // Clientes "novos" = primeira visita nesse estab caiu dentro do período
    const visitsWeek = (firstOrders as { user_id: string }[] | null) ?? [];
    const userIds = Array.from(new Set(visitsWeek.map((v) => v.user_id)));
    let newClients = 0;
    if (userIds.length > 0) {
      const { data: priorVisits } = await admin
        .from("visits")
        .select("user_id")
        .eq("establishment_id", e.id)
        .lt("created_at", periodStartIso)
        .in("user_id", userIds);
      const prior = new Set(((priorVisits as { user_id: string }[] | null) ?? []).map((v) => v.user_id));
      newClients = userIds.filter((u) => !prior.has(u)).length;
    }

    const { data: owner } = await admin.auth.admin.getUserById(e.owner_id);
    const email = owner?.user?.email;
    if (!email) continue;

    await sendWeeklyDigestEstabEmail({
      to: email,
      estabName: e.name,
      visits: visits ?? 0,
      coupons: coupons ?? 0,
      revenue: formatBRL(revenue),
      newClients,
      period: periodLabel,
      inspectUrl: `https://brava-mais.vercel.app/loja/receita`,
    });

    await admin.from("weekly_digests_log").insert({
      establishment_id: e.id,
      period_start: periodKey,
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}
