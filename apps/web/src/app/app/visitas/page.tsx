import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Lugares que visitei" };

interface VisitRow {
  id: string;
  created_at: string;
  source: string;
  establishments: {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    city: string | null;
    state: string | null;
    logo_url: string | null;
    cover_url: string | null;
    photos: string[] | null;
    establishment_categories: { categories: { name: string } | null }[] | null;
  } | null;
}

interface AggregatedPlace {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  categoryName: string | null;
  visits: number;
  lastVisit: string;
  firstVisit: string;
}

export default async function VisitasPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("visits")
    .select(
      `id, created_at, source,
       establishments(id, slug, name, tagline, city, state, logo_url, cover_url, photos,
                      establishment_categories(categories(name)))`,
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (data as unknown as VisitRow[] | null) ?? [];

  // Agrupa por estabelecimento (1 card por loja, com contagem + última visita)
  const byEstab = new Map<string, AggregatedPlace>();
  for (const r of rows) {
    const e = r.establishments;
    if (!e) continue;
    const existing = byEstab.get(e.id);
    if (existing) {
      existing.visits += 1;
      if (r.created_at < existing.firstVisit) existing.firstVisit = r.created_at;
    } else {
      byEstab.set(e.id, {
        id: e.id,
        slug: e.slug,
        name: e.name,
        tagline: e.tagline,
        city: e.city,
        state: e.state,
        logoUrl: e.logo_url,
        coverUrl: e.cover_url || e.photos?.[0] || null,
        categoryName: e.establishment_categories?.[0]?.categories?.name ?? null,
        visits: 1,
        lastVisit: r.created_at,
        firstVisit: r.created_at,
      });
    }
  }

  const places = Array.from(byEstab.values()).sort((a, b) =>
    b.lastVisit.localeCompare(a.lastVisit),
  );

  const totalVisits = rows.length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Lugares que visitei</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Sua passagem pela rede BRAVA+</h1>
        <p className="mt-1 text-brava-muted">
          {places.length} lugar{places.length === 1 ? "" : "es"} · {totalVisits} visita{totalVisits === 1 ? "" : "s"} no total
        </p>
      </header>

      {places.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center">
          <p className="text-2xl">📍</p>
          <p className="mt-2 text-brava-ink">Você ainda não visitou nenhum parceiro.</p>
          <p className="mt-1 text-sm text-brava-muted">
            Toda vez que um estab ler sua carteirinha (QR), o registro aparece aqui.
          </p>
          <Link
            href="/app/buscar"
            className="mt-5 inline-flex items-center rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black"
          >
            Buscar parceiros perto
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {places.map((p) => {
            const date = new Date(p.lastVisit);
            const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
            const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            return (
              <li key={p.id}>
                <Link
                  href={`/app/estabelecimento/${p.slug}`}
                  className="block overflow-hidden rounded-3xl border border-brava-border bg-brava-card transition hover:border-brava-yellow hover:shadow-md"
                >
                  <div className="relative h-32 w-full overflow-hidden bg-brava-paper">
                    {p.coverUrl ? (
                      <Image
                        src={p.coverUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-brava-muted">📍</div>
                    )}
                    <div className="absolute right-3 top-3 rounded-full bg-brava-black/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                      {p.visits === 1 ? "1ª visita" : `${p.visits} visitas`}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    {p.logoUrl && (
                      <Image
                        src={p.logoUrl}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-xl object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-black text-brava-ink">{p.name}</p>
                      <p className="truncate text-xs text-brava-muted">
                        {[p.categoryName, p.city && `${p.city}/${p.state ?? ""}`.replace(/\/$/, "")]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <p className="mt-1 text-[11px] text-brava-muted">
                        Última visita: <strong className="text-brava-ink">{dateStr}</strong> às {timeStr}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
