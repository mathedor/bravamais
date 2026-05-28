import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { SearchResults, type SearchEstab } from "@/components/app/search-results";
import { PROMO_LABELS } from "@/lib/format";
import { getUserCategoryAccess } from "@/lib/category-access";

export const metadata = { title: "Buscar" };

interface PageProps {
  searchParams: Promise<{ q?: string; categoria?: string; tipo?: string }>;
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const { q, categoria, tipo } = await searchParams;
  const supabase = await createClient();
  const access = await getUserCategoryAccess(profile.id);

  const [{ data: estabsRaw }, { data: categorias }] = await Promise.all([
    supabase
      .from("establishments")
      .select(
        `id, slug, name, tagline, city, state, lat, lng, cover_url, photos, average_rating,
         establishment_categories(category_id, categories(slug, name)),
         establishment_promotions(promotion_type, is_active),
         coupons(id, is_active, valid_until),
         loyalty_clubs(id, is_active)`,
      )
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("categories")
      .select("slug, name, display_order")
      .eq("is_active", true)
      .order("display_order"),
  ]);

  type RawEstab = {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    city: string | null;
    state: string | null;
    lat: number | null;
    lng: number | null;
    cover_url: string | null;
    photos: string[] | null;
    average_rating: number | null;
    establishment_categories?: { category_id: string; categories: { slug: string; name: string } | null }[];
    establishment_promotions?: { promotion_type: string; is_active: boolean }[];
    coupons?: { id: string; is_active: boolean; valid_until: string | null }[];
    loyalty_clubs?: { id: string; is_active: boolean }[];
  };

  const nowIso = new Date().toISOString();
  const items: SearchEstab[] = ((estabsRaw as unknown as RawEstab[]) ?? []).map((e) => {
    const firstCatId = e.establishment_categories?.[0]?.category_id ?? null;
    const firstCatPricing = firstCatId ? access.pricing.get(firstCatId) : null;
    const accessible = access.unlimited || (firstCatId ? access.ids.has(firstCatId) : true);
    return {
      slug: e.slug,
      name: e.name,
      tagline: e.tagline,
      city: e.city,
      state: e.state,
      lat: e.lat,
      lng: e.lng,
      cover: e.cover_url || e.photos?.[0] || null,
      categorySlug: e.establishment_categories?.[0]?.categories?.slug ?? null,
      categoryName: firstCatPricing?.name ?? null,
      categoryPriceCents: firstCatPricing?.monthly_cents ?? null,
      accessible,
      promo:
        e.establishment_promotions
          ?.filter((p) => p.is_active)
          .map((p) => PROMO_LABELS[p.promotion_type])
          .filter(Boolean)[0] ?? null,
      hasActiveCoupons: (e.coupons ?? []).some((c) => c.is_active && (!c.valid_until || c.valid_until > nowIso)),
      hasLoyalty: (e.loyalty_clubs ?? []).some((l) => l.is_active),
      rating: e.average_rating,
    };
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Buscar</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brava-ink sm:text-4xl">
          Encontre seu próximo achado
        </h1>
      </header>

      <SearchResults
        items={items}
        categorias={(categorias ?? []).map((c) => ({ slug: c.slug, name: c.name }))}
        initialQ={q}
        initialCategoria={categoria}
        initialTipo={tipo}
      />

      <div className="h-6" />
    </div>
  );
}
