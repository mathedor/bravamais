import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron diário: processa solicitações de exclusão de conta (LGPD) que
 * passaram do scheduled_for.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: due } = await admin
    .from("deletion_requests")
    .select("id, user_id")
    .lte("scheduled_for", now)
    .is("processed_at", null)
    .is("cancelled_at", null);

  let processed = 0;
  for (const req of (due ?? [])) {
    try {
      // Marca como processado antes de deletar (evita reprocess)
      await admin.from("deletion_requests").update({ processed_at: new Date().toISOString() }).eq("id", req.id);
      // Cascade vai limpar perfil + visits + orders + tudo via FK
      await admin.auth.admin.deleteUser(req.user_id);
      processed += 1;
    } catch (err) {
      console.error("[cron] delete failed for", req.user_id, err);
    }
  }

  return NextResponse.json({ ok: true, processed });
}
