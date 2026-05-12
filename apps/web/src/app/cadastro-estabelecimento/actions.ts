"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type State = { error?: string } | undefined;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function signupEstablishmentAction(_: State, formData: FormData): Promise<State> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const estabName = String(formData.get("estab_name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase();
  const categoryId = String(formData.get("category_id") || "").trim();

  if (!fullName || !email || !password || !estabName || !city || !state) {
    return { error: "Preencha nome, email, senha, nome da loja, cidade e estado." };
  }
  if (password.length < 8) {
    return { error: "Senha precisa ter ao menos 8 caracteres." };
  }

  const supabase = await createClient();

  // 1. Signup
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });

  if (signupError) {
    const m = signupError.message.toLowerCase();
    if (m.includes("already registered")) return { error: "Esse email já tem conta. Faça login pra cadastrar a loja." };
    return { error: signupError.message };
  }
  if (!signupData.user) return { error: "Falha ao criar usuário." };
  const userId = signupData.user.id;

  // 2. Promote to establishment role (server-side com service role bypassa RLS)
  const admin = createAdminClient();
  await admin.from("profiles").update({ role: "establishment", full_name: fullName }).eq("id", userId);

  // 3. Slug único
  const baseSlug = slugify(estabName);
  let slug = baseSlug;
  let attempt = 1;
  while (attempt < 20) {
    const { data: existing } = await admin
      .from("establishments")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;
    attempt += 1;
  }

  // 4. Create establishment (via admin pra garantir sem trip de RLS)
  const { data: estab, error: estabErr } = await admin
    .from("establishments")
    .insert({
      owner_id: userId,
      slug,
      name: estabName,
      tagline: tagline || null,
      description: description || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      city,
      state: state.slice(0, 2),
      is_active: false, // pending review
      is_verified: false,
    })
    .select("id, slug")
    .single();
  if (estabErr || !estab) {
    return { error: `Erro criando estabelecimento: ${estabErr?.message ?? "desconhecido"}` };
  }

  if (categoryId) {
    await admin.from("establishment_categories").insert({
      establishment_id: estab.id,
      category_id: categoryId,
    });
  }

  // Default promo types
  await admin.from("establishment_promotions").insert([
    { establishment_id: estab.id, promotion_type: "cupom_desconto", is_active: true },
    { establishment_id: estab.id, promotion_type: "clube_fidelidade", is_active: true },
  ]);

  revalidatePath("/", "layout");

  // Se está logado direto (no email confirm), vai pro /loja; senão pro sucesso
  const { data: sess } = await supabase.auth.getSession();
  if (sess.session) {
    redirect("/loja");
  }
  redirect("/cadastro/sucesso");
}
