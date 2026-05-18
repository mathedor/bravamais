import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY } from "../../anim";

const LINHAS = [
  { label: "+8 clientes novos × R$ 45",         valor: 360,   start: 35 },
  { label: "+35% conversão fidelidade",         valor: 1260,  start: 60 },
  { label: "+6 entregas/dia × R$ 45 × 26 dias", valor: 7020,  start: 85 },
];

const TOTAL = LINHAS.reduce((s, l) => s + l.valor, 0); // 8640
const PCT_INCREMENTO = 38;

function brl(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

export function SceneCalculadora() {
  const frame = useCurrentFrame();

  const tagOp = fadeIn(frame, 0, 12);
  const titleOp = fadeIn(frame, 10, 14);
  const titleY = slideY(frame, 10, 14, 30, 0);

  const animatedTotal = interpolate(frame, [115, 150], [0, TOTAL], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          color: COLORS.emerald,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Faça a conta
      </p>

      <h2
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontSize: 72,
          fontWeight: 900,
          color: COLORS.fgOnLight,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginTop: 16,
          marginBottom: 12,
        }}
      >
        Quanto BRAVA+{" "}
        <span style={{ color: COLORS.emerald }}>soma na sua receita</span>?
      </h2>

      <p
        style={{
          opacity: fadeIn(frame, 22, 12),
          fontSize: 22,
          fontWeight: 600,
          color: COLORS.fgMutedOnLight,
          margin: 0,
          marginBottom: 28,
        }}
      >
        Loja típica: <strong>40 clientes/dia · ticket R$ 45 · 26 dias</strong>
      </p>

      {/* 3 linhas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LINHAS.map((l) => {
          const op = fadeIn(frame, l.start, 12);
          const x = interpolate(frame, [l.start, l.start + 14], [-40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
          return (
            <div
              key={l.label}
              style={{
                opacity: op,
                transform: `translateX(${x}px)`,
                background: COLORS.white,
                border: `1px solid ${COLORS.borderOnLight}`,
                borderRadius: 18,
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                boxShadow: "0 6px 18px rgba(10,10,10,0.04)",
              }}
            >
              <p style={{ fontSize: 22, fontWeight: 700, color: COLORS.fgOnLight, margin: 0 }}>
                {l.label}
              </p>
              <p style={{ fontSize: 30, fontWeight: 900, color: COLORS.emerald, margin: 0, fontFamily: "monospace" }}>
                +{brl(l.valor)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Total grande */}
      <div
        style={{
          opacity: fadeIn(frame, 108, 14),
          marginTop: 24,
          background: COLORS.dark,
          color: COLORS.white,
          borderRadius: 28,
          padding: "28px 36px",
          textAlign: "center",
          boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
        }}
      >
        <p
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: COLORS.accent,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Receita extra · mês
        </p>
        <p
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: COLORS.accent,
            margin: 0,
            marginTop: 8,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            fontFamily: "monospace",
          }}
        >
          +{brl(animatedTotal)}
        </p>
        <p
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.fgMutedOnDark,
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          = <span style={{ color: COLORS.emeraldLight }}>+{PCT_INCREMENTO}%</span> acima da receita atual
        </p>
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 155, 14),
          marginTop: 14,
          fontSize: 22,
          fontWeight: 700,
          color: COLORS.fgMutedOnLight,
          textAlign: "center",
        }}
      >
        Anualizado:{" "}
        <strong style={{ color: COLORS.emerald, fontSize: 28 }}>+{brl(TOTAL * 12)}</strong>{" "}
        a mais no caixa
      </div>
    </AbsoluteFill>
  );
}
