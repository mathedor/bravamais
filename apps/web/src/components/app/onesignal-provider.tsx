"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(os: unknown) => void>;
  }
}

export function OneSignalProvider() {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

  useEffect(() => {
    if (!appId) return;
    if (typeof window === "undefined") return;
    if (document.getElementById("onesignal-sdk")) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: unknown) => {
      const os = OneSignal as { init: (cfg: Record<string, unknown>) => Promise<void> };
      await os.init({
        appId,
        notifyButton: { enable: false },
        serviceWorkerPath: "/OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/" },
      });
    });

    const s = document.createElement("script");
    s.id = "onesignal-sdk";
    s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    s.defer = true;
    document.head.appendChild(s);
  }, [appId]);

  return null;
}

export async function requestPushPermission(): Promise<void> {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    OneSignal?: { Notifications?: { requestPermission: () => Promise<void> } };
  };
  await w.OneSignal?.Notifications?.requestPermission();
}
