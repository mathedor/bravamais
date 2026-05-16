import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { fadeIn, popIn, slideY } from "../anim";

const PINS = [
  { x: 18, y: 32, delay: 30 },
  { x: 38, y: 18, delay: 36 },
  { x: 62, y: 26, delay: 42 },
  { x: 82, y: 38, delay: 48 },
  { x: 28, y: 52, delay: 54 },
  { x: 56, y: 56, delay: 60 },
  { x: 76, y: 62, delay: 66 },
  { x: 22, y: 72, delay: 72 },
  { x: 48, y: 78, delay: 78 },
  { x: 70, y: 84, delay: 84 },
];

export function SceneDesktop() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: COLORS.dark, padding: 80, overflow: "hidden" }}>
      <div
        style={{
          opacity: fadeIn(frame, 0, 14),
          transform: `translateY(${slideY(frame, 0, 14, 30, 0)}px)`,
          fontSize: 84,
          fontWeight: 900,
          color: COLORS.white,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginBottom: 16,
        }}
      >
        Parceiros{" "}
        <span style={{ color: COLORS.accent }}>perto de você</span>.
      </div>
      <div
        style={{
          opacity: fadeIn(frame, 15, 14),
          fontSize: 26,
          fontWeight: 500,
          color: COLORS.fgMutedOnDark,
          marginBottom: 30,
        }}
      >
        Mapa ao vivo. Filtro por categoria. Geo-push quando você chega perto.
      </div>

      <div
        style={{
          flex: 1,
          background: `radial-gradient(ellipse at 30% 30%, ${COLORS.blue}40 0%, ${COLORS.darkAlt} 60%)`,
          borderRadius: 32,
          border: `1px solid ${COLORS.borderOnDark}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h${i}`} x1="0" x2="100%" y1={`${i * 10}%`} y2={`${i * 10}%`} stroke="white" strokeWidth="1" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={`${i * 10}%`} x2={`${i * 10}%`} y1="0" y2="100%" stroke="white" strokeWidth="1" />
          ))}
        </svg>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 28,
            height: 28,
            background: COLORS.blue,
            border: "4px solid white",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 0 8px ${COLORS.blue}40, 0 0 40px ${COLORS.blueBright}`,
            zIndex: 5,
          }}
        />

        {PINS.map((pin, i) => {
          const op = fadeIn(frame, pin.delay, 8);
          const scale = popIn(frame, pin.delay, fps, { damping: 12, stiffness: 220 });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: `translate(-50%, -100%) scale(${scale})`,
                opacity: op,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50% 50% 50% 0",
                  background: COLORS.accent,
                  border: `3px solid ${COLORS.blue}`,
                  transform: "rotate(-45deg)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ transform: "rotate(45deg)", color: COLORS.dark, fontSize: 26, fontWeight: 900 }}>+</span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 100, 14),
          marginTop: 24,
          display: "flex",
          gap: 14,
          justifyContent: "center",
        }}
      >
        {[
          { v: "50+", l: "parceiros" },
          { v: "15", l: "categorias" },
          { v: "10", l: "bairros" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${COLORS.borderOnDark}`,
              borderRadius: 18,
              padding: "18px 28px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <p style={{ fontSize: 44, fontWeight: 900, color: COLORS.accent, margin: 0, lineHeight: 1 }}>{s.v}</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.fgMutedOnDark, margin: 0, marginTop: 6 }}>{s.l}</p>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}
