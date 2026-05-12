"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

type State = { error?: string; ok?: boolean } | undefined;

export async function updateProfileAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const data = {
    name: String(formData.get("name") || "").trim(),
    tagline: String(formData.get("tagline") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    whatsapp: String(formData.get("whatsapp") || "").trim() || null,
    instagram: String(formData.get("instagram") || "").trim() || null,
    website: String(formData.get("website") || "").trim() || null,
    city: String(formData.get("city") || "").trim() || null,
    state: (String(formData.get("state") || "").trim().toUpperCase() || null) as string | null,
    cep: String(formData.get("cep") || "").trim() || null,
    street: String(formData.get("street") || "").trim() || null,
    number: String(formData.get("number") || "").trim() || null,
    neighborhood: String(formData.get("neighborhood") || "").trim() || null,
    logo_url: String(formData.get("logo_url") || "").trim() || null,
    cover_url: String(formData.get("cover_url") || "").trim() || null,
  };

  if (!data.name) return { error: "Nome obrigatório." };

  const { error } = await supabase
    .from("establishments")
    .update(data)
    .eq("id", establishment.id);

  if (error) return { error: error.message };

  revalidatePath("/loja/perfil");
  revalidatePath("/loja");
  return { ok: true };
}
