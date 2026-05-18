import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

export function SceneHero() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.darkAlt} 50%, #312e81 100%)`,
      padding: 100, justifyContent: "center",
    }}>
      <div style={{ opacity: fadeIn(frame, 0, 20), transform: `translateY(${slideY(frame, 0, 25, 40, 0)}px)` }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: 6, color: COLORS.accent, marginBottom: 40 }}>
          BRAVA<span style={{ color: "#fff" }}>+</span> · COMERCIAIS
        </div>
        <div style={{ fontSize: 110, lineHeight: 1, fontWeight: 900, color: "#fff", letterSpacing: -3 }}>
          Sua comissão
        </div>
        <div style={{ fontSize: 110, lineHeight: 1, fontWeight: 900, color: COLORS.accent, letterSpacing: -3, marginTop: 10 }}>
          recorrente
        </div>
        <div style={{ fontSize: 110, lineHeight: 1, fontWeight: 900, color: "#fff", letterSpacing: -3, marginTop: 10 }}>
          começa hoje.
        </div>
        <div style={{ marginTop: 80, fontSize: 36, color: "rgba(255,255,255,0.75)", lineHeight: 1.3, maxWidth: 850 }}>
          Cadastra clientes BRAVA+ na rua. Ganha por meses, enquanto eles estiverem ativos.
        </div>
      </div>
    </AbsoluteFill>
  );
}
