"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface LocationData {
  lat: number;
  lng: number;
  city: string | null;
  state: string | null;
  updatedAt: number;
}

interface Ctx {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
}

const LocationContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "brava:location";
const TTL_MS = 60 * 60 * 1000;

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LocationData;
      if (Date.now() - parsed.updatedAt < TTL_MS) {
        setLocation(parsed);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo navegador.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60 * 1000,
        });
      });

      const { latitude, longitude } = pos.coords;
      let city: string | null = null;
      let state: string | null = null;
      try {
        const r = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`,
        );
        const j = await r.json();
        city = j.city || j.locality || null;
        state = j.principalSubdivisionCode?.split("-")?.[1] || j.principalSubdivision || null;
      } catch {
        /* swallow */
      }

      const data: LocationData = { lat: latitude, lng: longitude, city, state, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLocation(data);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        if (err.code === 1) setError("Permita o acesso à localização.");
        else if (err.code === 3) setError("Tempo esgotado tentando localizar.");
        else setError("Não consegui encontrar sua localização.");
      } else {
        setError("Falha ao obter localização.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLocation(null);
  }, []);

  return (
    <LocationContext.Provider value={{ location, loading, error, requestLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside LocationProvider");
  return ctx;
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
