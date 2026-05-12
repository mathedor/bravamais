import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Garante uma conversa única entre user e establishment.
 * Retorna o id da conversa.
 */
export async function ensureConversation(userId: string, establishmentId: string): Promise<string> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("conversations")
    .select("id")
    .eq("user_id", userId)
    .eq("establishment_id", establishmentId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await admin
    .from("conversations")
    .insert({ user_id: userId, establishment_id: establishmentId })
    .select("id")
    .single();
  if (error || !created) throw new Error(error?.message ?? "Falha ao criar conversa.");
  return created.id;
}
