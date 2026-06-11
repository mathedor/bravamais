// BRAVA+ — orquestração de pagamentos (server-only)
//
// Tabela `payments` é a fonte da verdade. Toda cobrança:
//   createPayment() → cria a linha + a cobrança no gateway
//   fulfillPayment() → confirma (idempotente) e dispara o efeito por "kind"
//   syncPaymentStatus() → consulta o gateway (usado no polling) e confirma
//
// PIX  → SyncPay   Cartão/Apple Pay/Google Pay → Stripe
import { createAdminClient } from "@/lib/supabase/admin";
import { createPixCharge, consultar } from "@/lib/syncpay";
import { createPaymentIntent, retrievePaymentIntent } from "@/lib/stripe";

export type PaymentKind =
  | "subscription"
  | "order"
  | "tag_recharge"
  | "tag_monthly"
  | "category_subscription"
  | "establishment_plan"
  | "gift_card"
  | "wallet_deposit";
export type PaymentMethod = "pix" | "card";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded";

export interface PaymentPayer {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

interface CreateArgs {
  kind: PaymentKind;
  refId: string;
  refMeta?: Record<string, unknown>;
  method: PaymentMethod;
  amountCents: number;
  description: string;
  payer: PaymentPayer;
  statementSuffix?: string;
}

export interface CreatePixResult {
  paymentId: string;
  method: "pix";
  pixCode: string;
  qrBase64: string;
  expiresAt: string;
}
export interface CreateCardResult {
  paymentId: string;
  method: "card";
  clientSecret: string;
  publishableKey: string;
}
export type CreateResult = CreatePixResult | CreateCardResult;

export async function createPayment(args: CreateArgs): Promise<CreateResult> {
  const admin = createAdminClient();

  // 1) linha pendente (pra ter o id antes de falar com o gateway)
  const { data: row, error } = await admin
    .from("payments")
    .insert({
      user_id: args.payer.id,
      kind: args.kind,
      ref_id: args.refId,
      ref_meta: args.refMeta ?? {},
      method: args.method,
      gateway: args.method === "pix" ? "syncpay" : "stripe",
      amount_cents: args.amountCents,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !row) throw new Error(error?.message ?? "Falha criando pagamento.");
  const paymentId = row.id as string;

  if (args.method === "pix") {
    const charge = await createPixCharge({
      amountCents: args.amountCents,
      description: args.description,
      externalRef: paymentId.slice(0, 8),
      payer: { name: args.payer.name, cpf: args.payer.cpf, email: args.payer.email, phone: args.payer.phone },
    });
    await admin
      .from("payments")
      .update({
        gateway: charge.isMock ? "mock" : "syncpay",
        gateway_charge_id: charge.identifier,
        pix_code: charge.pixCode,
        pix_qr_base64: charge.qrBase64,
        expires_at: charge.expiresAt,
        raw: charge.raw as Record<string, unknown>,
      })
      .eq("id", paymentId);
    return {
      paymentId,
      method: "pix",
      pixCode: charge.pixCode,
      qrBase64: charge.qrBase64,
      expiresAt: charge.expiresAt,
    };
  }

  // cartão → Stripe
  const intent = await createPaymentIntent({
    amountCents: args.amountCents,
    description: args.description,
    statementSuffix: args.statementSuffix,
    metadata: { payment_id: paymentId, kind: args.kind, ref_id: args.refId },
  });
  await admin
    .from("payments")
    .update({
      gateway: intent.isMock ? "mock" : "stripe",
      gateway_charge_id: intent.paymentIntentId,
    })
    .eq("id", paymentId);
  return {
    paymentId,
    method: "card",
    clientSecret: intent.clientSecret,
    publishableKey: intent.publishableKey,
  };
}

// ============================================================
// Confirmação (idempotente)
// ============================================================
export async function fulfillPayment(paymentId: string): Promise<{ ok: boolean; already?: boolean }> {
  const admin = createAdminClient();

  // trava: só "ganha" o fulfillment quem conseguir mudar de !paid → paid
  const { data: claimed } = await admin
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", paymentId)
    .neq("status", "paid")
    .select("id, user_id, kind, ref_id, ref_meta, gateway_charge_id, amount_cents")
    .maybeSingle();

  if (!claimed) return { ok: true, already: true };

  const p = claimed as {
    id: string;
    user_id: string;
    kind: PaymentKind;
    ref_id: string;
    ref_meta: Record<string, unknown>;
    gateway_charge_id: string | null;
    amount_cents: number;
  };

  try {
    if (p.kind === "subscription") await fulfillSubscription(p);
    else if (p.kind === "order") await fulfillOrder(p);
    else if (p.kind === "tag_recharge") await fulfillTagRecharge(p);
    else if (p.kind === "tag_monthly") await fulfillTagMonthly(p);
    else if (p.kind === "category_subscription") await fulfillCategorySubscription(p);
    else if (p.kind === "establishment_plan") await fulfillEstablishmentPlan(p);
    else if (p.kind === "gift_card") await fulfillGiftCard(p);
    else if (p.kind === "wallet_deposit") await fulfillWalletDeposit(p);
  } catch (e) {
    console.error("[fulfillPayment]", paymentId, e);
  }
  return { ok: true };
}

async function fulfillSubscription(p: {
  user_id: string;
  ref_id: string;
  gateway_charge_id: string | null;
}) {
  const admin = createAdminClient();
  const tier = p.ref_id;
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", p.user_id)
    .maybeSingle();

  const payload = {
    user_id: p.user_id,
    tier,
    status: "active" as const,
    current_period_start: start.toISOString(),
    current_period_end: end.toISOString(),
    cancel_at_period_end: false,
    efi_subscription_id: p.gateway_charge_id,
  };
  if (existing) await admin.from("subscriptions").update(payload).eq("id", existing.id);
  else await admin.from("subscriptions").insert(payload);

  await admin.from("notifications").insert({
    user_id: p.user_id,
    type: "subscription",
    title: `BRAVA+ ${tier.toUpperCase()} ativada!`,
    body: "Pagamento confirmado. Aproveite todas as vantagens.",
    link: "/app",
  });
}

async function fulfillOrder(p: { user_id: string; ref_id: string; gateway_charge_id: string | null }) {
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      efi_charge_id: p.gateway_charge_id,
    })
    .eq("id", p.ref_id)
    .eq("user_id", p.user_id);

