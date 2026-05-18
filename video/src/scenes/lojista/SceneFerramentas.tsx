import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FERRAMENTA_FRAMES } from "../../constants";
import { fadeIn, popIn } from "../../anim";

interface Ferramenta {
  emoji: string;
  nome: string;
  punch: string;
  mock: React.ReactNode;
}

const FERRAMENTAS: Ferramenta[] = [
  {
    emoji: "🎟️",
    nome: "Cupom de desconto",
    punch: "% ou R$ off · código único",
    mock: <CupomMock />,
  },
  {
    emoji: "⭐",
    nome: "Clube de fidelidade",
    punch: "X visitas = brinde automático",
    mock: <FidelidadeMock />,
  },
  {
    emoji: "🎁",
    nome: "Vale-presente",
    punch: "Receita antecipada da loja",
    mock: <ValePresenteMock />,
  },
  {
    emoji: "🪙",
    nome: "BRAVA Coins",
    punch: "1% cashback · vira desconto",
    mock: <CoinsMock />,
  },
  {
    emoji: "📸",
    nome: "Stories interativos",
    punch: "Igual Insta · com cupom dentro",
    mock: <StoriesMock />,
  },
  {
    emoji: "🎰",
    nome: "Roleta de prêmios",
    punch: "Cliente gira no check-in",
    mock: <RoletaMock />,
  },
  {
    emoji: "⚡",
    nome: "Cupom flash / Blast",
    punch: "Hora vazia? Dispara agora",
    mock: <BlastMock />,
  },
  {
    emoji: "🪑",
    nome: "Mesa QR (sem garçom)",
    punch: "Cliente pede pelo app · cozinha na TV",
    mock: <EmbaixadorMock />,
  },
  {
    emoji: "📊",
    nome: "Benchmark anônimo",
    punch: "Você vs média da categoria",
    mock: <IndiqueMock />,
  },
];

export function SceneFerramentas() {
  return (
    <AbsoluteFill style={{ background: COLORS.whiteBg }}>
      {/* Headline persistente no topo */}
      <Header />

      {/* Cards em sequência */}
      {FERRAMENTAS.map((f, i) => (
        <Sequence
          key={f.nome}
          from={i * FERRAMENTA_FRAMES}
          durationInFrames={FERRAMENTA_FRAMES + 5}
        >
          <FerramentaCard ferramenta={f} index={i} total={FERRAMENTAS.length} />
        </Sequence>
      ))}

      {/* Progress bar embaixo */}
      <ProgressIndicator />
    </AbsoluteFill>
  );
}

function Header() {
  const frame = useCurrentFrame();
  const op = fadeIn(frame, 0, 12);
  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 80,
        right: 80,
        opacity: op,
        zIndex: 5,
      }}
    >
      <p
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: COLORS.blue,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        9 ferramentas no seu painel
      </p>
      <h2
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: COLORS.fgOnLight,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginTop: 12,
          marginBottom: 0,
        }}
      >
        Atrair, fidelizar e <span style={{ color: COLORS.blue }}>vender mais</span>.
      </h2>
    </div>
  );
}

