"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME, type UserRole } from "@/lib/supabase/types";

type State = { error?: string } | undefined;

export async function signInAction(_: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Informe email e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: traduzirErro(error.message) };
  }

  const role = await fetchRole(supabase);
  revalidatePath("/", "layout");
  redirect(ROLE_HOME[role] ?? "/app");
}

export async function signUpAction(_: State, formData: FormData): Promise<State> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || !email || !password) {
    return { error: "Preencha nome, email e senha." };
  }
  if (password.length < 8) {
    return { error: "Senha precisa ter ao menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  // No e-mail confirmation flow: usuário já está logado.
  const { data: sess } = await supabase.auth.getSession();
  if (sess.session) {
    const role = await fetchRole(supabase);
    revalidatePath("/", "layout");
    redirect(ROLE_HOME[role] ?? "/app");
  }

  // Quando confirmação por email está ativa, redireciona pra tela de "verifique seu email"
  redirect("/cadastro/sucesso");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

async function fetchRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<UserRole> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "subscriber";
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return ((data?.role as UserRole) ?? "subscriber");
}

function traduzirErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email ou senha inválidos.";
  if (m.includes("already registered")) return "Esse email já tem conta. Tente entrar.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos.";
  if (m.includes("email not confirmed")) return "Confirme seu email antes de entrar.";
  return msg;
}
