import { requireRole } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AdminSidebar } from "@/components/admin/sidebar-nav";
import { TourMount } from "@/components/onboarding/tour-modal";
import { TourTrigger } from "@/components/onboarding/tour-trigger";
import { ADMIN_TOUR } from "@/components/onboarding/tours-data";
import { PageHelpAuto } from "@/components/onboarding/page-help";
import {
  BottomNav,
  ChartIcon,
  ShopIcon,
  UsersIcon,
  PlusMarkIcon,
  SettingsIcon,
  type NavItem,
} from "@/components/shared/bottom-nav";

// Atalhos compactos no header. Menu completo na sidebar (desktop) e /admin/menu (mobile).
const DESKTOP_HEADER_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/entregas", label: "Entregas" },
  { href: "/admin/estabelecimentos", label: "Lojas" },
  { href: "/admin/menu", label: "Tudo" },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/admin", label: "Início", icon: ChartIcon },
  { href: "/admin/usuarios", label: "Usuários", icon: UsersIcon },
  { href: "/admin", label: "BRAVA+", icon: PlusMarkIcon, center: true },
  { href: "/admin/estabelecimentos", label: "Lojas", icon: ShopIcon },
  { href: "/admin/menu", label: "Menu", icon: SettingsIcon },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("admin");
  const supabase = await createClient();
  const { data: profileFlags } = await supabase
    .from("profiles")
    .select("tutorials_completed")
    .eq("id", profile.id)
    .maybeSingle();
  const tutorialsCompleted = (profileFlags?.tutorials_completed ?? {}) as Record<string, string>;
  const needsTour = !tutorialsCompleted.admin;

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-brava-paper text-brava-ink">
        <DashboardHeader
          brandHref="/admin"
          navItems={DESKTOP_HEADER_NAV}
          layoutId="admin-nav-pill"
          badge="Admin"
          rightSlot={
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-brava-muted sm:inline-flex">
                {profile.full_name?.split(" ")[0] ?? "admin"}
              </span>
              <TourTrigger role="admin" />
              <ThemeToggle />
              <SignOutButton className="rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-xs text-brava-muted hover:bg-brava-paper" />
            </div>
          }
        />
        <PageHelpAuto tourRole="admin" />
        <div className="mx-auto flex w-full max-w-7xl flex-1">
          <AdminSidebar />
          <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
        </div>
        <BottomNav items={BOTTOM_NAV} layoutId="admin-bottom-pill" />
        <TourMount role="admin" steps={ADMIN_TOUR} autoOpen={needsTour} />
      </div>
    </ThemeProvider>
  );
}
