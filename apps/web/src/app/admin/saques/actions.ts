"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { uploadToStorage } from "@/lib/storage";
import { conferirRepasseExcedente } from "@/lib/financeiro";

type State = { error?: string; ok?: string } | undefined;

/** pendente -> aprovado (sinaliza pro lojista que a transferência está na fila). */
export async function approveWithdrawalAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const id = String(formData.get("withdrawal_id") || "");
  if (!id) return { error: "ID inválido." };

  const supabase = createAdminClient();
  const { data: w } = await supabase
    .from("withdrawals")
    .select("id, status, establishment_id, amount_cents")
    .eq("id", id)
    .maybeSingle();
  if (!w) return { error: "Saque não encontrado." };
  if (w.status !== "pending") return { error: "Só saques pendentes podem ser aprovados." };

  await supabase
    .from("withdrawals")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      processed_by_admin_user_id: admin.id,
    })
    .eq("id", id);

  await notifyOwner(
    supabase,
    w.establishment_id,
    `✅ Saque aprovado: R$ ${(w.amount_cents / 100).toFixed(2)}`,
    "A transferência entrou na fila de pagamento.",
  );

  revalidatePath("/admin/saques");
  return { ok: "Saque aprovado." };
}

/** pendente/aprovado -> pago, com comprovante obrigatório + FIFO nas orders + checagem de excedente. */
export async function payWithdrawalAction(_: State, formData: FormData): Promise<State> {
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

  const { data: withdrawal } = await supabase
    .from("withdrawals")
    .select("id, status, establishment_id, amount_cents")
    .eq("id", id)
    .maybeSingle();
  if (!withdrawal) return { error: "Saque não encontrado." };
  if (!["pending", "approved"].includes(withdrawal.status)) {
    return { error: "Saque já processado." };
  }

  await supabase
    .from("withdrawals")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      receipt_url: receiptUrl,
      processed_by_admin_user_id: admin.id,
    })
    .eq("id", id);

  // Marca orders elegíveis como withdrawn (FIFO simples até o valor do saque)
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

  // Pagou a maior? Gera bloqueio 'repasse_excedente' automaticamente.
  await conferirRepasseExcedente(withdrawal.establishment_id);

  await notifyOwner(
    supabase,
    withdrawal.establishment_id,
    `💰 Saque pago: R$ ${(withdrawal.amount_cents / 100).toFixed(2)}`,
    "Seu saque foi processado. Veja o comprovante em Saques.",
  );

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
    .select("status, establishment_id, amount_cents")
    .eq("id", id)
    .maybeSingle();
  if (!withdrawal) return { error: "Saque não encontrado." };
  if (!["pending", "approved"].includes(withdrawal.status)) {
    return { error: "Saque já processado." };
  }

  await supabase
    .from("withdrawals")
    .update({ status: "rejected", rejected_at: new Date().toISOString(), rejected_reason: reason })
    .eq("id", id);

  await notifyOwner(supabase, withdrawal.establishment_id, "❌ Saque recusado", `Motivo: ${reason}`);

  revalidatePath("/admin/saques");
  return { ok: "Saque recusado." };
}

async function notifyOwner(
  supabase: ReturnType<typeof createAdminClient>,
  establishmentId: string,
  title: string,
  body: string,
) {
  const { data: estab } = await supabase
    .from("establishments")
    .select("owner_id")
    .eq("id", establishmentId)
    .maybeSingle();
  if (estab) {
    await supabase.from("notifications").insert({
      user_id: estab.owner_id,
      type: "system",
      title,
      body,
      link: "/loja/saques",
    });
  }
}
