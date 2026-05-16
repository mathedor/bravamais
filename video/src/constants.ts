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
