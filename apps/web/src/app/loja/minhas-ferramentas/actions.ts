"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

export async function activateFeatureAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) throw new Error("missing_slug");

  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { error } = await supabase.rpc("activate_estab_feature", {
    p_estab_id: establishment.id,
    p_feature_slug: slug,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/loja/minhas-ferramentas");
  revalidatePath("/loja", "layout");
}

export async function requestFeatureRemovalAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!slug) throw new Error("missing_slug");

  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { error } = await supabase.rpc("request_feature_removal", {
    p_estab_id: establishment.id,
    p_feature_slug: slug,
    p_reason: reason,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/loja/minhas-ferramentas");
}
