import type { Metadata, Viewport } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { LocationProvider } from "@/components/app/location-context";
import { AppHeader } from "@/components/app/app-header";
import { BottomNav } from "@/components/app/bottom-nav";
import { AppSidebar } from "@/components/app/sidebar-nav";
import { OneSignalProvider } from "@/components/app/onesignal-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { runOnboardingChecks } from "@/lib/onboarding-checks";
import { GeoWatcher } from "@/components/app/geo-watcher";
import { PWAInstaller } from "@/components/app/pwa-installer";
import { OnboardingModal } from "@/components/app/onboarding-modal";
import { PostHogInit } from "@/components/posthog-init";
import { TourMount } from "@/components/onboarding/tour-modal";
import { USUARIO_TOUR } from "@/components/onboarding/tours-data";
import { PageHelpAuto } from "@/components/onboarding/page-help";

export const metadata: Metadata = {
  title: "BRAVA+ Cliente",
  applicationName: "BRAVA+",
  manifest: "/app/manifest.webmanifest",
  appleWebApp: { capable: true, title: "BRAVA+", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#FBBF24",
  width: "device-width",
  initialScale: 1,
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  // Fire-and-forget: aniversário + confirma referral (idempotente)
  runOnboardingChecks(profile.id).catch(() => {});

  const [{ data: sub }, { data: notifs }, { count: unread }, { data: profileFlags }, { data: categorias }] = await Promise.all([
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
    supabase.from("profiles").select("onboarded_at, tutorials_completed").eq("id", profile.id).maybeSingle(),
    supabase.from("categories").select("slug, name").eq("is_active", true).order("display_order"),
  ]);

  const needsOnboarding = !profileFlags?.onboarded_at;
  const tutorialsCompleted = (profileFlags?.tutorials_completed ?? {}) as Record<string, string>;
  const needsTour = !tutorialsCompleted.usuario && !needsOnboarding;

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
          <PageHelpAuto tourRole="usuario" />
          <div className="mx-auto flex w-full max-w-7xl flex-1">
            <AppSidebar userName={profile.full_name ?? undefined} />
            <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
          </div>
          <BottomNav />
          <OneSignalProvider />
          <GeoWatcher />
          <PWAInstaller />
          {needsOnboarding && <OnboardingModal categorias={categorias ?? []} />}
          <TourMount role="usuario" steps={USUARIO_TOUR} autoOpen={needsTour} />
          <PostHogInit />
        </div>
      </LocationProvider>
    </ThemeProvider>
  );
}
