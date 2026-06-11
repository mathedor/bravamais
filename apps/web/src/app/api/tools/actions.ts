"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { requireEstablishment } from "@/lib/establishment-guard";
import { createPayment, type CreatePixResult, type CreateCardResult } from "@/lib/payments";
import { getPayer } from "@/lib/payer";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return user;
}

async function requireAdmin() {
  await requireRole("admin");
  return createClient();
}

/* ============================================================
   1) BRAVA WALLET
   ============================================================ */
async function startWalletDeposit(packId: string, method: "pix" | "card") {
  await requireUser();
  const admin = createAdminClient();
  const { data: pack } = await admin
    .from("wallet_bonus_packs")
    .select("deposit_cents, label")
    .eq("id", packId)
    .eq("is_active", true)
    .maybeSingle<{ deposit_cents: number; label: string }>();
  if (!pack) return { error: "Pack inválido." };

  const payer = await getPayer();
  if (!payer) return { error: "Faça login pra depositar." };

  return createPayment({
    kind: "wallet_deposit",
    refId: packId,
    method,
    amountCents: pack.deposit_cents,
    description: `BRAVA Wallet — ${pack.label}`,
    statementSuffix: "BRAVAWALLET",
    payer,
  });
}

export async function createWalletDepositPix(packId: string): Promise<CreatePixResult | { error: string }> {
  return (await startWalletDeposit(packId, "pix")) as CreatePixResult | { error: string };
}

export async function createWalletDepositCard(packId: string): Promise<CreateCardResult | { error: string }> {
  return (await startWalletDeposit(packId, "card")) as CreateCardResult | { error: string };
}

// Depósito da Wallet agora passa pelo gateway real (createWalletDepositPix/Card + PayModal);
// o crédito acontece no fulfillment (lib/payments.ts → fulfillWalletDeposit).

export async function walletPackUpsertAction(_: any, fd: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(fd.get("id") || "");
  const data = {
    label: String(fd.get("label") || "").trim(),
    deposit_cents: Math.floor(parseFloat(String(fd.get("deposit_brl") || "0").replace(",", ".")) * 100),
    bonus_cents: Math.floor(parseFloat(String(fd.get("bonus_brl") || "0").replace(",", ".")) * 100),
    is_active: fd.get("is_active") === "on",
    display_order: parseInt(String(fd.get("display_order") || "100"), 10),
  };
  if (id) await admin.from("wallet_bonus_packs").update(data).eq("id", id);
  else await admin.from("wallet_bonus_packs").insert(data);
  revalidatePath("/admin/ferramentas/wallet");
  return { ok: true };
}

export async function walletPackDeleteAction(id: string) {
  await requireAdmin();
  createAdminClient().from("wallet_bonus_packs").delete().eq("id", id);
  revalidatePath("/admin/ferramentas/wallet");
}

/* ============================================================
   2) MODO GRUPO
   ============================================================ */
export async function createOutingAction(_: any, fd: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error, data } = await supabase.from("group_outings").insert({
    organizer_id: user.id,
    establishment_id: String(fd.get("establishment_id") || "") || null,
    title: String(fd.get("title") || "").trim(),
    description: String(fd.get("description") || "").trim() || null,
    planned_at: fd.get("planned_at") ? new Date(String(fd.get("planned_at"))).toISOString() : null,
    max_members: parseInt(String(fd.get("max_members") || "10"), 10),
  }).select("id").single();
  if (error) return { error: error.message };

  // Adiciona organizador como primeiro membro
  await supabase.from("group_outing_members").insert({ outing_id: data.id, user_id: user.id });
  revalidatePath("/app/grupos");
  return { ok: true, id: data.id };
}

export async function joinOutingAction(outingId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("group_outing_members").upsert({ outing_id: outingId, user_id: user.id });
  revalidatePath("/app/grupos");
}

export async function leaveOutingAction(outingId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("group_outing_members").delete().eq("outing_id", outingId).eq("user_id", user.id);
  revalidatePath("/app/grupos");
}

