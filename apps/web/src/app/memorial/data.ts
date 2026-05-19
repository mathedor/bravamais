import { PAGE_HELPS, type PageHelpKey, type PageHelpEntry } from "@/lib/page-helps";

export type RoleKey = "usuario" | "lojista" | "entregador" | "admin" | "comercial";

const ROLE_MAP: Record<string, RoleKey> = {
  app: "usuario",
  loja: "lojista",
  entregador: "entregador",
  admin: "admin",
  comercial: "comercial",
};

function detectRole(key: PageHelpKey): RoleKey {
  const prefix = key.split("-")[0];
  return ROLE_MAP[prefix] ?? "admin";
}

export const ROLE_META: Record<RoleKey, { label: string; emoji: string; tagline: string; color: string }> = {
  usuario: {
    label: "Assinante (usuário final)",
    emoji: "👤",
    tagline: "Quem paga mensalidade pra acessar cupons, fidelidade, cashback e benefícios da rede BRAVA+.",
    color: "#2563EB",
  },
  lojista: {
    label: "Estabelecimento (lojista)",
    emoji: "🏪",
    tagline: "Comerciante parceiro que oferece cupons, programa de fidelidade e vende pelo app BRAVA+.",
    color: "#FBBF24",
  },
  entregador: {
    label: "Entregador (motoboy freelance)",
    emoji: "🛵",
    tagline: "Motoboy independente da malha BRAVA+ — aceita entregas dos parceiros, ganha por entrega via PIX.",
    color: "#F97316",
  },
  comercial: {
    label: "Comercial (representante de campo)",
    emoji: "🤝",
    tagline: "Vendedor B2B externo que capta lojistas e assinantes na rua. Ganha comissão recorrente.",
    color: "#6366F1",
  },
  admin: {
    label: "Administrador (time BRAVA+)",
    emoji: "🛠️",
    tagline: "Time interno BRAVA+ com acesso total: gestão de usuários, parceiros, ferramentas, monetização e BI.",
    color: "#0A0A0A",
  },
};

export function helpsByRole(): Record<RoleKey, { key: PageHelpKey; entry: PageHelpEntry }[]> {
  const out: Record<RoleKey, { key: PageHelpKey; entry: PageHelpEntry }[]> = {
    usuario: [], lojista: [], entregador: [], comercial: [], admin: [],
  };
  (Object.keys(PAGE_HELPS) as PageHelpKey[]).forEach((k) => {
    const r = detectRole(k);
    out[r].push({ key: k, entry: PAGE_HELPS[k] });
  });
  return out;
}

export const DEMO_LOGINS = [
  { role: "Assinante", emoji: "👤", email: "demo.usuario@bravamais.app", password: "BravaUser@2026!", url: "/app" },
  { role: "Lojista", emoji: "🏪", email: "demo.lojista@bravamais.app", password: "BravaLojista@2026!", url: "/loja" },
  { role: "Entregador", emoji: "🛵", email: "demo.entregador@bravamais.app", password: "BravaEntregador@2026!", url: "/entregador" },
  { role: "Comercial", emoji: "🤝", email: "demo.comercial@bravamais.app", password: "BravaComercial@2026!", url: "/comercial" },
  { role: "Admin", emoji: "🛠️", email: "demo.admin@bravamais.app", password: "BravaAdmin@2026!", url: "/admin" },
];
