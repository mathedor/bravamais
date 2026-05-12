"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LocationPill } from "./location-pill";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { BravaLogo } from "@/components/shared/brava-logo";
import { NotificationBell } from "./notification-bell";
import { signOutAction } from "@/app/auth/actions";

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
  const initials = userName?.[0]?.toUpperCase() ?? "B";

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 border-b border-brava-border bg-gradient-to-b from-brava-card/95 to-brava-card/80 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brava-yellow/30 to-transparent" />

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <Link href="/app" className="inline-flex items-center">
            <span className="hidden sm:inline-flex">
              <BravaLogo size={32} />
            </span>
            <span className="sm:hidden">
              <BravaLogo size={26} />
            </span>
          </Link>
        </motion.div>

        <nav className="hidden items-center gap-0.5 sm:flex">
          {DESKTOP_NAV.map((item) => {
            const active =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group relative rounded-full px-3 py-2 text-sm font-medium transition ${
                  active ? "text-brava-ink" : "text-brava-muted hover:text-brava-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="desktop-nav-pill"
                    className="absolute inset-0 rounded-full bg-brava-yellow shadow-lg shadow-brava-yellow/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative inline-flex items-center gap-1.5">
                  <span
                    className={`text-base transition-transform duration-200 ${
                      active ? "scale-110" : "group-hover:scale-110 group-hover:-rotate-6"
                    }`}
                  >
                    {item.emoji}
                  </span>
                  <span className="hidden lg:inline">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/assinar"
              title={tier ? `Plano ${tier.toUpperCase()} — fazer upgrade` : "Assinar BRAVA+"}
              className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-brava-yellow via-amber-400 to-brava-yellow-deep px-3 py-2 text-xs font-bold text-brava-black shadow-lg shadow-brava-yellow/30 sm:inline-flex"
            >
              <span className="text-sm">💎</span>
              <span className="font-black uppercase tracking-wider">{tier ?? "Assinar"}</span>
              <span className="text-[10px] opacity-70">▲</span>
            </Link>
          </motion.div>

          <LocationPill />
          <NotificationBell userId={userId} initialNotifs={notifs} initialUnread={unread} />
          <ThemeToggle />

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/app/perfil"
              title={`Perfil de ${userName ?? "você"}`}
              className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brava-yellow to-amber-500 text-sm font-black text-brava-blue shadow-md ring-2 ring-brava-card transition sm:inline-flex"
            >
              {initials}
            </Link>
          </motion.div>

          <form action={signOutAction}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              title="Sair do BRAVA+"
              aria-label="Sair"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brava-border bg-brava-card text-brava-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </motion.button>
          </form>
        </div>
      </div>
    </motion.header>
  );
}
