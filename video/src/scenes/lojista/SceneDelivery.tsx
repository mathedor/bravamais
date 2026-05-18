import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../../constants";
import { fadeIn, slideY, popIn } from "../../anim";

export function SceneDelivery() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagOp = fadeIn(frame, 0, 12);
  const titleOp = fadeIn(frame, 8, 14);
  const titleY = slideY(frame, 8, 14, 30, 0);

  const mapScale = popIn(frame, 28, fps, { damping: 14, stiffness: 150 });

  // Motoqueiro se move da loja → casa (arco)
  const motoProgress = interpolate(frame, [55, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const motoX = 12 + motoProgress * 76; // % horizontal
  const motoY = 70 - Math.sin(motoProgress * Math.PI) * 38; // arco subindo e descendo

  // Path desenha do ponto A até o motoqueiro
  const pathLen = motoProgress;

  // Status atual (muda conforme progresso)
  const status =
    motoProgress < 0.05 ? { txt: "📋 Pedido confirmado",   color: COLORS.fgMutedOnLight }
    : motoProgress < 0.2 ? { txt: "👨‍🍳 Em preparação",     color: COLORS.accentDark }
    : motoProgress < 0.95 ? { txt: "🛵 A caminho",          color: COLORS.blue }
    : { txt: "✅ Entregue!",                                 color: COLORS.emerald };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, ${COLORS.dark} 0%, ${COLORS.blue} 100%)`,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <p
        style={{
          opacity: tagOp,
          fontSize: 26,
          fontWeight: 800,
          color: COLORS.accent,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Delivery próprio · 0% comissão
      </p>

      <h2
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontSize: 76,
          fontWeight: 900,
          color: COLORS.white,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginTop: 16,
          marginBottom: 28,
        }}
      >
        Cliente vê o entregador{" "}
        <span style={{ color: COLORS.accent }}>em tempo real</span>.
      </h2>

      {/* MAPA GRANDE */}
      <div
        style={{
          transform: `scale(${mapScale})`,
          transformOrigin: "center top",
          width: "100%",
          height: 920,
          background: `linear-gradient(180deg, #FFF8E1 0%, #FFFBEB 100%)`,
          borderRadius: 36,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
          border: `4px solid ${COLORS.white}`,
        }}
      >
        {/* Grid de ruas */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }} preserveAspectRatio="none">
          {[15, 30, 45, 60, 75, 90].map((v) => (
            <line key={`h${v}`} x1="0" x2="100%" y1={`${v}%`} y2={`${v}%`} stroke="#cbd5e1" strokeWidth="1.5" />
          ))}
          {[15, 30, 45, 60, 75, 90].map((v) => (
            <line key={`v${v}`} x1={`${v}%`} x2={`${v}%`} y1="0" y2="100%" stroke="#cbd5e1" strokeWidth="1.5" />
          ))}
        </svg>

        {/* Rio decorativo */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 0 40 Q 30 35, 60 50 T 100 45" stroke="#7dd3fc" strokeWidth="2" fill="none" opacity="0.5" />
        </svg>

        {/* Path principal (rota completa pontilhada) */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 12 70 Q 50 0, 88 70"
            stroke={`${COLORS.accent}50`}
            strokeWidth="0.7"
            strokeDasharray="1.8 1.2"
            fill="none"
          />
        </svg>

        {/* Path traçado (já percorrido) — sólido amarelo */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 12 70 Q 50 0, 88 70"
            stroke={COLORS.accent}
            strokeWidth="1"
            fill="none"
            strokeDasharray="200"
            strokeDashoffset={200 * (1 - pathLen)}
            style={{ filter: `drop-shadow(0 0 6px ${COLORS.accentDark})` }}
          />
        </svg>

        {/* Pin LOJA (origem) */}
        <div style={{ position: "absolute", left: "12%", top: "70%", transform: "translate(-50%, -50%)" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: COLORS.blue,
              display: "grid",
              placeItems: "center",
              fontSize: 40,
              boxShadow: `0 8px 24px ${COLORS.blue}50`,
              border: `4px solid ${COLORS.white}`,
            }}
          >
            🏪
          </div>
          <p
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: COLORS.blue,
              textAlign: "center",
              marginTop: 6,
              background: COLORS.white,
              padding: "4px 10px",
              borderRadius: 100,
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              whiteSpace: "nowrap",
              transform: "translateX(-50%)",
              marginLeft: "50%",
              display: "inline-block",
            }}
          >
            Café Mineiro
          </p>
        </div>

        {/* Pin CASA (destino) */}
        <div style={{ position: "absolute", left: "88%", top: "70%", transform: "translate(-50%, -50%)" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: COLORS.emerald,
              display: "grid",
              placeItems: "center",
              fontSize: 40,
              boxShadow: `0 8px 24px ${COLORS.emerald}50`,
              border: `4px solid ${COLORS.white}`,
            }}
          >
            🏠
          </div>
          <p
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: COLORS.emerald,
              textAlign: "center",
              marginTop: 6,
              background: COLORS.white,
              padding: "4px 10px",
              borderRadius: 100,
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              whiteSpace: "nowrap",
              transform: "translateX(-50%)",
              marginLeft: "50%",
              display: "inline-block",
            }}
          >
            Sua casa
          </p>
        </div>

        {/* MOTOQUEIRO GRANDE animado */}
        <div
          style={{
            position: "absolute",
            left: `${motoX}%`,
            top: `${motoY}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 5,
          }}
        >
          {/* Pulse ring */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: COLORS.accent,
              opacity: 0.25,
              animation: "pulse 1.4s ease-out infinite",
            }}
          />
          {/* Motoqueiro */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
              border: `5px solid ${COLORS.white}`,
              display: "grid",
              placeItems: "center",
              fontSize: 56,
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
              position: "relative",
            }}
          >
            🛵
          </div>
        </div>

        {/* Badge "AO VIVO" top-right do mapa */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: COLORS.white,
            padding: "10px 18px",
            borderRadius: 100,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontSize: 18,
            fontWeight: 900,
            color: COLORS.fgOnLight,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 12px #ef4444",
            }}
          />
          AO VIVO
        </div>

        {/* Card status bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            right: 24,
            background: COLORS.white,
            padding: 20,
            borderRadius: 20,
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: COLORS.fgMutedOnLight,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Status
              </p>
              <p style={{ fontSize: 26, fontWeight: 900, color: status.color, margin: 0, marginTop: 4 }}>
                {status.txt}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: COLORS.fgMutedOnLight,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                ETA
              </p>
              <p style={{ fontSize: 32, fontWeight: 900, color: COLORS.blue, margin: 0, fontFamily: "monospace" }}>
                {Math.max(0, Math.round(8 - motoProgress * 8))} min
              </p>
            </div>
          </div>

          {/* Código aparece no fim */}
          {motoProgress >= 0.7 && (
            <div
              style={{
                marginTop: 14,
                background: `${COLORS.emerald}15`,
                border: `2px dashed ${COLORS.emerald}`,
                borderRadius: 14,
                padding: 12,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: COLORS.emerald,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Código pra entrega
              </p>
              <p
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: COLORS.emerald,
                  margin: 0,
                  marginTop: 2,
                  fontFamily: "monospace",
                  letterSpacing: "0.2em",
                }}
              >
                4729
              </p>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}
