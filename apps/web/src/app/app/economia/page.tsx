import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Minha economia" };

interface SaleRow {
  id: string;
  gross_cents: number;
  discount_cents: number;
  net_cents: number;
  benefit_kind: string | null;
  benefit_label: string | null;
  created_at: string;
  establishments: { slug: string; name: string; logo_url: string | null } | null;
}

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EconomiaPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("pos_sales")
    .select("id, gross_cents, discount_cents, net_cents, benefit_kind, benefit_label, created_at, establishments(slug, name, logo_url)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data as unknown as SaleRow[] | null) ?? [];

  const totalSaved = rows.reduce((s, r) => s + (r.discount_cents ?? 0), 0);
  const totalSpent = rows.reduce((s, r) => s + (r.net_cents ?? 0), 0);
  const visits = rows.length;
  const byEstab = new Map<string, { name: string; slug: string; saved: number; visits: number }>();
  for (const r of rows) {
    if (!r.establishments) continue;
    const key = r.establishments.slug;
    const exist = byEstab.get(key);
    if (exist) {
      exist.saved += r.discount_cents ?? 0;
      exist.visits += 1;
    } else {
      byEstab.set(key, {
        name: r.establishments.name,
        slug: r.establishments.slug,
        saved: r.discount_cents ?? 0,
        visits: 1,
      });
    }
  }
  const topEstabs = Array.from(byEstab.values()).sort((a, b) => b.saved - a.saved).slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Minha economia</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Quanto o BRAVA+ já te poupou</h1>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border-2 border-brava-yellow bg-gradient-to-br from-brava-yellow/15 to-amber-100/30 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-black/70">Economia total</p>
          <p className="mt-2 text-3xl font-black text-brava-black">{centsToBRL(totalSaved)}</p>
        </div>
        <div className="rounded-3xl border border-brava-border bg-brava-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">Gasto total</p>
          <p className="mt-2 text-3xl font-black text-brava-ink">{centsToBRL(totalSpent)}</p>
        </div>
        <div className="rounded-3xl border border-brava-border bg-brava-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">Compras registradas</p>
          <p className="mt-2 text-3xl font-black text-brava-ink">{visits}</p>
        </div>
      </section>

      {topEstabs.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">Onde mais economizou</h2>
          <ul className="space-y-2">
            {topEstabs.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/app/estabelecimento/${e.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card px-4 py-3 hover:border-brava-yellow"
                >
                  <span className="text-xl">🏪</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-brava-ink">{e.name}</p>
                    <p className="text-xs text-brava-muted">{e.visits} compra{e.visits === 1 ? "" : "s"}</p>
                  </div>
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{centsToBRL(e.saved)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">Histórico</h2>
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center">
            <p className="text-brava-ink">Nenhuma compra registrada no balcão ainda.</p>
            <p className="mt-1 text-sm text-brava-muted">
              Toda vez que um estab passar a sua carteirinha e aplicar um benefício, aparece aqui.
            </p>
            <Link href="/app/buscar" className="mt-5 inline-flex items-center rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black">
              Buscar parceiros
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={r.establishments ? `/app/estabelecimento/${r.establishments.slug}` : "#"}
                  className="flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card px-4 py-3 hover:bg-brava-paper"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-brava-ink">{r.establishments?.name ?? "—"}</p>
                    <p className="text-xs text-brava-muted">
                      {new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {r.benefit_label && ` · ${r.benefit_label}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brava-ink">{centsToBRL(r.net_cents)}</p>
                    {r.discount_cents > 0 && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">−{centsToBRL(r.discount_cents)}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
