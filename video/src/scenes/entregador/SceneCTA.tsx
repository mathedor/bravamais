import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

export function SceneCTA() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.darkAlt}, ${COLORS.blue})`,
      padding: 100, justifyContent: "center", textAlign: "center", color: "#fff",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 20) }}>
        <div style={{ fontSize: 130, fontWeight: 900, lineHeight: 1, letterSpacing: -3 }}>
          Pronto pra
        </div>
        <div style={{ fontSize: 160, fontWeight: 900, color: COLORS.accent, lineHeight: 1, marginTop: 10, letterSpacing: -4 }}>
          ganhar mais?
        </div>
      </div>
      <div style={{ opacity: fadeIn(frame, 30, 20), transform: `translateY(${slideY(frame, 30, 25, 30, 0)}px)`, marginTop: 60 }}>
        <div style={{ fontSize: 40, color: "rgba(255,255,255,0.75)", marginBottom: 60 }}>
          Cadastro em 5 minutos · aprovação em 24h<br/>
          Primeira entrega = bônus de R$ 50
        </div>
        <div style={{
          display: "inline-block",
          background: COLORS.accent,
          color: COLORS.fg,
          padding: "32px 60px",
          borderRadius: 24,
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: -1,
        }}>
          brava-mais.vercel.app/seja-entregador
        </div>
      </div>
    </AbsoluteFill>
  );
}