/* ============================================================
   3) VOU AÍ AGORA
   ============================================================ */
export async function arrivalIntentAction(_: any, fd: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const estabId = String(fd.get("establishment_id") || "");
  const eta = parseInt(String(fd.get("eta_minutes") || "15"), 10);

  // Pega regra de cortesia se houver
  const { data: rule } = await supabase
    .from("arrival_courtesy_rules")
    .select("courtesy_text, min_eta_minutes")
    .eq("establishment_id", estabId)
    .eq("is_active", true)
    .lte("min_eta_minutes", eta)
    .maybeSingle();

  await supabase.from("arrival_intents").insert({
    user_id: user.id,
    establishment_id: estabId,
    eta_minutes: eta,
    courtesy_message: rule?.courtesy_text ?? null,
    courtesy_offered_at: rule ? new Date().toISOString() : null,
  });
  revalidatePath(`/app/estabelecimento/`, "page");
  return { ok: true };
}

export async function arrivalCourtesyRuleUpsertAction(_: any, fd: FormData) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const id = String(fd.get("id") || "");
  const data = {
    establishment_id: establishment.id,
    min_eta_minutes: parseInt(String(fd.get("min_eta_minutes") || "15"), 10),
    courtesy_text: String(fd.get("courtesy_text") || "").trim(),
    tier_required: (String(fd.get("tier_required") || "") || null) as any,
    is_active: fd.get("is_active") === "on",
  };
  if (id) await supabase.from("arrival_courtesy_rules").update(data).eq("id", id);
  else await supabase.from("arrival_courtesy_rules").insert(data);
  revalidatePath("/loja/vou-ai");
  return { ok: true };
}

/* ============================================================
   4) NOTAS PRIVADAS
   ============================================================ */
export async function saveNoteAction(_: any, fd: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const estabId = String(fd.get("establishment_id") || "");
  const body = String(fd.get("body") || "").trim();
  if (!body) return { error: "Texto vazio" };

  const { data: existing } = await supabase
    .from("private_notes")
    .select("id")
    .eq("user_id", user.id)
    .eq("establishment_id", estabId)
    .maybeSingle();

  if (existing) {
    await supabase.from("private_notes").update({ body }).eq("id", existing.id);
  } else {
    await supabase.from("private_notes").insert({ user_id: user.id, establishment_id: estabId, body });
  }
  revalidatePath("/app/notas");
  return { ok: true };
}

/* ============================================================
   5) CUPOM-PRESENTE PESSOAL
   ============================================================ */
export async function sendPersonalGiftAction(_: any, fd: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("personal_coupon_gifts").insert({
    sender_id: user.id,
    recipient_id: String(fd.get("recipient_id") || "") || null,
    recipient_hint: String(fd.get("recipient_hint") || "").trim() || null,
    establishment_id: String(fd.get("establishment_id") || ""),
    discount_kind: String(fd.get("discount_kind") || "percent"),
    discount_value: parseFloat(String(fd.get("discount_value") || "10").replace(",", ".")),
    message: String(fd.get("message") || "").trim() || null,
  });
  revalidatePath("/app/presentes");
  return { ok: true };
}

/* ============================================================
   6) WAITLIST
   ============================================================ */
export async function joinWaitlistAction(_: any, fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("waitlist_entries").insert({
    establishment_id: String(fd.get("establishment_id") || ""),
    user_id: user?.id ?? null,
    guest_name: String(fd.get("guest_name") || "").trim() || null,
    guest_phone: String(fd.get("guest_phone") || "").trim() || null,
    party_size: parseInt(String(fd.get("party_size") || "2"), 10),
  });
  if (error) return { error: error.message };
  revalidatePath("/loja/lista-espera");
  return { ok: true };
}

