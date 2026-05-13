"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installShown, setInstallShown] = useState(false);
  const [pushState, setPushState] = useState<"unknown" | "granted" | "denied" | "default">("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setInstallPrompt(prompt);
      const dismissed = localStorage.getItem("brava_pwa_dismissed");
      if (!dismissed) setInstallShown(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setInstallShown(false);
    });

    if ("Notification" in window) {
      setPushState(Notification.permission as typeof pushState);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallShown(false);
  }

  function dismissInstall() {
    localStorage.setItem("brava_pwa_dismissed", String(Date.now()));
    setInstallShown(false);
  }

  async function enablePush() {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !VAPID_PUBLIC) return;
    const perm = await Notification.requestPermission();
    setPushState(perm as typeof pushState);
    if (perm !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    const keyBytes = urlBase64ToUint8Array(VAPID_PUBLIC);
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes.buffer as ArrayBuffer,
    });
    const json = sub.toJSON();
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(json),
    });
  }

  // Show install banner OR push prompt OR nothing
  if (installed) {
    // already installed PWA — show push prompt if available + permission default
    if (VAPID_PUBLIC && pushState === "default") return <PushBanner onAccept={enablePush} />;
    return null;
  }

  if (installShown && installPrompt) {
    return (
      <div className="fixed inset-x-0 bottom-28 z-40 mx-auto max-w-md px-4 sm:bottom-6">
        <div className="rounded-3xl border-2 border-brava-yellow bg-brava-card p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brava-yellow text-2xl">📱</div>
            <div className="flex-1">
              <p className="text-sm font-black text-brava-ink">Instale o BRAVA+ na sua tela</p>
              <p className="mt-0.5 text-xs text-brava-muted">Notificações de cupons + acesso 1-clique</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={dismissInstall} className="flex-1 rounded-full border border-brava-border bg-brava-paper px-3 py-2 text-xs font-medium">
              Agora não
            </button>
            <button onClick={install} className="flex-1 rounded-full bg-brava-yellow px-3 py-2 text-xs font-black text-brava-black">
              📲 Instalar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (VAPID_PUBLIC && pushState === "default") return <PushBanner onAccept={enablePush} />;

  return null;
}

function PushBanner({ onAccept }: { onAccept: () => void }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("brava_push_dismissed")) setHidden(true);
  }, []);

  if (hidden) return null;

  function dismiss() {
    localStorage.setItem("brava_push_dismissed", String(Date.now()));
    setHidden(true);
  }

  return (
    <div className="fixed inset-x-0 bottom-28 z-40 mx-auto max-w-md px-4 sm:bottom-6">
      <div className="rounded-3xl border-2 border-brava-blue bg-brava-card p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brava-blue text-2xl text-white">🔔</div>
          <div className="flex-1">
            <p className="text-sm font-black text-brava-ink">Aceitar notificações?</p>
            <p className="mt-0.5 text-xs text-brava-muted">Cupons quentes + promos flash dos seus favoritos</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={dismiss} className="flex-1 rounded-full border border-brava-border bg-brava-paper px-3 py-2 text-xs font-medium">
            Agora não
          </button>
          <button onClick={onAccept} className="flex-1 rounded-full bg-brava-blue px-3 py-2 text-xs font-black text-white">
            🔔 Ativar
          </button>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}
