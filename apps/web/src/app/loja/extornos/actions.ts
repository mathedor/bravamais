"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";

type State = { error?: string; ok?: string } | undefined;

export async function contestRefundAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const ticketId = String(formData.get("ticket_id") || "");
  const contest = String(formData.get("contest") || "").trim();
  const action = String(formData.get("action") || "contest"); // contest, approve

  if (!ticketId) return { error: "ID inválido." };

  const admin = createAdminClient();
  const { data: ticket } = await admin
    .from("refund_tickets")
    .select("id, user_id, establishment_id, status, order_id, refund_amount_cents, establishments(name)")
    .eq("id", ticketId)
    .maybeSingle();
  if (!ticket || ticket.establishment_id !== establishment.id) return { error: "Ticket não encontrado." };
  if (ticket.status !== "open") return { error: "Status atual não permite contestação." };

  if (action === "approve") {
    // Lojista aceita extorno: marca refunded direto (sem precisar do admin)
    await admin
      .from("refund_tickets")
      .update({
        status: "refunded",
        establishment_contest: contest || "Aprovado pelo lojista",
        admin_decision: "Lojista aprovou diretamente.",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", ticketId);
    await admin.from("notifications").insert({
      user_id: ticket.user_id,
      type: "system",
      title: `✅ Extorno aprovado por ${establishment.name}`,
      body: "Você receberá o estorno em breve.",
      link: "/app/extornos",
    });
  } else {
    if (!contest) return { error: "Informe sua contestação." };
    await admin
      .from("refund_tickets")
      .update({
        status: "contested",
        establishment_contest: contest,
        contested_at: new Date().toISOString(),
      })
      .eq("id", ticketId);
    await admin.from("notifications").insert({
      user_id: ticket.user_id,
      type: "system",
      title: `⚠️ ${establishment.name} contestou seu extorno`,
      body: "Admin BRAVA+ vai analisar e decidir.",
      link: "/app/extornos",
    });
  }

  revalidatePath("/loja/extornos");
  return { ok: "Resposta enviada." };
}
