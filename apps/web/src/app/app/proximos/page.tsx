import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { NearbyList, type NearbyItem } from "@/components/app/nearby-list";
import { PROMO_LABELS } from "@/lib/format";

export const metadata = { title: "Próximo a mim" };

interface RawEstab {
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  logo_url: string | null;
  cover_url: string | null;
  photos: string[] | null;
  establishment_promotions?: { promotion_type: string; is_active: boolean }[];
}

export default async function ProximosPage() {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: estabsRaw } = await supabase
    .from("establishments")
    .select(
      `slug, name, tagline, city, state, lat, lng, logo_url, cover_url, photos,
       establishment_promotions(promotion_type, is_active)`,
    )
    .eq("is_active", true)
    .not("lat", "is", null)
    .not("lng", "is", null);

  const estabs = (estabsRaw as unknown as RawEstab[]) ?? [];

  const items: NearbyItem[] = estabs.map((e) => ({
    slug: e.slug,
    name: e.name,
    tagline: e.tagline,
    city: e.city,
    state: e.state,
    lat: e.lat!,
    lng: e.lng!,
    cover: e.cover_url || e.photos?.[0] || null,
    logo: e.logo_url,
    promo:
      e.establishment_promotions
        ?.filter((p) => p.is_active)
        .map((p) => PROMO_LABELS[p.promotion_type])
        .filter(Boolean)[0] ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">📍 Geolocalização</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Próximo a você
        </h1>
        <p className="mt-1 text-brava-muted">
          Parceiros ordenados por distância da sua localização atual.
        </p>
      </header>

      <NearbyList items={items} limit={50} />

      <div className="h-6" />
    </div>
  );
}
