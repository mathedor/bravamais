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
  acessos_hoje?: number;
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

  // acessos_hoje — logins registrados hoje (login_events)
  try {
    const { count, error } = await admin
      .from("login_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hoje);
    if (error || count === null) throw error ?? new Error("count null");
    pulso.acessos_hoje = count;
  } catch {
    pulso.avisos.push("metrica acessos_hoje indisponivel");
  }

  // vendas_hoje — vendas de balcão (pos_sales) + payments pagos hoje
  try {
    const [pos, pay] = await Promise.all([
      admin
        .from("pos_sales")
        .select("id", { count: "exact", head: true })
        .gte("created_at", hoje),
      admin
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("paid_at", hoje),
    ]);
    if (pos.error) throw pos.error;
    if (pay.error) throw pay.error;
    pulso.vendas_hoje = (pos.count ?? 0) + (pay.count ?? 0);
  } catch {
    pulso.avisos.push("metrica vendas_hoje indisponivel");
  }

  // transacionado_hoje_centavos — net_cents do balcão + amount_cents dos payments pagos
  try {
    const [pos, pay] = await Promise.all([
      admin
        .from("pos_sales")
        .select("net_cents")
        .gte("created_at", hoje)
        .limit(10000),
      admin
        .from("payments")
        .select("amount_cents")
        .eq("status", "paid")
        .gte("paid_at", hoje)
        .limit(10000),
    ]);
    if (pos.error) throw pos.error;
    if (pay.error) throw pay.error;
    const somaPos = (pos.data ?? []).reduce(
      (s: number, r: { net_cents: number | null }) => s + (r.net_cents ?? 0),
      0,
    );
    const somaPay = (pay.data ?? []).reduce(
      (s: number, r: { amount_cents: number | null }) => s + (r.amount_cents ?? 0),
      0,
    );
    pulso.transacionado_hoje_centavos = somaPos + somaPay;
  } catch {
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
