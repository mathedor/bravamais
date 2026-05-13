"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function completeOnboardingAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const cats = String(formData.get("favorite_categories") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({
      onboarded_at: new Date().toISOString(),
      favorite_categories: cats,
    })
    .eq("id", user.id);

  revalidatePath("/app", "layout");
}
