import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

const PASSOS = [
  { n: "1", t: "Abre o mapa", d: "Filtra restaurantes 1.5 km" },
  { n: "2", t: "Adiciona ao CRM", d: "Top 10 viram cards" },
  { n: "3", t: "Visita & propõe", d: "Bate na porta, marca ação" },
  { n: "4", t: "Cadastra", d: "Conta no seu nome em 2 min" },
  { n: "5", t: "PIX cai", d: "Mensal, na chave que você cadastrou" },
];

export function SceneFluxo() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: "#fafafc",
      padding: 80, justifyContent: "center",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 15) }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: "rgba(0,0,0,0.4)", marginBottom: 30 }}>
          DO PROSPECT AO PIX
        </div>
        <div style={{ fontSize: 76, fontWeight: 900, color: COLORS.fg, lineHeight: 1, marginBottom: 50 }}>
          Como é seu dia.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {PASSOS.map((p, i) => {
          const start = 20 + i * 20;
          return (
            <div key={p.n} style={{
              opacity: fadeIn(frame, start, 16),
              transform: `translateX(${slideY(frame, start, 18, 60, 0)}px)`,
              padding: 28, borderRadius: 22,
              background: "#fff",
              border: "2px solid #e4e4e7",
              display: "flex", gap: 28, alignItems: "center",
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "#4338ca", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 56, fontWeight: 900,
                flexShrink: 0,
              }}>{p.n}</div>
              <div>
                <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.fg }}>{p.t}</div>
                <div style={{ fontSize: 26, color: COLORS.fgMuted, marginTop: 4 }}>{p.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
