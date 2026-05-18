import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

const PILARES = [
  { n: "01", t: "Você decide", d: "Online/offline quando quiser. Sem meta forçada." },
  { n: "02", t: "Ganho transparente", d: "Vê distância + ganho antes de aceitar." },
  { n: "03", t: "PIX direto", d: "Diário ou semanal. Sem taxa de antecipação." },
];

export function ScenePilares() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.blue} 100%)`,
      padding: 100, justifyContent: "center", color: "#fff",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 15) }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: COLORS.accent, marginBottom: 30 }}>
          COMO FUNCIONA
        </div>
        <div style={{ fontSize: 90, fontWeight: 900, lineHeight: 1, marginBottom: 60 }}>
          3 mudanças.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {PILARES.map((p, i) => {
          const start = 25 + i * 25;
          return (
            <div key={p.n} style={{
              opacity: fadeIn(frame, start, 18),
              transform: `translateY(${slideY(frame, start, 22, 30, 0)}px)`,
              padding: 36, borderRadius: 24,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", gap: 30, alignItems: "center",
            }}>
              <div style={{ fontSize: 70, fontWeight: 900, color: COLORS.accent, fontFamily: "monospace", minWidth: 130 }}>{p.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 46, fontWeight: 900, marginBottom: 8 }}>{p.t}</div>
                <div style={{ fontSize: 30, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>{p.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
