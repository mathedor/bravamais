"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function submitReportAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Faça login pra denunciar." };

  const targetType = String(formData.get("target_type") || "");
  const targetId = String(formData.get("target_id") || "");
  const reason = String(formData.get("reason") || "").trim();
  const detail = String(formData.get("detail") || "").trim() || null;
  if (!targetType || !targetId || !reason) return { ok: false, error: "Faltam dados." };

  const admin = createAdminClient();
  await admin.from("reports").insert({
    reporter_user_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    detail,
    status: "open",
  });
  return { ok: true };
}
