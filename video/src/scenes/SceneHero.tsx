import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { fadeIn, slideY, popIn } from "../anim";
import { Noise } from "../components/Noise";
import { Blob } from "../components/Blob";
import { Sticker } from "../components/Sticker";

export function SceneHero() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = popIn(frame, 0, fps, { damping: 14 });
  const titleOpacity = fadeIn(frame, 12, 18);
  const titleY = slideY(frame, 12, 18, 40, 0);
  const word2Op = fadeIn(frame, 40, 14);
  const word2Y = slideY(frame, 40, 14, 40, 0);
  const word3Op = fadeIn(frame, 75, 18);
  const word3Scale = popIn(frame, 75, fps, { damping: 12, stiffness: 180 });

  return (
    <AbsoluteFill style={{ background: COLORS.dark, overflow: "hidden" }}>
      <Blob color={COLORS.accent} x={70} y={20} size={70} opacity={0.35} />
      <Blob color={COLORS.blue} x={20} y={85} size={55} opacity={0.5} />
      <Noise opacity={0.04} />

      <AbsoluteFill style={{ padding: 80, justifyContent: "center", alignItems: "flex-start" }}>
        {/* BRAVA+ logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 80,
          }}
        >
          <span style={{ fontSize: 48, fontWeight: 900, color: COLORS.white, letterSpacing: "-0.04em" }}>
            BRAVA
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: COLORS.accent,
              lineHeight: 0.9,
              marginLeft: 6,
              textShadow: `0 0 40px ${COLORS.accent}`,
            }}
          >
            +
          </span>
        </div>

        <div style={{ color: COLORS.white, width: "100%" }}>
          <div
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: COLORS.fgMutedOnDark,
              marginBottom: 16,
            }}
          >
            Pague pouco.
          </div>

          <div
            style={{
              opacity: word2Op,
              transform: `translateY(${word2Y}px)`,
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: COLORS.fgMutedOnDark,
              marginBottom: 30,
            }}
          >
            Economize
          </div>

          <div
            style={{
              opacity: word3Op,
              transform: `scale(${word3Scale})`,
              transformOrigin: "left center",
              fontSize: 168,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: COLORS.accent,
              textShadow: `0 0 60px ${COLORS.accentDark}`,
            }}
          >
            muito.
          </div>
        </div>
      </AbsoluteFill>

      <Sticker text="50+ parceiros" emoji="🏪" appearAt={55} position="top-right" variant="yellow" size="md" inset={90} />
      <Sticker text="7 dias grátis" appearAt={88} position="bottom-right" variant="white" size="sm" rotate={-5} inset={110} />
    </AbsoluteFill>
  );
}
