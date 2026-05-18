import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY, popIn } from "../../anim";

const ITENS = [
  { emoji: "☕", label: "Café",     valor: "R$ 18" },
  { emoji: "🥗", label: "Almoço",   valor: "R$ 50" },
  { emoji: "🍝", label: "Jantar",   valor: "R$ 120" },
  { emoji: "🏋️", label: "Academia", valor: "R$ 130" },
  { emoji: "💇", label: "Corte",    valor: "R$ 60" },
  { emoji: "🛵", label: "Delivery", valor: "R$ 45" },
];

export function SceneProblema() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = fadeIn(frame, 0, 14);
  const titleY = slideY(frame, 0, 14, 40, 0);
  const xWord = fadeIn(frame, 90, 18);

  return (
    <AbsoluteFill style={{ background: COLORS.whiteBg, padding: 80, justifyContent: "center" }}>
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontSize: 92,
          fontWeight: 900,
          color: COLORS.fgOnLight,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginBottom: 60,
        }}
      >
        Todo dia<br />
        você <span style={{ color: COLORS.danger }}>gasta</span>.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 50 }}>
        {ITENS.map((it, i) => {
          const op = fadeIn(frame, 20 + i * 8, 12);
          const scale = popIn(frame, 20 + i * 8, fps, { damping: 14, stiffness: 180 });
          return (
            <div
              key={it.label}
              style={{
                opacity: op,
                transform: `scale(${scale})`,
                background: COLORS.white,
                borderRadius: 28,
                padding: 28,
                display: "flex",
                alignItems: "center",
                gap: 18,
                boxShadow: "0 14px 40px rgba(10,10,10,0.08)",
                border: `1px solid ${COLORS.borderOnLight}`,
              }}
            >
              <span style={{ fontSize: 56 }}>{it.emoji}</span>
              <div>
                <p style={{ fontSize: 22, fontWeight: 700, color: COLORS.fgOnLight, margin: 0 }}>{it.label}</p>
                <p style={{ fontSize: 32, fontWeight: 900, color: COLORS.danger, margin: 0, marginTop: 2 }}>
                  {it.valor}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          opacity: xWord,
          fontSize: 72,
          fontWeight: 900,
          color: COLORS.danger,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        Sem desconto algum.
      </div>
    </AbsoluteFill>
  );
}
