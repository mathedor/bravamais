import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { CategoryPicker } from "@/components/app/category-picker";
import { NearbyButton } from "@/components/app/nearby-button";
import { FeaturedRow, type FeaturedItem } from "@/components/app/featured-row";
import { NearbyList, type NearbyItem } from "@/components/app/nearby-list";
import { PROMO_LABELS, formatBRL } from "@/lib/format";

export const metadata = { title: "Início" };

interface RawEstab {
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  logo_url: string | null;
  cover_url: string | null;
  photos: string[] | null;
  is_verified: boolean;
  total_visits: number;
  establishment_categories?: { categories: { slug: string; name: string } | null }[];
  establishment_promotions?: { promotion_type: string; is_active: boolean }[];
}

export default async function AppHome() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [
    { data: estabsRaw },
    { data: categorias },
    { data: subscription },
    { data: cuponsAtivos },
    { data: profileFull },
    { data: savings },
  ] = await Promise.all([
    supabase
      .from("establishments")
      .select(
        `slug, name, tagline, city, state, lat, lng, logo_url, cover_url, photos, is_verified, total_visits,
         establishment_categories(categories(slug, name)),
         establishment_promotions(promotion_type, is_active)`,
      )
      .eq("is_active", true)
      .order("total_visits", { ascending: false })
      .limit(60),
    supabase
      .from("categories")
      .select("slug, name, display_order")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("subscriptions")
      .select("tier, status, current_period_end, trial_ends_at")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("coupons")
      .select("code, description, discount_percent, discount_cents, establishments(slug, name, cover_url)")
      .eq("is_active", true)
      .limit(6),
    supabase.from("profiles").select("coins_balance").eq("id", profile.id).maybeSingle(),
    supabase.from("user_savings").select("total_saved_cents").eq("user_id", profile.id).maybeSingle(),
  ]);

  const coins = profileFull?.coins_balance ?? 0;
  const totalSaved = (savings as unknown as { total_saved_cents: number } | null)?.total_saved_cents ?? 0;

  const estabs = (estabsRaw as unknown as RawEstab[]) ?? [];

  const featured: FeaturedItem[] = estabs.slice(0, 8).map((e) => ({
    slug: e.slug,
    name: e.name,
    category: e.establishment_categories?.[0]?.categories?.name ?? null,
    cover: e.cover_url || e.photos?.[0] || null,
    logo: e.logo_url,
  }));

  const nearby: NearbyItem[] = estabs
    .filter((e) => typeof e.lat === "number" && typeof e.lng === "number")
    .map((e) => ({
      slug: e.slug,
      name: e.name,
      tagline: e.tagline,
      city: e.city,
      state: e.state,
      lat: e.lat!,
      lng: e.lng!,
      cover: e.cover_url || e.photos?.[0] || null,
      logo: e.logo_url,
      promo:
        e.establishment_promotions
          ?.filter((p) => p.is_active)
          .map((p) => PROMO_LABELS[p.promotion_type])
          .filter(Boolean)[0] ?? null,
    }));

  type Cupom = {
    code: string;
    description: string | null;
    discount_percent: number | null;
    discount_cents: number | null;
    establishments: { slug: string; name: string; cover_url: string | null } | null;
  };
  const cupons = (cuponsAtivos as unknown as Cupom[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Hero saudação */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brava-black via-brava-ink to-brava-blue p-6 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brava-yellow/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-brava-blue-bright/40 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">
            {greetingByHour()}
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[0.95] tracking-tight sm:text-5xl">
            Oi, {firstName(profile.full_name)} 👋
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/75 sm:text-base">
            Aproveite as vantagens do clube. Mostre sua carteirinha no balcão e veja seus benefícios crescerem.
          </p>

          {/* Stats compactos: economia + coins */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
            <Link
              href="/app/carteira"
              className="group rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur transition hover:bg-white/10"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-brava-yellow">Economizou</p>
              <p className="mt-1 text-xl font-black">{formatBRL(totalSaved)}</p>
              <p className="text-[10px] text-white/55">ver carteira →</p>
            </Link>
            <Link
              href="/app/carteira"
              className="group rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur transition hover:bg-white/10"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-brava-yellow">BRAVA Coins</p>
              <p className="mt-1 text-xl font-black">🪙 {coins}</p>
              <p className="text-[10px] text-white/55">ganhe + indicando amigos</p>
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 sm:max-w-md">
            <PerkChip label="Carteira" href="/app/carteira" emoji="🪙" />
            <PerkChip label="Carteirinha" href="/app/carteirinha" emoji="💳" />
            <PerkChip label="Buscar" href="/app/buscar" emoji="🔎" />
            <PerkChip label="Indique" href="/app/indique" emoji="🎁" />
          </div>

          {subscription && (
            <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs backdrop-blur">
              <span className="rounded-full bg-brava-yellow px-2 py-0.5 font-bold text-brava-black">
                {subscription.tier?.toUpperCase()}
              </span>
              <span className="text-white/80">
                {subscription.status === "trial"
                  ? `Trial até ${formatDate(subscription.trial_ends_at)}`
                  : subscription.status === "active"
                  ? `Renova ${formatDate(subscription.current_period_end)}`
                  : subscription.status}
              </span>
              <Link href="/assinar" className="text-brava-yellow underline-offset-2 hover:underline">
                Upgrade
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stories: em destaque */}
      <section className="mt-10">
        <SectionHeader title="Em destaque agora" subtitle="Parceiros mais visitados do clube" />
        <div className="mt-5">
          <FeaturedRow items={featured} />
        </div>
      </section>

      {/* Atalhos: Próximo a mim + Categorias */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <NearbyButton />
        <CategoryPicker categorias={(categorias ?? []).map((c) => ({ slug: c.slug, name: c.name }))} />
      </section>

      {/* Cupons quentes */}
      {cupons.length > 0 && (
        <section className="mt-10">
          <SectionHeader title="Cupons quentes 🔥" subtitle="Códigos exclusivos pra usar agora" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cupons.map((c, i) => (
              <CouponCard key={c.code + i} coupon={c} />
            ))}
          </div>
        </section>
      )}

      {/* Perto de você */}
      <section className="mt-10">
        <SectionHeader title="Perto de você" subtitle="Ordenado por distância" actionHref="/app/buscar" actionLabel="Ver tudo" />
        <div className="mt-5">
          <NearbyList items={nearby} limit={8} />
        </div>
      </section>

      <div className="h-6" />
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  actionHref,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-2">
      <div>
        <h2 className="text-xl font-black tracking-tight text-brava-ink sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-brava-muted sm:text-sm">{subtitle}</p>}
      </div>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="text-xs font-bold text-brava-blue hover:underline sm:text-sm">
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}

function PerkChip({ href, label, emoji }: { href: string; label: string; emoji: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur transition hover:bg-white/15"
    >
      <span className="text-xl transition-transform group-hover:scale-110">{emoji}</span>
      <span className="text-[11px] font-bold text-white">{label}</span>
    </Link>
  );
}

function CouponCard({
  coupon,
}: {
  coupon: {
    code: string;
    description: string | null;
    discount_percent: number | null;
    discount_cents: number | null;
    establishments: { slug: string; name: string; cover_url: string | null } | null;
  };
}) {
  const valor =
    coupon.discount_percent != null
      ? `-${coupon.discount_percent}%`
      : coupon.discount_cents != null
      ? `R$ ${(coupon.discount_cents / 100).toFixed(2)}`
      : "";

  return (
    <Link
      href={coupon.establishments ? `/app/estabelecimento/${coupon.establishments.slug}` : "#"}
      className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brava-yellow via-amber-300 to-brava-yellow-deep p-5 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">{coupon.establishments?.name ?? "Cupom"}</p>
          <p className="mt-2 text-3xl font-black text-brava-black">{valor}</p>
        </div>
        {coupon.establishments?.cover_url && (
          <div className="relative h-14 w-14 overflow-hidden rounded-xl ring-2 ring-brava-black/10">
            <Image src={coupon.establishments.cover_url} alt="" fill sizes="56px" className="object-cover" />
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-brava-black/80">{coupon.description ?? ""}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-md bg-brava-black px-2 py-1 font-mono text-xs font-bold text-brava-yellow">
          {coupon.code}
        </span>
        <span className="text-xs font-bold text-brava-blue group-hover:underline">Ver loja →</span>
      </div>
      <div className="pointer-events-none absolute -right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-card" />
      <div className="pointer-events-none absolute -left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-card" />
    </Link>
  );
}

function firstName(name: string | null): string {
  if (!name) return "amigo";
  return name.split(" ")[0];
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
