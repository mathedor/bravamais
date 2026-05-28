"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function setUserCategoriesAction(formData: FormData): Promise<{ ok: boolean; error?: string; total_cents?: number }> {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const raw = formData.getAll("category_ids");
  const ids = raw.map(String).filter((s) => s && s !== "null");

  const { data, error } = await supabase.rpc("set_user_categories", {
    p_category_ids: ids,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/assinar/categorias");
  revalidatePath("/app", "layout");
  return data as { ok: boolean; total_cents?: number };
}
