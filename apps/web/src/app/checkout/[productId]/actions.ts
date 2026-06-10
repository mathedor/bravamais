"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth-guard";
import { haversineKm, quoteDelivery, generateConfirmationCode } from "@/lib/delivery-pricing";
import { buildFullAddress } from "@/lib/geocoding";
import { createPayment, type CreateResult } from "@/lib/payments";
import { getPayer } from "@/lib/payer";
import type { DeliveryZone, EstablishmentDeliverySettings, UserAddress } from "@/lib/supabase/types";

type State =
  | {
      error?: string;
      ok?: boolean;
      orderId?: string;
      payment?: CreateResult;
    }
  | undefined;

interface QuoteResponse {
  feeCents: number;
  distanceKm: number | null;
  outOfRange: boolean;
  freeShipping: boolean;
  zoneKm: number | null;
}

export async function getDeliveryQuote(
  establishmentId: string,
  addressId: string,
  subtotalCents: number,
): Promise<QuoteResponse> {
  const supabase = await createClient();
  const [{ data: estab }, { data: addr }, { data: zones }, { data: settings }] = await Promise.all([
    supabase.from("establishments").select("lat, lng").eq("id", establishmentId).maybeSingle<{ lat: number | null; lng: number | null }>(),
    supabase.from("user_addresses").select("lat, lng").eq("id", addressId).maybeSingle<{ lat: number | null; lng: number | null }>(),
    supabase.from("delivery_zones").select("max_km, fee_cents, free_above_cents, is_active").eq("establishment_id", establishmentId),
    supabase.from("establishment_delivery_settings").select("max_radius_km, delivery_enabled").eq("establishment_id", establishmentId).maybeSingle<Pick<EstablishmentDeliverySettings, "max_radius_km" | "delivery_enabled">>(),
  ]);

  if (!estab?.lat || !estab?.lng || !addr?.lat || !addr?.lng) {
    return { feeCents: 0, distanceKm: null, outOfRange: true, freeShipping: false, zoneKm: null };
  }
  if (!settings?.delivery_enabled) {
    return { feeCents: 0, distanceKm: null, outOfRange: true, freeShipping: false, zoneKm: null };
  }

  const distanceKm = haversineKm({ lat: estab.lat, lng: estab.lng }, { lat: addr.lat, lng: addr.lng });
  const quote = quoteDelivery({
    distanceKm,
    subtotalCents,
    zones: (zones ?? []) as Pick<DeliveryZone, "max_km" | "fee_cents" | "free_above_cents" | "is_active">[],
    maxRadiusKm: Number(settings?.max_radius_km ?? 20),
  });

  return {
    feeCents: quote.feeCents,
    distanceKm: Number(distanceKm.toFixed(2)),
    outOfRange: quote.outOfRange,
    freeShipping: quote.freeShipping,
    zoneKm: quote.zoneKm,
  };
}

export async function placeOrderAction(_: State, formData: FormData): Promise<State> {
  const { profile } = await requireUser();
  const productId = String(formData.get("product_id") || "");
  const qty = Math.max(1, Math.min(10, parseInt(String(formData.get("qty") || "1"), 10)));
  const deliveryType = String(formData.get("delivery_type") || "pickup") as "pickup" | "delivery";
  const addressId = String(formData.get("address_id") || "");
  const paymentMethod = String(formData.get("payment_method") || "pix") as "pix" | "credit_card";
  const notes = String(formData.get("notes") || "").trim();

  if (!productId) return { error: "Produto inválido." };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, price_cents, establishment_id, is_active")
    .eq("id", productId)
    .maybeSingle<{ id: string; name: string; price_cents: number; establishment_id: string; is_active: boolean }>();

  if (!product || !product.is_active) return { error: "Produto indisponível." };

  const subtotalCents = product.price_cents * qty;

  // Delivery quote (se for entrega)
  let feeCents = 0;
  let distanceKm: number | null = null;
  let address: UserAddress | null = null;

  if (deliveryType === "delivery") {
    if (!addressId) return { error: "Selecione um endereço de entrega." };

    const { data: a } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", profile.id)
      .maybeSingle<UserAddress>();

    if (!a) return { error: "Endereço não encontrado." };
    address = a;

    const quote = await getDeliveryQuote(product.establishment_id, addressId, subtotalCents);
    if (quote.outOfRange) return { error: "Esta loja não entrega no seu endereço (fora do raio)." };
    feeCents = quote.feeCents;
    distanceKm = quote.distanceKm;
  }

  const totalCents = subtotalCents + feeCents;

  // 1. Cria order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: profile.id,
      establishment_id: product.establishment_id,
      status: "pending_payment",
      subtotal_cents: subtotalCents,
      discount_cents: 0,
      total_cents: totalCents,
      payment_method: paymentMethod,
      delivery_type: deliveryType,
      delivery_address_id: deliveryType === "delivery" ? addressId : null,
      delivery_fee_cents: feeCents,
      delivery_distance_km: distanceKm,
      delivery_notes: notes || null,
    })
    .select("id")
    .single();

  if (orderErr || !order) return { error: orderErr?.message ?? "Erro criando pedido." };

  // 2. Cria order_item
  await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    qty,
    unit_price_cents: product.price_cents,
  });

  // 3. Cria delivery record (se entrega)
  if (deliveryType === "delivery" && address) {
    const { data: estab } = await supabase
      .from("establishments")
      .select("street, number, neighborhood, city, state, cep, lat, lng, name")
      .eq("id", product.establishment_id)
      .maybeSingle<{ street: string | null; number: string | null; neighborhood: string | null; city: string | null; state: string | null; cep: string | null; lat: number | null; lng: number | null; name: string }>();

    await admin.from("deliveries").insert({
      order_id: order.id,
      establishment_id: product.establishment_id,
      status: "awaiting_assignment",
      pickup_address: buildFullAddress(estab ?? {}),
      pickup_lat: estab?.lat,
      pickup_lng: estab?.lng,
      dropoff_address: buildFullAddress(address),
      dropoff_lat: address.lat,
      dropoff_lng: address.lng,
      recipient_name: address.recipient_name ?? profile.full_name,
      recipient_phone: address.recipient_phone ?? profile.phone,
      distance_km: distanceKm,
      fee_cents: feeCents,
      confirmation_code: generateConfirmationCode(),
      notes: notes || null,
    });
  }

  // 4. Cobrança: PIX (SyncPay) ou cartão/Apple Pay/Google Pay (Stripe)
  const payer = await getPayer();
  if (!payer) return { error: "Faça login pra pagar." };

  const method = paymentMethod === "pix" ? "pix" : "card";
  const payment = await createPayment({
    kind: "order",
    refId: order.id,
    refMeta: { establishment_id: product.establishment_id },
    method,
    amountCents: totalCents,
    description: `BRAVA+ pedido #${order.id.slice(0, 8)}`,
    statementSuffix: "BRAVAMAIS",
    payer,
  });

  // guarda o charge id no pedido (referência rápida)
  if (payment.method === "pix") {
    await supabase
      .from("orders")
      .update({ efi_charge_id: payment.paymentId, efi_pix_qr: payment.pixCode })
      .eq("id", order.id);
  } else {
    await supabase.from("orders").update({ efi_charge_id: payment.paymentId }).eq("id", order.id);
  }

  revalidatePath("/app/pedidos");
  return { ok: true, orderId: order.id, payment };
}
