import { SidebarShell, type SidebarGroup } from "@/components/shared/sidebar-shell";

export const COMERCIAL_NAV_GROUPS: SidebarGroup[] = [
  {
    label: "Início",
    items: [
      { href: "/comercial", emoji: "🏠", label: "Dashboard" },
      { href: "/comercial/agenda", emoji: "📅", label: "Agenda do dia" },
    ],
  },
  {
    label: "Prospecção",
    items: [
      { href: "/comercial/prospects", emoji: "🗺️", label: "Mapa de prospects" },
      { href: "/comercial/crm", emoji: "📋", label: "CRM (kanban)" },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { href: "/comercial/cadastros/estabelecimento", emoji: "🏪", label: "Cadastrar lojista" },
      { href: "/comercial/cadastros/usuario", emoji: "👤", label: "Cadastrar assinante" },
      { href: "/comercial/links", emoji: "🔗", label: "Links de convite" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/comercial/comissoes", emoji: "💰", label: "Minhas comissões" },
      { href: "/comercial/relatorios", emoji: "📊", label: "Relatórios" },
    ],
  },
  {
    label: "Playbooks de venda",
    items: [
      { href: "/apresentacao/script-estabelecimento", emoji: "📘", label: "Vender pra lojista" },
      { href: "/apresentacao/script-usuario", emoji: "📗", label: "Vender pra usuário" },
    ],
  },
  {
    label: "Conta",
    items: [
      { href: "/comercial/perfil", emoji: "⚙️", label: "Meus dados + PIX" },
    ],
  },
];

export function ComercialSidebar({ name }: { name?: string }) {
  return (
    <SidebarShell
      groups={COMERCIAL_NAV_GROUPS}
      layoutId="comercial-sidebar-active"
      contextLabel="Comercial"
      contextValue={name}
      contextTone="blue"
    />
  );
}
