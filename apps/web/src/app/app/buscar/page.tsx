import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { EstablishmentCard, type EstablishmentCardData } from "@/components/establishment-card";
import { SearchFilters } from "./search-filters";
import { PROMO_LABELS } from "@/lib/format";

export const metadata = { title: "Buscar" };

interface PageProps {
  searchParams: Promise<{ q?: string; categoria?: string; tipo?: string }>;
}

export default async function BuscarPage({ searchParams }: PageProps) {
  await requireRole(["subscriber", "admin"]);
  const { q, categoria, tipo } = await searchParams;
  const supabase = await createClient();

  const { data: categorias } = await supabase
    .from("categories")
    .select("slug, name, display_order")
    .eq("is_active", true)
    .order("display_order");

  let query = supabase
    .from("establishments")
    .select(
      `id, slug, name, tagline, city, state, logo_url, cover_url, photos,
       average_rating, total_reviews,
       establishment_categories!inner(category_id, categories!inner(slug)),
       establishment_promotions(promotion_type, is_active)`,
    )
    .eq("is_active", true);

  if (q) {
    query = query.or(`name.ilike.%${q}%,tagline.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (categoria) {
    query = query.eq("establishment_categories.categories.slug", categoria);
  }

  const { data, error } = await query.order("name");

  type RawEstab = EstablishmentCardData & {
    establishment_promotions?: { promotion_type: string; is_active: boolean }[];
  };

  let estabs: RawEstab[] = (data as RawEstab[]) ?? [];
  if (tipo) {
    estabs = estabs.filter((e) =>
      e.establishment_promotions?.some(
        (p) => p.promotion_type === tipo && p.is_active,
      ),
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-brava-ink md:text-4xl">Buscar estabelecimentos</h1>
        <p className="mt-1 text-brava-muted">
          Encontre parceiros perto de você e veja as vantagens disponíveis.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-brava-border bg-brava-paper p-5">
          <SearchFilters categorias={categorias ?? []} />
        </aside>

        <section>
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Erro carregando estabelecimentos.
            </div>
          )}

          {!error && estabs.length === 0 && (
            <div className="rounded-3xl border border-dashed border-brava-border bg-white p-12 text-center">
              <p className="text-lg font-medium text-brava-ink">Nenhum estabelecimento encontrado</p>
              <p className="mt-1 text-sm text-brava-muted">Tente ajustar os filtros.</p>
            </div>
          )}

          {!error && estabs.length > 0 && (
            <>
              <p className="mb-4 text-sm text-brava-muted">
                {estabs.length} {estabs.length === 1 ? "estabelecimento encontrado" : "estabelecimentos encontrados"}
                {tipo ? ` com ${PROMO_LABELS[tipo]}` : ""}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {estabs.map((e) => (
                  <EstablishmentCard
                    key={e.slug}
                    e={{
                      ...e,
                      promos: e.establishment_promotions
                        ?.filter((p) => p.is_active)
                        .map((p) => PROMO_LABELS[p.promotion_type] ?? p.promotion_type),
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
