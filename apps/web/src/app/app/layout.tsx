import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { LocationProvider } from "@/components/app/location-context";
import { AppHeader } from "@/components/app/app-header";
import { BottomNav } from "@/components/app/bottom-nav";
import { OneSignalProvider } from "@/components/app/onesignal-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <LocationProvider>
      <div className="flex min-h-screen flex-col bg-brava-paper text-brava-ink">
        <AppHeader userName={profile.full_name} tier={sub?.tier ?? undefined} />
        <main className="flex-1">{children}</main>
        <BottomNav />
        <OneSignalProvider />
      </div>
    </LocationProvider>
  );
}
