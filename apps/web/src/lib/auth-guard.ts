import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLE_HOME, type Profile, type UserRole } from "@/lib/supabase/types";

const TOUCH_THROTTLE_MS = 5 * 60 * 1000;

// Presença: atualiza profiles.last_seen_at no máximo a cada 5 min,
// fire-and-forget (nunca bloqueia nem derruba a página).
function touchLastSeen(userId: string, lastSeenAt: string | null) {
  const last = lastSeenAt ? Date.parse(lastSeenAt) : 0;
  if (Date.now() - last < TOUCH_THROTTLE_MS) return;
  try {
    void createAdminClient()
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", userId)
      .then(() => {}, () => {});
  } catch {
    // sem credenciais admin em algum ambiente — presença é best-effort
  }
}

export async function requireUser(): Promise<{
  user: { id: string; email: string | null };
  profile: Profile;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile) {
    redirect("/entrar");
  }

  touchLastSeen(user.id, profile.last_seen_at ?? null);

  return {
    user: { id: user.id, email: user.email ?? null },
    profile,
  };
}

export async function requireRole(role: UserRole | UserRole[]) {
  const { user, profile } = await requireUser();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(profile.role)) {
    redirect(ROLE_HOME[profile.role] ?? "/app");
  }
  return { user, profile };
}
