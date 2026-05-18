import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY, popIn } from "../../anim";
import { Blob } from "../../components/Blob";

interface Pilar {
  emoji: string;
  title: string;
  features: string[];
  accentColor: string;
}

const PILARES: Pilar[] = [
  {
    emoji: "🧲",
    title: "Atrair",
    features: ["Cupons no app", "Stories interativos", "Aparição no mapa"],
    accentColor: COLORS.accent, // amarelo BRAVA
  },
  {
    emoji: "🔁",
    title: "Fidelizar",
    features: ["Clube de fidelidade", "BRAVA Coins (cashback)", "Vale-presente"],
    accentColor: COLORS.emerald,
  },
  {
    emoji: "🛵",
    title: "Entregar",
    features: ["Delivery rastreável", "Rota otimizada", "Vitrine de entregadores"],
    accentColor: COLORS.blueBright, // azul BRAVA bright
  },
];

export function ScenePilares() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagOp = fadeIn(frame, 0, 12);
  const titleOp = fadeIn(frame, 10, 14);
  const titleY = slideY(frame, 10, 14, 30, 0);
  const closingOp = fadeIn(frame, 140, 14);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.dark,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Blob color={COLORS.accent} x={85} y={15} size={45} opacity={0.25} />
      <Blob color={COLORS.blue} x={15} y={85} size={50} opacity={0.4} />

      <p
        style={{
          opacity: tagOp,
          fontSize: 26,
          fontWeight: 800,
          color: COLORS.accent,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        BRAVA+ resolve em 3 frentes
      </p>

      <h2
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontSize: 84,
          fontWeight: 900,
          color: COLORS.white,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginTop: 16,
          marginBottom: 50,
        }}
      >
        Atrair + Fidelizar +<br />
        <span style={{ color: COLORS.accent }}>Entregar</span> — num lugar só.
      </h2>

      {/* 3 pilares lado a lado */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
        {PILARES.map((p, i) => {
          const startFrame = 28 + i * 25;
          const op = fadeIn(frame, startFrame, 14);
          const scale = popIn(frame, startFrame, fps, { damping: 13, stiffness: 170 });
          return (
            <div
              key={p.title}
              style={{
                opacity: op,
                transform: `scale(${scale})`,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.borderOnDark}`,
                borderRadius: 28,
                padding: 24,
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: `${p.accentColor}25`,
                  border: `2px solid ${p.accentColor}50`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 44,
                  marginBottom: 16,
                }}
              >
                {p.emoji}
              </div>
              <p
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  color: p.accentColor,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {p.title}
              </p>
              <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: "none" }}>
                {p.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 20,
                      color: COLORS.fgMutedOnDark,
                      paddingLeft: 18,
                      position: "relative",
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    <span style={{ position: "absolute", left: 0, color: p.accentColor }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div
        style={{
          opacity: closingOp,
          marginTop: 50,
          textAlign: "center",
          fontSize: 36,
          fontWeight: 900,
          color: COLORS.white,
        }}
      >
        <span style={{ color: COLORS.accent }}>9 ferramentas</span> · 1 plataforma ·{" "}
        <span style={{ color: COLORS.accent }}>R$ 0</span> pra você
      </div>
    </AbsoluteFill>
  );
}
