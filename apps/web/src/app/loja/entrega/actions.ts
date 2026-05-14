"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

type State = { error?: string; ok?: boolean } | undefined;

export async function saveDeliverySettingsAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const deliveryEnabled = String(formData.get("delivery_enabled") || "") === "on";
  const pickupEnabled = String(formData.get("pickup_enabled") || "") === "on";
  const maxRadiusKm = parseFloat(String(formData.get("max_radius_km") || "20").replace(",", ".")) || 20;
  const prepMinutes = parseInt(String(formData.get("default_prep_minutes") || "30"), 10) || 30;
  const notifyTemplate = String(formData.get("notify_template_whatsapp") || "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("establishment_delivery_settings")
    .upsert({
      establishment_id: establishment.id,
      delivery_enabled: deliveryEnabled,
      pickup_enabled: pickupEnabled,
      max_radius_km: maxRadiusKm,
      default_prep_minutes: prepMinutes,
      notify_template_whatsapp: notifyTemplate || null,
      updated_at: new Date().toISOString(),
    });
  if (error) return { error: error.message };

  revalidatePath("/loja/entrega");
  return { ok: true };
}

export async function upsertZoneAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("id") || "");
  const maxKm = parseFloat(String(formData.get("max_km") || "0").replace(",", "."));
  const fee = parseFloat(String(formData.get("fee") || "0").replace(",", "."));
  const freeAbove = parseFloat(String(formData.get("free_above") || "0").replace(",", "."));

  if (!maxKm || maxKm <= 0) return { error: "Distância (km) inválida." };
  if (fee < 0) return { error: "Taxa inválida." };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase
      .from("delivery_zones")
      .update({
        max_km: maxKm,
        fee_cents: Math.round(fee * 100),
        free_above_cents: freeAbove > 0 ? Math.round(freeAbove * 100) : null,
      })
      .eq("id", id)
      .eq("establishment_id", establishment.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("delivery_zones")
      .insert({
        establishment_id: establishment.id,
        max_km: maxKm,
        fee_cents: Math.round(fee * 100),
        free_above_cents: freeAbove > 0 ? Math.round(freeAbove * 100) : null,
      });
    if (error) return { error: error.message };
  }
  revalidatePath("/loja/entrega");
  return { ok: true };
}

export async function deleteZoneAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("delivery_zones").delete().eq("id", id).eq("establishment_id", establishment.id);
  revalidatePath("/loja/entrega");
}
