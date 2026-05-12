import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { CategoryBar, TierPie, SignupsArea, TopCouponsBar } from "@/components/admin-charts";

export const metadata = { title: "Admin · Dashboard" };

const TIER_PRICE_CENTS: Record<string, number> = { basico: 1990, premium: 3990, vip: 7990 };

export default async function AdminDashboard() {
  await requireRole("admin");
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: estabsCount },
    { count: ordersCount },
    { count: couponsCount },
    { data: subsRaw },
    { data: usersRaw },
    { data: catEstabsRaw },
    { data: topCouponsRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("establishments").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("coupons").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("subscriptions").select("tier, status").in("status", ["active", "trial"]),
    supabase.from("profiles").select("created_at").order("created_at", { ascending: false }).limit(60),
    supabase
      .from("establishment_categories")
      .select("category_id, categories(slug, name, display_order)"),
    supabase
      .from("coupons")
      .select("code, uses_count")
      .order("uses_count", { ascending: false })
      .limit(8),
  ]);

  // Tier distribution
  const tierCount = new Map<string, number>();
  let mrrCents = 0;
  for (const s of (subsRaw as { tier: string; status: string }[] | null) ?? []) {
    tierCount.set(s.tier, (tierCount.get(s.tier) ?? 0) + 1);
    if (s.status === "active") mrrCents += TIER_PRICE_CENTS[s.tier] ?? 0;
  }
  const tierData = Array.from(tierCount.entries()).map(([k, v]) => ({ name: k.toUpperCase(), value: v }));

  // Signups por dia (últimos 14)
  const dayMap = new Map<string, number>();
  const now = Date.now();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 24 * 3600 * 1000).toISOString().slice(0, 10);
    dayMap.set(d, 0);
  }
  for (const u of (usersRaw as { created_at: string }[] | null) ?? []) {
    const day = new Date(u.created_at).toISOString().slice(0, 10);
    if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const signupsData = Array.from(dayMap.entries()).map(([day, signups]) => ({
    day: day.slice(5),
    signups,
  }));

  // Estabelecimentos por categoria
  type CatRow = { category_id: string; categories: { name: string; display_order: number } | null };
  const catMap = new Map<string, number>();
  for (const ec of (catEstabsRaw as CatRow[] | null) ?? []) {
    const name = ec.categories?.name ?? "—";
    catMap.set(name, (catMap.get(name) ?? 0) + 1);
  }
  const categoryData = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Top cupons
  const couponsData = ((topCouponsRaw as { code: string; uses_count: number }[] | null) ?? [])
    .filter((c) => c.uses_count > 0)
    .map((c) => ({ code: c.code, uses: c.uses_count }));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink md:text-4xl">Dashboard</h1>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Usuários totais" value={`${usersCount ?? 0}`} />
        <Kpi label="Estabelecimentos ativos" value={`${estabsCount ?? 0}`} />
        <Kpi label="MRR estimado" value={formatBRL(mrrCents)} />
        <Kpi label="Pedidos no banco" value={`${ordersCount ?? 0}`} accent="yellow" />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-brava-border bg-white p-6">
          <h2 className="text-lg font-bold text-brava-ink">Signups (14 dias)</h2>
          <p className="text-xs text-brava-muted">Novos usuários por dia</p>
          <div className="mt-4">
            <SignupsArea data={signupsData} />
          </div>
        </article>
        <article className="rounded-3xl border border-brava-border bg-white p-6">
          <h2 className="text-lg font-bold text-brava-ink">Distribuição de assinaturas</h2>
          <p className="text-xs text-brava-muted">Trials e ativas por tier</p>
          <div className="mt-4">
            {tierData.length ? (
              <TierPie data={tierData} />
            ) : (
              <p className="py-12 text-center text-sm text-brava-muted">Sem assinaturas ainda.</p>
            )}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-brava-border bg-white p-6">
          <h2 className="text-lg font-bold text-brava-ink">Estabelecimentos por categoria</h2>
          <div className="mt-4">
            {categoryData.length ? (
              <CategoryBar data={categoryData} />
            ) : (
              <p className="py-12 text-center text-sm text-brava-muted">Sem dados.</p>
            )}
          </div>
        </article>
        <article className="rounded-3xl border border-brava-border bg-white p-6">
          <h2 className="text-lg font-bold text-brava-ink">Top cupons (mais usados)</h2>
          <div className="mt-4">
            {couponsData.length ? (
              <TopCouponsBar data={couponsData} />
            ) : (
              <p className="py-12 text-center text-sm text-brava-muted">
                Cupons criados: {couponsCount ?? 0} · ainda sem usos registrados
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: "yellow" }) {
  return (
    <article className={`rounded-2xl border p-5 ${accent === "yellow" ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-white"}`}>
      <p className="text-xs uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-2 text-3xl font-black text-brava-ink">{value}</p>
    </article>
  );
}
