import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 86400; // 1 dia

function slugifyCity(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface EstabRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  city: string;
  logo_url: string | null;
  establishment_categories: { categories: { slug: string; name: string } | null }[];
}

async function loadData(cidadeSlug: string, categoriaSlug: string) {
  const admin = createAdminClient();
  const [{ data: cat }, { data: estabs }] = await Promise.all([
    admin.from("categories").select("slug, name, monthly_cents").eq("slug", categoriaSlug).maybeSingle(),
    admin
      .from("establishments")
      .select("id, slug, name, tagline, city, logo_url, establishment_categories(categories(slug, name))")
      .eq("is_active", true),
  ]);
  if (!cat) return null;
  const rows = ((estabs as unknown as EstabRow[] | null) ?? []).filter(
    (e) =>
      slugifyCity(e.city ?? "") === cidadeSlug &&
      e.establishment_categories.some((ec) => ec.categories?.slug === categoriaSlug),
  );
  if (!rows.length) return null;
  return { cat, rows, cityName: rows[0].city };
}

export async function generateStaticParams() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("establishments")
      .select("city, establishment_categories(categories(slug))")
      .eq("is_active", true);
    const combos = new Set<string>();
    for (const e of (data as unknown as { city: string | null; establishment_categories: { categories: { slug: string } | null }[] }[] | null) ?? []) {
      if (!e.city) continue;
      for (const ec of e.establishment_categories) {
        if (ec.categories?.slug) combos.add(`${slugifyCity(e.city)}::${ec.categories.slug}`);
      }
    }
    return [...combos].map((c) => {
      const [cidade, categoria] = c.split("::");
      return { cidade, categoria };
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cidade: string; categoria: string }>;
}): Promise<Metadata> {
  const { cidade, categoria } = await params;
  const data = await loadData(cidade, categoria);
  if (!data) return { title: "BRAVA+" };
  const title = `Descontos em ${data.cat.name} em ${data.cityName} | BRAVA+`;
  const description = `${data.rows.length} ${data.rows.length === 1 ? "lugar" : "lugares"} de ${data.cat.name} em ${data.cityName} com cupons, clube de fidelidade e vantagens exclusivas pra assinantes BRAVA+.`;
  return { title, description, alternates: { canonical: `/vantagens/${cidade}/${categoria}` } };
}

export default async function VantagensLocalPage({
  params,
}: {
  params: Promise<{ cidade: string; categoria: string }>;
}) {
  const { cidade, categoria } = await params;
  const data = await loadData(cidade, categoria);
  if (!data) notFound();
  const { cat, rows, cityName } = data;

  // outras categorias com estab na mesma cidade (links internos)
  const admin = createAdminClient();
  const { data: all } = await admin
    .from("establishments")
    .select("city, establishment_categories(categories(slug, name))")
    .eq("is_active", true);
  const siblings = new Map<string, string>();
  for (const e of (all as unknown as { city: string | null; establishment_categories: { categories: { slug: string; name: string } | null }[] }[] | null) ?? []) {
    if (!e.city || slugifyCity(e.city) !== cidade) continue;
    for (const ec of e.establishment_categories) {
      if (ec.categories && ec.categories.slug !== categoria) siblings.set(ec.categories.slug, ec.categories.name);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Descontos em ${cat.name} em ${cityName}`,
    numberOfItems: rows.length,
    itemListElement: rows.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: `https://www.bravamais.com.br/p/${e.slug}`,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">
          BRAVA+ · {cityName}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brava-ink sm:text-4xl">
          Descontos em {cat.name} em {cityName}
        </h1>
        <p className="mt-2 text-brava-muted">
          {rows.length} {rows.length === 1 ? "lugar parceiro" : "lugares parceiros"} com cupom, clube de
          fidelidade e vantagens exclusivas pra assinantes.
          {typeof cat.monthly_cents === "number" && cat.monthly_cents > 0 && (
            <>
              {" "}Assine a categoria {cat.name} por{" "}
              <b>{(cat.monthly_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês</b>.
            </>
          )}
        </p>
        <Link
          href="/assinar/categorias"
          className="mt-4 inline-block rounded-full bg-brava-black px-6 py-3 text-sm font-black text-brava-yellow"
        >
          Quero esses descontos
        </Link>
      </header>

      <section className="space-y-3">
        {rows.map((e) => (
          <Link
            key={e.id}
            href={`/p/${e.slug}`}
            className="flex items-center gap-4 rounded-2xl border border-brava-border bg-brava-card p-4 transition hover:border-brava-yellow"
          >
            {e.logo_url ? (
              <Image src={e.logo_url} alt={e.name} width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl object-cover" unoptimized />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brava-paper text-lg">🏪</div>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold text-brava-ink">{e.name}</p>
              {e.tagline && <p className="truncate text-sm text-brava-muted">{e.tagline}</p>}
            </div>
          </Link>
        ))}
      </section>

      {siblings.size > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-black uppercase tracking-wider text-brava-muted">
            Mais vantagens em {cityName}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...siblings.entries()].map(([slug, name]) => (
              <Link
                key={slug}
                href={`/vantagens/${cidade}/${slug}`}
                className="rounded-full border border-brava-border px-4 py-2 text-xs font-bold text-brava-ink hover:border-brava-yellow"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
