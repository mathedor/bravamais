import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "BI — Admin" };

interface CohortRow {
  cohort_month: string;
  cohort_size: number;
  active_m0: number;
  active_m1: number;
  active_m2: number;
  active_m3: number;
}

interface RevenueRow {
  source: string;
  monthly_estimate_cents: number;
  count: number;
}

export default async function AdminBIPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: cohorts }, { data: revenue }, { count: totalSubs }, { count: activeEstabs }] = await Promise.all([
    admin.rpc("cohort_retention"),
    admin.rpc("platform_revenue_breakdown"),
    admin.from("subscriptions").select("*", { count: "exact", head: true }).in("status", ["active", "trial"]),
    admin.from("establishments").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const rows = (cohorts as CohortRow[] | null) ?? [];
  const rev = (revenue as RevenueRow[] | null) ?? [];
  const totalMonthly = rev.reduce((s, r) => s + r.monthly_estimate_cents, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin · BI</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Receita & retenção</h1>
          <p className="mt-1 text-sm text-brava-muted">Quadro vivo da plataforma BRAVA+.</p>
        </div>
        <nav className="flex gap-2 text-xs">
          <Link href="/admin/churn" className="rounded-full bg-brava-blue px-4 py-2 font-bold text-white">Churn risk</Link>
          <Link href="/admin/fraude" className="rounded-full bg-rose-500 px-4 py-2 font-bold text-white">Antifraude</Link>
          <Link href="/admin/slots" className="rounded-full bg-brava-yellow px-4 py-2 font-bold text-brava-black">Slots pagos</Link>
          <Link href="/admin/b2b" className="rounded-full bg-brava-black px-4 py-2 font-bold text-brava-yellow">B2B</Link>
        </nav>
      </header>

      {/* Receita */}
      <section className="rounded-3xl bg-gradient-to-br from-brava-black via-brava-blue to-brava-blue-bright p-6 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">MRR estimado total</p>
        <p className="mt-2 text-5xl font-black tracking-tight">{formatBRL(totalMonthly)}</p>
        <p className="mt-1 text-xs text-white/65">
          {totalSubs ?? 0} assinantes ativos · {activeEstabs ?? 0} estabelecimentos
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {rev.map((r) => (
            <div key={r.source} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brava-yellow">{labelFor(r.source)}</p>
              <p className="mt-1 text-2xl font-black">{formatBRL(r.monthly_estimate_cents)}</p>
              <p className="text-[10px] text-white/55">{r.count} {r.source === "b2b_seats" ? "seats" : "items"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cohort */}
      <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-lg font-black text-brava-ink">Retenção por cohort de cadastro</h2>
        <p className="text-[11px] text-brava-muted">% de cada cohort que voltou no mês N após o cadastro (visitas)</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-brava-muted">
                <th className="py-2 pr-3">Cohort</th>
                <th className="py-2 pr-3">Tamanho</th>
                <th className="py-2 pr-3">M0</th>
                <th className="py-2 pr-3">M1</th>
                <th className="py-2 pr-3">M2</th>
                <th className="py-2 pr-3">M3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brava-border">
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-brava-muted">Sem dados ainda.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.cohort_month}>
                    <td className="py-2 pr-3 font-mono">{r.cohort_month}</td>
                    <td className="py-2 pr-3 font-bold text-brava-ink">{r.cohort_size}</td>
                    <Cell value={r.active_m0} size={r.cohort_size} />
                    <Cell value={r.active_m1} size={r.cohort_size} />
                    <Cell value={r.active_m2} size={r.cohort_size} />
                    <Cell value={r.active_m3} size={r.cohort_size} />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Cell({ value, size }: { value: number; size: number }) {
  const pct = size > 0 ? Math.round((100 * value) / size) : 0;
  const tone = pct >= 50 ? "bg-emerald-500/20 text-emerald-700" : pct >= 20 ? "bg-amber-500/20 text-amber-700" : "bg-rose-500/15 text-rose-700";
  return (
    <td className="py-2 pr-3">
      <span className={`rounded px-2 py-0.5 font-bold ${tone}`}>
        {pct}% <span className="opacity-60">({value})</span>
      </span>
    </td>
  );
}

function labelFor(src: string): string {
  switch (src) {
    case "user_subscriptions": return "🧑 Assinaturas user";
    case "featured_slots": return "🏆 Slots pagos";
    case "b2b_seats": return "🏢 BRAVA+ Empresas";
    default: return src;
  }
}
