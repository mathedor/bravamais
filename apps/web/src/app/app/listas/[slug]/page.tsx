import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { ReviewStars } from "@/components/app/review-stars";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

interface Item {
  position: number;
  note: string | null;
  establishments: {
    slug: string;
    name: string;
    tagline: string | null;
    cover_url: string | null;
    logo_url: string | null;
    average_rating: number | null;
  } | null;
}

export default async function ListaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: list } = await supabase
    .from("editorial_lists")
    .select("id, title, description, cover_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!list) notFound();

  const { data: itemsRaw } = await supabase
    .from("editorial_list_items")
    .select("position, note, establishments(slug, name, tagline, cover_url, logo_url, average_rating)")
    .eq("list_id", list.id)
    .order("position");
  const items = (itemsRaw as unknown as Item[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Curadoria BRAVA+</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brava-ink">{list.title}</h1>
        {list.description && <p className="mt-2 text-sm text-brava-muted">{list.description}</p>}
      </header>

      <div className="space-y-3">
        {items.map((it, i) =>
          it.establishments ? (
            <Link
              key={it.establishments.slug}
              href={`/app/estabelecimento/${it.establishments.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card p-3 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brava-yellow text-base font-black text-brava-black">#{i + 1}</span>
              {it.establishments.cover_url ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Image src={it.establishments.cover_url} alt="" fill sizes="64px" className="object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brava-paper text-xl">🏪</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-brava-ink">{it.establishments.name}</p>
                {it.establishments.tagline && <p className="truncate text-[11px] text-brava-muted">{it.establishments.tagline}</p>}
                {it.establishments.average_rating && (
                  <div className="mt-0.5 flex items-center gap-1 text-[10px]">
                    <ReviewStars rating={it.establishments.average_rating} size={10} />
                    <span className="text-brava-muted">{it.establishments.average_rating.toFixed(1)}</span>
                  </div>
                )}
                {it.note && <p className="mt-1 text-[11px] italic text-brava-muted">"{it.note}"</p>}
              </div>
              <span className="text-brava-blue group-hover:translate-x-1 transition">→</span>
            </Link>
          ) : null,
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}
