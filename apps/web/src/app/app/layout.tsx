import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { LocationProvider } from "@/components/app/location-context";
import { AppHeader } from "@/components/app/app-header";
import { BottomNav } from "@/components/app/bottom-nav";
import { OneSignalProvider } from "@/components/app/onesignal-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { runOnboardingChecks } from "@/lib/onboarding-checks";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  // Fire-and-forget: aniversário + confirma referral (idempotente)
  runOnboardingChecks(profile.id).catch(() => {});

  const [{ data: sub }, { data: notifs }, { count: unread }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("read_at", null),
  ]);

  return (
    <ThemeProvider>
      <LocationProvider>
        <div className="flex min-h-screen flex-col bg-brava-paper text-brava-ink">
          <AppHeader
            userId={profile.id}
            userName={profile.full_name}
            tier={sub?.tier ?? undefined}
            notifs={notifs ?? []}
            unread={unread ?? 0}
          />
          <main className="flex-1">{children}</main>
          <BottomNav />
          <OneSignalProvider />
        </div>
      </LocationProvider>
    </ThemeProvider>
  );
}
