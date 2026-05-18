import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY, popIn } from "../../anim";

export function ScenePainel() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagOp = fadeIn(frame, 0, 12);
  const titleOp = fadeIn(frame, 10, 14);
  const titleY = slideY(frame, 10, 14, 30, 0);
  const cardScale = popIn(frame, 28, fps, { damping: 14, stiffness: 150 });

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
        Painel da loja
      </p>

      <h2
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontSize: 76,
          fontWeight: 900,
          color: COLORS.fgOnLight,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginTop: 16,
          marginBottom: 40,
        }}
      >
        Tudo na sua{" "}
        <span style={{ color: COLORS.blue }}>palma</span>.
      </h2>

      {/* Painel mockup */}
      <div
        style={{
          transform: `scale(${cardScale})`,
          transformOrigin: "center top",
          background: COLORS.dark,
          borderRadius: 36,
          padding: 20,
          boxShadow: "0 40px 100px rgba(0,0,0,0.25)",
          margin: "0 auto",
          width: "100%",
          maxWidth: 820,
        }}
      >
        <div
          style={{
            background: COLORS.white,
            borderRadius: 24,
            padding: 28,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 14, color: COLORS.fgMutedOnLight, margin: 0, fontWeight: 600 }}>
                Café Mineiro · hoje
              </p>
              <p style={{ fontSize: 30, fontWeight: 900, color: COLORS.fgOnLight, margin: 0, marginTop: 2 }}>
                Olá, lojista 👋
              </p>
            </div>
            <span
              style={{
                background: COLORS.emerald,
                color: COLORS.white,
                padding: "6px 14px",
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              ● Ao vivo
            </span>
          </div>

          {/* KPIs em grid 2x2 — cores BRAVA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Receita BRAVA+ mês", value: "R$ 4.380",  delta: "+38%",          color: COLORS.emerald, start: 42 },
              { label: "Cupons usados",       value: "127",       delta: "+22 vs ontem",  color: COLORS.blue,    start: 52 },
              { label: "Top cliente",         value: "Marina S.", delta: "24 visitas",    color: COLORS.accentDark, start: 62 },
              { label: "Entregas hoje",       value: "18",        delta: "3 esperando",   color: COLORS.danger,  start: 72 },
            ].map((k) => {
              const op = fadeIn(frame, k.start, 10);
              return (
                <div
                  key={k.label}
                  style={{
                    opacity: op,
                    background: COLORS.whiteBg,
                    borderRadius: 16,
                    padding: 16,
                    border: `1px solid ${COLORS.borderOnLight}`,
                  }}
                >
                  <p style={{ fontSize: 12, color: COLORS.fgMutedOnLight, margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {k.label}
                  </p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: COLORS.fgOnLight, margin: 0, marginTop: 4 }}>
                    {k.value}
                  </p>
                  <p style={{ fontSize: 13, color: k.color, margin: 0, marginTop: 2, fontWeight: 800 }}>
                    {k.delta}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Botões de ação */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <div
              style={{
                opacity: fadeIn(frame, 90, 10),
                flex: 1,
                background: COLORS.danger,
                color: COLORS.white,
                padding: "16px 18px",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 900,
                textAlign: "center",
                boxShadow: `0 6px 16px ${COLORS.danger}40`,
              }}
            >
              ⚡ Disparar cupom flash
            </div>
            <div
              style={{
                opacity: fadeIn(frame, 100, 10),
                flex: 1,
                background: COLORS.accent,
                color: COLORS.fgOnLight,
                padding: "16px 18px",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 900,
                textAlign: "center",
                boxShadow: `0 6px 16px ${COLORS.accentDark}40`,
              }}
            >
              🛵 Ver entregadores
            </div>
          </div>

          {/* Alerta de churn */}
          <div
            style={{
              opacity: fadeIn(frame, 115, 10),
              marginTop: 14,
              background: `${COLORS.danger}10`,
              border: `1px solid ${COLORS.danger}30`,
              borderRadius: 14,
              padding: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 28 }}>⚠️</span>
            <p style={{ fontSize: 14, color: COLORS.danger, margin: 0, fontWeight: 700 }}>
              <strong>5 clientes recorrentes</strong> sumiram há 30 dias —{" "}
              <span style={{ textDecoration: "underline" }}>enviar cupom retenção</span>
            </p>
          </div>
        </div>
      </div>

      <p
        style={{
          opacity: fadeIn(frame, 145, 12),
          marginTop: 28,
          fontSize: 22,
          fontWeight: 600,
          color: COLORS.fgMutedOnLight,
          textAlign: "center",
        }}
      >
        Receita, CRM, BI, blast, alertas. Tudo num só lugar.
      </p>
    </AbsoluteFill>
  );
}
