"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleFavoriteAction(estabId: string): Promise<{ ok: boolean; isFav: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !estabId) return { ok: false, isFav: false };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("favorites")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("establishment_id", estabId)
    .maybeSingle();

  if (existing) {
    await admin.from("favorites").delete().eq("user_id", user.id).eq("establishment_id", estabId);
    revalidatePath("/app/favoritos");
    return { ok: true, isFav: false };
  }

  await admin.from("favorites").insert({ user_id: user.id, establishment_id: estabId });
  revalidatePath("/app/favoritos");
  return { ok: true, isFav: true };
}
