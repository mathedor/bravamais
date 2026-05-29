import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron diário: roda 3 regras de antifraude e popula fraud_signals_log.
 * - visits_burst: mesmo user no mesmo estab >5x em 1h
 * - coupon_velocity: cupons em >=5 estabs no mesmo dia
 * - rapid_signup_redemption: 1ª redenção < 1h depois do signup
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("run_fraud_scan");
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    ...((data as Record<string, unknown>) ?? {}),
    ts: new Date().toISOString(),
  });
}
