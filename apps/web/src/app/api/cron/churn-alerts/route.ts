import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendChurnRetentionEmail } from "@/lib/email";

/**
 * Cron diário: detecta users sem visita há 30+ dias, cria cupom retenção,
 * notifica (push já vai pela tabela notifications + sw.js) e manda email.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: rpcResult, error } = await admin.rpc("dispatch_churn_retention", { p_limit: 500 });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Dispara emails pra ofertas recém-criadas (últimos 5 min)
  const { data: recentOffers } = await admin
    .from("retention_offers")
    .select("id, user_id, coupon_id, profiles(full_name), coupons(code, establishments(name))")
    .gt("sent_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .eq("email_sent", false)
    .limit(500);

  type Row = {
    id: string;
    user_id: string;
    profiles: { full_name: string | null } | null;
    coupons: { code: string; establishments: { name: string } | null } | null;
  };

  let emailSent = 0;
  for (const r of (recentOffers as unknown as Row[] | null) ?? []) {
    // Busca email do user
    const { data: userRow } = await admin.from("profiles").select("id").eq("id", r.user_id).maybeSingle();
    if (!userRow) continue;
    const { data: authUser } = await admin.auth.admin.getUserById(r.user_id);
    const email = authUser?.user?.email;
    const code = r.coupons?.code ?? "";
    const estabName = r.coupons?.establishments?.name ?? "um parceiro";
    if (email && code) {
      try {
        await sendChurnRetentionEmail({
          to: email,
          name: r.profiles?.full_name ?? "",
          code,
          estabName,
        });
        await admin.from("retention_offers").update({ email_sent: true }).eq("id", r.id);
        emailSent += 1;
      } catch {
        // ignore email errors — notif já foi
      }
    }
  }

  return NextResponse.json({
    ...((rpcResult as Record<string, unknown>) ?? {}),
    email_sent: emailSent,
    ts: new Date().toISOString(),
  });
}
