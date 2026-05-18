"use server";

import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";

export type GooglePlaceItem = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  jaProspect: boolean;
};

const CATEGORY_TO_GMAPS_TYPE: Record<string, string> = {
  restaurantes: "restaurant",
  bares: "bar",
  cafes: "cafe",
  padarias: "bakery",
  doceria: "bakery",
  beleza: "beauty_salon",
  saude: "health",
  esportes: "gym",
  petshop: "pet_store",
  moda: "clothing_store",
  presentes: "gift_shop",
  papelaria: "book_store",
  floriculturas: "florist",
  decoracao: "home_goods_store",
  servicos: "establishment",
  lazer: "tourist_attraction",
  "casas-de-show": "night_club",
};

/** Busca Google Places no raio + categoria. */
export async function searchGooglePlaces(input: {
  lat: number;
  lng: number;
  radius: number; // metros
  categorySlug?: string;
  keyword?: string;
}): Promise<{ ok: boolean; items: GooglePlaceItem[]; error?: string }> {
  const { affiliate } = await requireCommercial();
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { ok: false, items: [], error: "GOOGLE_MAPS_API_KEY não configurada." };

  const params = new URLSearchParams({
    location: `${input.lat},${input.lng}`,
    radius: String(Math.min(Math.max(input.radius, 100), 5000)),
    key: apiKey,
    language: "pt-BR",
  });
  if (input.categorySlug && CATEGORY_TO_GMAPS_TYPE[input.categorySlug]) {
    params.set("type", CATEGORY_TO_GMAPS_TYPE[input.categorySlug]);
  }
  if (input.keyword) params.set("keyword", input.keyword);

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`,
    { cache: "no-store" },
  );
  if (!res.ok) return { ok: false, items: [], error: `Google Places HTTP ${res.status}` };

  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
    results?: Array<{
      place_id: string;
      name: string;
      vicinity?: string;
      geometry?: { location?: { lat: number; lng: number } };
      rating?: number;
      user_ratings_total?: number;
      types?: string[];
    }>;
  };

  if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return { ok: false, items: [], error: `Places: ${data.status} ${data.error_message ?? ""}` };
  }

  const results = (data.results ?? []).filter((r) => r.geometry?.location);

  // Checa quais já são prospect desse comercial
  const supabase = await createClient();
  const placeIds = results.map((r) => r.place_id);
  const { data: existing } = await supabase
    .from("commercial_prospects")
    .select("gmaps_place_id")
    .eq("affiliate_id", affiliate.id)
    .in("gmaps_place_id", placeIds);
  const existingSet = new Set((existing ?? []).map((e) => e.gmaps_place_id));

  return {
    ok: true,
    items: results.map((r) => ({
      placeId: r.place_id,
      name: r.name,
      address: r.vicinity ?? "",
      lat: r.geometry!.location!.lat,
      lng: r.geometry!.location!.lng,
      rating: r.rating,
      userRatingsTotal: r.user_ratings_total,
      types: r.types,
      jaProspect: existingSet.has(r.place_id),
    })),
  };
}

/** Geocode reverso pra centralizar mapa por endereço. */
export async function geocodeAddress(address: string): Promise<{
  ok: boolean; lat?: number; lng?: number; formatted?: string; error?: string;
}> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { ok: false, error: "GOOGLE_MAPS_API_KEY não configurada." };
  const params = new URLSearchParams({ address, key: apiKey, language: "pt-BR", region: "br" });
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, { cache: "no-store" });
  if (!res.ok) return { ok: false, error: `Geocode HTTP ${res.status}` };
  const data = await res.json() as any;
  if (data.status !== "OK" || !data.results?.length) {
    return { ok: false, error: `Geocode: ${data.status}` };
  }
  const top = data.results[0];
  return {
    ok: true,
    lat: top.geometry.location.lat,
    lng: top.geometry.location.lng,
    formatted: top.formatted_address,
  };
}

/** Salva um Google Place como prospect novo. */
export async function saveProspectFromGoogle(input: {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  categorySlug?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("commercial_prospects")
    .insert({
      affiliate_id: affiliate.id,
      kind: "establishment",
      status: "novo",
      source: "gmaps",
      name: input.name,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      gmaps_place_id: input.placeId,
      gmaps_rating: input.rating ?? null,
      category_slug: input.categorySlug ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id };
}
