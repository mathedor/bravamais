"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { sendPushToUser } from "@/lib/push";

export async function sendRetentionPushAction(formData: FormData) {
  await requireRole("admin");
  const userId = String(formData.get("user_id") || "");
  const userName = String(formData.get("user_name") || "amigo").split(" ")[0];
  if (!userId) return { error: "Faltam dados." };

  const admin = createAdminClient();
  const title = `${userName}, voltamos com novidades 👀`;
  const body = "Tem cupons fresquinhos e parceiros novos no clube. Dá uma olhada e te damos +50 coins na próxima visita.";

  await admin.from("notifications").insert({
    user_id: userId,
    type: "system",
    title,
    body,
    link: "/app",
  });

  sendPushToUser(userId, { title, body, url: "/app", tag: "retention" }).catch(() => {});

  return { ok: true };
}
