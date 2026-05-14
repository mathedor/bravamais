"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

// Smooth scroll só nas landings públicas (hero + scroll cinematográfico).
// Em painéis (sidebar sticky + listas longas + mapas) o lenis trava a rolagem,
// então mantemos scroll nativo lá.
const SMOOTH_ROUTES: ReadonlySet<string> = new Set([
  "/",
  "/seja-parceiro",
  "/seja-entregador",
  "/privacidade",
  "/termos",
]);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const enabled = SMOOTH_ROUTES.has(pathname);

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.5,
    });

    let frameId = 0;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [enabled]);

  return <>{children}</>;
}
