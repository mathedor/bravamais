"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Cancela a renovação automática da assinatura BRAVA+ (mantém acesso até o fim do período). */
export async function cancelRenewalAction(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const admin = createAdminClient();
  await admin
    .from("recurring_subscriptions")
    .update({ cancel_at_period_end: true })
    .eq("user_id", user.id)
    .eq("status", "active")
    .in("kind", ["subscription", "category_subscription"]);

  await admin.from("subscriptions").update({ cancel_at_period_end: true }).eq("user_id", user.id);

  revalidatePath("/app/perfil");
  return { ok: true };
}