export async function waitlistCallAction(id: string) {
  await requireEstablishment();
  const supabase = await createClient();
  await supabase.from("waitlist_entries").update({
    status: "chamado", called_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/loja/lista-espera");
}

export async function waitlistSeatAction(id: string) {
  await requireEstablishment();
  const supabase = await createClient();
  await supabase.from("waitlist_entries").update({
    status: "sentado", seated_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/loja/lista-espera");
}

/* ============================================================
   7) MESA QR (lojista)
   ============================================================ */
export async function mesaQrUpsertAction(_: any, fd: FormData) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const id = String(fd.get("id") || "");
  const data = {
    establishment_id: establishment.id,
    label: String(fd.get("label") || "").trim(),
    capacity: parseInt(String(fd.get("capacity") || "4"), 10),
    is_active: fd.get("is_active") === "on",
  };
  if (id) await supabase.from("mesa_qr").update(data).eq("id", id);
  else await supabase.from("mesa_qr").insert(data);
  revalidatePath("/loja/mesa-qr");
  return { ok: true };
}

export async function mesaQrDeleteAction(id: string) {
  await requireEstablishment();
  await (await createClient()).from("mesa_qr").delete().eq("id", id);
  revalidatePath("/loja/mesa-qr");
}

/* ============================================================
   8) PARCERIAS
   ============================================================ */
export async function partnershipUpsertAction(_: any, fd: FormData) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const partnerEstabId = String(fd.get("partner_estab_id") || "");
  if (!partnerEstabId) return { error: "Selecione parceiro" };

  const [a, b] = [establishment.id, partnerEstabId].sort();
  const data = {
    estab_a: a, estab_b: b,
    combo_label: String(fd.get("combo_label") || "").trim() || null,
    combo_price_cents: fd.get("combo_price_brl") ? Math.floor(parseFloat(String(fd.get("combo_price_brl")).replace(",", ".")) * 100) : null,
    proposed_by: establishment.id,
    status: "proposta" as const,
  };
  const { error } = await supabase.from("partnerships").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/loja/parcerias");
  return { ok: true };
}

export async function partnershipAcceptAction(id: string) {
  await requireEstablishment();
  const supabase = await createClient();
  await supabase.from("partnerships").update({
    status: "ativa", accepted_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/loja/parcerias");
}

/* ============================================================
   9) A/B TEST
   ============================================================ */
export async function abTestCreateAction(_: any, fd: FormData) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  await supabase.from("coupon_ab_tests").insert({
    establishment_id: establishment.id,
    hypothesis: String(fd.get("hypothesis") || "").trim(),
    variant_a_label: String(fd.get("variant_a_label") || "Variante A").trim(),
    variant_a_discount_kind: String(fd.get("variant_a_kind") || "percent"),
    variant_a_discount_value: parseFloat(String(fd.get("variant_a_value") || "20").replace(",", ".")),
    variant_b_label: String(fd.get("variant_b_label") || "Variante B").trim(),
    variant_b_discount_kind: String(fd.get("variant_b_kind") || "fixed"),
    variant_b_discount_value: parseFloat(String(fd.get("variant_b_value") || "10").replace(",", ".")),
    audience_size: parseInt(String(fd.get("audience_size") || "100"), 10),
    status: "rascunho",
  });
  revalidatePath("/loja/ab-test");
  return { ok: true };
}

export async function abTestStartAction(id: string) {
  await requireEstablishment();
  await (await createClient()).from("coupon_ab_tests").update({
    status: "rodando", started_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/loja/ab-test");
}

export async function abTestEndAction(id: string, winner: "a" | "b" | "tie") {
  await requireEstablishment();
  await (await createClient()).from("coupon_ab_tests").update({
    status: "concluido", ended_at: new Date().toISOString(), winner,
  }).eq("id", id);
  revalidatePath("/loja/ab-test");
}

/* ============================================================
   10) CROSS-SELL
   ============================================================ */
export async function crossSellUpsertAction(_: any, fd: FormData) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const id = String(fd.get("id") || "");
  const data = {
    establishment_id: establishment.id,
    trigger_product_id: String(fd.get("trigger_product_id") || "") || null,
    offer_label: String(fd.get("offer_label") || "").trim(),
    discount_kind: String(fd.get("discount_kind") || "percent"),
    discount_value: parseFloat(String(fd.get("discount_value") || "10").replace(",", ".")),
    valid_hours: parseInt(String(fd.get("valid_hours") || "24"), 10),
    is_active: fd.get("is_active") === "on",
  };
  if (id) await supabase.from("cross_sell_rules").update(data).eq("id", id);
  else await supabase.from("cross_sell_rules").insert(data);
  revalidatePath("/loja/cross-sell");
  return { ok: true };
}

/* ============================================================
   11) CALENDÁRIO DE PROMO
   ============================================================ */
export async function promoCalendarUpsertAction(_: any, fd: FormData) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  await supabase.from("promo_calendar_events").insert({
    establishment_id: establishment.id,
    kind: String(fd.get("kind") || "coupon"),
    title: String(fd.get("title") || "").trim(),
    description: String(fd.get("description") || "").trim() || null,
    scheduled_at: new Date(String(fd.get("scheduled_at"))).toISOString(),
  });
  revalidatePath("/loja/calendario");
  return { ok: true };
}

export async function promoCalendarDeleteAction(id: string) {
  await requireEstablishment();
  await (await createClient()).from("promo_calendar_events").delete().eq("id", id);
  revalidatePath("/loja/calendario");
}

/* ============================================================
   12) CHAT BOT (auto-resposta)
   ============================================================ */
export async function chatBotUpsertAction(_: any, fd: FormData) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const id = String(fd.get("id") || "");
  const data = {
    establishment_id: establishment.id,
    trigger_pattern: String(fd.get("trigger_pattern") || "").trim(),
    reply_text: String(fd.get("reply_text") || "").trim(),
    is_active: fd.get("is_active") === "on",
  };
  if (id) await supabase.from("chat_auto_replies").update(data).eq("id", id);
  else await supabase.from("chat_auto_replies").insert(data);
  revalidatePath("/loja/chat-bot");
  return { ok: true };
}

export async function chatBotDeleteAction(id: string) {
  await requireEstablishment();
  await (await createClient()).from("chat_auto_replies").delete().eq("id", id);
  revalidatePath("/loja/chat-bot");
}

/* ============================================================
   13) CFO BACKUP
   ============================================================ */
export async function cfoBackupUpsertAction(_: any, fd: FormData) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  await supabase.from("cfo_backup_subscriptions").upsert({
    establishment_id: establishment.id,
    email: String(fd.get("email") || "").trim(),
    frequency: String(fd.get("frequency") || "weekly"),
    is_active: fd.get("is_active") === "on",
  });
  revalidatePath("/loja/cfo-backup");
  return { ok: true };
}

/* ============================================================
   14) ADMIN CRUDs gerais
   ============================================================ */
export async function badgeUpsertAction(_: any, fd: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(fd.get("id") || "");
  const data = {
    slug: String(fd.get("slug") || "").trim().toLowerCase(),
    label: String(fd.get("label") || "").trim(),
    description: String(fd.get("description") || "").trim() || null,
    icon: String(fd.get("icon") || "🏆"),
    rule_kind: String(fd.get("rule_kind") || "estabs"),
    rule_value: parseInt(String(fd.get("rule_value") || "5"), 10),
    coins_reward: parseInt(String(fd.get("coins_reward") || "50"), 10),
    is_active: fd.get("is_active") === "on",
    display_order: parseInt(String(fd.get("display_order") || "100"), 10),
  };
  if (id) await admin.from("badges").update(data).eq("id", id);
  else await admin.from("badges").insert(data);
  revalidatePath("/admin/ferramentas/badges");
  return { ok: true };
}

export async function badgeDeleteAction(id: string) {
  await requireAdmin();
  createAdminClient().from("badges").delete().eq("id", id);
  revalidatePath("/admin/ferramentas/badges");
}

export async function trainingVideoUpsertAction(_: any, fd: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(fd.get("id") || "");
  const data = {
    audience: String(fd.get("audience") || "lojista"),
    title: String(fd.get("title") || "").trim(),
    description: String(fd.get("description") || "").trim() || null,
    video_url: String(fd.get("video_url") || "").trim() || null,
    duration_seconds: parseInt(String(fd.get("duration_seconds") || "60"), 10),
    topic: String(fd.get("topic") || "").trim() || null,
    display_order: parseInt(String(fd.get("display_order") || "100"), 10),
    is_active: fd.get("is_active") === "on",
  };
  if (id) await admin.from("training_videos").update(data).eq("id", id);
  else await admin.from("training_videos").insert(data);
  revalidatePath("/admin/ferramentas/treinamentos");
  return { ok: true };
}

export async function trainingVideoDeleteAction(id: string) {
  await requireAdmin();
  createAdminClient().from("training_videos").delete().eq("id", id);
  revalidatePath("/admin/ferramentas/treinamentos");
}

export async function seasonalTemplateUpsertAction(_: any, fd: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(fd.get("id") || "");
  const data = {
    name: String(fd.get("name") || "").trim(),
    description: String(fd.get("description") || "").trim() || null,
    month_start: parseInt(String(fd.get("month_start") || "1"), 10),
    month_end: parseInt(String(fd.get("month_end") || "1"), 10),
    suggested_discount_percent: parseFloat(String(fd.get("suggested_discount_percent") || "20")),
    suggested_title: String(fd.get("suggested_title") || "").trim(),
    icon: String(fd.get("icon") || "🎉"),
    is_active: fd.get("is_active") === "on",
  };
  if (id) await admin.from("seasonal_templates").update(data).eq("id", id);
  else await admin.from("seasonal_templates").insert(data);
  revalidatePath("/admin/ferramentas/sazonalidade");
  return { ok: true };
}

export async function seasonalTemplateDeleteAction(id: string) {
  await requireAdmin();
  createAdminClient().from("seasonal_templates").delete().eq("id", id);
  revalidatePath("/admin/ferramentas/sazonalidade");
}

/* ============================================================
   FORM WRAPPERS (FormData-only)
   ============================================================ */
export async function fdWalletPackUpsert(fd: FormData) { await walletPackUpsertAction(undefined, fd); }
export async function fdCreateOuting(fd: FormData) { await createOutingAction(undefined, fd); }
export async function fdArrivalIntent(fd: FormData) { await arrivalIntentAction(undefined, fd); }
export async function fdArrivalCourtesyRule(fd: FormData) { await arrivalCourtesyRuleUpsertAction(undefined, fd); }
export async function fdSaveNote(fd: FormData) { await saveNoteAction(undefined, fd); }
export async function fdSendGift(fd: FormData) { await sendPersonalGiftAction(undefined, fd); }
export async function fdJoinWaitlist(fd: FormData) { await joinWaitlistAction(undefined, fd); }
export async function fdMesaQr(fd: FormData) { await mesaQrUpsertAction(undefined, fd); }
export async function fdPartnership(fd: FormData) { await partnershipUpsertAction(undefined, fd); }
export async function fdAbTestCreate(fd: FormData) { await abTestCreateAction(undefined, fd); }
export async function fdCrossSell(fd: FormData) { await crossSellUpsertAction(undefined, fd); }
export async function fdPromoCalendar(fd: FormData) { await promoCalendarUpsertAction(undefined, fd); }
export async function fdChatBot(fd: FormData) { await chatBotUpsertAction(undefined, fd); }
export async function fdCfoBackup(fd: FormData) { await cfoBackupUpsertAction(undefined, fd); }
export async function fdBadge(fd: FormData) { await badgeUpsertAction(undefined, fd); }
export async function fdTraining(fd: FormData) { await trainingVideoUpsertAction(undefined, fd); }
export async function fdSeasonal(fd: FormData) { await seasonalTemplateUpsertAction(undefined, fd); }
