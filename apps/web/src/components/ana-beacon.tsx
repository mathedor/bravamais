"use client";

import { useEffect } from "react";

// Beacon da Ana (https://www.ana.show) — conta acessos das páginas PÚBLICAS.
// O pulso (/api/ana/pulso) OMITE acessos_hoje; a Ana preenche sozinha na coleta.
// Não dispara em áreas logadas (painéis) nem em rotas de auth.
const PREFIXOS_PRIVADOS = ["/app", "/admin", "/loja", "/entregador", "/comercial", "/auth"];

export function AnaBeacon() {
  useEffect(() => {
    const path = window.location.pathname;
    const privada = PREFIXOS_PRIVADOS.some(
      (p) => path === p || path.startsWith(`${p}/`),
    );
    if (privada) return;
    try {
      navigator.sendBeacon("https://www.ana.show/api/b/bravamais");
    } catch {
      /* silencioso */
    }
  }, []);
  return null;
}
