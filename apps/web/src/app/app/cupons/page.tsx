import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Meus cupons" };

interface GrantRow {
  id: string;
  coupon_id: string;
  created_at: string;
  used_at: string | null;
  source: string;
  coupons: {
    id: string;
    code: string;
    description: string | null;
    discount_percent: number | null;
    discount_cents: number | null;
    valid_until: string | null;
    is_active: boolean;
    establishments: { slug: string; name: string; logo_url: string | null } | null;
  } | null;
}

interface RedemptionRow {
  id: string;
  redeemed_at: string;
  coupons: {
    id: string;
    code: string;
    description: string | null;
    discount_percent: number | null;
    discount_cents: number | null;
    establishments: { slug: string; name: string; logo_url: string | null } | null;
  } | null;
}

function formatDiscount(percent: number | null, cents: number | null): string {
  if (percent) return `${percent}%`;
  if (cents) return `-${formatBRL(cents)}`;
  return "—";
}

export default async function MeusCuponsPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const nowIso = new Date().toISOString();

  const [{ data: grants }, { data: redemptions }] = await Promise.all([
    supabase
      .from("coupon_grants")
      .select(
        "id, coupon_id, created_at, used_at, source, coupons(id, code, description, discount_percent, discount_cents, valid_until, is_active, establishments(slug, name, logo_url))",
      )
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("coupon_redemptions")
      .select(
        "id, redeemed_at, coupons(id, code, description, discount_percent, discount_cents, establishments(slug, name, logo_url))",
      )
      .eq("user_id", profile.id)
      .order("redeemed_at", { ascending: false }),
  ]);

  const grantRows = ((grants as unknown as GrantRow[] | null) ?? []).filter((g) => g.coupons);
  const redemptionRows = (redemptions as unknown as RedemptionRow[] | null) ?? [];

  const usedIds = new Set(redemptionRows.map((r) => r.coupons?.id).filter(Boolean) as string[]);

  const available = grantRows.filter((g) => {
    const c = g.coupons!;
    if (!c.is_active) return false;
    if (g.used_at) return false;
    if (usedIds.has(c.id)) return false;
    if (c.valid_until && c.valid_until < nowIso) return false;
    return true;
  });

  const expiredUnused = grantRows.filter((g) => {
    const c = g.coupons!;
    if (g.used_at) return false;
    if (usedIds.has(c.id)) return false;
    return c.valid_until ? c.valid_until < nowIso : false;
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Meus cupons</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Cupons que recebi</h1>
        <p className="mt-1 text-brava-muted">
          {available.length} {available.length === 1 ? "disponível" : "disponíveis"} · {redemptionRows.length} {redemptionRows.length === 1 ? "usado" : "usados"}
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-base font-bold text-brava-ink">Disponíveis pra usar</h2>
        {available.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-8 text-center">
            <p className="text-brava-ink">Nenhum cupom disponível agora.</p>
            <p className="mt-1 text-sm text-brava-muted">
              Quando um parceiro te mandar um cupom (ou você resgatar pela busca), ele aparece aqui.
            </p>
            <Link
              href="/app/buscar"
              className="mt-5 inline-flex items-center rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black"
            >
              Buscar parceiros
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {available.map((g) => {
              const c = g.coupons!;
              const estab = c.establishments;
              const valor = formatDiscount(c.discount_percent, c.discount_cents);
              return (
                <li key={g.id}>
                  <Link
                    href={estab ? `/app/estabelecimento/${estab.slug}` : "#"}
                    className="group relative flex items-stretch gap-0 overflow-hidden rounded-3xl border-2 border-brava-yellow/70 bg-gradient-to-br from-brava-yellow/15 via-amber-50 to-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-amber-900/20 dark:via-amber-950/40 dark:to-zinc-900"
                  >
                    <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-brava-yellow px-2 text-brava-black">
                      <p className="text-2xl font-black leading-none">{valor}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-80">OFF</p>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
                      {estab?.logo_url ? (
                        <Image
                          src={estab.logo_url}
                          alt={estab.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brava-paper text-brava-muted">
                          🎟️
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-brava-ink">{estab?.name ?? "Cupom"}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-brava-muted">
                          {c.description ?? "Cupom exclusivo pra você"}
                        </p>
                        <p className="mt-1.5 font-mono text-[11px] font-bold text-brava-blue">{c.code}</p>
                      </div>
                      {c.valid_until && (
                        <div className="hidden text-right sm:block">
                          <p className="text-[10px] uppercase tracking-wider text-brava-muted">
                            válido até<br />
                            <strong className="text-brava-ink">
                              {new Date(c.valid_until).toLocaleDateString("pt-BR")}
                            </strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {redemptionRows.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-bold text-brava-ink">Histórico — cupons usados</h2>
          <ul className="space-y-2">
            {redemptionRows.map((r) => {
              const c = r.coupons;
              if (!c) return null;
              const valor = formatDiscount(c.discount_percent, c.discount_cents);
              return (
                <li key={r.id}>
                  <Link
                    href={c.establishments ? `/app/estabelecimento/${c.establishments.slug}` : "#"}
                    className="flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card px-4 py-3 text-sm hover:bg-brava-paper"
                  >
                    <span className="rounded-md bg-brava-paper px-2 py-1 font-mono text-xs font-bold text-brava-blue">{c.code}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-brava-ink">{c.establishments?.name ?? "—"}</p>
                      <p className="text-xs text-brava-muted">
                        usado em {new Date(r.redeemed_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="font-black text-brava-blue">{valor}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {expiredUnused.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-base font-bold text-brava-muted">Expirados sem usar</h2>
          <ul className="space-y-2">
            {expiredUnused.map((g) => {
              const c = g.coupons!;
              return (
                <li
                  key={g.id}
                  className="flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card px-4 py-3 text-sm opacity-60"
                >
                  <span className="rounded-md bg-brava-paper px-2 py-1 font-mono text-xs font-bold text-brava-muted">{c.code}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{c.establishments?.name ?? "—"}</p>
                    <p className="text-xs text-brava-muted">
                      expirou em {new Date(c.valid_until ?? g.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
