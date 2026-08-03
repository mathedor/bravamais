import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "https://www.bravamais.com.br";

type Chamado = {
  id: string;
  titulo: string;
  de: string;
  status: string;
  prioridade: "normal" | "alta";
  criado_em: string;
  detalhe: string;
  url?: string;
};

/** Conector da Ana — chamados um a um · GET /api/ana/chamados · Bearer ANA_PULSO_TOKEN */
export async function GET(req: Request) {
  const token = process.env.ANA_PULSO_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const admin = createAdminClient();
  const chamados: Chamado[] = [];

  // support_tickets não resolvidos/fechados — mesma entidade do chamados_abertos do pulso
  try {
    const { data, error } = await admin
      .from("support_tickets")
      .select("id, subject, category, status, priority, opener_role, opener_user_id, created_at")
      .in("status", ["open", "waiting_user", "waiting_admin"])
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    const rows = (data ?? []) as Array<{
      id: string;
      subject: string;
      category: string | null;
      status: string;
      priority: number | null;
      opener_role: string | null;
      opener_user_id: string | null;
      created_at: string;
    }>;

    // nome de quem abriu (best-effort — sem nome usa o papel)
    const nomes: Record<string, string> = {};
    try {
      const ids = [...new Set(rows.map((r) => r.opener_user_id).filter(Boolean))] as string[];
      if (ids.length > 0) {
        const { data: profs, error: e2 } = await admin
          .from("profiles")
          .select("id, full_name")
          .in("id", ids);
        if (e2) throw e2;
        for (const p of (profs ?? []) as Array<{ id: string; full_name: string | null }>) {
          if (p.full_name) nomes[p.id] = p.full_name;
        }
      }
    } catch {
      // segue sem nomes
    }

    for (const t of rows) {
      chamados.push({
        id: t.id,
        titulo: t.subject,
        de: (t.opener_user_id && nomes[t.opener_user_id]) || t.opener_role || "desconhecido",
        status: t.status,
        prioridade: (t.priority ?? 3) <= 2 ? "alta" : "normal",
        criado_em: t.created_at,
        detalhe: `Chamado de suporte — categoria: ${t.category ?? "geral"}`,
        url: `${BASE}/admin/suporte`,
      });
    }
  } catch {
    // listagem nunca 500 — devolve o que tiver
  }

  return NextResponse.json({ sistema: "bravamais", chamados });
}
