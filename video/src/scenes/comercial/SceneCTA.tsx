import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

export function SceneCTA() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${COLORS.dark}, #312e81)`,
      padding: 100, justifyContent: "center", textAlign: "center", color: "#fff",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 20) }}>
        <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1, letterSpacing: -3 }}>
          Bora construir
        </div>
        <div style={{ fontSize: 150, fontWeight: 900, color: COLORS.accent, lineHeight: 1, marginTop: 10, letterSpacing: -4 }}>
          carteira?
        </div>
      </div>
      <div style={{ opacity: fadeIn(frame, 30, 20), transform: `translateY(${slideY(frame, 30, 25, 30, 0)}px)`, marginTop: 60 }}>
        <div style={{ fontSize: 38, color: "rgba(255,255,255,0.75)", marginBottom: 50 }}>
          Mande mensagem · alinhamos território<br/>e tabela de comissão sua
        </div>
        <div style={{
          display: "inline-block",
          background: COLORS.accent,
          color: COLORS.fg,
          padding: "32px 60px",
          borderRadius: 24,
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: -1,
        }}>
          comercial@bravamais.app
        </div>
      </div>
    </AbsoluteFill>
  );
}
