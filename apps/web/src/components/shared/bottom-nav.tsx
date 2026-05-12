"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { SVGProps, FC } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  center?: boolean;
  centerIcon?: FC<SVGProps<SVGSVGElement>>;
}

export function BottomNav({ items, layoutId }: { items: NavItem[]; layoutId: string }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 sm:hidden">
        <div className="pointer-events-auto relative mx-auto max-w-md px-4 pb-3">
          <div className="relative rounded-3xl border border-white/10 bg-brava-black/85 px-3 pb-2 pt-3 backdrop-blur-xl shadow-2xl shadow-brava-black/40">
            <div className="grid grid-cols-5 items-center gap-1">
              {items.map((item) => {
                const isActive = isActiveRoute(pathname, item.href);
                const Icon = item.centerIcon ?? item.icon;

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
                        {item.label}
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
                        layoutId={layoutId}
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

function isActiveRoute(pathname: string, href: string): boolean {
  // Para `/app`, exato. Para subrotas, prefix.
  // Considerar matching mais flexível por base.
  const segments = href.split("/").filter(Boolean);
  const base = segments.length <= 1 ? `/${segments[0] ?? ""}` : href;
  if (segments.length === 1) {
    return pathname === base;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

// Reusable icons
export const HomeIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12 12 3l9 9" />
    <path d="M5 10v10h14V10" />
  </svg>
);

export const SearchIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const StarIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
  </svg>
);

export const UserIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
  </svg>
);

export const PlusMarkIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M9 4h6a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1Z" />
  </svg>
);

export const QrIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3M14 18h3M18 14v7M21 14v3M14 21h7" />
  </svg>
);

export const TicketIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
    <path d="M13 6v12M9 6v2M9 16v2" />
  </svg>
);

export const StoryIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

export const ShopIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9 5 3h14l2 6" />
    <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
    <path d="M9 21V12h6v9" />
  </svg>
);

export const ChartIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 3 3 5-6" />
  </svg>
);

export const UsersIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const PackageIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8 12 3 3 8l9 5 9-5Z" />
    <path d="M3 8v9l9 5 9-5V8" />
    <path d="m12 13 0 9" />
  </svg>
);

export const SettingsIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);
