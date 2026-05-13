export type TierBadge = "bronze" | "prata" | "ouro" | "diamante";

export const TIER_META: Record<TierBadge, { label: string; emoji: string; color: string; bg: string; bullet: string }> = {
  bronze: { label: "Bronze", emoji: "🥉", color: "#a0522d", bg: "bg-amber-100", bullet: "Comece sua jornada" },
  prata: { label: "Prata", emoji: "🥈", color: "#9ca3af", bg: "bg-slate-200", bullet: "Cliente regular" },
  ouro: { label: "Ouro", emoji: "🥇", color: "#FFC500", bg: "bg-amber-200", bullet: "Top do clube · cupons exclusivos" },
  diamante: { label: "Diamante", emoji: "💎", color: "#22d3ee", bg: "bg-cyan-100", bullet: "Lenda · benefícios VIP máximos" },
};
