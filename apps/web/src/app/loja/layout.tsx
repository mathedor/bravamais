import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationBell } from "@/components/app/notification-bell";
import { PromoTrigger } from "@/components/loja/promo-trigger";
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
  { href: "/loja/hoje", label: "Ao vivo", emoji: "📸" },
  { href: "/loja/entregas", label: "Entregas", emoji: "🛵" },
  { href: "/loja/cupons", label: "Cupons", emoji: "🎟️" },
  { href: "/loja/chat", label: "Chat", emoji: "💬" },
  { href: "/loja/saques", label: "Saques", emoji: "💰" },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/loja", label: "Início", icon: HomeIcon },
  { href: "/loja/hoje", label: "Ao vivo", icon: StoryIcon },
  { href: "/loja/qr-scanner", label: "QR", icon: QrIcon, center: true },
  { href: "/loja/cupons", label: "Cupons", icon: TicketIcon },
  { href: "/loja/mais", label: "Mais", icon: SettingsIcon },
];

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const { establishment, profile } = await requireEstablishment();
  const supabase = await createClient();

  const [{ data: notifs }, { count: unread }] = await Promise.all([
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
      <div className="flex min-h-screen flex-col bg-brava-paper text-brava-ink">
        <DashboardHeader
          brandHref="/loja"
          navItems={DESKTOP_NAV}
          layoutId="loja-nav-pill"
          badge={establishment.name.length > 14 ? "Loja" : establishment.name}
          rightSlot={
            <div className="flex items-center gap-1.5">
              <PromoTrigger />
              <NotificationBell
                userId={profile.id}
                initialNotifs={notifs ?? []}
                initialUnread={unread ?? 0}
              />
              <ThemeToggle />
              <SignOutButton iconOnly className="hidden h-9 w-9 items-center justify-center rounded-full border border-brava-border bg-brava-card text-brava-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 sm:inline-flex" />
            </div>
          }
        />
        <main className="flex-1">{children}</main>
        <BottomNav items={BOTTOM_NAV} layoutId="loja-bottom-pill" />
      </div>
    </ThemeProvider>
  );
}
