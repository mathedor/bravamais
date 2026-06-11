// BRAVA+ — motor de cobrança recorrente (rodado pelo cron diário).
//
// Cartão (Stripe): cobra off-session automaticamente (renovação invisível).
// PIX (SyncPay): não há débito automático → gera nova cobrança e notifica;
//   o usuário paga manualmente e o webhook renova o período.
import { createAdminClient } from "@/lib/supabase/admin";
import { createPayment, fulfillPayment, type PaymentKind } from "@/lib/payments";
import { chargeOffSession } from "@/lib/stripe";
import { createPixCharge } from "@/lib/syncpay";
import { getPayerAdmin } from "@/lib/payer";

const MAX_CARD_RETRIES = 3;
const PIX_GRACE_DAYS = 5;

interface RecurringRow {
  id: string;
  user_id: string;
  kind: PaymentKind;
  ref_id: string;
  ref_meta: Record<string, unknown>;
  amount_cents: number;
  method: "card" | "pix";
  gateway: string;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
  status: string;
  current_period_end: string;
  next_charge_at: string;
  cancel_at_period_end: boolean;
  retries: number;
}

const LABEL: Record<string, string> = {
  subscription: "Assinatura BRAVA+",
  category_subscription: "Assinatura BRAVA+ (categorias)",
  establishment_plan: "Plano de loja BRAVA+",
  tag_monthly: "Plano BRAVA Tag mensal",
};

const LINK: Record<string, string> = {
  subscription: "/assinar",
  category_subscription: "/assinar/categorias",
  establishment_plan: "/loja/plano",
  tag_monthly: "/app/tag",
};

export async function runRecurringBilling(limit = 200): Promise<{
  processed: number;
  cardCharged: number;
  cardFailed: number;
  pixReminders: number;
  canceled: number;
}> {
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: due } = await admin
    .from("recurring_subscriptions")
    .select("*")
    .eq("status", "active")
    .lte("next_charge_at", nowIso)
    .limit(limit);

  const rows = (due ?? []) as RecurringRow[];
  const stats = { processed: 0, cardCharged: 0, cardFailed: 0, pixReminders: 0, canceled: 0 };

  for (const row of rows) {
    stats.processed++;
    try {
      // cancelamento agendado: encerra ao fim do período
      if (row.cancel_at_period_end) {
        await deactivate(row, "canceled", "Sua assinatura foi encerrada conforme solicitado.");
        stats.canceled++;
        continue;
      }

      if (row.method === "card") {
        const ok = await chargeCard(row);
        if (ok) stats.cardCharged++;
        else stats.cardFailed++;
      } else {
        const canceled = await remindPix(row);
        if (canceled) stats.canceled++;
        else stats.pixReminders++;
      }
    } catch (e) {
      console.error("[recurring]", row.id, e);
    }
  }

  return stats;
}

// ---------- Cartão: cobra automaticamente ----------
async function chargeCard(row: RecurringRow): Promise<boolean> {
  const admin = createAdminClient();

  if (!row.stripe_customer_id || !row.stripe_payment_method_id) {
    // sem cartão salvo → trata como falha (pede atualização)
    await onCardFailure(row, "Sem cartão salvo. Atualize seu meio de pagamento.");
    return false;
  }

  const res = await chargeOffSession({
    customerId: row.stripe_customer_id,
    paymentMethodId: row.stripe_payment_method_id,
    amountCents: row.amount_cents,
    description: `${LABEL[row.kind] ?? "BRAVA+"} (renovação)`,
    metadata: { kind: row.kind, ref_id: row.ref_id, recurring: "1", renewal: "1" },
  });

  if (res.status === "succeeded") {
    // registra o pagamento e dispara o fulfillment (estende o período + reseta next_charge)
    const { data: pay } = await admin
      .from("payments")
      .insert({
        user_id: row.user_id,
        kind: row.kind,
        ref_id: row.ref_id,
        ref_meta: { ...row.ref_meta, recurring: true, renewal: true },
        method: "card",
        gateway: "stripe",
        gateway_charge_id: res.paymentIntentId,
        amount_cents: row.amount_cents,
        status: "pending",
      })
      .select("id")
      .single();
    if (pay) await fulfillPayment(pay.id as string);
    return true;
  }

  await onCardFailure(row, "Não conseguimos renovar sua assinatura no cartão.");
  return false;
}

