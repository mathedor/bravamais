import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

interface PkgCoupon {
  highlight: boolean;
  display_order: number;
  coupons: {
    id: string;
    code: string;
    description: string | null;
    discount_percent: number | null;
    discount_cents: number | null;
    establishments: { slug: string; name: string; cover_url: string | null } | null;
  } | null;
}

export default async function PacotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: pkg } = await supabase
    .from("seasonal_packages")
    .select("id, title, subtitle, description, cover_url, theme_emoji, theme_color, ends_at")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!pkg) notFound();

  const { data: itemsRaw } = await supabase
    .from("seasonal_package_coupons")
    .select("highlight, display_order, coupons(id, code, description, discount_percent, discount_cents, establishments(slug, name, cover_url))")
    .eq("package_id", pkg.id)
    .order("display_order");
  const items = (itemsRaw as unknown as PkgCoupon[] | null) ?? [];

  const endsAt = new Date(pkg.ends_at);
  const hoursLeft = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 3600000));
  const daysLeft = Math.floor(hoursLeft / 24);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <header className="relative overflow-hidden rounded-3xl p-8 text-brava-black shadow-xl" style={{ background: `linear-gradient(135deg, ${pkg.theme_color}, #fff)` }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Pacote especial</p>
        <p className="mt-2 text-5xl">{pkg.theme_emoji ?? "🎉"}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{pkg.title}</h1>
        {pkg.subtitle && <p className="mt-1 text-base font-bold">{pkg.subtitle}</p>}
        <p className="mt-3 text-xs font-bold">
          {daysLeft > 0 ? `⏰ ${daysLeft} dia${daysLeft === 1 ? "" : "s"} restantes` : `⏰ ${hoursLeft}h restantes`}
        </p>
        {pkg.description && <p className="mt-3 max-w-2xl text-sm">{pkg.description}</p>}
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((it, i) =>
          it.coupons ? (
            <Link
              key={it.coupons.id}
              href={`/app/estabelecimento/${it.coupons.establishments?.slug ?? ""}`}
              className={`group relative overflow-hidden rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-xl ${
                it.highlight ? "bg-gradient-to-br from-brava-yellow via-amber-300 to-brava-yellow-deep text-brava-black" : "border border-brava-border bg-brava-card text-brava-ink"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {it.highlight && <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brava-blue">⭐ Destaque</p>}
                  <p className={`text-xs font-bold uppercase tracking-wider ${it.highlight ? "text-brava-blue" : "text-brava-blue"}`}>
                    {it.coupons.establishments?.name ?? "—"}
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {it.coupons.discount_percent ? `-${it.coupons.discount_percent}%` : it.coupons.discount_cents ? `R$ ${(it.coupons.discount_cents / 100).toFixed(2)}` : ""}
                  </p>
                  {it.coupons.description && <p className="mt-1 text-xs opacity-75">{it.coupons.description}</p>}
                </div>
                {it.coupons.establishments?.cover_url && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 ring-brava-black/10">
                    <Image src={it.coupons.establishments.cover_url} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <code className={`rounded-md px-2 py-1 font-mono text-xs font-bold ${it.highlight ? "bg-brava-black text-brava-yellow" : "bg-brava-paper"}`}>
                  {it.coupons.code}
                </code>
                <span className="text-xs font-bold opacity-80">Ver loja →</span>
              </div>
            </Link>
          ) : null,
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}
