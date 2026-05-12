import { createAdminClient } from "@/lib/supabase/admin";

export interface NearbyEstablishment {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  cover_url: string | null;
  photos: string[];
  average_rating: number | null;
  total_reviews: number;
  total_visits: number;
  distance_km: number | null;
}

/**
 * Usa o RPC `search_establishments` (PostGIS) quando lat/lng presentes.
 * Cai pra query normal sem geo caso contrário.
 */
export async function searchEstablishments(args: {
  q?: string;
  categorySlugs?: string[];
  promoTypes?: string[];
  lat?: number;
  lng?: number;
  maxDistanceKm?: number;
  sortBy?: "nearest" | "rating" | "recent";
  limit?: number;
}): Promise<NearbyEstablishment[]> {
  const admin = createAdminClient();
  try {
    const { data, error } = await admin.rpc("search_establishments", {
      q: args.q ?? null,
      category_slugs: args.categorySlugs?.length ? args.categorySlugs : null,
      promo_types: args.promoTypes?.length ? args.promoTypes : null,
      user_lat: args.lat ?? null,
      user_lng: args.lng ?? null,
      max_distance_km: args.maxDistanceKm ?? null,
      sort_by: args.sortBy ?? "nearest",
      page_size: args.limit ?? 24,
      page_offset: 0,
    });
    if (error) {
      console.warn("[postgis-search] rpc error:", error.message);
      return [];
    }
    return (data ?? []) as NearbyEstablishment[];
  } catch (err) {
    console.warn("[postgis-search] threw:", err);
    return [];
  }
}
