/** Configurações globais do vídeo BRAVA+.
 *  35 segundos a 30fps = 1050 frames. */

export const FPS = 30;
export const SEGUNDOS = 35;
export const DURATION_FRAMES = FPS * SEGUNDOS;

// Reel vertical 1080x1920 (Insta/TikTok/Shorts).
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Paleta BRAVA+ — amarelo + azul + preto. */
export const COLORS = {
  white: "#ffffff",
  whiteBg: "#fafafc",
  dark: "#0A0A0A",
  darkAlt: "#18181B",

  fgOnDark: "#ffffff",
  fgOnLight: "#0A0A0A",
  fgMutedOnDark: "rgba(255,255,255,0.7)",
  fgMutedOnLight: "rgba(10,10,10,0.65)",
  fgDimOnDark: "rgba(255,255,255,0.45)",
  fgDimOnLight: "rgba(10,10,10,0.4)",

  // BRAND BRAVA+
  accent: "#FBBF24",       // amarelo BRAVA
  accentDark: "#F59E0B",   // amarelo deep
  accentLight: "#FCD34D",  // amarelo claro
  blue: "#1E3A8A",         // azul BRAVA
  blueBright: "#2563EB",

  // Positivo (economia)
  emerald: "#10b981",
  emeraldLight: "#34d399",

  // Negativo (problema)
  danger: "#dc2626",
  rose: "#f43f5e",

  borderOnDark: "rgba(255,255,255,0.1)",
  borderOnLight: "rgba(10,10,10,0.08)",

  // Aliases compat
  bg: "#ffffff",
  bgAlt: "#fafafc",
  fg: "#0A0A0A",
  fgMuted: "rgba(10,10,10,0.65)",
  fgDim: "rgba(10,10,10,0.4)",
  border: "rgba(10,10,10,0.08)",
};

/** Timing de cada cena (em frames, 30 fps). Total = 1050 frames = 35s. */
export const SCENES = {
  hero:        { start: 0,   duration: 120 }, // 0-4s   · "Pague pouco. Economize muito."
  problema:    { start: 120, duration: 150 }, // 4-9s   · "Gasta tudo sem desconto"
  solucao:     { start: 270, duration: 150 }, // 9-14s  · "BRAVA+ junta tudo"
  mobile:      { start: 420, duration: 180 }, // 14-20s · carteirinha + cupom no app
  calculadora: { start: 600, duration: 150 }, // 20-25s · animação economia real
  desktop:     { start: 750, duration: 150 }, // 25-30s · mapa + ecossistema
  cta:         { start: 900, duration: 150 }, // 30-35s · "7 dias grátis"
} as const;

export type SceneKey = keyof typeof SCENES;

/** Timing da versão LOJISTA — 57 segundos, narrativa progressiva
 *  no padrão Antecipaqui. Cada cena conduz pra próxima. */
export const SEGUNDOS_LOJISTA = 57;
export const DURATION_FRAMES_LOJISTA = FPS * SEGUNDOS_LOJISTA; // 1710

export const SCENES_LOJISTA = {
  hero:         { start: 0,    duration: 120 }, // 0-4s     · "Mais clientes. Mais retenção. Mais delivery."
  problema:     { start: 120,  duration: 150 }, // 4-9s     · 3 cards de problemas reais
  pilares:      { start: 270,  duration: 150 }, // 9-14s    · 3 pilares (Atrair · Fidelizar · Entregar)
  ferramentas:  { start: 420,  duration: 360 }, // 14-26s   · 9 ferramentas uma a uma (40 frames cada)
  painel:       { start: 780,  duration: 180 }, // 26-32s   · mockup do painel /loja com KPIs
  delivery:     { start: 960,  duration: 210 }, // 32-39s   · mapa rastreável com motoqueiro animado
  entregadores: { start: 1170, duration: 180 }, // 39-45s   · vitrine de freelancers
  calculadora:  { start: 1350, duration: 180 }, // 45-51s   · números somando até o total
  cta:          { start: 1530, duration: 180 }, // 51-57s   · "Cadastrar minha loja"
} as const;

/** Duração de cada ferramenta na cena Ferramentas: 9 × 40 = 360 frames = 12s */
export const FERRAMENTA_FRAMES = 40;
