"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const DISMISS_KEY = "brava_push_optin_dismissed";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * Pedido de push com contexto — mostrado só depois que o usuário já resgatou
 * algo (a página decide renderizar). Não insiste: dispensou, não volta.
 */
export function PushOptInCard() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !VAPID_PUBLIC ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      Notification.permission !== "default" ||
      localStorage.getItem(DISMISS_KEY)
    ) {
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setVisible(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const keyBytes = urlBase64ToUint8Array(VAPID_PUBLIC);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes.buffer as ArrayBuffer,
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      window.__brava_ph?.capture("push_optin_enabled");
      setVisible(false);
    } catch {
      setVisible(false);
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-brava-yellow/40 bg-brava-yellow/10 p-4">
      <div className="min-w-0">
        <p className="text-sm font-black text-brava-ink">🔔 Não perca a próxima promo</p>
        <p className="text-xs text-brava-muted">
          Avisamos quando os lugares que você frequenta soltarem cupom ou promoção relâmpago.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full px-3 py-2 text-xs font-bold text-brava-muted"
        >
          Agora não
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={enable}
          className="rounded-full bg-brava-black px-4 py-2 text-xs font-black text-brava-yellow disabled:opacity-60"
        >
          {busy ? "Ativando…" : "Ativar avisos"}
        </button>
      </div>
    </div>
  );
}