function FerramentaCard({ ferramenta, index, total }: { ferramenta: Ferramenta; index: number; total: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrada: slide da direita + scale
  const scale = popIn(frame, 0, fps, { damping: 14, stiffness: 150 });
  const x = interpolate(frame, [0, 10], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 4),
  });

  // Saída: fade out + leve slide pra esquerda
  const exitOp = interpolate(frame, [FERRAMENTA_FRAMES - 6, FERRAMENTA_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitX = interpolate(frame, [FERRAMENTA_FRAMES - 6, FERRAMENTA_FRAMES], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        padding: 80,
        paddingTop: 360,
        paddingBottom: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        opacity: exitOp,
        transform: `translateX(${x + exitX}px)`,
      }}
    >
      {/* Contador */}
      <p
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: COLORS.fgMutedOnLight,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          margin: 0,
          marginBottom: 12,
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>

      {/* Card grande centralizado */}
      <div
        style={{
          transform: `scale(${scale})`,
          background: COLORS.white,
          borderRadius: 32,
          padding: 36,
          boxShadow: "0 30px 80px rgba(10,10,10,0.10)",
          border: `1px solid ${COLORS.borderOnLight}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
              display: "grid",
              placeItems: "center",
              fontSize: 64,
              flexShrink: 0,
              boxShadow: `0 12px 30px ${COLORS.accentDark}40`,
            }}
          >
            {ferramenta.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: 50,
                fontWeight: 900,
                color: COLORS.fgOnLight,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              {ferramenta.nome}
            </h3>
            <p
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: COLORS.blue,
                margin: 0,
                marginTop: 6,
              }}
            >
              {ferramenta.punch}
            </p>
          </div>
        </div>

        {/* Mockup */}
        <div style={{ marginTop: 8 }}>{ferramenta.mock}</div>
      </div>
    </AbsoluteFill>
  );
}

function ProgressIndicator() {
  const frame = useCurrentFrame();
  const total = FERRAMENTA_FRAMES * 9;
  const pct = Math.min(1, frame / total);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 80,
        right: 80,
        zIndex: 5,
      }}
    >
      <div
        style={{
          height: 8,
          background: "rgba(10,10,10,0.08)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct * 100}%`,
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDark})`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// Mockups individuais
// ============================================================

function CupomMock() {
  return (
    <div
      style={{
        border: `3px dashed ${COLORS.accentDark}`,
        background: `${COLORS.accent}15`,
        borderRadius: 20,
        padding: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <span
          style={{
            background: COLORS.white,
            padding: "8px 14px",
            borderRadius: 8,
            fontFamily: "monospace",
            fontSize: 18,
            fontWeight: 900,
            color: COLORS.fgOnLight,
            letterSpacing: "0.1em",
          }}
        >
          CAFE15
        </span>
        <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.fgOnLight, margin: 0, marginTop: 8 }}>
          Desconto na primeira visita
        </p>
      </div>
      <p style={{ fontSize: 64, fontWeight: 900, color: COLORS.blue, margin: 0, letterSpacing: "-0.04em" }}>
        -15%
      </p>
    </div>
  );
}

function FidelidadeMock() {
  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color: COLORS.fgOnLight, margin: 0 }}>
        A cada 8 cafés = 1 grátis
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div
            key={n}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              background: n <= 5 ? COLORS.accent : "rgba(10,10,10,0.08)",
              border: n <= 5 ? `2px solid ${COLORS.accentDark}` : "none",
              display: "grid",
              placeItems: "center",
              fontSize: 20,
            }}
          >
            {n <= 5 ? "☕" : ""}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 16, color: COLORS.fgMutedOnLight, margin: 0, marginTop: 10, fontWeight: 700 }}>
        5/8 visitas · faltam 3
      </p>
    </div>
  );
}

function ValePresenteMock() {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
        borderRadius: 20,
        padding: 24,
        color: COLORS.fgOnLight,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 36 }}>🎁</span>
        <span
          style={{
            background: "rgba(10,10,10,0.15)",
            padding: "4px 12px",
            borderRadius: 100,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Vale-presente
        </span>
      </div>
      <p style={{ fontSize: 36, fontWeight: 900, margin: 0, marginTop: 10 }}>R$ 110 em crédito</p>
      <p style={{ fontSize: 16, opacity: 0.75, margin: 0, marginTop: 4 }}>
        de R$ 100 pago · bônus de 10%
      </p>
    </div>
  );
}

function CoinsMock() {
  return (
    <div
      style={{
        background: `${COLORS.accent}20`,
        border: `1px solid ${COLORS.accent}60`,
        borderRadius: 20,
        padding: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: COLORS.accent,
            display: "grid",
            placeItems: "center",
            fontSize: 36,
          }}
        >
          🪙
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: COLORS.fgOnLight, margin: 0 }}>
            +85 coins ganhos
          </p>
          <p style={{ fontSize: 16, color: COLORS.fgMutedOnLight, margin: 0, marginTop: 2 }}>
            de uma compra de R$ 85,00
          </p>
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          background: COLORS.white,
          padding: 12,
          borderRadius: 12,
          textAlign: "center",
          fontSize: 15,
          color: COLORS.fgMutedOnLight,
        }}
      >
        Saldo: <strong style={{ color: COLORS.blue, fontSize: 18 }}>320 coins ≈ R$ 32</strong>
      </div>
    </div>
  );
}

function StoriesMock() {
  return (
    <div
      style={{
        position: "relative",
        background: `linear-gradient(135deg, ${COLORS.blue} 0%, #4338ca 100%)`,
        borderRadius: 20,
        padding: 24,
        height: 140,
        color: COLORS.white,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          right: 16,
          top: 16,
          background: "rgba(255,255,255,0.2)",
          padding: "4px 12px",
          borderRadius: 100,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        📸 STORY
      </span>
      <p style={{ fontSize: 26, fontWeight: 900, margin: 0, marginTop: 10 }}>
        🍝 Risoto do chef hoje
      </p>
      <p style={{ fontSize: 16, opacity: 0.85, margin: 0, marginTop: 6 }}>
        R$ 49 → <strong>R$ 39 com BRAVA+</strong>
      </p>
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 24,
          right: 24,
          background: COLORS.accent,
          color: COLORS.fgOnLight,
          padding: "8px 14px",
          borderRadius: 100,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 900,
        }}
      >
        🎟️ Resgatar -20% agora
      </div>
    </div>
  );
}

