"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export async function toggleReviewHiddenAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const admin = createAdminClient();
  const id = String(formData.get("id") ?? "");
  const hide = String(formData.get("hide") ?? "") === "1";
  if (!id) return;
  await admin.from("reviews").update({ is_hidden: hide }).eq("id", id);
  revalidatePath("/admin/avaliacoes");
}
