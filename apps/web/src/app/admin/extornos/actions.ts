"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { uploadToStorage } from "@/lib/storage";

type State = { error?: string; ok?: string } | undefined;

export async function resolveRefundAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const id = String(formData.get("ticket_id") || "");
  const decision = String(formData.get("decision") || ""); // approve, reject
  const note = String(formData.get("note") || "").trim();
  if (!id || !decision) return { error: "Faltam campos." };

  const supabase = createAdminClient();
  const { data: ticket } = await supabase
    .from("refund_tickets")
    .select("id, user_id, establishment_id, status, refund_amount_cents")
    .eq("id", id)
    .maybeSingle();
  if (!ticket) return { error: "Ticket não encontrado." };
  if (!["open", "contested", "approved"].includes(ticket.status)) {
    return { error: "Status já resolvido." };
  }

  let receiptUrl: string | null = null;
  if (decision === "approve") {
    const receipt = formData.get("receipt");
    if (receipt instanceof Blob && receipt.size > 0) {
      const r = await uploadToStorage("receipts", `refund/${id}`, receipt);
      if (r.error || !r.url) return { error: r.error ?? "Falha no upload." };
      receiptUrl = r.url;
    }
    if (!receiptUrl) return { error: "Anexe o comprovante do estorno." };

    await supabase
      .from("refund_tickets")
      .update({
        status: "refunded",
        admin_decision: note || "Estorno aprovado pelo admin.",
        refund_receipt_url: receiptUrl,
        resolved_by_admin_user_id: admin.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);

    await supabase.from("notifications").insert({
      user_id: ticket.user_id,
      type: "system",
      title: `✅ Extorno aprovado pela BRAVA+`,
      body: "O valor foi transferido. Confira o comprovante.",
      link: "/app/extornos",
    });
  } else {
    if (!note) return { error: "Informe o motivo da rejeição." };
    await supabase
      .from("refund_tickets")
      .update({
        status: "rejected",
        admin_decision: note,
        resolved_by_admin_user_id: admin.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);

    await supabase.from("notifications").insert({
      user_id: ticket.user_id,
      type: "system",
      title: `❌ Extorno negado pela BRAVA+`,
      body: note,
      link: "/app/extornos",
    });
  }

  revalidatePath("/admin/extornos");
  return { ok: "Decisão registrada." };
}
