import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../constants";
import { fadeIn, slideY } from "../anim";

const ITENS = [
  { emoji: "🥗", label: "Almoço 8x",   antes: 400, depois: 352 }, // 12% off
  { emoji: "🏋️", label: "Academia",   antes: 130, depois: 104 }, // 20% off
  { emoji: "💇", label: "Corte",      antes: 60,  depois: 51  }, // 15% off
  { emoji: "🛵", label: "Delivery 6x", antes: 270, depois: 238 }, // 12% off
];

const TOTAL_ECONOMIA = ITENS.reduce((s, i) => s + (i.antes - i.depois), 0);

function brl(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function SceneCalculadora() {
  const frame = useCurrentFrame();

  const animatedTotal = interpolate(frame, [95, 130], [0, TOTAL_ECONOMIA], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.whiteBg, padding: 80, justifyContent: "center" }}>
      <div
        style={{
          opacity: fadeIn(frame, 0, 14),
          transform: `translateY(${slideY(frame, 0, 14, 30, 0)}px)`,
          fontSize: 80,
          fontWeight: 900,
          color: COLORS.fgOnLight,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginBottom: 12,
        }}
      >
        Faça a conta.
      </div>
      <div
        style={{
          opacity: fadeIn(frame, 12, 14),
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.fgMutedOnLight,
          marginBottom: 40,
        }}
      >
        Hábitos comuns × descontos BRAVA+
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 30 }}>
        {ITENS.map((it, i) => {
          const op = fadeIn(frame, 25 + i * 10, 12);
          return (
            <div
              key={it.label}
              style={{
                opacity: op,
                background: COLORS.white,
                borderRadius: 22,
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                gap: 22,
                boxShadow: "0 8px 24px rgba(10,10,10,0.06)",
                border: `1px solid ${COLORS.borderOnLight}`,
              }}
            >
              <span style={{ fontSize: 48 }}>{it.emoji}</span>
              <p style={{ flex: 1, fontSize: 28, fontWeight: 700, margin: 0, color: COLORS.fgOnLight }}>
                {it.label}
              </p>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: COLORS.fgMutedOnLight,
                    textDecoration: "line-through",
                    margin: 0,
                  }}
                >
                  {brl(it.antes)}
                </p>
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: COLORS.emerald,
                    margin: 0,
                    marginTop: 2,
                  }}
                >
                  {brl(it.depois)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          opacity: fadeIn(frame, 85, 14),
          background: COLORS.dark,
          color: COLORS.white,
          borderRadius: 32,
          padding: 40,
          textAlign: "center",
          boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
        }}
      >
        <p
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.accent,
            letterSpacing: "0.2em",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Você economiza
        </p>
        <p
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: COLORS.accent,
            margin: 0,
            marginTop: 10,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {brl(animatedTotal)}
        </p>
        <p
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.fgMutedOnDark,
            marginTop: 14,
            marginBottom: 0,
          }}
        >
          só num mês · BRAVA+ Básico custa R$ 19,90
        </p>
      </div>
    </AbsoluteFill>
  );
}
