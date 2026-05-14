import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { AdminSidebar } from "@/components/admin/sidebar-nav";
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

  return (
    <div className="flex min-h-screen flex-col bg-brava-black text-white">
      <DashboardHeader
        brandHref="/admin"
        navItems={DESKTOP_HEADER_NAV}
        layoutId="admin-nav-pill"
        badge="Admin"
        variant="dark"
        rightSlot={
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-white/65 sm:inline-flex">
              {profile.full_name?.split(" ")[0] ?? "admin"}
            </span>
            <SignOutButton className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 hover:bg-white/10" />
          </div>
        }
      />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <AdminSidebar />
        <main className="min-w-0 flex-1 bg-brava-paper pb-20 text-brava-ink lg:pb-0">{children}</main>
      </div>
      <BottomNav items={BOTTOM_NAV} layoutId="admin-bottom-pill" />
    </div>
  );
}
