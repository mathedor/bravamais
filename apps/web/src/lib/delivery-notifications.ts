import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push";
import { formatBRL } from "@/lib/format";

interface DeliveryNotifyContext {
  deliveryId: string;
  pickup: string;
  dropoff: string;
  feeCents: number;
  code: string;
  delivererName?: string;
  delivererPhone?: string;
  delivererWhatsapp?: string;
  customerUserId?: string;
}

/**
 * Gera deeplink wa.me com mensagem pronta pro lojista clicar e enviar
 * pelo WhatsApp Web. Usa o template configurado em delivery settings
 * (fallback pra template padrão se não tiver).
 */
export function buildWhatsappDeliveryLink({
  phone,
  template,
  pickup,
  dropoff,
  code,
  feeCents,
}: {
  phone: string;
  template?: string | null;
  pickup: string;
  dropoff: string;
  code: string;
  feeCents: number;
}): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const tpl = template ?? `🛵 Nova entrega BRAVA+!\n\nOrigem: {pickup}\nDestino: {dropoff}\n\nCódigo de confirmação: {code}\nValor: {fee}\n\nAbra o app pra aceitar.`;
  const msg = tpl
    .replace("{pickup}", pickup)
    .replace("{dropoff}", dropoff)
    .replace("{code}", code)
    .replace("{fee}", formatBRL(feeCents));
  const ddi = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${ddi}?text=${encodeURIComponent(msg)}`;
}

/**
 * Notifica entregador de uma nova entrega atribuída via push + notification interna.
 * Email/SMS ficam pro lojista disparar manualmente via botão WhatsApp.
 */
export async function notifyDelivererAssigned(
  context: DeliveryNotifyContext & { delivererUserId?: string | null },
): Promise<void> {
  if (!context.delivererUserId) return;
  const admin = createAdminClient();

  // Push web (silencioso se VAPID não configurado)
  await sendPushToUser(context.delivererUserId, {
    title: "🛵 Nova entrega atribuída!",
    body: `Destino: ${context.dropoff} · ${formatBRL(context.feeCents)}`,
    url: `/entregador/${context.deliveryId}`,
    tag: `delivery-${context.deliveryId}`,
  });

  // Notification interna (in-app)
  await admin.from("notifications").insert({
    user_id: context.delivererUserId,
    type: "delivery",
    title: "Nova entrega BRAVA+",
    body: `${context.pickup} → ${context.dropoff}`,
    link: `/entregador/${context.deliveryId}`,
    metadata: { delivery_id: context.deliveryId, code: context.code, fee_cents: context.feeCents },
  });
}

/**
 * Notifica o cliente de mudança de status (saiu pra entrega, entregue).
 */
export async function notifyCustomerStatus(
  customerUserId: string,
  status: "picked_up" | "delivered" | "canceled",
  context: { deliveryId: string; orderId: string; delivererName?: string; code?: string },
): Promise<void> {
  const admin = createAdminClient();
  const messages: Record<typeof status, { title: string; body: string }> = {
    picked_up: {
      title: "🛵 Saiu pra entrega!",
      body: context.delivererName
        ? `${context.delivererName} já está a caminho. Código: ${context.code ?? ""}`
        : "Seu pedido está a caminho!",
    },
    delivered: {
      title: "✅ Entregue!",
      body: "Seu pedido foi entregue. Que tal avaliar o entregador?",
    },
    canceled: {
      title: "Entrega cancelada",
      body: "Sua entrega foi cancelada. Confira detalhes no app.",
    },
  };

  const m = messages[status];

  await sendPushToUser(customerUserId, {
    title: m.title,
    body: m.body,
    url: `/app/pedidos/${context.orderId}`,
    tag: `delivery-${context.deliveryId}-${status}`,
  });

  await admin.from("notifications").insert({
    user_id: customerUserId,
    type: "delivery",
    title: m.title,
    body: m.body,
    link: `/app/pedidos/${context.orderId}`,
    metadata: { delivery_id: context.deliveryId, status },
  });
}
