import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewStars } from "@/components/app/review-stars";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://brava-mais.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: estab } = await admin
    .from("establishments")
    .select("name, tagline, description, cover_url, city, state")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!estab) return { title: "Parceiro não encontrado" };

  const title = `${estab.name} · BRAVA+`;
  const desc = estab.tagline ?? estab.description?.slice(0, 160) ?? "Confira esse parceiro do clube BRAVA+";
  const url = `${BASE}/p/${slug}`;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: "BRAVA+",
      images: estab.cover_url ? [{ url: estab.cover_url, width: 1200, height: 630 }] : undefined,
      locale: "pt_BR",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: desc, images: estab.cover_url ? [estab.cover_url] : undefined },
  };
}

interface Estab {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  lat: number | null;
  lng: number | null;
  average_rating: number | null;
  total_reviews: number;
}

export default async function PublicEstabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("establishments")
    .select(
      "id, slug, name, tagline, description, logo_url, cover_url, phone, whatsapp, street, number, neighborhood, city, state, cep, lat, lng, average_rating, total_reviews",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const estab = data as Estab | null;
  if (!estab) notFound();

  // Schema.org LocalBusiness pro Google
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: estab.name,
    description: estab.description ?? estab.tagline ?? undefined,
    image: estab.cover_url ?? estab.logo_url ?? undefined,
    telephone: estab.phone ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: [estab.street, estab.number].filter(Boolean).join(", "),
      addressLocality: estab.city,
      addressRegion: estab.state,
      postalCode: estab.cep,
      addressCountry: "BR",
    },
    geo: estab.lat && estab.lng ? { "@type": "GeoCoordinates", latitude: estab.lat, longitude: estab.lng } : undefined,
    aggregateRating: estab.average_rating && estab.total_reviews ? {
      "@type": "AggregateRating",
      ratingValue: estab.average_rating,
      reviewCount: estab.total_reviews,
    } : undefined,
    url: `${BASE}/p/${estab.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative h-72 w-full overflow-hidden bg-brava-paper">
        {estab.cover_url && <Image src={estab.cover_url} alt={estab.name} fill priority sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
      </section>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="-mt-24 rounded-3xl border border-brava-border bg-brava-card p-6 shadow-xl">
          <div className="flex items-start gap-4">
            {estab.logo_url && (
              <Image src={estab.logo_url} alt="" width={80} height={80} className="h-20 w-20 rounded-2xl object-cover" />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-black text-brava-ink">{estab.name}</h1>
              {estab.tagline && <p className="mt-1 text-brava-muted">{estab.tagline}</p>}
              {estab.average_rating && (
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <ReviewStars rating={estab.average_rating} />
                  <span className="text-brava-muted">{estab.average_rating.toFixed(1)} · {estab.total_reviews} avaliações</span>
                </div>
              )}
            </div>
          </div>

          {estab.description && (
            <p className="mt-5 whitespace-pre-line text-brava-ink">{estab.description}</p>
          )}

          <div className="mt-6 grid gap-2 text-sm text-brava-muted">
            {estab.city && <p>📍 {[estab.street, estab.number, estab.neighborhood, estab.city, estab.state].filter(Boolean).join(", ")}</p>}
            {estab.phone && <p>📞 {estab.phone}</p>}
            {estab.whatsapp && <p>💬 WhatsApp {estab.whatsapp}</p>}
          </div>

          <div className="mt-8 rounded-3xl bg-gradient-to-br from-brava-yellow to-amber-500 p-6 text-center text-brava-black shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Clube BRAVA+</p>
            <p className="mt-2 text-2xl font-black">Acesse cupons, fidelidade e cashback aqui</p>
            <Link href="/assinar" className="mt-4 inline-block rounded-full bg-brava-black px-6 py-3 text-sm font-black text-brava-yellow hover:scale-105">
              Assinar BRAVA+ →
            </Link>
            <p className="mt-2 text-[11px] text-brava-blue">7 dias grátis · cancele quando quiser</p>
          </div>
        </div>
      </div>
    </>
  );
}
