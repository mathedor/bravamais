import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { CategoryBar, TierPie, SignupsArea, TopCouponsBar } from "@/components/admin-charts";

export const metadata = { title: "Admin · Dashboard" };

const TIER_PRICE_CENTS: Record<string, number> = { basico: 1990, premium: 3990, vip: 7990 };

interface LogRow {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string | null;
  created_at: string;
}

export default async function AdminDashboard() {
  await requireRole("admin");
  const supabase = await createClient();
  const adminDb = createAdminClient();
  const last30Iso = new Date(Date.now() - 30 * 86400000).toISOString();
  const last7Iso = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    { count: usersTotal },
    { count: usersLast7 },
    { count: estabsTotal },
    { count: estabsPending },
    { count: subsActive },
    { count: subsTrial },
    { count: ordersTotal },
    { count: ordersLast30 },
    { count: couponsActive },
    { count: storiesActive },
    { count: rewardsClaimed },
    { count: rewardsPending },
    { count: giftPending },
    { data: subsRaw },
    { data: ordersRaw },
    { data: giftsRaw },
    { data: usersByDayRaw },
    { data: categoryAggRaw },
    { data: topCouponsRaw },
    { data: recentLogsRaw },
    { data: pendingEstabsRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", last7Iso),
    supabase.from("establishments").select("*", { count: "exact", head: true }),
    supabase.from("establishments").select("*", { count: "exact", head: true }).eq("is_active", false),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trial"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", last30Iso),
    supabase.from("coupons").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("establishment_stories")
      .select("*", { count: "exact", head: true })
      .gt("expires_at", new Date().toISOString()),
    supabase.from("loyalty_rewards").select("*", { count: "exact", head: true }),
    supabase
      .from("loyalty_rewards")
      .select("*", { count: "exact", head: true })
      .is("used_at", null),
    supabase
      .from("gift_cards")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")
      .is("redeemed_at", null),
    supabase.from("subscriptions").select("tier, status").in("status", ["active", "trial"]),
    supabase.from("orders").select("total_cents, status, created_at").gte("created_at", last30Iso),
    supabase
      .from("gift_cards")
      .select("value_cents, status, created_at")
      .gte("created_at", last30Iso)
      .in("status", ["paid", "redeemed"]),
    supabase.from("profiles").select("created_at").order("created_at", { ascending: false }).limit(80),
    supabase.from("establishment_categories").select("category_id, categories(name)"),
    supabase.from("coupons").select("code, uses_count").order("uses_count", { ascending: false }).limit(8),
    adminDb
      .from("access_logs")
      .select("id, action, entity_type, entity_id, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("establishments")
      .select("id, slug, name, city, state, created_at")
      .eq("is_active", false)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Tier distribution
  const tierCount = new Map<string, number>();
  let mrrCents = 0;
  for (const s of (subsRaw as { tier: string; status: string }[] | null) ?? []) {
    tierCount.set(s.tier, (tierCount.get(s.tier) ?? 0) + 1);
    if (s.status === "active") mrrCents += TIER_PRICE_CENTS[s.tier] ?? 0;
  }
  const tierData = Array.from(tierCount.entries()).map(([k, v]) => ({ name: k.toUpperCase(), value: v }));

  // Revenue 30d
  const revenue30d = ((ordersRaw as { total_cents: number; status: string }[] | null) ?? [])
    .filter((o) => ["paid", "completed"].includes(o.status))
    .reduce((s, o) => s + o.total_cents, 0);
  const giftRevenue30d = ((giftsRaw as { value_cents: number }[] | null) ?? []).reduce((s, g) => s + g.value_cents, 0);

  // Signups por dia (últimos 14)
  const dayMap = new Map<string, number>();
  const now = Date.now();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 24 * 3600 * 1000).toISOString().slice(0, 10);
    dayMap.set(d, 0);
  }
  for (const u of (usersByDayRaw as { created_at: string }[] | null) ?? []) {
    const day = new Date(u.created_at).toISOString().slice(0, 10);
    if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const signupsData = Array.from(dayMap.entries()).map(([day, signups]) => ({ day: day.slice(5), signups }));

  // Categorias
  type CatRow = { categories: { name: string } | null };
  const catMap = new Map<string, number>();
  for (const ec of (categoryAggRaw as CatRow[] | null) ?? []) {
    const name = ec.categories?.name ?? "—";
    catMap.set(name, (catMap.get(name) ?? 0) + 1);
  }
  const categoryData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const couponsData = ((topCouponsRaw as { code: string; uses_count: number }[] | null) ?? [])
    .filter((c) => c.uses_count > 0)
    .map((c) => ({ code: c.code, uses: c.uses_count }));

  const logs = (recentLogsRaw as LogRow[] | null) ?? [];
  const pendingEstabs = (pendingEstabsRaw as { id: string; slug: string; name: string; city: string | null; state: string | null; created_at: string }[] | null) ?? [];

  const totalSubscribers = (subsActive ?? 0) + (subsTrial ?? 0);
  const conversionRate = (usersTotal ?? 0) > 0 ? Math.round(((subsActive ?? 0) / (usersTotal ?? 1)) * 1000) / 10 : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink md:text-4xl">Dashboard</h1>
        <p className="mt-1 text-sm text-brava-muted">Visão completa do BRAVA+ em tempo real</p>
      </header>

      {/* Alertas pendentes */}
      {((estabsPending ?? 0) + (rewardsPending ?? 0) + (giftPending ?? 0)) > 0 && (
        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {(estabsPending ?? 0) > 0 && (
            <AlertCard
              count={estabsPending ?? 0}
              label="Lojas pendentes de ativação"
              href="/admin/estabelecimentos?status=pending"
              tone="amber"
            />
          )}
          {(rewardsPending ?? 0) > 0 && (
            <AlertCard
              count={rewardsPending ?? 0}
              label="Prêmios aguardando uso"
              href="/admin/cupons"
              tone="yellow"
            />
          )}
          {(giftPending ?? 0) > 0 && (
            <AlertCard
              count={giftPending ?? 0}
              label="Vale-presentes pendentes"
              href="/admin/cupons"
              tone="blue"
            />
          )}
        </section>
      )}

      {/* KPIs principais (8) */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Usuários" value={`${usersTotal ?? 0}`} delta={`+${usersLast7 ?? 0} em 7d`} />
        <Kpi label="Estabelecimentos" value={`${estabsTotal ?? 0}`} delta={`${(estabsTotal ?? 0) - (estabsPending ?? 0)} ativos`} />
        <Kpi label="MRR estimado" value={formatBRL(mrrCents)} delta={`${subsActive ?? 0} pagantes`} accent="yellow" />
        <Kpi label="Receita pedidos 30d" value={formatBRL(revenue30d)} delta={`${ordersLast30 ?? 0} pedidos`} />
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Receita V-P 30d" value={formatBRL(giftRevenue30d)} delta="Vale-presentes" />
        <Kpi label="Conversão paga" value={`${conversionRate}%`} delta="Active / total" />
        <Kpi label="Cupons ativos" value={`${couponsActive ?? 0}`} delta={`${rewardsClaimed ?? 0} prêmios`} />
        <Kpi label="Stories ativos" value={`${storiesActive ?? 0}`} delta="Hoje" />
      </section>

      {/* Charts */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <h2 className="text-lg font-bold text-brava-ink">Signups (14 dias)</h2>
          <p className="text-xs text-brava-muted">Novos usuários por dia</p>
          <div className="mt-4">
            <SignupsArea data={signupsData} />
          </div>
        </article>
        <article className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <h2 className="text-lg font-bold text-brava-ink">Assinaturas</h2>
          <p className="text-xs text-brava-muted">Ativas + trials por tier · {totalSubscribers} total</p>
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
        <article className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <h2 className="text-lg font-bold text-brava-ink">Estabelecimentos por categoria</h2>
          <div className="mt-4">
            {categoryData.length ? <CategoryBar data={categoryData} /> : <p className="py-12 text-center text-sm text-brava-muted">Sem dados.</p>}
          </div>
        </article>
        <article className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <h2 className="text-lg font-bold text-brava-ink">Top cupons (mais usados)</h2>
          <div className="mt-4">
            {couponsData.length ? (
              <TopCouponsBar data={couponsData} />
            ) : (
              <p className="py-12 text-center text-sm text-brava-muted">
                {couponsActive ?? 0} cupons criados · ainda sem usos
              </p>
            )}
          </div>
        </article>
      </section>

      {/* Bottom row: Pending review + Activity feed */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-brava-ink">Lojas aguardando aprovação</h2>
            {(estabsPending ?? 0) > 0 && (
              <Link href="/admin/estabelecimentos?status=pending" className="text-xs font-bold text-brava-blue hover:underline">
                ver todas →
              </Link>
            )}
          </header>
          {pendingEstabs.length === 0 ? (
            <p className="text-sm text-brava-muted">Nenhuma loja pendente. 👌</p>
          ) : (
            <ul className="space-y-2">
              {pendingEstabs.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/admin/estabelecimentos/${e.slug}`}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-amber-50 px-4 py-3 transition hover:bg-amber-100"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-bold text-brava-ink">{e.name}</p>
                      <p className="text-xs text-brava-muted">
                        {e.city ? `${e.city}/${e.state ?? ""}` : "—"} · {new Date(e.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-700">revisar →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <header className="mb-4">
            <h2 className="text-lg font-bold text-brava-ink">Atividade recente</h2>
            <p className="text-xs text-brava-muted">Últimos eventos registrados no sistema</p>
          </header>
          {logs.length === 0 ? (
            <p className="text-sm text-brava-muted">Sem eventos registrados ainda.</p>
          ) : (
            <ul className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 rounded-xl bg-brava-paper px-3 py-2 text-xs">
                  <span className="rounded-full bg-brava-card px-2 py-0.5 font-mono text-[10px] uppercase">{l.action}</span>
                  <span className="line-clamp-1 flex-1 text-brava-muted">{l.entity_type}</span>
                  <span className="shrink-0 text-brava-muted">
                    {new Date(l.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {l.user_id && (
                    <Link href={`/admin/usuarios/${l.user_id}`} className="shrink-0 text-brava-blue hover:underline">
                      user →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {/* Monetização + BI extras */}
      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        <QuickLink href="/admin/bi" emoji="📊" label="BI · receita e cohort" />
        <QuickLink href="/admin/churn" emoji="⚠️" label="Risco de churn" />
        <QuickLink href="/admin/fraude" emoji="🛡️" label="Antifraude" />
        <QuickLink href="/admin/slots" emoji="🏆" label="Slots pagos" />
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-4">
        <QuickLink href="/admin/b2b" emoji="🏢" label="BRAVA+ Empresas" />
        <QuickLink href="/admin/denuncias" emoji="🚩" label="Denúncias" />
        <QuickLink href="/admin/suporte" emoji="🛟" label="Suporte (tickets)" />
        <QuickLink href="/admin/desafios" emoji="🏆" label="Desafios mensais" />
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-4">
        <QuickLink href="/admin/listas" emoji="📚" label="Listas editoriais" />
        <QuickLink href="/admin/pacotes" emoji="🎉" label="Pacotes sazonais" />
        <QuickLink href="/admin/afiliados" emoji="🤝" label="Afiliados comerciais" />
        <QuickLink href="/admin/categorias" emoji="🏷️" label="Categorias" />
      </section>

      <div className="h-8" />
    </div>
  );
}

function Kpi({ label, value, delta, accent }: { label: string; value: string; delta?: string; accent?: "yellow" }) {
  return (
    <article className={`rounded-2xl border p-4 ${accent === "yellow" ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-brava-card"}`}>
      <p className="text-[11px] uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-brava-ink">{value}</p>
      {delta && <p className="mt-1 text-[11px] text-brava-muted">{delta}</p>}
    </article>
  );
}

function AlertCard({ count, label, href, tone }: { count: number; label: string; href: string; tone: "amber" | "yellow" | "blue" }) {
  const styles = {
    amber: "border-amber-300 bg-amber-50 text-amber-900",
    yellow: "border-brava-yellow bg-brava-yellow/10 text-brava-blue",
    blue: "border-brava-blue bg-brava-blue/10 text-brava-blue",
  }[tone];
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-md ${styles}`}
    >
      <div>
        <p className="text-3xl font-black">{count}</p>
        <p className="text-xs">{label}</p>
      </div>
      <span className="text-2xl">→</span>
    </Link>
  );
}

function QuickLink({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card p-4 transition hover:-translate-y-0.5 hover:border-brava-yellow hover:shadow-md"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brava-paper text-xl">{emoji}</span>
      <span className="text-sm font-bold text-brava-ink group-hover:text-brava-blue">{label}</span>
    </Link>
  );
}
