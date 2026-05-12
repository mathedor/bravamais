import Link from "next/link";
import Image from "next/image";

export interface EstablishmentCardData {
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  cover_url: string | null;
  photos: string[];
  average_rating: number | null;
  total_reviews: number;
  promos?: string[];
  distance_km?: number | null;
}

export function EstablishmentCard({ e }: { e: EstablishmentCardData }) {
  const cover = e.cover_url || e.photos?.[0] || null;

  return (
    <Link
      href={`/app/estabelecimento/${e.slug}`}
      className="group block overflow-hidden rounded-3xl border border-brava-border bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brava-paper">
        {cover ? (
          <Image
            src={cover}
            alt={e.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brava-muted">sem foto</div>
        )}
        {typeof e.distance_km === "number" && (
          <span className="absolute right-3 top-3 rounded-full bg-brava-black/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {e.distance_km.toFixed(1)} km
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          {e.logo_url ? (
            <Image
              src={e.logo_url}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-brava-border"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brava-yellow text-brava-blue">
              <span className="text-xl font-black">+</span>
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-brava-ink">{e.name}</h3>
            <p className="truncate text-sm text-brava-muted">
              {e.city ? `${e.city}/${e.state ?? ""}` : ""}
            </p>
          </div>
        </div>
        {e.tagline && (
          <p className="mt-3 line-clamp-2 text-sm text-brava-muted">{e.tagline}</p>
        )}
        {e.promos && e.promos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {e.promos.slice(0, 3).map((p) => (
              <span
                key={p}
                className="rounded-full bg-brava-yellow/20 px-2 py-0.5 text-[11px] font-medium text-brava-blue"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