async function onCardFailure(row: RecurringRow, msg: string) {
  const admin = createAdminClient();
  const retries = row.retries + 1;

  if (retries >= MAX_CARD_RETRIES) {
    await deactivate(row, "past_due", `${msg} Sua assinatura foi suspensa — atualize o pagamento pra reativar.`);
    return;
  }

  // tenta de novo em 2 dias
  const next = new Date();
  next.setDate(next.getDate() + 2);
  await admin
    .from("recurring_subscriptions")
    .update({ retries, next_charge_at: next.toISOString(), updated_at: new Date().toISOString() })
    .eq("id", row.id);

  await notify(row.user_id, "Falha na renovação", `${msg} Vamos tentar de novo em 2 dias.`, LINK[row.kind] ?? "/app");
}

// ---------- PIX: gera cobrança e notifica ----------
async function remindPix(row: RecurringRow): Promise<boolean> {
  const admin = createAdminClient();

  // estourou a carência sem pagar → suspende
  const deadline = new Date(row.current_period_end);
  deadline.setDate(deadline.getDate() + PIX_GRACE_DAYS);
  if (new Date() > deadline) {
    await deactivate(row, "past_due", "Sua assinatura PIX não foi renovada e foi suspensa. Renove quando quiser.");
    return true;
  }

  const payer = await getPayerAdmin(row.user_id);
  if (!payer) return false;

  const charge = await createPayment({
    kind: row.kind,
    refId: row.ref_id,
    refMeta: row.ref_meta,
    method: "pix",
    amountCents: row.amount_cents,
    description: `${LABEL[row.kind] ?? "BRAVA+"} (renovação)`,
    statementSuffix: "BRAVAMAIS",
    payer,
    recurring: true,
  });

  // lembra de novo amanhã até pagar (o webhook renova e reseta next_charge)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await admin
    .from("recurring_subscriptions")
    .update({ next_charge_at: tomorrow.toISOString(), updated_at: new Date().toISOString() })
    .eq("id", row.id);

  const code = "pixCode" in charge ? charge.pixCode : "";
  await admin.from("notifications").insert({
    user_id: row.user_id,
    type: "subscription",
    title: "Renove sua assinatura via PIX",
    body: code
      ? "Toque pra pagar e manter seus benefícios ativos."
      : "Acesse pra renovar sua assinatura.",
    link: LINK[row.kind] ?? "/app",
  });
  return false;
}

// ---------- Desativação + downgrade por tipo ----------
async function deactivate(row: RecurringRow, status: "canceled" | "past_due", msg: string) {
  const admin = createAdminClient();
  await admin
    .from("recurring_subscriptions")
    .update({ status, cancel_at_period_end: false, updated_at: new Date().toISOString() })
    .eq("id", row.id);

  if (row.kind === "subscription" || row.kind === "category_subscription") {
    await admin.from("subscriptions").update({ status: "canceled" }).eq("user_id", row.user_id);
  } else if (row.kind === "establishment_plan") {
    const estabId = String(row.ref_meta.establishment_id ?? "");
    if (estabId) {
      await admin.from("establishment_subscriptions").update({ status: "canceled" }).eq("establishment_id", estabId);
      await admin.from("establishments").update({ plan_tier: "basico" }).eq("id", estabId);
    }
  } else if (row.kind === "tag_monthly") {
    await admin.from("tag_wallets").update({ monthly_active: false }).eq("user_id", row.user_id);
  }

  await notify(row.user_id, status === "canceled" ? "Assinatura encerrada" : "Assinatura suspensa", msg, LINK[row.kind] ?? "/app");
}

async function notify(userId: string, title: string, body: string, link: string) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({ user_id: userId, type: "subscription", title, body, link });
}
