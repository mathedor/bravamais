"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AdminNavItem {
  href: string;
  emoji: string;
  label: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Visão geral",
    items: [{ href: "/admin", emoji: "📊", label: "Dashboard" }],
  },
  {
    label: "Usuários",
    items: [
      { href: "/admin/usuarios", emoji: "👥", label: "Assinantes" },
      { href: "/admin/assinaturas", emoji: "💎", label: "Assinaturas" },
      { href: "/admin/churn", emoji: "📉", label: "Churn & retenção" },
      { href: "/admin/desafios", emoji: "🎯", label: "Desafios" },
      { href: "/admin/listas", emoji: "📑", label: "Listas editoriais" },
      { href: "/admin/afiliados", emoji: "🤝", label: "Afiliados comerciais" },
    ],
  },
  {
    label: "Estabelecimentos",
    items: [
      { href: "/admin/estabelecimentos", emoji: "🏪", label: "Lojas" },
      { href: "/admin/categorias", emoji: "🏷️", label: "Categorias" },
      { href: "/admin/pacotes", emoji: "🎀", label: "Pacotes sazonais" },
      { href: "/admin/slots", emoji: "📌", label: "Slots de destaque" },
      { href: "/admin/b2b", emoji: "🏢", label: "BRAVA+ Empresas (B2B)" },
    ],
  },
  {
    label: "Entregas",
    items: [
      { href: "/admin/entregadores", emoji: "🧑‍✈️", label: "Entregadores" },
      { href: "/admin/entregas", emoji: "🛵", label: "Entregas (todas)" },
    ],
  },
  {
    label: "Conteúdo & monetização",
    items: [
      { href: "/admin/cupons", emoji: "🎟️", label: "Cupons" },
      { href: "/admin/planos", emoji: "💳", label: "Planos de assinatura" },
      { href: "/admin/bi", emoji: "📈", label: "BI avançado" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/admin/saques", emoji: "🏦", label: "Saques" },
      { href: "/admin/extornos", emoji: "↩️", label: "Estornos" },
    ],
  },
  {
    label: "Suporte & moderação",
    items: [
      { href: "/admin/suporte", emoji: "🛟", label: "Tickets de suporte" },
      { href: "/admin/denuncias", emoji: "🚨", label: "Denúncias" },
      { href: "/admin/fraude", emoji: "🛡️", label: "Antifraude" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-brava-black/95 lg:block">
      <nav className="px-3 py-5">
        {ADMIN_NAV_GROUPS.map((group) => (
          <section key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                        active
                          ? "bg-brava-yellow font-bold text-brava-black shadow-md shadow-brava-yellow/20"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-base">{item.emoji}</span>
                      <span className="truncate">{item.label}</span>
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

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}
