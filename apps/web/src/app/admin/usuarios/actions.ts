"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: string } | undefined;

export async function adminCreateUserAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const role = String(formData.get("role") || "subscriber");
  const phone = String(formData.get("phone") || "").trim() || null;

  if (!email || !password || !fullName) return { error: "Preencha email, senha e nome." };
  if (password.length < 8) return { error: "Senha precisa ter pelo menos 8 caracteres." };
  if (!["subscriber", "establishment", "commercial", "admin"].includes(role)) return { error: "Role inválido." };

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) return { error: error?.message ?? "Falha ao criar usuário." };

  await supabase.from("profiles").update({ role, full_name: fullName, phone }).eq("id", data.user.id);

  await logActivity({
    userId: admin.id,
    entityType: "user",
    entityId: data.user.id,
    action: "auth_signup",
  });

  revalidatePath("/admin/usuarios");
  redirect(`/admin/usuarios/${data.user.id}`);
}

export async function adminDeleteUserAction(formData: FormData) {
  const { user: admin } = await requireRole("admin");
  const userId = String(formData.get("user_id") || "");
  if (!userId) return;

  const supabase = createAdminClient();
  await supabase.auth.admin.deleteUser(userId);

  await logActivity({
    userId: admin.id,
    entityType: "user",
    entityId: userId,
    action: "admin_user_suspended",
  });

  revalidatePath("/admin/usuarios");
}

export async function adminGiftSubscriptionAction(formData: FormData) {
  const { user: admin } = await requireRole("admin");
  const userId = String(formData.get("user_id") || "");
  const days = parseInt(String(formData.get("days") || "0"), 10);
  const tier = String(formData.get("tier") || "premium");
  if (!userId || !days || days < 1) return;

  const supabase = createAdminClient();
  const newEnd = new Date(Date.now() + days * 86400000).toISOString();

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const baseEnd = existing.current_period_end && new Date(existing.current_period_end) > new Date()
      ? existing.current_period_end
      : new Date().toISOString();
    const finalEnd = new Date(new Date(baseEnd).getTime() + days * 86400000).toISOString();
    await supabase
      .from("subscriptions")
      .update({ tier, status: "active", current_period_end: finalEnd })
      .eq("id", existing.id);
  } else {
    await supabase.from("subscriptions").insert({
      user_id: userId,
      tier,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: newEnd,
    });
  }

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "subscription",
    title: `🎁 Você ganhou ${days} dias de BRAVA+ ${tier.toUpperCase()}!`,
    body: "Cortesia da equipe BRAVA+. Aproveite!",
    link: "/app",
  });

  await logActivity({
    userId: admin.id,
    entityType: "subscription",
    entityId: userId,
    action: "admin_role_changed",
  });

  revalidatePath(`/admin/usuarios/${userId}`);
}
