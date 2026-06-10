import { NextResponse } from "next/server";
import { parseSyncWebhook, consultar } from "@/lib/syncpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillByChargeId } from "@/lib/payments";

/**
 * Webhook SyncPay (PIX cash-in).
 * SyncPay manda { identifier, status }. Confirmamos no servidor (consultar)
 * antes de marcar pago — nunca confiamos só no webhook.
 *
 * Configurar no painel SyncPay: https://www.bravamais.com.br/api/syncpay/webhook
 */
export async function POST(req: Request) {
  const body = await req.text();
  const event = parseSyncWebhook(body);
  if (!event) return NextResponse.json({ ok: true, skipped: "no-id" });

  // guarda bruto sempre (debug)
  const admin = createAdminClient();
  await admin
    .from("payments")
    .update({ raw: { webhook: body } })
    .eq("gateway_charge_id", event.identifier)
    .neq("status", "paid");

  if (event.status !== "completed" && event.status !== "approved" && event.status !== "paid") {
    return NextResponse.json({ ok: true, noop: event.status });
  }

  try {
    const check = await consultar(event.identifier);
    if (check.status !== "paid") return NextResponse.json({ ok: true, noop: check.status });
    const r = await fulfillByChargeId("syncpay", event.identifier);
    return NextResponse.json({ ok: true, found: r.found });
  } catch (e) {
    console.error("[syncpay webhook]", e);
    return NextResponse.json({ ok: true, err: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
