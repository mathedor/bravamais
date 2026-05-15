import { SidebarShell, type SidebarGroup } from "@/components/shared/sidebar-shell";

export const LOJA_NAV_GROUPS: SidebarGroup[] = [
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

export function LojaSidebar({ establishmentName }: { establishmentName?: string }) {
  return (
    <SidebarShell
      groups={LOJA_NAV_GROUPS}
      layoutId="loja-sidebar-active"
      contextLabel="Loja"
      contextValue={establishmentName}
      contextTone="yellow"
    />
  );
}
