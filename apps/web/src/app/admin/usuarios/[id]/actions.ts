"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: string } | undefined;

export async function adminUpdateUserBasicAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const userId = String(formData.get("user_id") || "");
  if (!userId) return { error: "ID inválido." };

  const supabase = createAdminClient();
  const fullName = String(formData.get("full_name") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const state = String(formData.get("state") || "").trim().toUpperCase() || null;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, city, state })
    .eq("id", userId);
  if (error) return { error: error.message };

  await logActivity({
    userId: admin.id,
    entityType: "user",
    entityId: userId,
    action: "admin_password_reset", // reusing a type — could add admin_user_updated
  });

  revalidatePath(`/admin/usuarios/${userId}`);
  return { ok: "Dados atualizados." };
}

export async function adminResetUserPasswordAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const userId = String(formData.get("user_id") || "");
  const newPassword = String(formData.get("new_password") || "");
  if (!userId) return { error: "ID inválido." };
  if (newPassword.length < 8) return { error: "Senha precisa ter pelo menos 8 caracteres." };

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { error: error.message };

  await logActivity({
    userId: admin.id,
    entityType: "user",
    entityId: userId,
    action: "admin_password_reset",
  });

  return { ok: "Senha alterada. Avise o usuário via canal seguro." };
}

export async function adminChangeUserRoleAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const userId = String(formData.get("user_id") || "");
  const role = String(formData.get("role") || "");
  if (!userId || !["subscriber", "establishment", "commercial", "admin"].includes(role)) {
    return { error: "Role inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };

  await logActivity({
    userId: admin.id,
    entityType: "user",
    entityId: userId,
    action: "admin_role_changed",
  });

  revalidatePath(`/admin/usuarios/${userId}`);
  return { ok: `Role alterada para ${role}.` };
}

export async function adminToggleUserActiveAction(formData: FormData) {
  const { user: admin } = await requireRole("admin");
  const userId = String(formData.get("user_id") || "");
  const currentlyActive = String(formData.get("is_active") || "") === "true";
  if (!userId) return;

  const supabase = createAdminClient();
  await supabase.from("profiles").update({ is_active: !currentlyActive }).eq("id", userId);

  await logActivity({
    userId: admin.id,
    entityType: "user",
    entityId: userId,
    action: "admin_user_suspended",
  });

  revalidatePath(`/admin/usuarios/${userId}`);
}
