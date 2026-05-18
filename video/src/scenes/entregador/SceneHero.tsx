import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

export function SceneHero() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 50%, #7c2d12 100%)`,
      padding: 100,
      justifyContent: "center",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 20), transform: `translateY(${slideY(frame, 0, 25, 40, 0)}px)` }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: COLORS.accent, marginBottom: 40 }}>
          BRAVA<span style={{ color: "#fff" }}>+</span> · ENTREGADORES
        </div>
        <div style={{ fontSize: 130, lineHeight: 1, fontWeight: 900, color: "#fff", letterSpacing: -3 }}>
          Sua moto.
        </div>
        <div style={{ fontSize: 130, lineHeight: 1, fontWeight: 900, color: COLORS.accent, letterSpacing: -3, marginTop: 10 }}>
          Seu horário.
        </div>
        <div style={{ fontSize: 130, lineHeight: 1, fontWeight: 900, color: "#fff", letterSpacing: -3, marginTop: 10 }}>
          Seu ganho.
        </div>
        <div style={{ marginTop: 80, fontSize: 38, color: "rgba(255,255,255,0.75)", lineHeight: 1.3, maxWidth: 800 }}>
          Sem mensalidade. Sem chefe. PIX direto na sua conta.
        </div>
      </div>
    </AbsoluteFill>
  );
}
