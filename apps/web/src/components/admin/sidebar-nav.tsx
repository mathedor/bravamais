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
