import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { MapView } from "./map-view";

export const metadata = { title: "Mapa de parceiros" };

interface Estab {
  slug: string;
  name: string;
  tagline: string | null;
  lat: number;
  lng: number;
  cover_url: string | null;
  logo_url: string | null;
  average_rating: number | null;
}

export default async function MapaPage() {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("establishments")
    .select("slug, name, tagline, lat, lng, cover_url, logo_url, average_rating")
    .eq("is_active", true)
    .not("lat", "is", null)
    .not("lng", "is", null);

  type Raw = Omit<Estab, "lat" | "lng"> & { lat: number | null; lng: number | null };
  const items: Estab[] = ((data as Raw[] | null) ?? [])
    .filter((e): e is Estab => e.lat != null && e.lng != null);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Mapa</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brava-ink">
          {items.length} parceiros no mapa
        </h1>
        <p className="mt-1 text-sm text-brava-muted">Clique nos pins pra abrir o 360 da loja.</p>
      </header>

      <MapView items={items} />

      <div className="h-6" />
    </div>
  );
}
