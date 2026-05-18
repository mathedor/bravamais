import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

const PILARES = [
  { n: "01", t: "Comissão recorrente", d: "Não vende e some. Continua ganhando por meses configurados." },
  { n: "02", t: "Plataforma pronta", d: "Cadastra pelo painel — conta sai com seu vínculo automático." },
  { n: "03", t: "Mapa Google Places", d: "Lojas reais no raio. Pinos = oportunidades pro CRM." },
];

export function ScenePilares() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.blue})`,
      padding: 100, justifyContent: "center", color: "#fff",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 15) }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: COLORS.accent, marginBottom: 30 }}>
          COMO BRAVA+ RESOLVE
        </div>
        <div style={{ fontSize: 86, fontWeight: 900, lineHeight: 1, marginBottom: 60 }}>
          3 alavancas.
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
                <div style={{ fontSize: 44, fontWeight: 900, marginBottom: 8 }}>{p.t}</div>
                <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>{p.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
