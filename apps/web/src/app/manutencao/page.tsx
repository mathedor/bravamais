import type { Metadata } from "next";

// Página estática de manutenção — sem banco, sem env, estilos inline.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Em manutenção",
  robots: { index: false, follow: false },
};

export default function ManutencaoPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,191,36,0.12), transparent), #0A0A0A",
        color: "#F4F4F5",
        padding: "2rem 1.5rem",
        fontFamily:
          "var(--font-inter, Inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "4.5rem",
          lineHeight: 1,
          marginBottom: "1.75rem",
          filter: "drop-shadow(0 0 24px rgba(251,191,36,0.35))",
        }}
        aria-hidden
      >
        🔧
      </div>

      <p
        style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#FBBF24",
          margin: "0 0 0.75rem",
        }}
      >
        Em manutenção
      </p>

      <h1
        style={{
          fontFamily: "var(--font-fredoka, Fredoka), var(--font-inter, Inter), sans-serif",
          fontSize: "clamp(2rem, 6vw, 3rem)",
          fontWeight: 700,
          margin: "0 0 1rem",
          color: "#FFFFFF",
        }}
      >
        BRAVA<span style={{ color: "#FBBF24" }}>+</span>
      </h1>

      <p
        style={{
          fontSize: "1.05rem",
          color: "#A1A1AA",
          maxWidth: "26rem",
          margin: "0 auto",
          lineHeight: 1.6,
        }}
      >
        Estamos fazendo uma melhoria rápida. Já já estamos de volta.
      </p>

      <div
        style={{
          marginTop: "2.5rem",
          width: "3.5rem",
          height: "3px",
          borderRadius: "999px",
          background: "linear-gradient(90deg, #FBBF24, #F59E0B)",
        }}
        aria-hidden
      />

      <footer
        style={{
          position: "fixed",
          bottom: "1.25rem",
          left: 0,
          right: 0,
          fontSize: "0.75rem",
          color: "#52525B",
        }}
      >
        Diretório Web ·{" "}
        <a
          href="https://diretoriow.com.br"
          style={{ color: "#71717A", textDecoration: "none" }}
        >
          diretoriow.com.br
        </a>
      </footer>
    </main>
  );
}
