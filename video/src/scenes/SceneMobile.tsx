import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { fadeIn, slideY, popIn } from "../anim";
import { Sticker } from "../components/Sticker";

export function SceneMobile() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = fadeIn(frame, 0, 14);
  const phoneScale = popIn(frame, 8, fps, { damping: 14, stiffness: 150 });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
        padding: 80,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${slideY(frame, 0, 14, 30, 0)}px)`,
          fontSize: 80,
          fontWeight: 900,
          color: COLORS.fgOnLight,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginBottom: 40,
        }}
      >
        Abre o app.<br />
        <span style={{ color: COLORS.blue }}>Mostra o QR.</span>
      </div>

      {/* Phone */}
      <div
        style={{
          transform: `scale(${phoneScale})`,
          transformOrigin: "center top",
          margin: "0 auto",
          width: 560,
          height: 1100,
          borderRadius: 64,
          background: COLORS.dark,
          padding: 18,
          boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 32,
            left: "50%",
            transform: "translateX(-50%)",
            width: 140,
            height: 32,
            borderRadius: 18,
            background: "#000",
            zIndex: 2,
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 52,
            background: COLORS.dark,
            overflow: "hidden",
            padding: 40,
            paddingTop: 100,
            color: COLORS.white,
            display: "flex",
            flexDirection: "column",
            gap: 30,
          }}
        >
          <div style={{ opacity: fadeIn(frame, 25, 12) }}>
            <p style={{ fontSize: 18, color: COLORS.fgMutedOnDark, margin: 0 }}>Oi, Mathe 👋</p>
            <p style={{ fontSize: 34, fontWeight: 900, marginTop: 8, marginBottom: 0 }}>
              Carteirinha BRAVA<span style={{ color: COLORS.accent }}>+</span>
            </p>
          </div>

          <div
            style={{
              opacity: fadeIn(frame, 45, 14),
              transform: `scale(${popIn(frame, 45, fps, { damping: 14, stiffness: 200 })})`,
              background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
              borderRadius: 32,
              padding: 32,
              color: COLORS.fgOnLight,
              boxShadow: `0 30px 60px ${COLORS.accentDark}80`,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", opacity: 0.7, margin: 0 }}>
              VIP MEMBER
            </p>
            <div
              style={{
                marginTop: 16,
                width: 200,
                height: 200,
                background: "#fff",
                borderRadius: 16,
                margin: "16px auto",
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gridTemplateRows: "repeat(12, 1fr)",
                padding: 14,
                gap: 3,
              }}
            >
              {Array.from({ length: 144 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: ((i * 37 + 11) % 3 === 0) ? "#0A0A0A" : "transparent",
                    borderRadius: 1,
                  }}
                />
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: "0.1em" }}>
              BRAVA-9X4M2K
            </p>
          </div>

          <div
            style={{
              opacity: fadeIn(frame, 80, 14),
              transform: `translateY(${slideY(frame, 80, 14, 30, 0)}px)`,
              background: COLORS.white,
              color: COLORS.fgOnLight,
              borderRadius: 22,
              padding: 22,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <span style={{ fontSize: 48 }}>🎟️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.fgMutedOnLight, margin: 0 }}>
                CUPOM ATIVO
              </p>
              <p style={{ fontSize: 28, fontWeight: 900, margin: 0, marginTop: 4 }}>
                -20% no Café Mineiro
              </p>
            </div>
          </div>
        </div>
      </div>

      <Sticker text="+5 coins" emoji="🪙" appearAt={110} position="top-right" variant="success" size="md" rotate={8} inset={90} />
      <Sticker text="Fidelidade ★" appearAt={140} position="middle-left" variant="dark" size="sm" rotate={-6} inset={50} />
    </AbsoluteFill>
  );
}
