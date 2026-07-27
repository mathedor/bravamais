import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Início do dia de HOJE em America/Sao_Paulo (Brasil sem horário de verão => -03:00 fixo)
function inicioDoDiaSP(): string {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${ymd}T00:00:00-03:00`).toISOString();
}

type Pulso = {
  sistema: string;
  online_agora?: number;
  novos_cadastros_hoje?: number;
  cadastros_por_nivel?: Record<string, number>;
  vendas_hoje?: number;
  transacionado_hoje_centavos?: number;
  chamados_abertos?: number;
  tarefas_pendentes?: number;
  avisos: string[];
};

export async function GET(req: Request) {
  const token = process.env.ANA_PULSO_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const admin = createAdminClient();
  const hoje = inicioDoDiaSP();
  const pulso: Pulso = { sistema: "bravamais", avisos: [] };

  // online_agora — users distintos com login nos últimos 15 min (login_events)
  try {
    const desde = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data, error } = await admin
      .from("login_events")
      .select("user_id")
      .gte("created_at", desde)
      .limit(5000);
    if (error) throw error;
    pulso.online_agora = new Set((data ?? []).map((r: { user_id: string }) => r.user_id)).size;
  } catch {
    pulso.avisos.push("metrica online_agora indisponivel");
  }

  // acessos_hoje — OMITIDO de propósito: o site usa o beacon da Ana no layout
  // público (components/ana-beacon.tsx); a Ana preenche sozinha na coleta.

  // novos_cadastros_hoje + cadastros_por_nivel — profiles criados hoje, por role
  // (roles reais do schema: subscriber, establishment, deliverer, commercial, admin)
  try {
    const { data, error } = await admin
      .from("profiles")
      .select("role")
      .gte("created_at", hoje)
      .limit(10000);
    if (error) throw error;
    const porNivel: Record<string, number> = {};
    for (const r of (data ?? []) as { role: string }[]) {
      porNivel[r.role] = (porNivel[r.role] ?? 0) + 1;
    }
    pulso.novos_cadastros_hoje = (data ?? []).length;
    pulso.cadastros_por_nivel = porNivel;
  } catch {
    pulso.avisos.push("metrica novos_cadastros_hoje indisponivel");
  }

  // vendas_hoje + transacionado_hoje_centavos — payments PAGOS hoje nos gateways
  // reais (PIX SyncPay + Stripe), mesmo critério do /admin/financeiro
  // (status='paid' por paid_at). Gateway 'mock' (demo) fica de fora.
  try {
    const { data, error } = await admin
      .from("payments")
      .select("amount_cents")
      .eq("status", "paid")
      .in("gateway", ["syncpay", "stripe"])
      .gte("paid_at", hoje)
      .limit(10000);
    if (error) throw error;
    const rows = (data ?? []) as { amount_cents: number | null }[];
    pulso.vendas_hoje = rows.length;
    pulso.transacionado_hoje_centavos = rows.reduce(
      (s, r) => s + (r.amount_cents ?? 0),
      0,
    );
  } catch {
    pulso.avisos.push("metrica vendas_hoje indisponivel");
    pulso.avisos.push("metrica transacionado_hoje_centavos indisponivel");
  }

  // chamados_abertos — support_tickets não resolvidos/fechados
  try {
    const { count, error } = await admin
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "waiting_user", "waiting_admin"]);
    if (error || count === null) throw error ?? new Error("count null");
    pulso.chamados_abertos = count;
  } catch {
    pulso.avisos.push("metrica chamados_abertos indisponivel");
  }

  // tarefas_pendentes — refund_tickets em aberto + saques aguardando admin
  try {
    const [refunds, saques] = await Promise.all([
      admin
        .from("refund_tickets")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "contested", "approved"]),
      admin
        .from("withdrawals")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);
    if (refunds.error) throw refunds.error;
    if (saques.error) throw saques.error;
    pulso.tarefas_pendentes = (refunds.count ?? 0) + (saques.count ?? 0);
  } catch {
    pulso.avisos.push("metrica tarefas_pendentes indisponivel");
  }

  // avisos extra — fila de email parada / falhas de envio hoje
  try {
    const { count, error } = await admin
      .from("email_outbox")
      .select("id", { count: "exact", head: true })
      .eq("status", "queued");
    if (!error && (count ?? 0) > 20) {
      pulso.avisos.push(`email_outbox com ${count} emails na fila`);
    }
  } catch {
    // aviso opcional — silencioso
  }
  try {
    const { count, error } = await admin
      .from("email_outbox")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", hoje);
    if (!error && (count ?? 0) > 0) {
      pulso.avisos.push(`${count} emails falharam hoje`);
    }
  } catch {
    // aviso opcional — silencioso
  }

  return NextResponse.json(pulso);
}
