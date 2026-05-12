import Link from "next/link";
import { requireEstablishment } from "@/lib/establishment-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  BottomNav,
  HomeIcon,
  StoryIcon,
  QrIcon,
  TicketIcon,
  SettingsIcon,
  type NavItem,
} from "@/components/shared/bottom-nav";

const DESKTOP_NAV = [
  { href: "/loja", label: "Início", emoji: "🏠" },
  { href: "/loja/hoje", label: "Hoje", emoji: "📸" },
  { href: "/loja/cupons", label: "Cupons", emoji: "🎟️" },
  { href: "/loja/vale-presente", label: "V-presentes", emoji: "🎁" },
  { href: "/loja/chat", label: "Chat", emoji: "💬" },
  { href: "/loja/recompensas", label: "Prêmios", emoji: "⭐" },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/loja", label: "Início", icon: HomeIcon },
  { href: "/loja/hoje", label: "Hoje", icon: StoryIcon },
  { href: "/loja/qr-scanner", label: "QR", icon: QrIcon, center: true },
  { href: "/loja/cupons", label: "Cupons", icon: TicketIcon },
  { href: "/loja/mais", label: "Mais", icon: SettingsIcon },
];

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const { establishment } = await requireEstablishment();

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-brava-paper text-brava-ink">
        <DashboardHeader
          brandHref="/loja"
          navItems={DESKTOP_NAV}
          layoutId="loja-nav-pill"
          badge={establishment.name.length > 14 ? "Loja" : establishment.name}
          rightSlot={
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-brava-yellow/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brava-blue sm:inline-flex">
                {establishment.is_active ? "Ativa" : "Em revisão"}
              </span>
              <ThemeToggle />
              <Link
                href="/loja/perfil"
                className="hidden rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-xs font-bold text-brava-ink sm:inline-flex"
              >
                Editar perfil
              </Link>
              <SignOutButton className="rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-xs text-brava-ink hover:bg-brava-paper" />
            </div>
          }
        />
        <main className="flex-1">{children}</main>
        <BottomNav items={BOTTOM_NAV} layoutId="loja-bottom-pill" />
      </div>
    </ThemeProvider>
  );
}
