"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const ITEMS = [
  { href: "/app", label: "Início", icon: HomeIcon },
  { href: "/app/pedidos", label: "Pedidos", icon: WalletIcon },
  { href: "/app/carteirinha", label: "Carteirinha", icon: PlusMarkIcon, center: true },
  { href: "/app/menu", label: "Menu", icon: StarIcon },
  { href: "/app/perfil", label: "Perfil", icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 sm:hidden">
        <div className="pointer-events-auto relative mx-auto max-w-md px-4 pb-3">
          <div className="relative rounded-3xl border border-white/10 bg-brava-black/85 px-3 pb-2 pt-3 backdrop-blur-xl shadow-2xl shadow-brava-black/40">
            <div className="grid grid-cols-5 items-center gap-1">
              {ITEMS.map((item) => {
                const isActive =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                if (item.center) {
                  return (
                    <div key={item.href} className="relative flex justify-center">
                      <Link
                        href={item.href}
                        aria-label={item.label}
                        className="absolute -top-9 flex h-16 w-16 items-center justify-center rounded-full bg-brava-yellow text-brava-blue shadow-xl shadow-brava-yellow/40 ring-4 ring-brava-black transition-transform active:scale-95"
                      >
                        <Icon className="h-8 w-8" />
                      </Link>
                      <span className="mt-8 text-[10px] font-bold uppercase tracking-wider text-brava-yellow">
                        QR
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    className="relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-transform active:scale-95"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="bottom-nav-pill"
                        className="absolute inset-0 rounded-2xl bg-white/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={`relative h-5 w-5 transition-colors ${
                        isActive ? "text-brava-yellow" : "text-white/65"
                      }`}
                    />
                    <span
                      className={`relative text-[10px] font-medium ${
                        isActive ? "text-brava-yellow" : "text-white/55"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-24 sm:hidden" aria-hidden />
    </>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 12 3l9 9" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7H7a2 2 0 0 1-2-2" />
      <circle cx="16" cy="13" r="1.3" fill="currentColor" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

function PlusMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 4h6a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
