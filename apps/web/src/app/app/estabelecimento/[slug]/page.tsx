import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL, formatPhone, PROMO_LABELS } from "@/lib/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function EstabelecimentoPage({ params }: PageProps) {
  const { slug } = await params;
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: estab } = await supabase
    .from("establishments")
    .select(
      `*,
       establishment_categories(category_id, categories(slug, name)),
       establishment_promotions(promotion_type, is_active),
       products(id, name, description, price_cents, photos, is_active),
       coupons(id, code, description, discount_percent, discount_cents, valid_until, is_active),
       loyalty_clubs(id, name, description, visits_required, benefit_description, is_active)`,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!estab) {
    notFound();
  }

  type Category = { slug: string; name: string };
  type Product = { id: string; name: string; description: string | null; price_cents: number; photos: string[]; is_active: boolean };
  type Coupon = { id: string; code: string; description: string | null; discount_percent: number | null; discount_cents: number | null; valid_until: string | null; is_active: boolean };
  type Loyalty = { id: string; name: string; description: string | null; visits_required: number; benefit_description: string; is_active: boolean };

  const cats: Category[] = (estab.establishment_categories ?? [])
    .map((ec: { categories: Category | null }) => ec.categories)
    .filter(Boolean) as Category[];

  const promos: string[] = (estab.establishment_promotions ?? [])
    .filter((p: { is_active: boolean }) => p.is_active)
    .map((p: { promotion_type: string }) => p.promotion_type);

  const products: Product[] = (estab.products ?? []).filter((p: Product) => p.is_active);
  const coupons: Coupon[] = (estab.coupons ?? []).filter((c: Coupon) => c.is_active);
  const loyaltyClubs: Loyalty[] = (estab.loyalty_clubs ?? []).filter((l: Loyalty) => l.is_active);

  const cover = estab.cover_url || estab.photos?.[0] || null;
  const endereco = [estab.street, estab.number, estab.neighborhood, estab.city, estab.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex-1">
      <section className="relative">
        <div className="relative h-72 w-full overflow-hidden bg-brava-paper md:h-96">
          {cover && (
            <Image
              src={cover}
              alt={estab.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
          <Link
            href="/app/buscar"
            className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur hover:bg-black/80"
          >
            ← Voltar
          </Link>
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <div className="-mt-20 flex flex-col gap-5 rounded-3xl border border-brava-border bg-white p-6 shadow-xl sm:flex-row sm:items-start">
            {estab.logo_url && (
              <Image
                src={estab.logo_url}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-1 ring-brava-border"
              />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-brava-ink md:text-4xl">{estab.name}</h1>
                  {estab.tagline && <p className="mt-1 text-brava-muted">{estab.tagline}</p>}
                </div>
                {estab.is_verified && (
                  <span className="inline-flex items-center rounded-full bg-brava-blue px-3 py-1 text-xs font-bold uppercase text-white">
                    Verificado
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {cats.map((c) => (
                  <span key={c.slug} className="rounded-full bg-brava-paper px-3 py-1 font-medium text-brava-ink">
                    {c.name}
                  </span>
                ))}
                {promos.map((p) => (
                  <span key={p} className="rounded-full bg-brava-yellow/20 px-3 py-1 font-medium text-brava-blue">
                    {PROMO_LABELS[p] ?? p}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {estab.whatsapp && (
                  <a
                    href={`https://wa.me/${estab.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600"
                  >
                    WhatsApp
                  </a>
                )}
                <Link
                  href={`/app/estabelecimento/${slug}/chat`}
                  className="inline-flex items-center rounded-full border border-brava-border bg-white px-4 py-2 text-sm font-medium text-brava-ink hover:bg-brava-paper"
                >
                  Falar com a loja
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_320px]">
        <article className="space-y-10">
          {estab.description && (
            <section>
              <h2 className="text-xl font-bold text-brava-ink">Sobre</h2>
              <p className="mt-3 whitespace-pre-line text-brava-muted">{estab.description}</p>
            </section>
          )}

          {products.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-brava-ink">Catálogo</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {products.map((p) => (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-brava-border bg-white"
                  >
                    {p.photos?.[0] && (
                      <div className="relative aspect-[4/3] w-full bg-brava-paper">
                        <Image src={p.photos[0]} alt={p.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-brava-ink">{p.name}</h3>
                      {p.description && (
                        <p className="mt-1 text-sm text-brava-muted line-clamp-2">{p.description}</p>
                      )}
                      <p className="mt-3 text-lg font-black text-brava-blue">{formatBRL(p.price_cents)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {coupons.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-brava-ink">Cupons ativos</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {coupons.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-dashed border-brava-yellow bg-brava-yellow/10 p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-brava-yellow px-2 py-1 font-mono text-xs font-bold tracking-wide text-brava-black">
                        {c.code}
                      </span>
                      <span className="text-2xl font-black text-brava-blue">
                        {c.discount_percent ? `-${c.discount_percent}%` : `-${formatBRL(c.discount_cents ?? 0)}`}
                      </span>
                    </div>
                    {c.description && <p className="mt-2 text-sm text-brava-ink">{c.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {loyaltyClubs.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-brava-ink">Clube de fidelidade</h2>
              <div className="mt-4 space-y-3">
                {loyaltyClubs.map((l) => (
                  <div key={l.id} className="rounded-2xl border border-brava-border bg-white p-5">
                    <p className="text-sm font-bold uppercase tracking-wider text-brava-muted">{l.name}</p>
                    <p className="mt-2 text-2xl font-black text-brava-ink">
                      A cada <span className="text-brava-blue">{l.visits_required}</span> visitas
                    </p>
                    <p className="mt-2 text-brava-muted">{l.benefit_description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-brava-border bg-white p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brava-muted">Contato</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {endereco && <li className="text-brava-ink">{endereco}</li>}
              {estab.phone && <li className="text-brava-muted">{formatPhone(estab.phone)}</li>}
              {estab.instagram && (
                <li>
                  <a
                    href={`https://instagram.com/${estab.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brava-blue hover:underline"
                  >
                    {estab.instagram}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-brava-yellow bg-brava-yellow/10 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brava-blue">Mostre sua carteirinha</h3>
            <p className="mt-2 text-sm text-brava-ink">
              No balcão, abra sua carteirinha BRAVA+ e deixe o lojista ler o QR pra marcar sua visita.
            </p>
            <Link
              href="/app/carteirinha"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brava-black px-4 py-2.5 text-sm font-bold text-white"
            >
              Abrir carteirinha
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