  await admin.from("notifications").insert({
    user_id: p.user_id,
    type: "order",
    title: "Pagamento confirmado!",
    body: "Seu pedido foi pago e já está sendo preparado.",
    link: `/app/pedidos/${p.ref_id}`,
  });
}

async function fulfillTagRecharge(p: { user_id: string; ref_id: string; amount_cents: number }) {
  const admin = createAdminClient();
  const { data } = await admin.rpc("tag_recharge_fulfill", {
    p_user_id: p.user_id,
    p_pack_id: p.ref_id,
  });
  const res = (data ?? {}) as { ok?: boolean; balance_cents?: number };
  await admin.from("notifications").insert({
    user_id: p.user_id,
    type: "tag",
    title: "Recarga BRAVA Tag confirmada!",
    body: res.ok ? "Seu saldo já está disponível." : "Pagamento confirmado.",
    link: "/app/tag",
  });
}

async function fulfillTagMonthly(p: { user_id: string }) {
  const admin = createAdminClient();
  await admin.rpc("tag_subscribe_monthly_fulfill", { p_user_id: p.user_id });
  await admin.from("notifications").insert({
    user_id: p.user_id,
    type: "tag",
    title: "Plano BRAVA Tag mensal ativo!",
    body: "Seu saldo recarrega automaticamente todo mês.",
    link: "/app/tag",
  });
}

