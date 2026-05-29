import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron diário pra processar renovações automáticas da BRAVA Tag.
 * - Pega wallets com monthly_active=true e monthly_next_charge vencido
 * - Credita o saldo do plano, registra transação, notifica usuário
 * - Agenda próxima renovação +1 mês
 *
 * Roda via tag_run_monthly_renewals (idempotente + batelado).
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("tag_run_monthly_renewals", { p_limit: 1000 });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...((data as Record<string, unknown>) ?? {}),
    ts: new Date().toISOString(),
  });
}
