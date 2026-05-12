"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LocationPill } from "./location-pill";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { BravaLogo } from "@/components/shared/brava-logo";
import { NotificationBell } from "./notification-bell";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

interface Props {
  userId: string;
  userName: string | null;
  tier?: string;
  notifs: Notif[];
  unread: number;
}

const DESKTOP_NAV = [
  { href: "/app", label: "Início", emoji: "🏠" },
  { href: "/app/buscar", label: "Buscar", emoji: "🔎" },
  { href: "/app/carteirinha", label: "Carteirinha", emoji: "💳" },
  { href: "/app/fidelidade", label: "Fidelidade", emoji: "⭐" },
  { href: "/app/chat", label: "Chat", emoji: "💬" },
  { href: "/app/perfil", label: "Perfil", emoji: "👤" },
];

export function AppHeader({ userId, userName, tier, notifs, unread }: Props) {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 border-b border-brava-border bg-brava-card/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/app" className="inline-flex items-center gap-2">
          <BravaLogo width={110} height={40} className="hidden sm:block" priority />
          <BravaLogo width={92} height={34} className="sm:hidden" priority />
        </Link>

        <nav className="hidden items-center gap-0.5 sm:flex">
          {DESKTOP_NAV.map((item) => {
            const active =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active ? "text-brava-ink" : "text-brava-muted hover:text-brava-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="desktop-nav-pill"
                    className="absolute inset-0 rounded-full bg-brava-yellow shadow-md shadow-brava-yellow/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative inline-flex items-center gap-1.5">
                  <span className={`text-base transition-transform ${active ? "" : "group-hover:scale-110"}`}>{item.emoji}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/assinar"
            className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-brava-yellow to-amber-400 px-3 py-1.5 text-xs font-bold text-brava-black shadow-md shadow-brava-yellow/30 transition hover:scale-105 sm:inline-flex"
          >
            <span className="text-sm">💎</span>
            {tier ? `${tier.toUpperCase()}` : "Assinar"}
            <span className="text-[10px] opacity-80">↑</span>
          </Link>
          <LocationPill />
          <NotificationBell userId={userId} initialNotifs={notifs} initialUnread={unread} />
          <ThemeToggle />
          <Link
            href="/app/perfil"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brava-yellow to-amber-500 text-xs font-black text-brava-blue transition hover:scale-105 sm:inline-flex"
            aria-label="Perfil"
          >
            {userName?.[0]?.toUpperCase() ?? "B"}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
