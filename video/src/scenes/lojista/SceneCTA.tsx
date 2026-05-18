import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, popIn, slideY } from "../../anim";
import { Blob } from "../../components/Blob";
import { Noise } from "../../components/Noise";

export function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Botão pulsa (loop)
  const pulse = 1 + Math.sin(frame * 0.15) * 0.03;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.dark} 0%, ${COLORS.blue} 100%)`,
        padding: 80,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <Blob color={COLORS.accent} x={50} y={30} size={70} opacity={0.25} />
      <Noise opacity={0.04} />

      <p
        style={{
          opacity: fadeIn(frame, 0, 14),
          transform: `translateY(${slideY(frame, 0, 14, 30, 0)}px)`,
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.accent,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          marginBottom: 30,
        }}
      >
        Pronto pra crescer?
      </p>

      <div
        style={{
          opacity: fadeIn(frame, 18, 14),
          transform: `scale(${popIn(frame, 18, fps, { damping: 12, stiffness: 180 })})`,
          fontSize: 160,
          fontWeight: 900,
          color: COLORS.accent,
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          marginBottom: 8,
          textShadow: `0 0 80px ${COLORS.accentDark}`,
        }}
      >
        GRÁTIS
      </div>

      <p
        style={{
          opacity: fadeIn(frame, 38, 14),
          fontSize: 36,
          fontWeight: 700,
          color: "white",
          marginTop: 0,
          marginBottom: 40,
        }}
      >
        no ano-piloto
      </p>

      {/* 3 perks */}
      <div
        style={{
          opacity: fadeIn(frame, 55, 14),
          display: "flex",
          gap: 16,
          marginBottom: 50,
        }}
      >
        {[
          { v: "0%",    l: "comissão"   },
          { v: "R$ 0",  l: "mensalidade" },
          { v: "24h",   l: "aprovação"   },
        ].map((p) => (
          <div
            key={p.l}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${COLORS.borderOnDark}`,
              borderRadius: 20,
              padding: "14px 26px",
              backdropFilter: "blur(6px)",
            }}
          >
            <p style={{ fontSize: 38, fontWeight: 900, color: COLORS.accent, margin: 0, lineHeight: 1 }}>{p.v}</p>
            <p style={{ fontSize: 16, color: COLORS.fgMutedOnDark, margin: 0, marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {p.l}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 80, 14),
          transform: `scale(${pulse})`,
          background: COLORS.accent,
          color: COLORS.fgOnLight,
          padding: "26px 50px",
          borderRadius: 100,
          fontSize: 38,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: 30,
          boxShadow: `0 30px 80px ${COLORS.accent}50`,
        }}
      >
        Cadastrar minha loja →
      </div>

      <p
        style={{
          opacity: fadeIn(frame, 105, 14),
          fontSize: 26,
          color: "white",
          fontWeight: 700,
          marginBottom: 50,
        }}
      >
        bravamais.app
      </p>

      <div
        style={{
          opacity: fadeIn(frame, 130, 14),
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 56,
          fontWeight: 900,
          color: "white",
          letterSpacing: "-0.04em",
        }}
      >
        BRAVA<span style={{ color: COLORS.accent, fontSize: 76, marginLeft: 6 }}>+</span>
      </div>
    </AbsoluteFill>
  );
}
