import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

const ITENS = [
  { e: "🗺️", t: "Mapa Google Places", d: "Lojas reais no raio" },
  { e: "📋", t: "CRM Kanban", d: "7 colunas, drag-and-drop" },
  { e: "📅", t: "Agenda automática", d: "Vem das ações do CRM" },
  { e: "🔗", t: "Links de convite", d: "Tracking de cliques + signups" },
  { e: "🏪", t: "Cadastro assistido", d: "Cliente na sua frente? Cadastra" },
  { e: "💰", t: "Painel de comissão", d: "Histórico + projeção do mês" },
];

export function SceneFerramentas() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COLORS.bg, padding: 80, justifyContent: "center" }}>
      <div style={{ opacity: fadeIn(frame, 0, 15) }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: "rgba(0,0,0,0.4)", marginBottom: 30 }}>
          SEU KIT COMPLETO
        </div>
        <div style={{ fontSize: 76, fontWeight: 900, color: COLORS.fg, lineHeight: 1, marginBottom: 50 }}>
          Tudo pronto pra vender.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {ITENS.map((item, i) => {
          const start = 25 + i * 14;
          return (
            <div key={i} style={{
              opacity: fadeIn(frame, start, 16),
              transform: `translateY(${slideY(frame, start, 18, 30, 0)}px)`,
              padding: 30, borderRadius: 22,
              background: "#fafafc",
              border: "2px solid #f4f4f5",
            }}>
              <div style={{ fontSize: 56 }}>{item.e}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.fg, marginTop: 12 }}>{item.t}</div>
              <div style={{ fontSize: 24, color: COLORS.fgMuted, marginTop: 6 }}>{item.d}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
