"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleProductAlertAction(productId: string): Promise<{ ok: boolean; isOn: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !productId) return { ok: false, isOn: false };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("product_alerts")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await admin.from("product_alerts").delete().eq("user_id", user.id).eq("product_id", productId);
    return { ok: true, isOn: false };
  }
  await admin.from("product_alerts").insert({ user_id: user.id, product_id: productId });
  revalidatePath("/app/estabelecimento", "layout");
  return { ok: true, isOn: true };
}
