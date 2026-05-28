import type { Metadata, Viewport } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";
import { PWARegister } from "@/components/shared/pwa-register";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ComercialSidebar } from "@/components/comercial/sidebar-nav";
import { NotificationBell } from "@/components/app/notification-bell";
import {
  BottomNav,
  HomeIcon,
  TicketIcon,
  UsersIcon,
  ChartIcon,
  SettingsIcon,
  type NavItem,
} from "@/components/shared/bottom-nav";
import { TourMount } from "@/components/onboarding/tour-modal";
import { TourTrigger } from "@/components/onboarding/tour-trigger";
import { COMERCIAL_TOUR } from "@/components/onboarding/tours-data";
import { PageHelpAuto } from "@/components/onboarding/page-help";

export const metadata: Metadata = {
  title: "BRAVA+ Comercial",
  applicationName: "BRAVA+ Comercial",
  manifest: "/comercial/manifest.webmanifest",
  appleWebApp: { capable: true, title: "BRAVA+ Field", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#16A34A",
  width: "device-width",
  initialScale: 1,
};

const DESKTOP_HEADER_NAV = [
  { href: "/comercial", label: "Início" },
  { href: "/comercial/prospects", label: "Mapa" },
  { href: "/comercial/crm", label: "CRM" },
  { href: "/comercial/comissoes", label: "Comissões" },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/comercial", label: "Início", icon: HomeIcon },
  { href: "/comercial/prospects", label: "Mapa", icon: ChartIcon },
  { href: "/comercial/crm", label: "CRM", icon: UsersIcon, center: true },
  { href: "/comercial/comissoes", label: "Ganhos", icon: TicketIcon },
  { href: "/comercial/perfil", label: "Conta", icon: SettingsIcon },
];

export default async function ComercialLayout({ children }: { children: React.ReactNode }) {
  const { affiliate, profile } = await requireCommercial();
  const supabase = await createClient();

  const [{ data: notifs }, { count: unread }, { data: profileFlags }] = await Promise.all([
    supabase.from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(15),
    supabase.from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("read_at", null),
    supabase.from("profiles").select("tutorials_completed").eq("id", profile.id).maybeSingle(),
  ]);

  const tutorialsCompleted = (profileFlags?.tutorials_completed ?? {}) as Record<string, string>;
  const needsTour = !tutorialsCompleted.comercial;

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-brava-paper text-brava-ink">
        <DashboardHeader
          brandHref="/comercial"
          navItems={DESKTOP_HEADER_NAV}
          layoutId="comercial-nav-pill"
          badge={`Comercial · ${affiliate.code}`}
          rightSlot={
            <div className="flex items-center gap-1.5">
              <NotificationBell
                userId={profile.id}
                initialNotifs={notifs ?? []}
                initialUnread={unread ?? 0}
              />
              <TourTrigger role="comercial" />
              <ThemeToggle />
              <SignOutButton iconOnly className="hidden h-9 w-9 items-center justify-center rounded-full border border-brava-border bg-brava-card text-brava-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 sm:inline-flex" />
            </div>
          }
        />
        <PageHelpAuto tourRole="comercial" />
        <PWARegister scope="/comercial" />
        <div className="mx-auto flex w-full max-w-7xl flex-1">
          <ComercialSidebar name={affiliate.name} />
          <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
        </div>
        <BottomNav items={BOTTOM_NAV} layoutId="comercial-bottom-pill" />
        <TourMount role="comercial" steps={COMERCIAL_TOUR} autoOpen={needsTour} />
      </div>
    </ThemeProvider>
  );
}
