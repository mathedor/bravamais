"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function resolveFeatureRequestAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const approve = formData.get("approve") === "true";
  const note = String(formData.get("note") ?? "").trim() || null;

  const { error } = await supabase.rpc("resolve_feature_request", {
    p_request_id: id,
    p_approve: approve,
    p_admin_note: note,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/feature-requests");
  revalidatePath("/admin/features");
}