function RoletaMock() {
  return (
    <div
      style={{
        background: `radial-gradient(circle, ${COLORS.accent}40 0%, transparent 70%)`,
        border: `2px dashed ${COLORS.accentDark}`,
        borderRadius: 20,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 60, lineHeight: 1 }}>🎰</div>
      <p style={{ fontSize: 18, fontWeight: 700, color: COLORS.fgMutedOnLight, margin: 0, marginTop: 6 }}>
        Você ganhou:
      </p>
      <p style={{ fontSize: 32, fontWeight: 900, color: COLORS.blue, margin: 0, marginTop: 4, letterSpacing: "-0.02em" }}>
        Café duplo grátis!
      </p>
      <p
        style={{
          fontSize: 14,
          color: COLORS.fgMutedOnLight,
          margin: 0,
          marginTop: 8,
          fontFamily: "monospace",
        }}
      >
        Código BR-X7K4
      </p>
    </div>
  );
}

function BlastMock() {
  return (
    <div
      style={{
        background: `${COLORS.danger}10`,
        border: `1px solid ${COLORS.danger}40`,
        borderRadius: 20,
        padding: 24,
      }}
    >
      <p
        style={{
          fontSize: 14,
          fontWeight: 900,
          color: COLORS.danger,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        ⚡ Cupom flash · ativo
      </p>
      <p style={{ fontSize: 30, fontWeight: 900, color: COLORS.fgOnLight, margin: 0, marginTop: 6 }}>
        -25% pelas próximas 2h
      </p>
      <p style={{ fontSize: 15, color: COLORS.fgMutedOnLight, margin: 0, marginTop: 4 }}>
        Enviado pra 142 clientes que já visitaram
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 12, fontSize: 13 }}>
        {[
          { l: "📤 142", c: COLORS.fgMutedOnLight },
          { l: "👁️ 38",  c: COLORS.blue },
          { l: "🛒 12",  c: COLORS.emerald },
        ].map((b) => (
          <span
            key={b.l}
            style={{
              background: COLORS.white,
              padding: "6px 12px",
              borderRadius: 100,
              fontWeight: 800,
              color: b.c,
            }}
          >
            {b.l}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmbaixadorMock() {
  return (
    <div
      style={{
        background: `${COLORS.blue}10`,
        border: `1px solid ${COLORS.blue}30`,
        borderRadius: 20,
        padding: 24,
      }}
    >
      <p
        style={{
          fontSize: 14,
          fontWeight: 900,
          color: COLORS.blue,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        👑 Top 3 embaixadores
      </p>
      <ul style={{ marginTop: 12, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { n: "Marina S.", v: "24 visitas · R$ 1.840" },
          { n: "Felipe R.", v: "19 visitas · R$ 1.420" },
          { n: "Ana C.",    v: "17 visitas · R$ 1.230" },
        ].map((c) => (
          <li
            key={c.n}
            style={{
              background: COLORS.white,
              padding: "12px 16px",
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: COLORS.fgOnLight }}>{c.n}</span>
            <span style={{ fontSize: 14, color: COLORS.fgMutedOnLight }}>{c.v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IndiqueMock() {
  return (
    <div
      style={{
        background: `${COLORS.emerald}10`,
        border: `1px solid ${COLORS.emerald}40`,
        borderRadius: 20,
        padding: 24,
      }}
    >
      <p
        style={{
          fontSize: 14,
          fontWeight: 900,
          color: COLORS.emerald,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        🤝 Indique e ganhe
      </p>
      <p style={{ fontSize: 26, fontWeight: 900, color: COLORS.fgOnLight, margin: 0, marginTop: 6 }}>
        Marina indicou 3 amigos
      </p>
      <p style={{ fontSize: 15, color: COLORS.fgMutedOnLight, margin: 0, marginTop: 4 }}>
        +150 coins pra ela · 3 clientes novos pra você
      </p>
      <div style={{ display: "flex", marginTop: 14 }}>
        {["🙋", "👨", "🙎"].map((e, i) => (
          <div
            key={i}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: COLORS.white,
              border: `3px solid ${COLORS.accent}`,
              display: "grid",
              placeItems: "center",
              fontSize: 22,
              marginLeft: i === 0 ? 0 : -12,
              zIndex: 3 - i,
            }}
          >
            {e}
          </div>
        ))}
      </div>
    </div>
  );
}
