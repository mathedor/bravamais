import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME, type Profile, type UserRole } from "@/lib/supabase/types";

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
