import { SidebarShell, type SidebarGroup } from "@/components/shared/sidebar-shell";

export const APP_NAV_GROUPS: SidebarGroup[] = [
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

export function AppSidebar({ userName }: { userName?: string }) {
  return (
    <SidebarShell
      groups={APP_NAV_GROUPS}
      layoutId="app-sidebar-active"
      contextLabel="Você"
      contextValue={userName ?? "BRAVA+ Member"}
      contextTone="yellow"
    />
  );
}
