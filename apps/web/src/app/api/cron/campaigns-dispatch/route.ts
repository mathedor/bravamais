import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron horário: dispara campanhas com status='scheduled' e scheduled_at <= now().
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: due } = await admin
    .from("campaigns")
    .select("id")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(20);

  let dispatched = 0;
  for (const c of (due ?? []) as { id: string }[]) {
    const { error } = await admin.rpc("dispatch_campaign", { p_campaign_id: c.id });
    if (!error) dispatched += 1;
  }

  return NextResponse.json({ ok: true, dispatched, ts: new Date().toISOString() });
}
