"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type State = { error?: string; ok?: string } | undefined;

export async function requestDeletionAction(_: State, formData: FormData): Promise<State> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login." };
  const reason = String(formData.get("reason") || "").trim() || null;

  const admin = createAdminClient();
  const scheduledFor = new Date(Date.now() + 7 * 86400000).toISOString();

  await admin
    .from("deletion_requests")
    .upsert(
      { user_id: user.id, reason, scheduled_for: scheduledFor, cancelled_at: null, processed_at: null },
      { onConflict: "user_id" },
    );

  revalidatePath("/app/perfil/dados");
  return { ok: "Solicitação registrada. Sua conta será excluída em 7 dias." };
}

export async function cancelDeletionAction(): Promise<State> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login." };

  const admin = createAdminClient();
  await admin.from("deletion_requests").update({ cancelled_at: new Date().toISOString() }).eq("user_id", user.id);

  revalidatePath("/app/perfil/dados");
  return { ok: "Exclusão cancelada." };
}
