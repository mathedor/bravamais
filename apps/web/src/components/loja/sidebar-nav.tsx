"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface LojaNavItem {
  href: string;
  emoji: string;
  label: string;
}

export interface LojaNavGroup {
  label: string;
  items: LojaNavItem[];
}

export const LOJA_NAV_GROUPS: LojaNavGroup[] = [
  {
    label: "Início",
    items: [
      { href: "/loja", emoji: "🏠", label: "Dashboard" },
      { href: "/loja/hoje", emoji: "📸", label: "Ao vivo (stories)" },
    ],
  },
  {
    label: "Vendas",
    items: [
      { href: "/loja/catalogo", emoji: "📦", label: "Catálogo" },
      { href: "/loja/pedidos", emoji: "🛒", label: "Pedidos online" },
      { href: "/loja/cupons", emoji: "🎟️", label: "Cupons" },
      { href: "/loja/vale-presente", emoji: "🎁", label: "Vale-presente" },
      { href: "/loja/promocoes", emoji: "📣", label: "Promoções" },
      { href: "/loja/blast", emoji: "⚡", label: "Promo blast" },
      { href: "/loja/roleta", emoji: "🎰", label: "Roleta da sorte" },
    ],
  },
  {
    label: "Entregas",
    items: [
      { href: "/loja/entregas", emoji: "🛵", label: "Entregas em andamento" },
      { href: "/loja/entrega", emoji: "📦", label: "Taxas e raio" },
      { href: "/loja/entregadores", emoji: "🧑‍✈️", label: "Minha equipe" },
      { href: "/loja/entregadores/disponiveis", emoji: "🔍", label: "Contratar freelancers" },
    ],
  },
  {
    label: "Clientes",
    items: [
      { href: "/loja/clientes", emoji: "👥", label: "Top clientes" },
      { href: "/loja/chat", emoji: "💬", label: "Chat" },
      { href: "/loja/qr-scanner", emoji: "📷", label: "Ler QR carteirinha" },
      { href: "/loja/fidelidade", emoji: "⭐", label: "Clube de fidelidade" },
      { href: "/loja/recompensas", emoji: "🏆", label: "Validar prêmios" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/loja/receita", emoji: "💰", label: "Receita & métricas" },
      { href: "/loja/contabil", emoji: "📊", label: "Contábil" },
      { href: "/loja/saques", emoji: "🏦", label: "Saques" },
      { href: "/loja/extornos", emoji: "↩️", label: "Estornos" },
    ],
  },
  {
    label: "Loja",
    items: [
      { href: "/loja/perfil", emoji: "🏷️", label: "Editar perfil" },
      { href: "/loja/plano", emoji: "💳", label: "Meu plano" },
      { href: "/loja/onboarding", emoji: "🚀", label: "Onboarding" },
    ],
  },
];

export function LojaSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-brava-border bg-brava-card/70 lg:block">
      <nav className="px-3 py-5">
        {LOJA_NAV_GROUPS.map((group) => (
          <section key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-brava-muted">
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
                          ? "bg-brava-yellow text-brava-black font-bold shadow-sm shadow-brava-yellow/30"
                          : "text-brava-ink hover:bg-brava-paper"
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
  if (href === "/loja") return pathname === "/loja";
  // /loja/entregadores deve não casar com /loja/entregadores/disponiveis
  return pathname === href || pathname.startsWith(href + "/");
}
