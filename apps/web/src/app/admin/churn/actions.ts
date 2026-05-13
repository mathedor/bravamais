"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export async function sendRetentionPushAction(formData: FormData) {
  await requireRole("admin");
  const userId = String(formData.get("user_id") || "");
  const userName = String(formData.get("user_name") || "amigo").split(" ")[0];
  if (!userId) return { error: "Faltam dados." };

  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: userId,
    type: "system",
    title: `${userName}, voltamos com novidades 👀`,
    body: "Tem cupons fresquinhos e parceiros novos no clube. Dá uma olhada e te damos +50 coins na próxima visita.",
    link: "/app",
  });

  return { ok: true };
}
