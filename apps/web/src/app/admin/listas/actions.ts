"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

export async function createListAction(_: State, formData: FormData): Promise<State> {
  const { user } = await requireRole("admin");
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  if (!slug || !title) return { error: "Slug e título obrigatórios." };

  const admin = createAdminClient();
  const { error } = await admin.from("editorial_lists").insert({
    slug, title, description, created_by_admin_user_id: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/listas");
  return { ok: "Lista criada." };
}

export async function togglePublishedAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const pub = String(formData.get("published") || "") === "true";
  const admin = createAdminClient();
  await admin.from("editorial_lists").update({ is_published: !pub }).eq("id", id);
  revalidatePath("/admin/listas");
  revalidatePath("/app");
}

export async function deleteListAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const admin = createAdminClient();
  await admin.from("editorial_lists").delete().eq("id", id);
  revalidatePath("/admin/listas");
}

export async function addToListAction(formData: FormData) {
  await requireRole("admin");
  const listId = String(formData.get("list_id") || "");
  const estabId = String(formData.get("estab_id") || "");
  const position = parseInt(String(formData.get("position") || "100"), 10);
  if (!listId || !estabId) return;
  const admin = createAdminClient();
  await admin.from("editorial_list_items").upsert(
    { list_id: listId, establishment_id: estabId, position },
    { onConflict: "list_id,establishment_id" },
  );
  revalidatePath(`/admin/listas/${listId}`);
}

export async function removeFromListAction(formData: FormData) {
  await requireRole("admin");
  const listId = String(formData.get("list_id") || "");
  const estabId = String(formData.get("estab_id") || "");
  const admin = createAdminClient();
  await admin.from("editorial_list_items").delete().eq("list_id", listId).eq("establishment_id", estabId);
  revalidatePath(`/admin/listas/${listId}`);
}
