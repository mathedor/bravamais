import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn } from "../../anim";

export function SceneCalculadora() {
  const frame = useCurrentFrame();
  const dailyTarget = 480;
  const monthlyTarget = 9600;
  const daily = Math.round(interpolate(frame, [20, 100], [0, dailyTarget], { extrapolateRight: "clamp" }));
  const monthly = Math.round(interpolate(frame, [120, 200], [0, monthlyTarget], { extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #ffffff 100%)`,
      padding: 100, justifyContent: "center",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 15) }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: "#b45309", marginBottom: 30 }}>
          FAZ A CONTA
        </div>
        <div style={{ fontSize: 84, fontWeight: 900, color: COLORS.fg, lineHeight: 1, marginBottom: 60 }}>
          Ganho real
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        <Card
          label="Por dia médio (6h trabalhadas)"
          valor={`R$ ${daily}`}
          detalhes="32 entregas · 5 km média · bônus de pico almoço"
          tone="amber"
        />
        <Card
          label="Por mês (5-6 dias/semana)"
          valor={`R$ ${monthly.toLocaleString("pt-BR")}`}
          detalhes="Sem mensalidade. Sem 30% de comissão. PIX direto."
          tone="emerald"
          big
        />
      </div>
    </AbsoluteFill>
  );
}

function Card({ label, valor, detalhes, tone, big }: { label: string; valor: string; detalhes: string; tone: "amber" | "emerald"; big?: boolean }) {
  const bg = tone === "emerald" ? "linear-gradient(135deg, #ecfdf5, #d1fae5)" : "linear-gradient(135deg, #fef3c7, #fed7aa)";
  const accent = tone === "emerald" ? "#059669" : "#d97706";
  return (
    <div style={{
      padding: 50, borderRadius: 32,
      background: bg,
      border: `3px solid ${accent}`,
      boxShadow: big ? "0 30px 80px rgba(0,0,0,0.15)" : "0 10px 30px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
        {label}
      </div>
      <div style={{ fontSize: big ? 200 : 130, fontWeight: 900, color: accent, lineHeight: 1, letterSpacing: -3 }}>
        {valor}
      </div>
      <div style={{ marginTop: 18, fontSize: 28, color: COLORS.fgMuted }}>
        {detalhes}
      </div>
    </div>
  );
}
