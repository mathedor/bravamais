import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

const PROBLEMAS = [
  { emoji: "🤐", titulo: "Algoritmo opaco", body: "Nunca sabe por que rejeitaram. Nota cai sem explicação." },
  { emoji: "💸", titulo: "Mensalidade come o lucro", body: "R$ 30-80/semana + 25-30% do frete." },
  { emoji: "⏳", titulo: "Pagamento demorado", body: "Trabalha hoje, recebe semana que vem." },
];

export function SceneProblema() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COLORS.bg, padding: 100, justifyContent: "center" }}>
      <div style={{ opacity: fadeIn(frame, 0, 15) }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: "rgba(0,0,0,0.4)", marginBottom: 30 }}>
          O QUE CANSA
        </div>
        <div style={{ fontSize: 90, fontWeight: 900, color: COLORS.fg, lineHeight: 1, marginBottom: 60 }}>
          Você passa por isso?
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {PROBLEMAS.map((p, i) => {
          const start = 25 + i * 22;
          return (
            <div key={i} style={{
              opacity: fadeIn(frame, start, 18),
              transform: `translateX(${slideY(frame, start, 22, 60, 0)}px)`,
              padding: 40, borderRadius: 24,
              background: "#fafafc",
              border: "2px solid #f4f4f5",
              display: "flex", gap: 30, alignItems: "center",
            }}>
              <div style={{ fontSize: 88 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: COLORS.fg, marginBottom: 8 }}>{p.titulo}</div>
                <div style={{ fontSize: 30, color: COLORS.fgMuted, lineHeight: 1.3 }}>{p.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
