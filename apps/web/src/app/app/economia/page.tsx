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

interface Breakdown {
  totals: { total_sales: number; gross: number; saved: number; spent: number };
  by_kind: Array<{ benefit_kind: string; cnt: number; saved: number }>;
  by_category: Array<{ category_id: string; category_name: string; slug: string; cnt: number; gross: number; saved: number; spent: number }>;
  by_month: Array<{ month: string; cnt: number; gross: number; saved: number }>;
  subscription: { monthly_cents: number; trial_ends_at: string | null; in_trial: boolean } | null;
}

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const KIND_LABEL: Record<string, { label: string; emoji: string; color: string }> = {
  coupon: { label: "Cupom", emoji: "🎟️", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200" },
  gift_card: { label: "Vale-presente", emoji: "🎁", color: "bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-200" },
  loyalty_reward: { label: "Fidelidade", emoji: "🏆", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200" },
  renewable: { label: "Renovável", emoji: "♻️", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" },
};

export default async function EconomiaPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: rowsRaw }, { data: breakdownData }] = await Promise.all([
    supabase
      .from("pos_sales")
      .select("id, gross_cents, discount_cents, net_cents, benefit_kind, benefit_label, created_at, establishments(slug, name, logo_url)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.rpc("user_economy_breakdown", { p_user_id: profile.id }),
  ]);

  const rows = (rowsRaw as unknown as SaleRow[] | null) ?? [];
  const breakdown = breakdownData as Breakdown | null;

  const totals = breakdown?.totals ?? { total_sales: 0, gross: 0, saved: 0, spent: 0 };
  const sub = breakdown?.subscription ?? null;

  // ROI: economia ÷ (mensalidade × meses desde primeira compra ou desde criação subscription)
  const firstSale = rows.length > 0 ? rows[rows.length - 1] : null;
  const monthsActive = firstSale
    ? Math.max(1, (Date.now() - new Date(firstSale.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 1;
  const monthlyAssin = sub?.monthly_cents ?? 0;
  const totalPaid = Math.round(monthlyAssin * monthsActive);
  const roi = monthlyAssin > 0 ? totals.saved / Math.max(1, totalPaid) : null;

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

  const maxMonth = Math.max(1, ...(breakdown?.by_month ?? []).map((m) => m.saved));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Minha economia</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Quanto o BRAVA+ já te poupou</h1>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border-2 border-brava-yellow bg-gradient-to-br from-brava-yellow/15 to-amber-100/30 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-black/70">Economia total</p>
          <p className="mt-2 text-3xl font-black text-brava-black">{centsToBRL(totals.saved)}</p>
        </div>
        <div className="rounded-3xl border border-brava-border bg-brava-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">Gasto total</p>
          <p className="mt-2 text-3xl font-black text-brava-ink">{centsToBRL(totals.spent)}</p>
        </div>
        <div className="rounded-3xl border border-brava-border bg-brava-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">Compras</p>
          <p className="mt-2 text-3xl font-black text-brava-ink">{totals.total_sales}</p>
        </div>
      </section>

      {/* ROI vs assinatura */}
      {monthlyAssin > 0 && (
        <section className="mb-8 rounded-3xl border border-brava-border bg-brava-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brava-muted">Vale a pena?</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-brava-muted">Assinatura mensal</p>
              <p className="text-xl font-black text-brava-ink">{centsToBRL(monthlyAssin)}</p>
            </div>
            <div>
              <p className="text-xs text-brava-muted">Pagou (estimado)</p>
              <p className="text-xl font-black text-brava-ink">{centsToBRL(totalPaid)}</p>
              <p className="text-[10px] text-brava-muted">{Math.round(monthsActive)} mês{Math.round(monthsActive) === 1 ? "" : "es"}</p>
            </div>
            <div>
              <p className="text-xs text-brava-muted">Retorno</p>
              <p className={`text-xl font-black ${roi !== null && roi >= 1 ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700"}`}>
                {roi !== null ? `${(roi * 100).toFixed(0)}%` : "—"}
              </p>
              <p className="text-[10px] text-brava-muted">
                {roi !== null && roi >= 1 ? "✓ Já se pagou" : "Use mais pra render"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Por tipo de benefício */}
      {breakdown && breakdown.by_kind.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">Por tipo de benefício</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {breakdown.by_kind.map((k) => {
              const meta = KIND_LABEL[k.benefit_kind] ?? { label: k.benefit_kind, emoji: "•", color: "bg-zinc-100" };
              return (
                <li key={k.benefit_kind} className="flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card px-4 py-3">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-brava-ink">{meta.label}</p>
                    <p className="text-xs text-brava-muted">{k.cnt} uso{k.cnt === 1 ? "" : "s"}</p>
                  </div>
                  <p className="font-black text-emerald-700 dark:text-emerald-300">{centsToBRL(k.saved)}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Por categoria */}
      {breakdown && breakdown.by_category.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">Por categoria</h2>
          <ul className="space-y-2">
            {breakdown.by_category.map((c) => (
              <li
                key={c.category_id}
                className="flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-brava-ink">{c.category_name}</p>
                  <p className="text-xs text-brava-muted">{c.cnt} compras · gastou {centsToBRL(c.spent)}</p>
                </div>
                <p className="font-black text-emerald-700 dark:text-emerald-300">{centsToBRL(c.saved)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Evolução mensal */}
      {breakdown && breakdown.by_month.length > 0 && (
        <section className="mb-8 rounded-3xl border border-brava-border bg-brava-card p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">Economia por mês</h2>
          <ul className="space-y-2">
            {breakdown.by_month.map((m) => {
              const pct = (m.saved / maxMonth) * 100;
              return (
                <li key={m.month}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-mono text-xs text-brava-muted">{m.month}</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">{centsToBRL(m.saved)}</span>
                  </div>
                  <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-brava-paper">
                    <div className="h-full bg-brava-yellow" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">Histórico de compras</h2>
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
