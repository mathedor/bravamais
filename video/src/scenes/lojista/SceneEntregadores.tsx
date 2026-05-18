import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY, popIn } from "../../anim";

const FREELANCERS = [
  { nome: "Carlos M.",  veiculo: "🛵 Honda 160",  rating: 4.9, entregas: 142, badge: "TOP",        badgeColor: "#10b981" },
  { nome: "Mariana T.", veiculo: "🚗 Fiat Uno",   rating: 4.7, entregas: 87,  badge: "VERIFICADA", badgeColor: "#3b82f6" },
  { nome: "João P.",    veiculo: "🚲 Bike elét.", rating: 4.8, entregas: 64,  badge: "ECO",        badgeColor: "#84cc16" },
];

export function SceneEntregadores() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagOp = fadeIn(frame, 0, 12);
  const titleOp = fadeIn(frame, 10, 14);
  const titleY = slideY(frame, 10, 14, 30, 0);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.whiteBg,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          opacity: tagOp,
          fontSize: 26,
          fontWeight: 800,
          color: COLORS.blue,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Sem entregador?
      </p>

      <h2
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontSize: 84,
          fontWeight: 900,
          color: COLORS.fgOnLight,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        Contrata um direto{" "}
        <span style={{ color: COLORS.blue }}>na plataforma</span>.
      </h2>

      <p
        style={{
          opacity: fadeIn(frame, 22, 12),
          fontSize: 26,
          fontWeight: 500,
          color: COLORS.fgMutedOnLight,
          marginBottom: 40,
        }}
      >
        Freelancers já validados pela equipe BRAVA+ — CNH, RG, CPF e veículo.
      </p>

      {/* Vitrine — 3 cards vertical stack */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FREELANCERS.map((f, i) => {
          const startFrame = 38 + i * 22;
          const op = fadeIn(frame, startFrame, 14);
          const scale = popIn(frame, startFrame, fps, { damping: 14, stiffness: 160 });
          return (
            <div
              key={f.nome}
              style={{
                opacity: op,
                transform: `scale(${scale})`,
                background: COLORS.white,
                borderRadius: 24,
                padding: 22,
                display: "flex",
                alignItems: "center",
                gap: 18,
                boxShadow: "0 14px 36px rgba(10,10,10,0.08)",
                border: `1px solid ${COLORS.borderOnLight}`,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 40,
                  flexShrink: 0,
                }}
              >
                🛵
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: COLORS.fgOnLight, margin: 0 }}>
                    {f.nome}
                  </p>
                  <span
                    style={{
                      background: f.badgeColor,
                      color: "white",
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.15em",
                      padding: "3px 10px",
                      borderRadius: 100,
                    }}
                  >
                    {f.badge}
                  </span>
                </div>
                <p style={{ fontSize: 18, color: COLORS.fgMutedOnLight, margin: 0 }}>{f.veiculo}</p>
                <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 16, fontWeight: 700 }}>
                  <span style={{ color: "#f59e0b" }}>⭐ {f.rating}</span>
                  <span style={{ color: COLORS.fgMutedOnLight }}>{f.entregas} entregas</span>
                </div>
              </div>
              <div
                style={{
                  background: COLORS.dark,
                  color: "white",
                  padding: "12px 22px",
                  borderRadius: 100,
                  fontSize: 16,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                Contratar →
              </div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          opacity: fadeIn(frame, 130, 14),
          marginTop: 30,
          fontSize: 20,
          fontWeight: 600,
          color: COLORS.fgMutedOnLight,
          textAlign: "center",
        }}
      >
        💡 BRAVA+ só faz a ponte. Você paga direto. Sem intermediário.
      </p>
    </AbsoluteFill>
  );
}
