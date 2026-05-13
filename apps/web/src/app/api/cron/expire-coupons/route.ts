import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron diário: marca cupons vencidos como inativos.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Cupons com valid_until vencido → marca inativo
  const { data: expired } = await admin
    .from("coupons")
    .update({ is_active: false })
    .lt("valid_until", now)
    .eq("is_active", true)
    .select("id");

  // Gift cards vencidos com saldo zerado já estão fora; marca vencidos via expires_at
  const { data: expiredGifts } = await admin
    .from("gift_cards")
    .update({ status: "expired" })
    .lt("expires_at", now)
    .eq("status", "paid")
    .select("id");

  return NextResponse.json({
    ok: true,
    coupons_expired: expired?.length ?? 0,
    gift_cards_expired: expiredGifts?.length ?? 0,
  });
}
