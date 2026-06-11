import { SidebarShell, type SidebarGroup } from "@/components/shared/sidebar-shell";
import { listEstabFeatureGrants } from "@/lib/feature-gate";

export const LOJA_NAV_GROUPS: SidebarGroup[] = [
  {
    label: "Início",
    items: [
      { href: "/loja", emoji: "🏠", label: "Dashboard" },
      { href: "/loja/hoje", emoji: "📸", label: "Ao vivo (stories)", featureSlug: "stories_interativos" },
    ],
  },
  {
    label: "Vendas",
    items: [
      { href: "/loja/beneficio-renovavel", emoji: "♻️", label: "Benefício Renovável ★", featureSlug: "beneficio_renovavel" },
      { href: "/loja/catalogo", emoji: "📦", label: "Catálogo", featureSlug: "catalogo_basico" },
      { href: "/loja/pedidos", emoji: "🛒", label: "Pedidos online", featureSlug: "catalogo_basico" },
      { href: "/loja/cupons", emoji: "🎟️", label: "Cupons", featureSlug: "cupom_unico" },
      { href: "/loja/vale-presente", emoji: "🎁", label: "Vale-presente", featureSlug: "vale_presente" },
      { href: "/loja/promocoes", emoji: "📣", label: "Promoções", featureSlug: "promo_blast" },
      { href: "/loja/blast", emoji: "⚡", label: "Promo blast", featureSlug: "promo_blast" },
      { href: "/loja/roleta", emoji: "🎰", label: "Roleta da sorte", featureSlug: "roleta_sorte" },
    ],
  },
  {
    label: "Entregas",
    items: [
      { href: "/loja/entregas", emoji: "🛵", label: "Entregas em andamento", featureSlug: "delivery_proprio" },
      { href: "/loja/entrega", emoji: "📦", label: "Taxas e raio", featureSlug: "delivery_proprio" },
      { href: "/loja/entregadores", emoji: "🧑‍✈️", label: "Minha equipe", featureSlug: "delivery_proprio" },
      { href: "/loja/entregadores/disponiveis", emoji: "🔍", label: "Contratar freelancers", featureSlug: "delivery_proprio" },
    ],
  },
  {
    label: "Clientes",
    items: [
      { href: "/loja/clientes", emoji: "👥", label: "Top clientes", featureSlug: "crm_top_clientes" },
      { href: "/loja/chat", emoji: "💬", label: "Chat", featureSlug: "chat_basico" },
      { href: "/loja/chat-bot", emoji: "🤖", label: "Auto-resposta (bot)", featureSlug: "chat_bot" },
      { href: "/loja/qr-scanner", emoji: "📷", label: "Ler QR carteirinha", featureSlug: "qr_scanner" },
      { href: "/loja/fidelidade", emoji: "⭐", label: "Clube de fidelidade", featureSlug: "fidelidade" },
      { href: "/loja/recompensas", emoji: "🏆", label: "Validar prêmios", featureSlug: "fidelidade" },
      { href: "/loja/vou-ai", emoji: "🚪", label: "Vou aí — recebimento", featureSlug: "vou_ai" },
      { href: "/loja/lista-espera", emoji: "⏳", label: "Fila de espera", featureSlug: "lista_espera" },
    ],
  },
  {
    label: "Operação avançada",
    items: [
      { href: "/loja/mesa-qr", emoji: "🪑", label: "Mesa QR", featureSlug: "mesa_qr" },
      { href: "/loja/kitchen", emoji: "🍳", label: "Display cozinha (TV)", featureSlug: "kitchen_display" },
      { href: "/loja/cross-sell", emoji: "🛒", label: "Cross-sell", featureSlug: "cross_sell" },
      { href: "/loja/calendario", emoji: "📅", label: "Calendário promo", featureSlug: "calendario_promo" },
    ],
  },
  {
    label: "Estratégia",
    items: [
      { href: "/loja/comparativo", emoji: "📊", label: "Comparativo regional", featureSlug: "benchmark_regional" },
      { href: "/loja/parcerias", emoji: "🤝", label: "Parcerias", featureSlug: "parcerias" },
      { href: "/loja/ab-test", emoji: "🧪", label: "A/B test cupons", featureSlug: "ab_test" },
      { href: "/loja/treinamento", emoji: "🎓", label: "Treinamento", featureSlug: "treinamento" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/loja/receita", emoji: "💰", label: "Receita & métricas", featureSlug: "receita_incremental" },
      { href: "/loja/contabil", emoji: "📊", label: "Contábil" },
      { href: "/loja/saques", emoji: "🏦", label: "Saques" },
      { href: "/loja/extornos", emoji: "↩️", label: "Estornos" },
      { href: "/loja/cfo-backup", emoji: "📧", label: "Backup CFO (email)", featureSlug: "cfo_backup" },
    ],
  },
  {
    label: "Loja",
    items: [
      { href: "/loja/perfil", emoji: "🏷️", label: "Editar perfil", featureSlug: "perfil" },
      { href: "/loja/minhas-ferramentas", emoji: "🧰", label: "Minhas ferramentas ★" },
      { href: "/loja/plano", emoji: "💳", label: "Meu plano" },
      { href: "/loja/onboarding", emoji: "🚀", label: "Onboarding", featureSlug: "onboarding" },
    ],
  },
  {
    label: "BRAVA +",
    items: [
      { href: "/como-funciona", emoji: "💡", label: "Como funciona" },
      { href: "/quem-somos", emoji: "🙌", label: "Quem somos" },
      { href: "/politica-de-pagamento", emoji: "💳", label: "Política de pagamento" },
      { href: "/politica-de-reembolso", emoji: "↩️", label: "Reembolso e devolução" },
      { href: "/politica-de-entrega", emoji: "🛵", label: "Política de entrega" },
      { href: "/politica-de-uso", emoji: "📘", label: "Política de uso" },
      { href: "/lgpd", emoji: "🔐", label: "LGPD" },
      { href: "/termos", emoji: "📄", label: "Termos de uso" },
    ],
  },
];

export async function LojaSidebar({
  establishmentName,
  establishmentId,
}: {
  establishmentName?: string;
  establishmentId: string;
}) {
  const activeSlugs = await listEstabFeatureGrants(establishmentId);

  const filteredGroups: SidebarGroup[] = LOJA_NAV_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.filter((it) => !it.featureSlug || activeSlugs.has(it.featureSlug)),
  })).filter((g) => g.items.length > 0);

  return (
    <SidebarShell
      groups={filteredGroups}
      layoutId="loja-sidebar-active"
      contextLabel="Loja"
      contextValue={establishmentName}
      contextTone="yellow"
    />
  );
}
