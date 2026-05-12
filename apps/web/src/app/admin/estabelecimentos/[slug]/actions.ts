"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: string } | undefined;

export async function adminUpdateEstablishmentBasicAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const estabId = String(formData.get("estab_id") || "");
  if (!estabId) return { error: "ID inválido." };

  const supabase = createAdminClient();
  const payload = {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim().toLowerCase(),
    tagline: String(formData.get("tagline") || "").trim() || null,
    city: String(formData.get("city") || "").trim() || null,
    state: String(formData.get("state") || "").trim().toUpperCase().slice(0, 2) || null,
    phone: String(formData.get("phone") || "").trim() || null,
    whatsapp: String(formData.get("whatsapp") || "").trim() || null,
  };
  if (!payload.name || !payload.slug) return { error: "Nome e slug obrigatórios." };

  const { error } = await supabase.from("establishments").update(payload).eq("id", estabId);
  if (error) return { error: error.message };

  await logActivity({
    userId: admin.id,
    entityType: "establishment",
    entityId: estabId,
    action: "admin_establishment_updated",
  });

  revalidatePath(`/admin/estabelecimentos/${payload.slug}`);
  return { ok: "Dados cadastrais atualizados." };
}

export async function adminResetOwnerPasswordAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const ownerId = String(formData.get("owner_id") || "");
  const newPassword = String(formData.get("new_password") || "");
  const estabId = String(formData.get("estab_id") || "");
  if (!ownerId) return { error: "Owner inválido." };
  if (newPassword.length < 8) return { error: "Senha precisa ter pelo menos 8 caracteres." };

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(ownerId, { password: newPassword });
  if (error) return { error: error.message };

  await logActivity({
    userId: admin.id,
    entityType: "user",
    entityId: ownerId,
    action: "admin_password_reset",
  });
  if (estabId) {
    await logActivity({
      userId: admin.id,
      entityType: "establishment",
      entityId: estabId,
      action: "admin_password_reset",
    });
  }

  return { ok: "Senha do dono alterada. Comunique por canal seguro." };
}

export async function adminToggleEstablishmentActiveAction(formData: FormData) {
  const { user: admin } = await requireRole("admin");
  const estabId = String(formData.get("estab_id") || "");
  const currentlyActive = String(formData.get("is_active") || "") === "true";
  const slug = String(formData.get("slug") || "");
  if (!estabId) return;

  const supabase = createAdminClient();
  await supabase.from("establishments").update({ is_active: !currentlyActive }).eq("id", estabId);

  await logActivity({
    userId: admin.id,
    entityType: "establishment",
    entityId: estabId,
    action: "admin_establishment_suspended",
  });

  if (slug) revalidatePath(`/admin/estabelecimentos/${slug}`);
}

export async function adminToggleEstablishmentVerifiedAction(formData: FormData) {
  const { user: admin } = await requireRole("admin");
  const estabId = String(formData.get("estab_id") || "");
  const currentlyVerified = String(formData.get("is_verified") || "") === "true";
  const slug = String(formData.get("slug") || "");
  if (!estabId) return;

  const supabase = createAdminClient();
  await supabase.from("establishments").update({ is_verified: !currentlyVerified }).eq("id", estabId);

  await logActivity({
    userId: admin.id,
    entityType: "establishment",
    entityId: estabId,
    action: "admin_establishment_verified",
  });

  if (slug) revalidatePath(`/admin/estabelecimentos/${slug}`);
}
