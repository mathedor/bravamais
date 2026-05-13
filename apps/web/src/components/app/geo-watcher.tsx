"use client";

import { useEffect } from "react";

/**
 * Em background pede geolocalização (silent permission) e dispara o endpoint
 * /api/geo-nearby que verifica se há parceiros com promo a < 500m. Roda 1x
 * por sessão e revalida a cada 15 min se o user ficar no app.
 */
export function GeoWatcher() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const LAST_KEY = "brava_geo_last_check";
    const lastStr = localStorage.getItem(LAST_KEY);
    const last = lastStr ? Number(lastStr) : 0;
    const FIFTEEN_MIN = 15 * 60 * 1000;
    if (Date.now() - last < FIFTEEN_MIN) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        localStorage.setItem(LAST_KEY, String(Date.now()));
        try {
          await fetch("/api/geo-nearby", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
        } catch {
          /* silent */
        }
      },
      () => {
        /* user denied — silent */
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 8000 },
    );
  }, []);

  return null;
}
