"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export interface SidebarItem {
  href: string;
  emoji: string;
  label: string;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

interface Props {
  groups: SidebarGroup[];
  /** Identificador único do layoutId pro motion (evita conflitos entre painéis) */
  layoutId: string;
  /** Texto de identificação do contexto exibido no topo da sidebar */
  contextLabel?: string;
  /** Detalhe do contexto (ex: nome da loja, "Admin", nome do user) */
  contextValue?: string;
  /** Cor de destaque do contexto */
  contextTone?: "yellow" | "blue" | "neutral";
  /** Função que define se um item é ativo. Default: prefix match com "/loja" sem casar subpaths errados */
  isActive?: (pathname: string, href: string) => boolean;
}

const TONE_BG: Record<NonNullable<Props["contextTone"]>, string> = {
  yellow: "bg-gradient-to-br from-brava-yellow to-amber-400 text-brava-black",
  blue: "bg-gradient-to-br from-brava-blue to-indigo-500 text-white",
  neutral: "bg-gradient-to-br from-brava-ink/90 to-brava-ink/70 text-brava-card",
};

export function SidebarShell({
  groups,
  layoutId,
  contextLabel,
  contextValue,
  contextTone = "neutral",
  isActive,
}: Props) {
  const pathname = usePathname();

  function defaultActive(href: string): boolean {
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      const params = new URLSearchParams(query);
      // Match exato com query — útil pra /admin/entregadores?status=pending_review
      if (pathname !== path) return false;
      // (não temos acesso ao searchParams do pathname client-side facilmente, ignoramos)
      return true;
    }
    if (href === "/" || href === "/loja" || href === "/app" || href === "/admin" || href === "/entregador") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  const check = isActive ?? defaultActive;

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-brava-border bg-brava-card/40 backdrop-blur-xl lg:block">
      {(contextLabel || contextValue) && (
        <div className="px-5 pb-2 pt-5">
          <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm ${TONE_BG[contextTone]}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/15 text-lg font-black backdrop-blur-sm">
              {contextLabel?.[0] ?? "B"}
            </div>
            <div className="min-w-0">
              {contextLabel && (
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">{contextLabel}</p>
              )}
              {contextValue && (
                <p className="truncate text-sm font-black">{contextValue}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="px-3 pb-6 pt-3">
        {groups.map((group) => (
          <section key={group.label} className="mb-4">
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brava-muted">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = check(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                        active
                          ? "text-brava-black font-bold"
                          : "text-brava-ink hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId={layoutId}
                          className="absolute inset-0 -z-0 rounded-xl bg-gradient-to-r from-brava-yellow to-amber-300 shadow-md shadow-brava-yellow/30 ring-1 ring-brava-yellow/30"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-brava-paper text-base shadow-sm transition group-hover:scale-105">
                        {item.emoji}
                      </span>
                      <span className="relative z-10 truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}
