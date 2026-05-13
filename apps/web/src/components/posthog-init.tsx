"use client";

import { useEffect } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

declare global {
  interface Window {
    __brava_ph?: { capture: (event: string, props?: Record<string, unknown>) => void };
  }
}

/**
 * PostHog client-side capture mínimo, sem dep externa.
 * Captura pageview a cada navegação + expõe window.__brava_ph.capture("event_name").
 */
export function PostHogInit() {
  useEffect(() => {
    if (!KEY || typeof window === "undefined") return;
    const distinct = localStorage.getItem("brava_ph_id") ?? (() => {
      const id = crypto.randomUUID();
      localStorage.setItem("brava_ph_id", id);
      return id;
    })();

    async function capture(event: string, props: Record<string, unknown> = {}) {
      try {
        await fetch(`${HOST}/capture/`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            api_key: KEY,
            event,
            distinct_id: distinct,
            properties: { ...props, $current_url: window.location.href },
            timestamp: new Date().toISOString(),
          }),
          keepalive: true,
        });
      } catch {
        /* silent */
      }
    }

    window.__brava_ph = { capture };
    capture("$pageview");

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a,button");
      if (!interactive) return;
      const label = interactive.getAttribute("aria-label") ?? interactive.textContent?.trim().slice(0, 50) ?? "";
      capture("ui_click", { label, tag: interactive.tagName });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
