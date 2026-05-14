"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDeliverer } from "@/lib/deliverer-guard";
import { notifyCustomerStatus } from "@/lib/delivery-notifications";
import type { Delivery } from "@/lib/supabase/types";

export async function toggleOnlineAction(formData: FormData) {
  const { deliverer } = await requireDeliverer();
  const goOnline = String(formData.get("online") || "") === "true";
  const supabase = await createClient();
  await supabase
    .from("deliverers")
    .update({ is_online: goOnline, last_seen_at: new Date().toISOString() })
    .eq("id", deliverer.id);
  revalidatePath("/entregador");
}

export async function acceptDeliveryAction(formData: FormData) {
  const { deliverer } = await requireDeliverer();
  const deliveryId = String(formData.get("delivery_id") || "");
  if (!deliveryId) return;
  const supabase = await createClient();
  await supabase
    .from("deliveries")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", deliveryId)
    .eq("deliverer_id", deliverer.id);
  revalidatePath(`/entregador/${deliveryId}`);
  revalidatePath("/entregador");
}

export async function pickupDeliveryAction(formData: FormData) {
  const { deliverer } = await requireDeliverer();
  const deliveryId = String(formData.get("delivery_id") || "");
  if (!deliveryId) return;

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id, order_id, orders(user_id)")
    .eq("id", deliveryId)
    .eq("deliverer_id", deliverer.id)
    .maybeSingle<{ id: string; order_id: string; orders: { user_id: string } | null }>();

  if (!delivery) return;

  await supabase
    .from("deliveries")
    .update({ status: "picked_up", picked_up_at: new Date().toISOString() })
    .eq("id", deliveryId);

  await admin.from("orders").update({ status: "ready" }).eq("id", delivery.order_id);

  if (delivery.orders?.user_id) {
    await notifyCustomerStatus(delivery.orders.user_id, "picked_up", {
      deliveryId: delivery.id,
      orderId: delivery.order_id,
      delivererName: deliverer.full_name,
      code: undefined,
    });
  }

  revalidatePath(`/entregador/${deliveryId}`);
  revalidatePath("/entregador");
}

export async function confirmDeliveredAction(_: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  const { deliverer } = await requireDeliverer();
  const deliveryId = String(formData.get("delivery_id") || "");
  const code = String(formData.get("code") || "").trim();

  if (!deliveryId || !code) return { error: "Código obrigatório." };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id, order_id, confirmation_code, orders(user_id)")
    .eq("id", deliveryId)
    .eq("deliverer_id", deliverer.id)
    .maybeSingle<{ id: string; order_id: string; confirmation_code: string; orders: { user_id: string } | null }>();

  if (!delivery) return { error: "Entrega não encontrada." };
  if (delivery.confirmation_code !== code) return { error: "Código incorreto. Confirme com o cliente." };

  await supabase
    .from("deliveries")
    .update({ status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", deliveryId);

  await admin
    .from("orders")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", delivery.order_id);

  if (delivery.orders?.user_id) {
    await notifyCustomerStatus(delivery.orders.user_id, "delivered", {
      deliveryId: delivery.id,
      orderId: delivery.order_id,
      delivererName: deliverer.full_name,
    });
  }

  revalidatePath(`/entregador/${deliveryId}`);
  revalidatePath("/entregador");
  return { ok: true };
}

export async function startTransitAction(formData: FormData) {
  const { deliverer } = await requireDeliverer();
  const deliveryId = String(formData.get("delivery_id") || "");
  if (!deliveryId) return;
  const supabase = await createClient();
  await supabase
    .from("deliveries")
    .update({ status: "in_transit" })
    .eq("id", deliveryId)
    .eq("deliverer_id", deliverer.id);
  revalidatePath(`/entregador/${deliveryId}`);
}
