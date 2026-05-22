import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron diário do Benefício Renovável.
 * - Expira grants vencidos não-usados (NÃO ACUMULATIVO).
 * - Cria novo grant pros membros elegíveis sem grant ativo.
 * - Notifica cada um.
 * Roda via dispatch_renewable_benefits (idempotente + batelado).
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("dispatch_renewable_benefits", { p_limit: 2000 });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const result = data?.[0] ?? { created_count: 0, expired_count: 0 };
  return NextResponse.json({
    ok: true,
    created: result.created_count,
    expired: result.expired_count,
    ts: new Date().toISOString(),
  });
}
