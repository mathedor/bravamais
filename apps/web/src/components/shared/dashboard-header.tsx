"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export interface DashboardNavItem {
  href: string;
  label: string;
  emoji?: string;
}

interface Props {
  brandHref: string;
  navItems: DashboardNavItem[];
  layoutId: string;
  badge?: string;
  rightSlot?: React.ReactNode;
  variant?: "light" | "dark";
}

export function DashboardHeader({ brandHref, navItems, layoutId, badge, rightSlot, variant = "light" }: Props) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
        isDark ? "border-white/10 bg-brava-black/80 text-white" : "border-brava-border bg-brava-card/85 text-brava-ink"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={brandHref} className="group inline-flex items-center gap-2">
          <Image
            src={isDark ? "/logo-dark.svg" : "/logo.svg"}
            alt="BRAVA+"
            width={110}
            height={40}
            className="hidden transition-transform group-hover:-translate-y-0.5 sm:block"
            priority
          />
          <Image
            src={isDark ? "/logo-dark.svg" : "/logo.svg"}
            alt="BRAVA+"
            width={92}
            height={34}
            className="sm:hidden"
            priority
          />
          {badge && (
            <motion.span
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 22 }}
              className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline-flex ${
                isDark ? "bg-brava-yellow text-brava-black" : "bg-brava-blue text-white"
              }`}
            >
              {badge}
            </motion.span>
          )}
        </Link>

        <nav className="hidden items-center gap-0.5 sm:flex">
          {navItems.map((item) => {
            const active =
              item.href === navItems[0].href ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? isDark
                      ? "text-brava-black"
                      : "text-brava-ink"
                    : isDark
                    ? "text-white/70 hover:text-white"
                    : "text-brava-muted hover:text-brava-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={layoutId}
                    className={`absolute inset-0 rounded-full ${
                      isDark
                        ? "bg-brava-yellow shadow-lg shadow-brava-yellow/30"
                        : "bg-brava-yellow shadow-md shadow-brava-yellow/40"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative inline-flex items-center gap-1.5">
                  {item.emoji && <span className="text-base">{item.emoji}</span>}
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">{rightSlot}</div>
      </div>
    </motion.header>
  );
}
