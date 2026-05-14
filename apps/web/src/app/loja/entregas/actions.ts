"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { notifyDelivererAssigned, notifyCustomerStatus } from "@/lib/delivery-notifications";

export async function assignDelivererAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const deliveryId = String(formData.get("delivery_id") || "");
  const delivererId = String(formData.get("deliverer_id") || "");
  if (!deliveryId || !delivererId) return;

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id, order_id, dropoff_address, pickup_address, fee_cents, confirmation_code")
    .eq("id", deliveryId)
    .eq("establishment_id", establishment.id)
    .maybeSingle<{ id: string; order_id: string; dropoff_address: string; pickup_address: string; fee_cents: number; confirmation_code: string }>();

  if (!delivery) return;

  await admin
    .from("deliveries")
    .update({
      deliverer_id: delivererId,
      status: "assigned",
      assigned_at: new Date().toISOString(),
    })
    .eq("id", deliveryId);

  const { data: deliverer } = await admin
    .from("deliverers")
    .select("user_id, full_name, phone, whatsapp")
    .eq("id", delivererId)
    .maybeSingle<{ user_id: string | null; full_name: string; phone: string; whatsapp: string | null }>();

  if (deliverer?.user_id) {
    await notifyDelivererAssigned({
      deliveryId: delivery.id,
      pickup: delivery.pickup_address,
      dropoff: delivery.dropoff_address,
      feeCents: delivery.fee_cents,
      code: delivery.confirmation_code,
      delivererUserId: deliverer.user_id,
    });
  }

  revalidatePath("/loja/entregas");
}

export async function markPreparingAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const orderId = String(formData.get("order_id") || "");
  if (!orderId) return;
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status: "preparing" })
    .eq("id", orderId)
    .eq("establishment_id", establishment.id);
  revalidatePath("/loja/entregas");
}

export async function markReadyAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const orderId = String(formData.get("order_id") || "");
  if (!orderId) return;
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status: "ready" })
    .eq("id", orderId)
    .eq("establishment_id", establishment.id);
  revalidatePath("/loja/entregas");
}

export async function cancelDeliveryAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const deliveryId = String(formData.get("delivery_id") || "");
  const reason = String(formData.get("reason") || "Cancelada pela loja");
  if (!deliveryId) return;

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id, order_id, orders(user_id)")
    .eq("id", deliveryId)
    .eq("establishment_id", establishment.id)
    .maybeSingle<{ id: string; order_id: string; orders: { user_id: string } | null }>();

  if (!delivery) return;

  await admin
    .from("deliveries")
    .update({ status: "canceled", canceled_at: new Date().toISOString(), cancel_reason: reason })
    .eq("id", deliveryId);

  if (delivery.orders?.user_id) {
    await notifyCustomerStatus(delivery.orders.user_id, "canceled", {
      deliveryId: delivery.id,
      orderId: delivery.order_id,
    });
  }

  revalidatePath("/loja/entregas");
}
