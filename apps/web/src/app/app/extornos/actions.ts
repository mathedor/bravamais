"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type State = { error?: string; ok?: string } | undefined;

export async function requestRefundAction(_: State, formData: FormData): Promise<State> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login pra pedir extorno." };

  const orderId = String(formData.get("order_id") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!orderId || !reason) return { error: "Selecione o pedido e o motivo." };

  // Verifica order pertence ao user e busca establishment
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, establishment_id, total_cents, status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.user_id !== user.id) return { error: "Pedido não encontrado." };
  if (!["paid", "completed"].includes(order.status)) return { error: "Só dá pra estornar pedidos pagos/concluídos." };

  // Verifica se já tem ticket aberto
  const { data: existing } = await admin
    .from("refund_tickets")
    .select("id, status")
    .eq("order_id", orderId)
    .in("status", ["open", "contested", "approved"])
    .maybeSingle();
  if (existing) return { error: "Já existe um pedido de extorno em andamento pra esse pedido." };

  const { error } = await admin.from("refund_tickets").insert({
    order_id: orderId,
    user_id: user.id,
    establishment_id: order.establishment_id,
    user_reason: reason,
    user_message: message || null,
    refund_amount_cents: order.total_cents,
  });
  if (error) return { error: error.message };

  // Notifica lojista
  const { data: estab } = await admin
    .from("establishments")
    .select("owner_id, name, slug")
    .eq("id", order.establishment_id)
    .maybeSingle();
  if (estab) {
    await admin.from("notifications").insert({
      user_id: estab.owner_id,
      type: "system",
      title: `🔴 Cliente pediu extorno`,
      body: `Motivo: ${reason}`,
      link: "/loja/extornos",
    });
  }

  revalidatePath("/app/extornos");
  return { ok: "Pedido de extorno aberto. Acompanhe o status." };
}
