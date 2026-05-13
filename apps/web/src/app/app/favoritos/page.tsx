import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Favoritos" };

interface FavRow {
  created_at: string;
  establishments: {
    slug: string;
    name: string;
    tagline: string | null;
    city: string | null;
    state: string | null;
    cover_url: string | null;
    logo_url: string | null;
    average_rating: number | null;
  } | null;
}

export default async function FavoritosPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("favorites")
    .select("created_at, establishments(slug, name, tagline, city, state, cover_url, logo_url, average_rating)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const rows = (data as unknown as FavRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Favoritos</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Seus lugares preferidos</h1>
        <p className="mt-1 text-sm text-brava-muted">{rows.length} parceiros salvos pra voltar.</p>
      </header>

      {rows.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center">
          <p className="text-5xl">❤️</p>
          <p className="mt-3 font-bold text-brava-ink">Você ainda não favoritou nenhum parceiro</p>
          <p className="mt-1 text-sm text-brava-muted">Toque no coração quando ver um lugar que gostar.</p>
          <Link href="/app/buscar" className="mt-4 inline-block rounded-full bg-brava-blue px-5 py-2 text-xs font-bold text-white">
            Explorar parceiros
          </Link>
        </section>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) =>
            r.establishments ? (
              <Link
                key={r.establishments.slug}
                href={`/app/estabelecimento/${r.establishments.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {r.establishments.cover_url || r.establishments.logo_url ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={r.establishments.cover_url ?? r.establishments.logo_url ?? ""}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brava-paper text-xl">🏪</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-brava-ink">{r.establishments.name}</p>
                  <p className="truncate text-xs text-brava-muted">
                    {r.establishments.tagline ?? (r.establishments.city ? `${r.establishments.city}/${r.establishments.state ?? ""}` : "")}
                  </p>
                  {r.establishments.average_rating && (
                    <p className="mt-0.5 text-xs">⭐ {r.establishments.average_rating.toFixed(1)}</p>
                  )}
                </div>
                <span className="text-brava-blue group-hover:translate-x-1 transition">→</span>
              </Link>
            ) : null,
          )}
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
