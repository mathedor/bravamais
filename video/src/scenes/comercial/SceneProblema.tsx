import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

const PROBS = [
  { e: "💸", t: "Comissão one-shot", d: "Vende e tem que vender de novo. Renda não compõe." },
  { e: "📝", t: "Excel + WhatsApp", d: "Lead se perde. Nunca sabe quem tá em qual etapa." },
  { e: "🔍", t: "Prospecção na sorte", d: "Bate na porta sem saber quais lojas existem." },
];

export function SceneProblema() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COLORS.bg, padding: 100, justifyContent: "center" }}>
      <div style={{ opacity: fadeIn(frame, 0, 15) }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: "rgba(0,0,0,0.4)", marginBottom: 30 }}>
          A REAL DO COMERCIAL DE RUA
        </div>
        <div style={{ fontSize: 86, fontWeight: 900, color: COLORS.fg, lineHeight: 1, marginBottom: 60 }}>
          Você sente isso?
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {PROBS.map((p, i) => {
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
              <div style={{ fontSize: 84 }}>{p.e}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: COLORS.fg, marginBottom: 8 }}>{p.t}</div>
                <div style={{ fontSize: 28, color: COLORS.fgMuted, lineHeight: 1.3 }}>{p.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
