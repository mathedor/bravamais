import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn } from "../../anim";

export function SceneCalculadora() {
  const frame = useCurrentFrame();
  const m1 = Math.round(interpolate(frame, [20, 60], [0, 530], { extrapolateRight: "clamp" }));
  const m6 = Math.round(interpolate(frame, [80, 140], [0, 2478], { extrapolateRight: "clamp" }));
  const m12 = Math.round(interpolate(frame, [160, 220], [0, 7396], { extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #ffffff 100%)`,
      padding: 80, justifyContent: "center",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 15) }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: "#4338ca", marginBottom: 30 }}>
          A GRANDE SACADA
        </div>
        <div style={{ fontSize: 76, fontWeight: 900, color: COLORS.fg, lineHeight: 1, marginBottom: 14 }}>
          Sua carteira <span style={{ color: "#4338ca" }}>compõe</span>.
        </div>
        <div style={{ fontSize: 30, color: COLORS.fgMuted, marginBottom: 50 }}>
          Cada mês você adiciona EM CIMA do que já tem.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <MesCard mes="Mês 1 (iniciante)" valor={`R$ ${m1}`} det="3 estabs + 10 subs novos" tone="light" />
        <MesCard mes="Mês 6 (em construção)" valor={`R$ ${m6.toLocaleString("pt-BR")}`} det="20 estabs ativos + 60 subs" tone="mid" />
        <MesCard mes="Mês 12 (carteira sólida)" valor={`R$ ${m12.toLocaleString("pt-BR")}`} det="50 estabs ativos + 200 subs" tone="strong" big />
      </div>
    </AbsoluteFill>
  );
}

function MesCard({ mes, valor, det, tone, big }: { mes: string; valor: string; det: string; tone: "light" | "mid" | "strong"; big?: boolean }) {
  const bg = tone === "strong" ? "linear-gradient(135deg, #4338ca, #6366f1)" : tone === "mid" ? "linear-gradient(135deg, #818cf8, #a5b4fc)" : "linear-gradient(135deg, #c7d2fe, #e0e7ff)";
  const fg = tone === "strong" ? "#fff" : tone === "mid" ? "#1e1b4b" : "#312e81";
  return (
    <div style={{ padding: big ? 50 : 36, borderRadius: 28, background: bg, color: fg, boxShadow: big ? "0 30px 80px rgba(67,56,202,0.3)" : "0 10px 30px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>{mes}</div>
      <div style={{ fontSize: big ? 140 : 92, fontWeight: 900, lineHeight: 1, letterSpacing: -3 }}>{valor}</div>
      <div style={{ fontSize: 26, marginTop: 12, opacity: 0.85 }}>{det}</div>
    </div>
  );
}
