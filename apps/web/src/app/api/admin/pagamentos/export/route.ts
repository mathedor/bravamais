import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

const PERIOD_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

export async function GET(req: Request) {
  await requireRole("admin");
  const url = new URL(req.url);

  const admin = createAdminClient();
  let query = admin
    .from("payments")
    .select(
      "id, kind, method, gateway, gateway_charge_id, amount_cents, status, created_at, paid_at, profile:user_id(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(10000);

  for (const f of ["status", "gateway", "method", "kind"] as const) {
    const v = url.searchParams.get(f);
    if (v) query = query.eq(f, v);
  }
  const period = url.searchParams.get("period");
  if (period && PERIOD_DAYS[period]) {
    query = query.gte(
      "created_at",
      new Date(Date.now() - PERIOD_DAYS[period] * 86400000).toISOString(),
    );
  }

  const { data } = await query;
  type Pay = {
    id: string;
    kind: string;
    method: string;
    gateway: string;
    gateway_charge_id: string | null;
    amount_cents: number;
    status: string;
    created_at: string;
    paid_at: string | null;
    profile: { full_name: string | null } | null;
  };
  const pays = ((data ?? []) as unknown as Pay[]);

  const rows = [
    "Data;Cliente;Tipo;Método;Gateway;ID gateway;Valor;Status;Pago em",
    ...pays.map((p) =>
      [
        new Date(p.created_at).toLocaleString("pt-BR"),
        (p.profile?.full_name ?? "").replace(/;/g, ","),
        p.kind,
        p.method,
        p.gateway,
        p.gateway_charge_id ?? "",
        (p.amount_cents / 100).toFixed(2).replace(".", ","),
        p.status,
        p.paid_at ? new Date(p.paid_at).toLocaleString("pt-BR") : "",
      ].join(";"),
    ),
  ].join("\n");

  // BOM pra Excel BR ler acento ok
  const body = "﻿" + rows;
  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="pagamentos-brava.csv"`,
    },
  });
}
