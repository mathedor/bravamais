"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: boolean } | undefined;

export async function createStoryAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const mediaUrl = String(formData.get("media_url") || "").trim();
  const caption = String(formData.get("caption") || "").trim();
  const ttlHoursStr = String(formData.get("ttl_hours") || "24").trim();
  const ttl = Math.max(1, Math.min(72, parseInt(ttlHoursStr, 10) || 24));

  if (!mediaUrl) return { error: "URL da imagem é obrigatória." };
  if (!/^https?:\/\//.test(mediaUrl)) return { error: "URL precisa começar com http(s)://" };

  const supabase = await createClient();
  const { error } = await supabase.from("establishment_stories").insert({
    establishment_id: establishment.id,
    media_url: mediaUrl,
    caption: caption || null,
    expires_at: new Date(Date.now() + ttl * 3600 * 1000).toISOString(),
  });
  if (error) return { error: error.message };
  await logActivity({
    userId: establishment.owner_id,
    entityType: "establishment",
    entityId: establishment.id,
    action: "story_posted",
  });
  revalidatePath("/loja/hoje");
  revalidatePath("/loja");
  return { ok: true };
}

export async function deleteStoryAction(formData: FormData) {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("establishment_stories")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishment.id);
  revalidatePath("/loja/hoje");
}
