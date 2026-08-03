import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Conector da Ana — baixa de chamado · POST /api/ana/chamados/resolver · Bearer ANA_PULSO_TOKEN
 * Body: { "id": "<uuid do support_ticket>" } — marca status='resolved' + resolved_at.
 */
export async function POST(req: Request) {
  const token = process.env.ANA_PULSO_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ ok: false, erro: "id obrigatorio" }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    const { data, error } = await admin
      .from("support_tickets")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();
    // uuid inválido vem como erro do Postgres — trata como não encontrado
    if (error || !data) {
      return NextResponse.json({ ok: false, erro: "nao encontrado" }, { status: 404 });
    }
    if (data.status === "resolved" || data.status === "closed") {
      return NextResponse.json({ ok: true, ja_estava: true });
    }
    const { error: e2 } = await admin
      .from("support_tickets")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", id);
    if (e2) throw e2;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, erro: "falha ao resolver" }, { status: 500 });
  }
}
