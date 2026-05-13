"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function voteStoryPollAction(formData: FormData): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const storyId = String(formData.get("story_id") || "");
  const optionId = String(formData.get("option_id") || "");
  if (!storyId || !optionId) return { ok: false };

  const admin = createAdminClient();
  await admin.from("story_poll_votes").upsert(
    { story_id: storyId, user_id: user.id, option_id: optionId },
    { onConflict: "story_id,user_id" },
  );
  return { ok: true };
}
