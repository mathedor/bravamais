import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY, popIn } from "../../anim";
import { Noise } from "../../components/Noise";
import { Blob } from "../../components/Blob";
import { Sticker } from "../../components/Sticker";

export function SceneHero() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = popIn(frame, 0, fps, { damping: 14 });
  const subOp = fadeIn(frame, 18, 12);
  const subY = slideY(frame, 18, 12, 30, 0);

  // 3 linhas de promessa em sequência
  const line1Op = fadeIn(frame, 40, 14);
  const line1Y = slideY(frame, 40, 14, 40, 0);

  const line2Op = fadeIn(frame, 65, 14);
  const line2Y = slideY(frame, 65, 14, 40, 0);

  const line3Op = fadeIn(frame, 90, 16);
  const line3Scale = popIn(frame, 90, fps, { damping: 12, stiffness: 180 });

  return (
    <AbsoluteFill style={{ background: COLORS.dark, overflow: "hidden" }}>
      <Blob color={COLORS.accent} x={75} y={20} size={70} opacity={0.3} />
      <Blob color={COLORS.blue} x={20} y={85} size={55} opacity={0.45} />
      <Noise opacity={0.04} />

      <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "flex-start" }}>
        {/* Logo + tag */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 30,
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 900, color: COLORS.white, letterSpacing: "-0.04em" }}>
            BRAVA
          </span>
          <span
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: COLORS.accent,
              lineHeight: 0.9,
              marginLeft: 6,
              textShadow: `0 0 50px ${COLORS.accent}`,
            }}
          >
            +
          </span>
        </div>

        <div
          style={{
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            fontSize: 38,
            fontWeight: 700,
            color: COLORS.fgMutedOnDark,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 60,
          }}
        >
          Pra sua loja
        </div>

        <div style={{ color: COLORS.white, width: "100%" }}>
          <div
            style={{
              opacity: line1Op,
              transform: `translateY(${line1Y}px)`,
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: COLORS.fgMutedOnDark,
              marginBottom: 8,
            }}
          >
            Mais clientes.
          </div>

          <div
            style={{
              opacity: line2Op,
              transform: `translateY(${line2Y}px)`,
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: COLORS.fgMutedOnDark,
              marginBottom: 16,
            }}
          >
            Mais retenção.
          </div>

          <div
            style={{
              opacity: line3Op,
              transform: `scale(${line3Scale})`,
              transformOrigin: "left center",
              fontSize: 128,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: COLORS.accent,
              textShadow: `0 0 60px ${COLORS.accentDark}`,
            }}
          >
            Mais delivery.
          </div>
        </div>
      </AbsoluteFill>

      <Sticker text="0% comissão" emoji="💸" appearAt={60} position="top-right" variant="yellow" size="md" inset={90} />
      <Sticker text="Grátis no piloto" appearAt={110} position="bottom-right" variant="white" size="sm" rotate={-5} inset={110} />
    </AbsoluteFill>
  );
}