async function fulfillCategorySubscription(p: {
  user_id: string;
  ref_meta: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const ids = Array.isArray(p.ref_meta.category_ids) ? (p.ref_meta.category_ids as string[]) : [];
  await admin.rpc("set_user_categories_fulfill", { p_user_id: p.user_id, p_category_ids: ids });
  await admin.from("notifications").insert({
    user_id: p.user_id,
    type: "subscription",
    title: "Assinatura BRAVA+ ativa!",
    body: "Suas categorias estão liberadas. Aproveite.",
    link: "/app",
  });
}

async function fulfillEstablishmentPlan(p: {
  user_id: string;
  ref_id: string;
  ref_meta: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const establishmentId = String(p.ref_meta.establishment_id ?? "");
  const tier = p.ref_id;
  if (!establishmentId) return;
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);

  await admin.from("establishment_subscriptions").upsert(
    {
      establishment_id: establishmentId,
      tier,
      status: "active",
      current_period_start: start.toISOString(),
      current_period_end: end.toISOString(),
    },
    { onConflict: "establishment_id" },
  );
  await admin.from("establishments").update({ plan_tier: tier }).eq("id", establishmentId);

  await admin.from("notifications").insert({
    user_id: p.user_id,
    type: "subscription",
    title: `Plano ${tier.toUpperCase()} ativado!`,
    body: "Seu plano de loja está ativo. Aproveite os recursos.",
    link: "/loja/plano",
  });
}

async function fulfillGiftCard(p: {
  user_id: string;
  gateway_charge_id: string | null;
  amount_cents: number;
  ref_meta: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const establishmentId = String(p.ref_meta.establishment_id ?? "");
  const code = String(p.ref_meta.code ?? "");
  if (!establishmentId || !code) return;

  const { data: gift } = await admin
    .from("gift_cards")
    .insert({
      establishment_id: establishmentId,
      code,
      value_cents: p.amount_cents,
      remaining_cents: p.amount_cents,
      buyer_user_id: p.user_id,
      recipient_name: (p.ref_meta.recipient_name as string) ?? null,
      recipient_message: (p.ref_meta.message as string) ?? null,
      granted_by: "purchase",
      granted_to_user_id: p.user_id,
      status: "paid",
      efi_charge_id: p.gateway_charge_id,
    })
    .select("id")
    .single();

  // BRAVA Coins: 1% cashback
  if (gift?.id) {
    const { grantCoins } = await import("@/lib/coins");
    await grantCoins({
      userId: p.user_id,
      delta: Math.max(1, Math.floor(p.amount_cents / 1000)),
      reason: "order_paid",
      entityType: "gift_card",
      entityId: gift.id,
    }).catch(() => {});
  }

  await admin.from("notifications").insert({
    user_id: p.user_id,
    type: "order",
    title: "Vale-presente confirmado!",
    body: `Seu vale está pronto. Código: ${code}`,
    link: `/presente/${code}`,
  });
}

async function fulfillWalletDeposit(p: { user_id: string; ref_id: string }) {
  const admin = createAdminClient();
  const { data: pack } = await admin
    .from("wallet_bonus_packs")
    .select("deposit_cents, bonus_cents, label")
    .eq("id", p.ref_id)
    .maybeSingle<{ deposit_cents: number; bonus_cents: number; label: string }>();
  if (!pack) return;

  const total = pack.deposit_cents + pack.bonus_cents;
  const { data: existing } = await admin
    .from("wallet_balances")
    .select("balance_cents, total_deposited_cents")
    .eq("user_id", p.user_id)
    .maybeSingle<{ balance_cents: number; total_deposited_cents: number }>();

  if (existing) {
    await admin
      .from("wallet_balances")
      .update({
        balance_cents: existing.balance_cents + total,
        total_deposited_cents: existing.total_deposited_cents + pack.deposit_cents,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", p.user_id);
  } else {
    await admin.from("wallet_balances").insert({
      user_id: p.user_id,
      balance_cents: total,
      total_deposited_cents: pack.deposit_cents,
    });
  }

  await admin.from("wallet_transactions").insert([
    { user_id: p.user_id, kind: "deposit", amount_cents: pack.deposit_cents, description: `Depósito: ${pack.label}`, bonus_pack_id: p.ref_id },
    { user_id: p.user_id, kind: "bonus", amount_cents: pack.bonus_cents, description: `Bônus de ${pack.label}`, bonus_pack_id: p.ref_id },
  ]);

  await admin.from("notifications").insert({
    user_id: p.user_id,
    type: "wallet",
    title: "Depósito confirmado!",
    body: "Seu saldo na carteira já está disponível.",
    link: "/app/carteira",
  });
}

// ============================================================
// Polling: consulta o gateway e confirma se já pagou
// ============================================================
export async function syncPaymentStatus(paymentId: string, userId?: string): Promise<PaymentStatus> {
  const admin = createAdminClient();
  const { data: p } = await admin
    .from("payments")
    .select("id, user_id, status, method, gateway, gateway_charge_id, expires_at")
    .eq("id", paymentId)
    .maybeSingle();
  if (!p) return "failed";
  if (userId && p.user_id !== userId) return "failed";
  if (p.status === "paid") return "paid";
  if (p.status === "failed" || p.status === "refunded") return p.status as PaymentStatus;

  const chargeId = p.gateway_charge_id as string | null;
  if (!chargeId) return "pending";

  try {
    if (p.method === "pix") {
      const { status } = await consultar(chargeId);
      if (status === "paid") {
        await fulfillPayment(paymentId);
        return "paid";
      }
      if (status === "failed" || status === "refunded") {
        await admin.from("payments").update({ status }).eq("id", paymentId);
        return status;
      }
    } else {
      const pi = await retrievePaymentIntent(chargeId);
      if (pi.status === "succeeded") {
        await fulfillPayment(paymentId);
        return "paid";
      }
      if (pi.status === "canceled") {
        await admin.from("payments").update({ status: "failed" }).eq("id", paymentId);
        return "failed";
      }
    }
  } catch (e) {
    console.error("[syncPaymentStatus]", paymentId, e);
  }

  // expira PIX vencido
  if (p.expires_at && new Date(p.expires_at as string).getTime() < Date.now()) {
    await admin.from("payments").update({ status: "expired" }).eq("id", paymentId);
    return "expired";
  }
  return "pending";
}

// Helper: confirma a partir do charge id do gateway (usado nos webhooks)
export async function fulfillByChargeId(
  gateway: "syncpay" | "stripe",
  chargeId: string,
): Promise<{ ok: boolean; found: boolean }> {
  const admin = createAdminClient();
  const { data: p } = await admin
    .from("payments")
    .select("id")
    .eq("gateway_charge_id", chargeId)
    .in("gateway", gateway === "syncpay" ? ["syncpay", "mock"] : ["stripe", "mock"])
    .maybeSingle();
  if (!p) return { ok: false, found: false };
  const r = await fulfillPayment(p.id as string);
  return { ok: r.ok, found: true };
}
