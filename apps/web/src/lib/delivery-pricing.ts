import type { DeliveryZone } from "@/lib/supabase/types";

const EARTH_KM = 6371;

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

export interface QuoteInput {
  distanceKm: number;
  subtotalCents: number;
  zones: Pick<DeliveryZone, "max_km" | "fee_cents" | "free_above_cents" | "is_active">[];
  maxRadiusKm: number;
}

export interface QuoteResult {
  feeCents: number;
  zoneKm: number | null;
  outOfRange: boolean;
  freeShipping: boolean;
}

/**
 * Calcula o valor da entrega aplicando a menor zona cuja max_km comporte
 * a distância. Considera free_above_cents (frete grátis se subtotal >= limite).
 * Retorna outOfRange quando distância excede o raio máximo da loja.
 */
export function quoteDelivery({ distanceKm, subtotalCents, zones, maxRadiusKm }: QuoteInput): QuoteResult {
  if (distanceKm > maxRadiusKm) {
    return { feeCents: 0, zoneKm: null, outOfRange: true, freeShipping: false };
  }

  const active = zones
    .filter((z) => z.is_active && z.max_km >= distanceKm)
    .sort((a, b) => a.max_km - b.max_km);

  if (active.length === 0) {
    return { feeCents: 0, zoneKm: null, outOfRange: true, freeShipping: false };
  }

  const zone = active[0];
  const freeShipping =
    typeof zone.free_above_cents === "number" &&
    zone.free_above_cents !== null &&
    subtotalCents >= zone.free_above_cents;

  return {
    feeCents: freeShipping ? 0 : zone.fee_cents,
    zoneKm: Number(zone.max_km),
    outOfRange: false,
    freeShipping,
  };
}

export function generateConfirmationCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
