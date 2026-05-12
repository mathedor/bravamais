"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { ensureConversation } from "@/lib/start-conversation";

export async function startConversationAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  if (!slug) return;
  const { profile } = await requireRole(["subscriber", "admin"]);

  const supabase = await createClient();
  const { data: estab } = await supabase
    .from("establishments")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!estab) return;

  const convId = await ensureConversation(profile.id, estab.id);
  redirect(`/app/chat/${convId}`);
}

export async function sendMessageAction(formData: FormData) {
  const conversationId = String(formData.get("conversation_id") || "");
  const body = String(formData.get("body") || "").trim();
  if (!conversationId || !body) return;

  const { profile } = await requireRole(["subscriber", "admin", "establishment"]);
  const supabase = await createClient();

  // Verifica acesso (RLS faz a checagem real, mas pegar a conversa pra cross-link)
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, user_id, establishment_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return;

  // Insere mensagem
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: profile.id,
    body,
  });

  // Atualiza last_message_at + unread counters via admin
  const admin = createAdminClient();
  const isUserSending = conv.user_id === profile.id;
  await admin
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      ...(isUserSending
        ? { unread_by_establishment: ((await getUnread(admin, conv.id, "estab")) ?? 0) + 1 }
        : { unread_by_user: ((await getUnread(admin, conv.id, "user")) ?? 0) + 1 }),
    })
    .eq("id", conversationId);

  revalidatePath(`/app/chat/${conversationId}`);
  revalidatePath(`/loja/chat/${conversationId}`);
}

async function getUnread(admin: ReturnType<typeof createAdminClient>, convId: string, kind: "user" | "estab"): Promise<number | null> {
  const { data } = await admin
    .from("conversations")
    .select(kind === "user" ? "unread_by_user" : "unread_by_establishment")
    .eq("id", convId)
    .maybeSingle();
  if (!data) return null;
  return kind === "user"
    ? (data as { unread_by_user: number }).unread_by_user
    : (data as { unread_by_establishment: number }).unread_by_establishment;
}

export async function markConversationReadAction(conversationId: string, side: "user" | "establishment") {
  const admin = createAdminClient();
  await admin
    .from("conversations")
    .update(side === "user" ? { unread_by_user: 0 } : { unread_by_establishment: 0 })
    .eq("id", conversationId);
}
