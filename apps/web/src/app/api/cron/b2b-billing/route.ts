import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPixCharge, consultar } from "@/lib/syncpay";
import { sendCampaignEmail } from "@/lib/email";

export const maxDuration = 300;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bravamais.com.br";

function firstOfMonth(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function fmtBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Cron diário do ciclo B2B:
 * 1. Gera a fatura do mês (seats_used × preço) pra cada conta ativa sem fatura no período,
 *    cria cobrança PIX (SyncPay) e emaila o contato da empresa.
 * 2. Reconciliação: consulta faturas pendentes no gateway (cobre mock e webhook perdido).
 * 3. Inadimplência: fatura vencida há 5+ dias → overdue + email de cobrança.
 * 4. Renovação de seats: assinatura de funcionário B2B vencendo em <7d → +1 ano se a
 *    empresa segue ativa.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const period = firstOfMonth();
  const out = { invoiced: 0, reconciled_paid: 0, overdue: 0, seats_renewed: 0, errors: [] as string[] };

  // ---------- 1) Faturas do mês ----------
  const { data: accounts } = await admin
    .from("b2b_accounts")
    .select("id, company_name, cnpj, contact_name, contact_email, seats_used, monthly_cents_per_seat")
    .eq("active", true)
    .gt("seats_used", 0);

  const { data: existing } = await admin
    .from("b2b_invoices")
    .select("account_id")
    .eq("period_month", period);
  const alreadyInvoiced = new Set((existing ?? []).map((i) => i.account_id));

  for (const acc of accounts ?? []) {
    if (alreadyInvoiced.has(acc.id)) continue;
    const amount = acc.seats_used * acc.monthly_cents_per_seat;
    if (amount <= 0) continue;
    try {
      const dueDate = new Date(Date.now() + 7 * 86400000);

      // linha em payments (contato da empresa não é user → user_id null)
      const { data: payRow, error: payErr } = await admin
        .from("payments")
        .insert({
          user_id: null,
          kind: "b2b_invoice",
          ref_id: acc.id,
          ref_meta: { account_id: acc.id, period_month: period, seats: acc.seats_used },
          method: "pix",
          gateway: "syncpay",
          amount_cents: amount,
          status: "pending",
        })
        .select("id")
        .single();
      if (payErr || !payRow) throw new Error(payErr?.message ?? "payments insert");

      let pixCode: string | null = null;
      try {
        const charge = await createPixCharge({
          amountCents: amount,
          description: `BRAVA+ Empresas — ${acc.company_name} — ${acc.seats_used} seats (${period.slice(0, 7)})`,
          payer: {
            name: acc.contact_name ?? acc.company_name,
            cpf: (acc.cnpj ?? "").replace(/\D/g, ""),
            email: acc.contact_email ?? "",
            phone: "",
          },
          externalRef: payRow.id,
        });
        pixCode = charge.pixCode;
        await admin
          .from("payments")
          .update({
            gateway_charge_id: charge.identifier,
            pix_code: charge.pixCode,
            expires_at: charge.expiresAt,
            gateway: charge.isMock ? "mock" : "syncpay",
          })
          .eq("id", payRow.id);
      } catch (chargeErr) {
        // sem PIX automático (ex.: CNPJ não aceito) → fatura fica pendente pra
        // tratamento manual; o email avisa o contato mesmo assim
        out.errors.push(`pix ${acc.company_name}: ${chargeErr instanceof Error ? chargeErr.message : "erro"}`);
      }

      const { error: invErr } = await admin.from("b2b_invoices").insert({
        account_id: acc.id,
        period_month: period,
        seats: acc.seats_used,
        amount_cents: amount,
        status: "pending",
        payment_id: payRow.id,
        pix_code: pixCode,
        due_date: dueDate.toISOString().slice(0, 10),
      });
      if (invErr) throw new Error(invErr.message);

      if (acc.contact_email) {
        await sendCampaignEmail({
          to: acc.contact_email,
          name: acc.contact_name ?? acc.company_name,
          title: `Fatura BRAVA+ Empresas — ${fmtBRL(amount)} (${acc.seats_used} colaboradores)`,
          body:
            `<p>Fatura mensal do benefício BRAVA+ da <b>${acc.company_name}</b>: <b>${acc.seats_used}</b> colaboradores ativos × ${fmtBRL(acc.monthly_cents_per_seat)} = <b>${fmtBRL(amount)}</b>.</p>` +
            `<p>Vencimento: <b>${dueDate.toLocaleDateString("pt-BR")}</b>.</p>` +
            (pixCode
              ? `<p>Pague com PIX copia-e-cola:</p><p style="background:#1a1a1e;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px;word-break:break-all;font-size:12px;font-family:monospace">${pixCode}</p>`
              : `<p>Responda este email pra combinar o pagamento.</p>`),
          ctaLabel: "Falar com o BRAVA+",
          ctaUrl: `${APP_URL}/seja-empresa`,
        });
      }
      out.invoiced += 1;
    } catch (e) {
      out.errors.push(`invoice ${acc.company_name}: ${e instanceof Error ? e.message : "erro"}`);
    }
  }

  // ---------- 2) Reconciliação de pendentes ----------
  const { data: pendings } = await admin
    .from("b2b_invoices")
    .select("id, payment_id, account_id, payments(gateway_charge_id)")
    .eq("status", "pending")
    .not("payment_id", "is", null)
    .limit(50);
  for (const inv of pendings ?? []) {
    const chargeId = (inv.payments as unknown as { gateway_charge_id: string | null } | null)?.gateway_charge_id;
    if (!chargeId) continue;
    try {
      const { status } = await consultar(chargeId);
      if (status === "paid") {
        await admin
          .from("b2b_invoices")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", inv.id)
          .eq("status", "pending");
        await admin
          .from("payments")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", inv.payment_id!)
          .neq("status", "paid");
        out.reconciled_paid += 1;
      }
    } catch {
      /* tenta de novo amanhã */
    }
  }

  // ---------- 3) Inadimplência ----------
  const cutoff = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);
  const { data: lateInvoices } = await admin
    .from("b2b_invoices")
    .select("id, amount_cents, pix_code, b2b_accounts(company_name, contact_name, contact_email)")
    .eq("status", "pending")
    .lt("due_date", cutoff);
  for (const inv of lateInvoices ?? []) {
    await admin.from("b2b_invoices").update({ status: "overdue" }).eq("id", inv.id);
    const acc = inv.b2b_accounts as unknown as { company_name: string; contact_name: string | null; contact_email: string | null } | null;
    if (acc?.contact_email) {
      await sendCampaignEmail({
        to: acc.contact_email,
        name: acc.contact_name ?? acc.company_name,
        title: `⚠️ Fatura BRAVA+ em aberto — ${fmtBRL(inv.amount_cents)}`,
        body:
          `<p>A fatura do benefício BRAVA+ da <b>${acc.company_name}</b> venceu há mais de 5 dias.</p>` +
          `<p>Pra manter o benefício dos colaboradores ativo, regularize o pagamento.</p>` +
          (inv.pix_code
            ? `<p>PIX copia-e-cola:</p><p style="background:#1a1a1e;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px;word-break:break-all;font-size:12px;font-family:monospace">${inv.pix_code}</p>`
            : ""),
        ctaLabel: "Falar com o BRAVA+",
        ctaUrl: `${APP_URL}/seja-empresa`,
      });
    }
    out.overdue += 1;
  }

  // ---------- 4) Renovação de seats (vencendo em <7 dias) ----------
  const soon = new Date(Date.now() + 7 * 86400000).toISOString();
  const { data: seatInvites } = await admin
    .from("b2b_invites")
    .select("accepted_user_id, b2b_accounts(active)")
    .not("accepted_user_id", "is", null);
  const activeSeatUsers = (seatInvites ?? [])
    .filter((s) => (s.b2b_accounts as unknown as { active: boolean } | null)?.active)
    .map((s) => s.accepted_user_id as string);
  if (activeSeatUsers.length) {
    const { data: expiring } = await admin
      .from("subscriptions")
      .select("user_id")
      .in("user_id", activeSeatUsers)
      .eq("status", "active")
      .lt("current_period_end", soon);
    for (const sub of expiring ?? []) {
      await admin
        .from("subscriptions")
        .update({ current_period_end: new Date(Date.now() + 365 * 86400000).toISOString() })
        .eq("user_id", sub.user_id);
      out.seats_renewed += 1;
    }
  }

  return NextResponse.json({ ok: true, period, ...out });
}
