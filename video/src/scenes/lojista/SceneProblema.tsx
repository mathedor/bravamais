import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY, popIn } from "../../anim";

interface ProblemCard {
  emoji: string;
  title: string;
  desc: string;
  highlight?: string;
}

const PROBLEMS: ProblemCard[] = [
  {
    emoji: "😶‍🌫️",
    title: "Sem histórico",
    desc: "Não sabe quem voltou, quem sumiu, quem é fiel.",
  },
  {
    emoji: "💤",
    title: "Hora vazia",
    desc: "3 da tarde, ninguém entra. Sem como avisar a base.",
  },
  {
    emoji: "🛵",
    title: "Delivery caro",
    desc: "Marketplace cobra",
    highlight: "27% de cada venda",
  },
];

export function SceneProblema() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = fadeIn(frame, 0, 14);
  const titleY = slideY(frame, 0, 14, 30, 0);
  const subOp = fadeIn(frame, 15, 14);
  const closingOp = fadeIn(frame, 130, 16);

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
      {/* Tag */}
      <p
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontSize: 26,
          fontWeight: 800,
          color: COLORS.danger,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        O balcão hoje
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
          marginBottom: 0,
        }}
      >
        Cliente entra,<br />
        compra,{" "}
        <span style={{ color: COLORS.danger }}>vai embora</span>.
      </h2>

      <p
        style={{
          opacity: subOp,
          marginTop: 24,
          fontSize: 28,
          fontWeight: 500,
          color: COLORS.fgMutedOnLight,
          marginBottom: 50,
        }}
      >
        Não volta. Não indica. Você nem sabe quem era.
      </p>

      {/* 3 cards de problema */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PROBLEMS.map((p, i) => {
          const startFrame = 30 + i * 22;
          const op = fadeIn(frame, startFrame, 12);
          const scale = popIn(frame, startFrame, fps, { damping: 14, stiffness: 180 });
          return (
            <div
              key={p.title}
              style={{
                opacity: op,
                transform: `scale(${scale})`,
                background: COLORS.white,
                borderRadius: 24,
                padding: "22px 26px",
                display: "flex",
                alignItems: "center",
                gap: 22,
                boxShadow: "0 14px 36px rgba(10,10,10,0.06)",
                border: `1px solid ${COLORS.borderOnLight}`,
              }}
            >
              <span style={{ fontSize: 64 }}>{p.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 30, fontWeight: 900, color: COLORS.fgOnLight, margin: 0 }}>
                  {p.title}
                </p>
                <p style={{ fontSize: 22, fontWeight: 500, color: COLORS.fgMutedOnLight, margin: 0, marginTop: 4 }}>
                  {p.desc}
                  {p.highlight && (
                    <>
                      {" "}
                      <strong style={{ color: COLORS.danger, fontSize: 26, fontWeight: 900 }}>
                        {p.highlight}
                      </strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          opacity: closingOp,
          marginTop: 36,
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.fgOnLight,
          textAlign: "center",
        }}
      >
        E se desse pra <span style={{ color: COLORS.blue }}>mudar tudo isso</span>?
      </p>
    </AbsoluteFill>
  );
}
