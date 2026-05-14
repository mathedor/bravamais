"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth-guard";
import { buildFullAddress, geocodeAddress } from "@/lib/geocoding";

type State = { error?: string; ok?: boolean } | undefined;

export async function createAddressAction(_: State, formData: FormData): Promise<State> {
  const { profile } = await requireUser();

  const label = String(formData.get("label") || "Casa").trim();
  const recipientName = String(formData.get("recipient_name") || "").trim();
  const recipientPhone = String(formData.get("recipient_phone") || "").trim();
  const cep = String(formData.get("cep") || "").replace(/\D/g, "");
  const street = String(formData.get("street") || "").trim();
  const number = String(formData.get("number") || "").trim();
  const complement = String(formData.get("complement") || "").trim();
  const neighborhood = String(formData.get("neighborhood") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase().slice(0, 2);
  const reference = String(formData.get("reference") || "").trim();
  const isDefault = String(formData.get("is_default") || "") === "on";

  if (!cep || !street || !city || !state) {
    return { error: "Preencha CEP, rua, cidade e UF." };
  }

  const geo = await geocodeAddress(buildFullAddress({ street, number, neighborhood, city, state, cep }));

  const supabase = await createClient();

  if (isDefault) {
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", profile.id);
  }

  const { error } = await supabase.from("user_addresses").insert({
    user_id: profile.id,
    label,
    recipient_name: recipientName || profile.full_name,
    recipient_phone: recipientPhone || null,
    cep,
    street,
    number: number || null,
    complement: complement || null,
    neighborhood: neighborhood || null,
    city,
    state,
    reference: reference || null,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    is_default: isDefault,
  });

  if (error) return { error: error.message };

  revalidatePath("/app/perfil/enderecos");
  return { ok: true };
}

export async function setDefaultAddressAction(formData: FormData) {
  const { profile } = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", profile.id);
  await supabase.from("user_addresses").update({ is_default: true }).eq("user_id", profile.id).eq("id", id);
  revalidatePath("/app/perfil/enderecos");
}

export async function deleteAddressAction(formData: FormData) {
  const { profile } = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("user_addresses").delete().eq("id", id).eq("user_id", profile.id);
  revalidatePath("/app/perfil/enderecos");
}
