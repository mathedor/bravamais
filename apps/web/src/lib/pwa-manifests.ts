export interface RoleManifest {
  role: "subscriber" | "establishment" | "admin" | "comercial" | "deliverer";
  name: string;
  shortName: string;
  description: string;
  startUrl: string;
  scope: string;
  themeColor: string;
  backgroundColor: string;
  iconColor: string;
}

export const ROLE_MANIFESTS: Record<RoleManifest["role"], RoleManifest> = {
  subscriber: {
    role: "subscriber",
    name: "BRAVA+ — Meu clube",
    shortName: "BRAVA+",
    description: "Clube de vantagens BRAVA+. Cupons, fidelidade, balcão e benefícios em parceiros locais.",
    startUrl: "/app",
    scope: "/app",
    themeColor: "#FBBF24",
    backgroundColor: "#0a0a0a",
    iconColor: "#FBBF24",
  },
  establishment: {
    role: "establishment",
    name: "BRAVA+ Lojista",
    shortName: "BRAVA+ Loja",
    description: "Painel do lojista BRAVA+. QR scanner, balcão de vendas, cupons, fidelidade e BI.",
    startUrl: "/loja",
    scope: "/loja",
    themeColor: "#1E3A8A",
    backgroundColor: "#0a0a0a",
    iconColor: "#FBBF24",
  },
  admin: {
    role: "admin",
    name: "BRAVA+ Admin",
    shortName: "BRAVA+ Admin",
    description: "Painel administrativo BRAVA+. BI, monetização, suporte e moderação.",
    startUrl: "/admin",
    scope: "/admin",
    themeColor: "#0a0a0a",
    backgroundColor: "#0a0a0a",
    iconColor: "#FBBF24",
  },
  comercial: {
    role: "comercial",
    name: "BRAVA+ Comercial",
    shortName: "BRAVA+ Field",
    description: "App de campo dos comerciais BRAVA+. CRM, mapa Google Places, comissões.",
    startUrl: "/comercial",
    scope: "/comercial",
    themeColor: "#16A34A",
    backgroundColor: "#0a0a0a",
    iconColor: "#FBBF24",
  },
  deliverer: {
    role: "deliverer",
    name: "BRAVA+ Entregador",
    shortName: "BRAVA Moto",
    description: "App do entregador BRAVA+. Receba ofertas, navegue rotas e ganhe por entrega.",
    startUrl: "/entregador",
    scope: "/entregador",
    themeColor: "#EA580C",
    backgroundColor: "#0a0a0a",
    iconColor: "#FBBF24",
  },
};

export function manifestJson(role: RoleManifest["role"]): Record<string, unknown> {
  const m = ROLE_MANIFESTS[role];
  return {
    name: m.name,
    short_name: m.shortName,
    description: m.description,
    start_url: m.startUrl,
    scope: m.scope,
    display: "standalone",
    orientation: "portrait",
    background_color: m.backgroundColor,
    theme_color: m.themeColor,
    lang: "pt-BR",
    categories: ["lifestyle", "shopping", "social"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/logo-mark.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: `/icons/${m.role}-192.png`,
        type: "image/png",
        sizes: "192x192",
        purpose: "any maskable",
      },
      {
        src: `/icons/${m.role}-512.png`,
        type: "image/png",
        sizes: "512x512",
        purpose: "any maskable",
      },
    ],
    shortcuts: shortcutsFor(role),
  };
}

function shortcutsFor(role: RoleManifest["role"]): Array<Record<string, unknown>> {
  switch (role) {
    case "subscriber":
      return [
        { name: "Carteirinha QR", short_name: "QR", url: "/app/carteirinha" },
        { name: "Meus cupons", short_name: "Cupons", url: "/app/cupons" },
        { name: "Buscar parceiros", short_name: "Buscar", url: "/app/buscar" },
      ];
    case "establishment":
      return [
        { name: "Bipar carteirinha", short_name: "QR", url: "/loja/qr-scanner" },
        { name: "Pedidos online", short_name: "Pedidos", url: "/loja/pedidos" },
        { name: "Chat", short_name: "Chat", url: "/loja/chat" },
      ];
    case "admin":
      return [
        { name: "Dashboard", short_name: "Home", url: "/admin" },
        { name: "Estabelecimentos", short_name: "Lojas", url: "/admin/estabelecimentos" },
        { name: "Pedidos de remoção", short_name: "Tickets", url: "/admin/feature-requests" },
      ];
    case "comercial":
      return [
        { name: "Mapa de prospects", short_name: "Mapa", url: "/comercial" },
        { name: "Minhas comissões", short_name: "Comissões", url: "/comercial/comissoes" },
      ];
    case "deliverer":
      return [
        { name: "Entregas disponíveis", short_name: "Painel", url: "/entregador" },
        { name: "Minhas entregas", short_name: "Histórico", url: "/entregador/historico" },
      ];
  }
}
