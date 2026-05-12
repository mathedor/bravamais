"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLE_HOME, type UserRole } from "@/lib/supabase/types";
import { logActivity } from "@/lib/activity-log";
import { sendWelcomeEmail } from "@/lib/email";

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
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logActivity({ userId: user.id, entityType: "user", entityId: user.id, action: "auth_signin" });
  }
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
  const { data: signupData, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  // Auto-confirma email via admin client (não exige clicar no link)
  if (signupData.user) {
    try {
      const admin = createAdminClient();
      await admin.auth.admin.updateUserById(signupData.user.id, { email_confirm: true });
    } catch {
      /* silent */
    }
  }

  // Welcome email (fire and forget)
  sendWelcomeEmail({ to: email, name: fullName }).catch(() => {});

  // Garante login imediato (caso a confirmação tenha bloqueado a session)
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) {
    await supabase.auth.signInWithPassword({ email, password });
  }

  const role = await fetchRole(supabase);
  revalidatePath("/", "layout");
  redirect(ROLE_HOME[role] ?? "/app");
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
