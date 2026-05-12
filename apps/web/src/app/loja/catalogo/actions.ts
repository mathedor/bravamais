"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

type State = { error?: string; ok?: boolean } | undefined;

export async function createProductAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceStr = String(formData.get("price") || "").trim();
  const photoUrl = String(formData.get("photo_url") || "").trim();

  if (!name || !priceStr) return { error: "Nome e preço são obrigatórios." };
  const priceCents = Math.round(parseFloat(priceStr.replace(",", ".")) * 100);
  if (!Number.isFinite(priceCents) || priceCents < 0) return { error: "Preço inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    establishment_id: establishment.id,
    name,
    description: description || null,
    price_cents: priceCents,
    photos: photoUrl ? [photoUrl] : [],
    is_active: true,
  });
  if (error) return { error: error.message };

  revalidatePath("/loja/catalogo");
  return { ok: true };
}

export async function deleteProductAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id).eq("establishment_id", establishment.id);
  revalidatePath("/loja/catalogo");
}

export async function toggleProductAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("id") || "");
  const isActive = String(formData.get("is_active") || "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: !isActive }).eq("id", id).eq("establishment_id", establishment.id);
  revalidatePath("/loja/catalogo");
}
