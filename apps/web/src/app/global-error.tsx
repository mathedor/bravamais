"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global-boundary]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: "48px 20px", background: "#0A0A0A", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 64 }}>💥</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "16px 0 8px" }}>Algo quebrou aqui</h1>
          <p style={{ fontSize: 14, opacity: 0.7 }}>
            Foi um erro grave do sistema. Tenta recarregar.
          </p>
          {error.digest && <p style={{ fontFamily: "monospace", fontSize: 11, opacity: 0.5, marginTop: 8 }}>id: {error.digest}</p>}
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, background: "#FFD400", color: "#0A0A0A", border: 0, padding: "12px 24px", borderRadius: 9999, fontWeight: 800, cursor: "pointer" }}
          >
            🔄 Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
