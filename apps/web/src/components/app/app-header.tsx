"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LocationPill } from "./location-pill";

interface Props {
  userName: string | null;
  tier?: string;
}

const DESKTOP_NAV = [
  { href: "/app", label: "Início" },
  { href: "/app/buscar", label: "Buscar" },
  { href: "/app/carteirinha", label: "Carteirinha" },
  { href: "/app/fidelidade", label: "Fidelidade" },
  { href: "/app/perfil", label: "Perfil" },
];

export function AppHeader({ userName, tier }: Props) {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 border-b border-brava-border bg-white/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/app" className="inline-flex items-center gap-2">
          <Image src="/logo.svg" alt="BRAVA+" width={110} height={40} className="hidden sm:block" priority />
          <Image src="/logo-mark.svg" alt="BRAVA+" width={36} height={36} className="sm:hidden" priority />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {DESKTOP_NAV.map((item) => {
            const active =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? "text-brava-ink" : "text-brava-muted hover:text-brava-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="desktop-nav-pill"
                    className="absolute inset-0 rounded-full bg-brava-yellow/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LocationPill />
          <Link
            href="/app/perfil"
            className="hidden items-center gap-2 rounded-full border border-brava-border bg-white px-2 py-1.5 text-xs sm:inline-flex"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brava-yellow text-brava-blue">
              <span className="text-sm font-black">
                {userName?.[0]?.toUpperCase() ?? "B"}
              </span>
            </span>
            <span className="font-bold text-brava-ink">{firstName(userName)}</span>
            {tier && (
              <span className="rounded-full bg-brava-blue px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                {tier}
              </span>
            )}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function firstName(name: string | null): string {
  if (!name) return "Você";
  return name.split(" ")[0];
}
