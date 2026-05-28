"use client";

import { useEffect } from "react";

interface Props {
  /** Scope do service worker (deve casar com o scope do manifest do role) */
  scope: string;
}

export function PWARegister({ scope }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker
      .register("/sw.js", { scope })
      .catch((err) => {
        console.warn("[PWA] registration failed", err);
      });
  }, [scope]);

  return null;
}
