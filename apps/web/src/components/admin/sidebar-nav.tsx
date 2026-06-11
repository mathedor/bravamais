import { SidebarShell, type SidebarGroup } from "@/components/shared/sidebar-shell";

export const ADMIN_NAV_GROUPS: SidebarGroup[] = [
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
      { href: "/admin/comerciais", emoji: "🤝", label: "Comerciais (campo)" },
      { href: "/admin/afiliados", emoji: "💸", label: "Afiliados (payouts)" },
    ],
  },
  {
    label: "Ferramentas (novo)",
    items: [
      { href: "/admin/ferramentas", emoji: "🧰", label: "Hub ferramentas" },
      { href: "/admin/ferramentas/beneficios", emoji: "♻️", label: "Benefício Renovável ★" },
      { href: "/admin/ferramentas/wallet", emoji: "💰", label: "Wallet (packs)" },
      { href: "/admin/ferramentas/badges", emoji: "🥇", label: "Badges" },
      { href: "/admin/ferramentas/sazonalidade", emoji: "🎉", label: "Sazonalidade" },
      { href: "/admin/ferramentas/treinamentos", emoji: "🎓", label: "Treinamentos" },
      { href: "/admin/relatorios/ferramentas", emoji: "📊", label: "Relatório ferramentas" },
      { href: "/admin/relatorios/categorias", emoji: "🏷️", label: "Relatório categorias ★" },
      { href: "/admin/relatorios/vendas", emoji: "💰", label: "Relatório vendas balcão ★" },
    ],
  },
  {
    label: "Estabelecimentos",
    items: [
      { href: "/admin/estabelecimentos", emoji: "🏪", label: "Lojas" },
      { href: "/admin/categorias", emoji: "🏷️", label: "Categorias (preços)" },
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
      { href: "/admin/campanhas", emoji: "📢", label: "Campanhas segmentadas ★" },
      { href: "/admin/planos", emoji: "💳", label: "Planos de assinatura" },
      { href: "/admin/features", emoji: "🧩", label: "Catálogo de features ★" },
      { href: "/admin/tag", emoji: "💳", label: "BRAVA Tag (rede) ★" },
      { href: "/admin/feature-requests", emoji: "📥", label: "Pedidos de remoção" },
      { href: "/admin/bi", emoji: "📈", label: "BI avançado" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/admin/financeiro", emoji: "💵", label: "Pagamentos & Recorrência ★" },
      { href: "/admin/saques", emoji: "🏦", label: "Saques" },
      { href: "/admin/extornos", emoji: "↩️", label: "Estornos" },
      { href: "/admin/relatorios/resgates", emoji: "🎟️", label: "Resgates de cupom ★" },
      { href: "/admin/relatorios/carteiras", emoji: "🪙", label: "Carteiras (float) ★" },
    ],
  },
  {
    label: "Suporte & moderação",
    items: [
      { href: "/admin/suporte", emoji: "🛟", label: "Tickets de suporte" },
      { href: "/admin/denuncias", emoji: "🚨", label: "Denúncias" },
      { href: "/admin/avaliacoes", emoji: "⭐", label: "Avaliações ★" },
      { href: "/admin/promo-blasts", emoji: "📣", label: "Promo blasts (lojistas) ★" },
      { href: "/admin/fraude", emoji: "🛡️", label: "Antifraude" },
      { href: "/admin/engajamento", emoji: "🎰", label: "Engajamento (monitor) ★" },
    ],
  },
];

export function AdminSidebar() {
  return (
    <SidebarShell
      groups={ADMIN_NAV_GROUPS}
      layoutId="admin-sidebar-active"
      contextLabel="BRAVA+ Admin"
      contextValue="Painel"
      contextTone="blue"
    />
  );
}
