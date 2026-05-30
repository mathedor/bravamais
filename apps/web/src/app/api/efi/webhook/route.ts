import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseEfiWebhook } from "@/lib/efi";

/**
 * Webhook Efí Pix: confirma cobrança recebida.
 *
 * Recebe POST com lista de pix recebidos. Pra cada txid, identifica o tipo
 * de cobrança (tier, recarga tag, order) via prefixo e marca como pago no
 * banco.
 *
 * Configure no painel Efí: Webhook URL = https://brava-mais.vercel.app/api/efi/webhook
 *
 * Em mock mode, esse endpoint não é chamado (UI simula via botão).
 */
export async function POST(req: Request) {
  const body = await req.text();
  const event = parseEfiWebhook(body);
  if (!event) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const admin = createAdminClient();
  let processed = 0;

  for (const p of event.pix ?? []) {
    try {
      const { error } = await admin.from("efi_webhook_events").insert({
        txid: p.txid,
        end_to_end_id: p.endToEndId,
        amount_brl: p.valor,
        paid_at: p.horario,
        info_pagador: p.infoPagador ?? null,
        raw_payload: { pix: p },
      });
      if (!error) processed += 1;
    } catch {
      // ignore
    }
    // TODO: lookup por txid em tag_transactions / subscriptions / orders e marcar pago
  }

  return NextResponse.json({ ok: true, processed });
}

// Efí também faz HEAD ping pra validar webhook
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
