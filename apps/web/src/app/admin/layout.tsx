import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import {
  BottomNav,
  ChartIcon,
  ShopIcon,
  UsersIcon,
  TicketIcon,
  PlusMarkIcon,
  type NavItem,
} from "@/components/shared/bottom-nav";

const DESKTOP_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/estabelecimentos", label: "Estabelecimentos" },
  { href: "/admin/cupons", label: "Cupons" },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/admin", label: "Início", icon: ChartIcon },
  { href: "/admin/usuarios", label: "Usuários", icon: UsersIcon },
  { href: "/admin", label: "BRAVA+", icon: PlusMarkIcon, center: true },
  { href: "/admin/estabelecimentos", label: "Lojas", icon: ShopIcon },
  { href: "/admin/cupons", label: "Cupons", icon: TicketIcon },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("admin");

  return (
    <div className="flex min-h-screen flex-col bg-brava-black text-white">
      <DashboardHeader
        brandHref="/admin"
        navItems={DESKTOP_NAV}
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
      <main className="flex-1 bg-brava-paper text-brava-ink">{children}</main>
      <BottomNav items={BOTTOM_NAV} layoutId="admin-bottom-pill" />
    </div>
  );
}
