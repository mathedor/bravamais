import { NextResponse } from "next/server";
import { runRecurringBilling } from "@/lib/recurring";

/**
 * Cron diário: cobrança recorrente.
 *  - Cartão (Stripe): cobra off-session automaticamente.
 *  - PIX (SyncPay): gera nova cobrança e notifica (sem débito automático).
 * Suspende após falhas/carência. Configurado em vercel.json.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const stats = await runRecurringBilling();
  return NextResponse.json({ ok: true, ...stats });
}
