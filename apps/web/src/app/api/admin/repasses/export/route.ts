import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export async function GET() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: estabs }, { data: orders }, { data: withdrawals }, { data: blocks }] =
    await Promise.all([
      admin.from("establishments").select("id, name").order("name"),
      admin
        .from("orders")
        .select("establishment_id, total_cents, payment_method, status")
        .in("status", ["paid", "completed"]),
      admin.from("withdrawals").select("establishment_id, amount_cents, status"),
      admin
        .from("financial_blocks")
        .select("establishment_id, valor_centavos")
        .eq("status", "ativo"),
    ]);

  interface Linha {
    name: string;
    faturadoPix: number;
    faturadoCartao: number;
    sacado: number;
    emAndamento: number;
    debitos: number;
  }
  const map = new Map<string, Linha>();
  for (const e of estabs ?? []) {
    map.set(e.id, { name: e.name, faturadoPix: 0, faturadoCartao: 0, sacado: 0, emAndamento: 0, debitos: 0 });
  }
  for (const o of orders ?? []) {
    const l = map.get(o.establishment_id);
    if (!l) continue;
    if (o.payment_method === "credit_card") l.faturadoCartao += o.total_cents;
    else l.faturadoPix += o.total_cents;
  }
  for (const w of withdrawals ?? []) {
    const l = map.get(w.establishment_id);
    if (!l) continue;
    if (w.status === "paid") l.sacado += w.amount_cents;
    if (w.status === "pending" || w.status === "approved") l.emAndamento += w.amount_cents;
  }
  for (const b of blocks ?? []) {
    const l = map.get(b.establishment_id);
    if (l) l.debitos += b.valor_centavos;
  }

  const fmt = (c: number) => (c / 100).toFixed(2).replace(".", ",");
  const rows = [
    "Lojista;Faturado PIX;Faturado Cartão;Repassado;Em andamento;Débitos;Saldo a repassar",
    ...[...map.values()]
      .filter((l) => l.faturadoPix + l.faturadoCartao + l.sacado + l.emAndamento + l.debitos > 0)
      .map((l) => {
        const saldo = l.faturadoPix + l.faturadoCartao - l.sacado - l.emAndamento - l.debitos;
        return [
          l.name.replace(/;/g, ","),
          fmt(l.faturadoPix),
          fmt(l.faturadoCartao),
          fmt(l.sacado),
          fmt(l.emAndamento),
          fmt(l.debitos),
          fmt(saldo),
        ].join(";");
      }),
  ].join("\n");

  const body = "﻿" + rows;
  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="repasses-brava.csv"`,
    },
  });
}
