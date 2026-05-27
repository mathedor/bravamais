"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadToPrivateStorage } from "@/lib/storage";
import type { VehicleType } from "@/lib/supabase/types";

type State = { error?: string; ok?: boolean } | undefined;

export async function applyDelivererAction(_: State, formData: FormData): Promise<State> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const cpf = String(formData.get("cpf") || "").trim();
  const rg = String(formData.get("rg") || "").trim();
  const birthDate = String(formData.get("birth_date") || "").trim() || null;
  const vehicle = String(formData.get("vehicle") || "moto") as VehicleType;
  const vehicleModel = String(formData.get("vehicle_model") || "").trim();
  const vehicleColor = String(formData.get("vehicle_color") || "").trim();
  const plate = String(formData.get("plate") || "").trim().toUpperCase();
  const cnhNumber = String(formData.get("cnh_number") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase().slice(0, 2);

  if (!fullName || !email || !password || !phone || !cpf) {
    return { error: "Preencha nome, email, senha, telefone e CPF." };
  }
  if (password.length < 8) return { error: "Senha precisa ter ao menos 8 caracteres." };

  const supabase = await createClient();
  const admin = createAdminClient();

  // 1. Signup
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (signupError) {
    const m = signupError.message.toLowerCase();
    if (m.includes("already registered")) return { error: "Esse email já tem conta. Faça login antes de aplicar." };
    return { error: signupError.message };
  }
  if (!signupData.user) return { error: "Falha ao criar usuário." };
  // Proteção anti-enumeração do Supabase: email já existente retorna user
  // "fantasma" (identities vazio, sem erro) → userId inexistente quebraria a FK.
  if (!signupData.user.identities || signupData.user.identities.length === 0) {
    return { error: "Esse email já tem conta. Faça login antes de aplicar." };
  }
  const userId = signupData.user.id;

  try {
    await admin.auth.admin.updateUserById(userId, { email_confirm: true });
  } catch {}

  // 2. Atualiza profile pra role deliverer + dados
  await admin.from("profiles").update({ role: "deliverer", full_name: fullName, phone, cpf }).eq("id", userId);

  // 3. Upload de docs (silenciosamente se faltar)
  const photoFile = formData.get("photo") as File | null;
  const cnhFile = formData.get("cnh_image") as File | null;
  const rgFile = formData.get("rg_image") as File | null;
  const cpfFile = formData.get("cpf_image") as File | null;

  const [photo, cnhImg, rgImg, cpfImg] = await Promise.all([
    photoFile && photoFile.size > 0 ? uploadToPrivateStorage("deliverers", `${userId}/photo`, photoFile) : Promise.resolve({} as { path?: string }),
    cnhFile && cnhFile.size > 0 ? uploadToPrivateStorage("deliverers", `${userId}/cnh`, cnhFile) : Promise.resolve({} as { path?: string }),
    rgFile && rgFile.size > 0 ? uploadToPrivateStorage("deliverers", `${userId}/rg`, rgFile) : Promise.resolve({} as { path?: string }),
    cpfFile && cpfFile.size > 0 ? uploadToPrivateStorage("deliverers", `${userId}/cpf`, cpfFile) : Promise.resolve({} as { path?: string }),
  ]);

  // 4. Cria deliverer record (pending_review + is_public_freelancer)
  const { error: insertErr } = await admin.from("deliverers").insert({
    user_id: userId,
    full_name: fullName,
    cpf,
    rg: rg || null,
    birth_date: birthDate,
    phone,
    whatsapp: whatsapp || phone,
    email,
    photo_url: photo.path ?? null,
    cnh_number: cnhNumber || null,
    cnh_url: cnhImg.path ?? null,
    rg_url: rgImg.path ?? null,
    cpf_url: cpfImg.path ?? null,
    vehicle,
    vehicle_model: vehicleModel || null,
    vehicle_color: vehicleColor || null,
    plate: plate || null,
    city: city || null,
    state: state || null,
    status: "pending_review",
    is_public_freelancer: true,
  });

  if (insertErr) return { error: `Erro salvando cadastro: ${insertErr.message}` };

  // Garante session pra entrar direto na tela de pendente
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) {
    await supabase.auth.signInWithPassword({ email, password });
  }

  redirect("/entregador/pendente");
}
