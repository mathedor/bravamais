"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AppNavItem {
  href: string;
  emoji: string;
  label: string;
}

export interface AppNavGroup {
  label: string;
  items: AppNavItem[];
}

export const APP_NAV_GROUPS: AppNavGroup[] = [
  {
    label: "Início",
    items: [
      { href: "/app", emoji: "🏠", label: "Home" },
      { href: "/app/buscar", emoji: "🔎", label: "Buscar parceiros" },
      { href: "/app/mapa", emoji: "🗺️", label: "Mapa" },
      { href: "/app/proximos", emoji: "📍", label: "Perto de mim" },
      { href: "/app/favoritos", emoji: "❤️", label: "Favoritos" },
      { href: "/app/listas", emoji: "📑", label: "Listas editoriais" },
    ],
  },
  {
    label: "Minha conta",
    items: [
      { href: "/app/carteirinha", emoji: "💳", label: "Carteirinha QR" },
      { href: "/app/carteira", emoji: "🪙", label: "Carteira (cupons & coins)" },
      { href: "/app/cupons", emoji: "🎟️", label: "Cupons" },
      { href: "/app/presentes", emoji: "🎁", label: "Vale-presentes" },
      { href: "/app/premios", emoji: "🏆", label: "Prêmios resgatados" },
      { href: "/app/fidelidade", emoji: "⭐", label: "Clubes de fidelidade" },
    ],
  },
  {
    label: "Pedidos & entregas",
    items: [
      { href: "/app/pedidos", emoji: "🛒", label: "Meus pedidos" },
      { href: "/app/perfil/enderecos", emoji: "📍", label: "Meus endereços" },
      { href: "/app/extornos", emoji: "↩️", label: "Estornos" },
    ],
  },
  {
    label: "Engajamento",
    items: [
      { href: "/app/desafios", emoji: "🎯", label: "Desafios mensais" },
      { href: "/app/indique", emoji: "👯", label: "Indique amigos" },
      { href: "/app/pacote", emoji: "🎀", label: "Pacotes sazonais" },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { href: "/app/chat", emoji: "💬", label: "Chat com lojistas" },
      { href: "/app/notificacoes", emoji: "🔔", label: "Notificações" },
      { href: "/app/suporte", emoji: "🛟", label: "Suporte" },
    ],
  },
  {
    label: "Conta & privacidade",
    items: [
      { href: "/app/perfil", emoji: "👤", label: "Meu perfil" },
      { href: "/app/perfil/dados", emoji: "🔐", label: "Privacidade (LGPD)" },
      { href: "/seja-parceiro", emoji: "🏪", label: "Tenho um estabelecimento" },
      { href: "/seja-entregador", emoji: "🛵", label: "Quero ser entregador" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-brava-border bg-brava-card/60 lg:block">
      <nav className="px-3 py-5">
        {APP_NAV_GROUPS.map((group) => (
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
  if (href === "/app") return pathname === "/app";
  if (href === "/app/perfil") return pathname === "/app/perfil";
  return pathname === href || pathname.startsWith(href + "/");
}
