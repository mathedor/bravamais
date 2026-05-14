"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import type { VehicleType } from "@/lib/supabase/types";

type State = { error?: string; ok?: boolean } | undefined;

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function createDelivererAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();

  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const cpf = String(formData.get("cpf") || "").trim();
  const vehicle = (String(formData.get("vehicle") || "moto").trim() as VehicleType);
  const vehicleModel = String(formData.get("vehicle_model") || "").trim();
  const vehicleColor = String(formData.get("vehicle_color") || "").trim();
  const plate = String(formData.get("plate") || "").trim().toUpperCase();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase().slice(0, 2);

  if (!fullName || !phone || !email) {
    return { error: "Nome, telefone e email são obrigatórios." };
  }

  const admin = createAdminClient();

  // 1. Cria auth user (auto-confirm)
  const password = generatePassword();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  let userId: string | null = created?.user?.id ?? null;

  if (createErr) {
    // Se já existe, busca o user existente
    const { data: existing } = await admin.from("profiles").select("id").eq("id", userId ?? "").maybeSingle();
    if (!existing) {
      // tenta buscar via listUsers (workaround pq não tem listUsers by email)
      // melhor: simplesmente avisar
      if (!createErr.message.toLowerCase().includes("already")) {
        return { error: `Erro criando usuário: ${createErr.message}` };
      }
    }
  }

  // 2. Promove role pra deliverer
  if (userId) {
    await admin.from("profiles").update({ role: "deliverer", full_name: fullName, phone }).eq("id", userId);
  }

  // 3. Cria deliverer record
  const { data: deliverer, error: delivErr } = await admin
    .from("deliverers")
    .insert({
      user_id: userId,
      full_name: fullName,
      phone,
      whatsapp: whatsapp || phone,
      email,
      cpf: cpf || null,
      vehicle,
      vehicle_model: vehicleModel || null,
      vehicle_color: vehicleColor || null,
      plate: plate || null,
      city: city || establishment.city,
      state: state || establishment.state,
      status: "approved",
      is_public_freelancer: false,
      approved_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (delivErr || !deliverer) {
    return { error: `Erro criando entregador: ${delivErr?.message ?? "desconhecido"}` };
  }

  // 4. Cria vínculo establishment_deliverers
  await admin.from("establishment_deliverers").insert({
    establishment_id: establishment.id,
    deliverer_id: deliverer.id,
    hired_via: "manual",
    is_active: true,
  });

  revalidatePath("/loja/entregadores");
  return { ok: true };
}

export async function toggleDelivererActiveAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("id") || "");
  const isActive = String(formData.get("is_active") || "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("establishment_deliverers")
    .update({ is_active: !isActive })
    .eq("id", id)
    .eq("establishment_id", establishment.id);
  revalidatePath("/loja/entregadores");
}

export async function unlinkDelivererAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("establishment_deliverers").delete().eq("id", id).eq("establishment_id", establishment.id);
  revalidatePath("/loja/entregadores");
}

export async function hireFreelancerAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const delivererId = String(formData.get("deliverer_id") || "");
  if (!delivererId) return;
  const admin = createAdminClient();
  await admin
    .from("establishment_deliverers")
    .insert({
      establishment_id: establishment.id,
      deliverer_id: delivererId,
      hired_via: "bridge",
      is_active: true,
    })
    .select("id");
  revalidatePath("/loja/entregadores");
  revalidatePath("/loja/entregadores/disponiveis");
}
