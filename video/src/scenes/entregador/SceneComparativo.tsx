import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn } from "../../anim";

const ROWS = [
  ["Mensalidade", "R$ 30-80/sem", "R$ 0"],
  ["Comissão s/ frete", "25-30%", "0%"],
  ["Pagamento", "7 dias", "Diário/sem"],
  ["Antecipação", "Com taxa", "Grátis"],
  ["Suporte humano", "Quase nunca", "24/7"],
  ["Bloqueio por recusa", "Frequente", "Nunca"],
];

export function SceneComparativo() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: COLORS.dark,
      padding: 80, justifyContent: "center", color: "#fff",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 15) }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: COLORS.accent, marginBottom: 30 }}>
          VS CONCORRÊNCIA
        </div>
        <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, marginBottom: 50 }}>
          Por que BRAVA+?
        </div>
      </div>
      <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: 28, background: "rgba(255,255,255,0.06)", fontSize: 22, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
          <div></div>
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.7)" }}>Outros</div>
          <div style={{ textAlign: "center", color: COLORS.accent }}>BRAVA+</div>
        </div>
        {ROWS.map((r, i) => {
          const start = 25 + i * 12;
          return (
            <div key={i} style={{
              opacity: fadeIn(frame, start, 15),
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
              padding: 30,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              fontSize: 30,
            }}>
              <div style={{ fontWeight: 700 }}>{r[0]}</div>
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)" }}>{r[1]}</div>
              <div style={{ textAlign: "center", color: COLORS.accent, fontWeight: 900 }}>{r[2]}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
