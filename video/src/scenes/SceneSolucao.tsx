import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { fadeIn, slideY, popIn } from "../anim";
import { Blob } from "../components/Blob";

const PERKS = [
  { emoji: "🎟️", label: "Cupons" },
  { emoji: "⭐", label: "Fidelidade" },
  { emoji: "🎁", label: "Vale-presente" },
  { emoji: "💳", label: "Carteirinha QR" },
  { emoji: "🪙", label: "Coins / cashback" },
  { emoji: "🛵", label: "Delivery integrado" },
];

export function SceneSolucao() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: COLORS.dark, padding: 80, justifyContent: "center", overflow: "hidden" }}>
      <Blob color={COLORS.accent} x={80} y={15} size={50} opacity={0.3} />
      <Blob color={COLORS.blue} x={15} y={88} size={50} opacity={0.4} />

      <div
        style={{
          opacity: fadeIn(frame, 0, 14),
          transform: `translateY(${slideY(frame, 0, 14, 40, 0)}px)`,
          fontSize: 96,
          fontWeight: 900,
          color: COLORS.white,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginBottom: 16,
        }}
      >
        Um clube.
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 22, 14),
          transform: `translateY(${slideY(frame, 22, 14, 40, 0)}px)`,
          fontSize: 96,
          fontWeight: 900,
          color: COLORS.fgMutedOnDark,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginBottom: 24,
        }}
      >
        Dezenas de parceiros.
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 44, 14),
          transform: `scale(${popIn(frame, 44, fps, { damping: 12, stiffness: 180 })})`,
          transformOrigin: "left center",
          fontSize: 124,
          fontWeight: 900,
          color: COLORS.accent,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: 60,
          textShadow: `0 0 60px ${COLORS.accentDark}`,
        }}
      >
        Tudo num app só.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {PERKS.map((p, i) => {
          const op = fadeIn(frame, 70 + i * 6, 12);
          const scale = popIn(frame, 70 + i * 6, fps, { damping: 13, stiffness: 200 });
          return (
            <div
              key={p.label}
              style={{
                opacity: op,
                transform: `scale(${scale})`,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.borderOnDark}`,
                borderRadius: 22,
                padding: 18,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 44 }}>{p.emoji}</div>
              <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.white, marginTop: 6, marginBottom: 0 }}>
                {p.label}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
