import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { fadeIn, popIn, slideY } from "../anim";
import { Blob } from "../components/Blob";
import { Noise } from "../components/Noise";

export function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

      <div
        style={{
          opacity: fadeIn(frame, 0, 14),
          transform: `translateY(${slideY(frame, 0, 14, 30, 0)}px)`,
          fontSize: 42,
          fontWeight: 700,
          color: COLORS.fgMutedOnDark,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 30,
        }}
      >
        Pronto pra
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 18, 14),
          transform: `scale(${popIn(frame, 18, fps, { damping: 12, stiffness: 180 })})`,
          fontSize: 180,
          fontWeight: 900,
          color: COLORS.accent,
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          marginBottom: 30,
          textShadow: `0 0 80px ${COLORS.accentDark}`,
        }}
      >
        economizar?
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 50, 14),
          background: COLORS.white,
          color: COLORS.fgOnLight,
          borderRadius: 100,
          padding: "30px 60px",
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: 40,
          boxShadow: `0 20px 60px ${COLORS.accent}40`,
        }}
      >
        7 dias grátis · sem cartão
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 75, 14),
          fontSize: 30,
          color: COLORS.white,
          fontWeight: 700,
        }}
      >
        bravamais.app
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 90, 14),
          marginTop: 60,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 60,
          fontWeight: 900,
          color: COLORS.white,
          letterSpacing: "-0.04em",
        }}
      >
        BRAVA<span style={{ color: COLORS.accent, fontSize: 84, marginLeft: 6 }}>+</span>
      </div>
    </AbsoluteFill>
  );
}
