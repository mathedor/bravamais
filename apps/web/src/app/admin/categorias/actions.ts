"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

export async function createCategoryAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const icon = String(formData.get("icon") || "").trim() || null;
  if (!slug || !name) return { error: "Slug e nome obrigatórios." };
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: "Slug aceita só letras, números e -" };

  const admin = createAdminClient();
  const { data: maxOrder } = await admin.from("categories").select("display_order").order("display_order", { ascending: false }).limit(1).maybeSingle();
  const nextOrder = ((maxOrder?.display_order ?? 0) as number) + 10;

  const { error } = await admin.from("categories").insert({ slug, name, icon, display_order: nextOrder, is_active: true });
  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  return { ok: "Categoria criada." };
}

export async function toggleCategoryAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  const admin = createAdminClient();
  await admin.from("categories").update({ is_active: !active }).eq("id", id);
  revalidatePath("/admin/categorias");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const admin = createAdminClient();
  await admin.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categorias");
}
