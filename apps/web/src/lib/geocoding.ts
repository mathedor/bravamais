/**
 * Geocoding helpers. Usa Google Geocoding API quando GOOGLE_MAPS_API_KEY existe.
 * Cai pra fallback (sem coords) silenciosamente quando não.
 */

interface GeoCoords {
  lat: number;
  lng: number;
}

export async function geocodeAddress(query: string): Promise<GeoCoords | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || !query.trim()) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=br&key=${key}`;
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      status: string;
      results?: Array<{ geometry?: { location?: GeoCoords } }>;
    };
    if (j.status !== "OK" || !j.results?.[0]?.geometry?.location) return null;
    return j.results[0].geometry.location;
  } catch {
    return null;
  }
}

export function buildFullAddress(parts: {
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  cep?: string | null;
}): string {
  const parts1 = [parts.street, parts.number].filter(Boolean).join(", ");
  const parts2 = [parts.neighborhood, parts.city, parts.state]
    .filter(Boolean)
    .join(" - ");
  return [parts1, parts2, parts.cep].filter(Boolean).join(", ");
}
