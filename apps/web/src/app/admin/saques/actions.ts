"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { uploadToStorage } from "@/lib/storage";

type State = { error?: string; ok?: string } | undefined;

export async function approveWithdrawalAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const id = String(formData.get("withdrawal_id") || "");
  if (!id) return { error: "ID inválido." };

  const receipt = formData.get("receipt");
  let receiptUrl: string | null = null;

  if (receipt instanceof Blob && receipt.size > 0) {
    const r = await uploadToStorage("receipts", `withdrawal/${id}`, receipt);
    if (r.error || !r.url) return { error: r.error ?? "Falha no upload do comprovante." };
    receiptUrl = r.url;
  }

  if (!receiptUrl) return { error: "Anexe o comprovante da transferência." };

  const supabase = createAdminClient();

  // 1. Marca saque como pago
  const { data: withdrawal } = await supabase
    .from("withdrawals")
    .select("id, establishment_id, amount_cents")
    .eq("id", id)
    .maybeSingle();
  if (!withdrawal) return { error: "Saque não encontrado." };

  await supabase
    .from("withdrawals")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      receipt_url: receiptUrl,
      processed_by_admin_user_id: admin.id,
    })
    .eq("id", id);

  // 2. Marca orders elegíveis como withdrawn (FIFO simples até o valor do saque)
  let remaining = withdrawal.amount_cents;
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_cents")
    .eq("establishment_id", withdrawal.establishment_id)
    .in("status", ["paid", "completed"])
    .is("withdrawn_at", null)
    .order("created_at", { ascending: true });

  for (const o of orders ?? []) {
    if (remaining <= 0) break;
    await supabase.from("orders").update({ withdrawn_at: new Date().toISOString() }).eq("id", o.id);
    remaining -= o.total_cents;
  }

  // 3. Notifica dono
  const { data: estab } = await supabase
    .from("establishments")
    .select("owner_id, name")
    .eq("id", withdrawal.establishment_id)
    .maybeSingle();
  if (estab) {
    await supabase.from("notifications").insert({
      user_id: estab.owner_id,
      type: "system",
      title: `💰 Saque pago: R$ ${(withdrawal.amount_cents / 100).toFixed(2)}`,
      body: "Seu saque foi processado. Veja o comprovante em Saques.",
      link: "/loja/saques",
    });
  }

  revalidatePath("/admin/saques");
  return { ok: "Saque marcado como pago." };
}

export async function rejectWithdrawalAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const id = String(formData.get("withdrawal_id") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!id || !reason) return { error: "ID e motivo são obrigatórios." };

  const supabase = createAdminClient();
  const { data: withdrawal } = await supabase
    .from("withdrawals")
    .select("establishment_id, amount_cents")
    .eq("id", id)
    .maybeSingle();
  if (!withdrawal) return { error: "Saque não encontrado." };

  await supabase
    .from("withdrawals")
    .update({ status: "rejected", rejected_at: new Date().toISOString(), rejected_reason: reason })
    .eq("id", id);

  const { data: estab } = await supabase
    .from("establishments")
    .select("owner_id")
    .eq("id", withdrawal.establishment_id)
    .maybeSingle();
  if (estab) {
    await supabase.from("notifications").insert({
      user_id: estab.owner_id,
      type: "system",
      title: `❌ Saque rejeitado`,
      body: `Motivo: ${reason}`,
      link: "/loja/saques",
    });
  }

  revalidatePath("/admin/saques");
  return { ok: "Saque rejeitado." };
}
