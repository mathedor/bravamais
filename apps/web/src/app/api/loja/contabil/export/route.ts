import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";

export async function GET(req: Request) {
  const { establishment } = await requireEstablishment();
  const url = new URL(req.url);
  const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const periodIso = month + "-01";

  const admin = createAdminClient();
  const [{ data: stmtRaw }, { data: linesRaw }] = await Promise.all([
    admin.rpc("estab_monthly_statement", { p_estab_id: establishment.id, p_month: periodIso }),
    admin.rpc("estab_monthly_lines", { p_estab_id: establishment.id, p_month: periodIso }),
  ]);

  type Stmt = {
    gross_revenue_cents: number;
    refunded_cents: number;
    net_revenue_cents: number;
    withdrawn_cents: number;
    balance_pending_cents: number;
  };
  type Line = { occurred_at: string; kind: string; description: string; amount_cents: number };
  const s = (Array.isArray(stmtRaw) ? stmtRaw[0] : stmtRaw) as Stmt | null;
  const ll = (linesRaw as Line[] | null) ?? [];

  const rows = [
    `Extrato BRAVA+ — ${establishment.name} — ${month}`,
    "",
    `Bruto;${(s?.gross_revenue_cents ?? 0) / 100}`,
    `Estornos;${(s?.refunded_cents ?? 0) / 100}`,
    `Líquido;${(s?.net_revenue_cents ?? 0) / 100}`,
    `Sacado;${(s?.withdrawn_cents ?? 0) / 100}`,
    `Pendente;${(s?.balance_pending_cents ?? 0) / 100}`,
    "",
    "Data;Tipo;Descrição;Valor",
    ...ll.map((l) =>
      `${new Date(l.occurred_at).toLocaleDateString("pt-BR")};${l.kind};${l.description.replace(/;/g, ",")};${(l.amount_cents / 100).toFixed(2)}`,
    ),
  ].join("\n");

  // BOM pra Excel BR ler acento ok
  const body = "﻿" + rows;
  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="extrato-brava-${month}.csv"`,
    },
  });
}
