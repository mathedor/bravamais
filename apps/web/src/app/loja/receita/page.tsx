import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Receita — Loja" };

interface RevenueRow {
  total_orders: number;
  total_revenue_cents: number;
  new_customer_orders: number;
  new_customer_revenue_cents: number;
  recurring_orders: number;
  recurring_revenue_cents: number;
  avg_ticket_cents: number;
  refunded_cents: number;
}

interface BenchmarkRow {
  category_slug: string | null;
  category_size: number;
  my_visits: number;
  category_avg_visits: number;
  my_percentile: number;
}

export default async function ReceitaPage() {
  const { establishment } = await requireEstablishment();
  const admin = createAdminClient();

  const [{ data: brk }, { data: bench }, { data: monthlyOrders }] = await Promise.all([
    admin.rpc("estab_revenue_breakdown", { p_estab_id: establishment.id }),
    admin.rpc("estab_category_benchmark", { p_estab_id: establishment.id }),
    admin
      .from("orders")
      .select("created_at, total_cents, status")
      .eq("establishment_id", establishment.id)
      .in("status", ["paid", "completed"])
      .gte("created_at", new Date(Date.now() - 90 * 86400000).toISOString())
      .order("created_at", { ascending: true }),
  ]);

  const r = (Array.isArray(brk) ? brk[0] : brk) as RevenueRow | null;
  const b = (Array.isArray(bench) ? bench[0] : bench) as BenchmarkRow | null;

  // Bucketize last 90d by week for sparkline
  const orders = (monthlyOrders as { created_at: string; total_cents: number }[] | null) ?? [];
  const buckets: { label: string; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const end = Date.now() - i * 7 * 86400000;
    const start = end - 7 * 86400000;
    const total = orders
      .filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= start && t < end;
      })
      .reduce((s, o) => s + o.total_cents, 0);
    const d = new Date(start);
    buckets.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, total });
  }
  const maxBucket = Math.max(1, ...buckets.map((b) => b.total));

  const newPct = r && r.total_revenue_cents > 0 ? Math.round((100 * r.new_customer_revenue_cents) / r.total_revenue_cents) : 0;
  const recPct = 100 - newPct;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Receita</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">O que o BRAVA+ trouxe pra você</h1>
        <p className="mt-1 text-sm text-brava-muted">Pedidos pagos e completados via clube · janela total</p>
      </header>

      {/* Hero KPI */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brava-black via-brava-blue to-brava-blue-bright p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brava-yellow/30 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-yellow">Receita total via BRAVA+</p>
          <p className="mt-2 text-5xl font-black tracking-tight">{formatBRL(r?.total_revenue_cents ?? 0)}</p>
          <p className="mt-1 text-xs text-white/65">
            {r?.total_orders ?? 0} pedidos · ticket médio {formatBRL(r?.avg_ticket_cents ?? 0)}
          </p>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">🆕 Clientes novos</p>
            <p className="mt-1 text-2xl font-black">{formatBRL(r?.new_customer_revenue_cents ?? 0)}</p>
            <p className="text-[10px] text-white/55">{r?.new_customer_orders ?? 0} pedidos · {newPct}% da receita</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brava-yellow">🔁 Recorrentes</p>
            <p className="mt-1 text-2xl font-black">{formatBRL(r?.recurring_revenue_cents ?? 0)}</p>
            <p className="text-[10px] text-white/55">{r?.recurring_orders ?? 0} pedidos · {recPct}% da receita</p>
          </div>
        </div>

        {(r?.refunded_cents ?? 0) > 0 && (
          <p className="relative mt-4 rounded-xl bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
            ⚠️ {formatBRL(r?.refunded_cents ?? 0)} foram estornados via tickets.
          </p>
        )}
      </section>

      {/* Sparkline 12 semanas */}
      <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-black text-brava-ink">Receita por semana</h2>
            <p className="text-[11px] text-brava-muted">Últimas 12 semanas</p>
          </div>
        </div>
        <div className="flex h-32 items-end gap-1">
          {buckets.map((b, i) => (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
              <div className="absolute bottom-full mb-2 hidden whitespace-nowrap rounded-md bg-brava-black px-2 py-1 text-[10px] font-bold text-brava-yellow group-hover:block">
                {formatBRL(b.total)}
              </div>
              <div
                className="w-full rounded-t bg-gradient-to-t from-brava-blue to-brava-blue-bright transition hover:from-brava-yellow hover:to-amber-300"
                style={{ height: `${Math.max(2, (b.total / maxBucket) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-1">
          {buckets.map((b, i) => (
            <span key={i} className="flex-1 text-center text-[9px] text-brava-muted">{b.label}</span>
          ))}
        </div>
      </section>

      {/* Benchmark categoria */}
      {b && b.category_size > 1 && (
        <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-5">
          <h2 className="text-lg font-black text-brava-ink">Como você se sai na sua categoria</h2>
          <p className="text-[11px] text-brava-muted">Comparação anônima com {b.category_size - 1} parceiros da mesma categoria</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-brava-paper p-3">
              <p className="text-[10px] uppercase tracking-wider text-brava-muted">Suas visitas</p>
              <p className="mt-1 text-2xl font-black text-brava-ink">{b.my_visits}</p>
            </div>
            <div className="rounded-2xl bg-brava-paper p-3">
              <p className="text-[10px] uppercase tracking-wider text-brava-muted">Média da categoria</p>
              <p className="mt-1 text-2xl font-black text-brava-ink">{Math.round(b.category_avg_visits)}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-brava-yellow/40 to-amber-200/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-brava-blue">Seu percentil</p>
              <p className="mt-1 text-2xl font-black text-brava-ink">{Math.round(b.my_percentile)}º</p>
              <p className="text-[10px] text-brava-muted">
                {b.my_percentile >= 80 ? "Top da categoria 🏆" : b.my_percentile >= 50 ? "Na média de cima" : "Precisa acelerar"}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/loja/clientes" className="rounded-2xl border border-brava-border bg-brava-card p-4 hover:bg-brava-paper">
          <p className="text-2xl">👥</p>
          <p className="mt-2 font-bold text-brava-ink">Ver top clientes</p>
          <p className="text-[11px] text-brava-muted">CRM com cupom personalizado</p>
        </Link>
        <Link href="/loja/blast" className="rounded-2xl border border-brava-border bg-brava-card p-4 hover:bg-brava-paper">
          <p className="text-2xl">⚡</p>
          <p className="mt-2 font-bold text-brava-ink">Promo flash</p>
          <p className="text-[11px] text-brava-muted">Tô vazio, dispara cupom</p>
        </Link>
        <Link href="/loja/saques" className="rounded-2xl border border-brava-border bg-brava-card p-4 hover:bg-brava-paper">
          <p className="text-2xl">💰</p>
          <p className="mt-2 font-bold text-brava-ink">Sacar saldo</p>
          <p className="text-[11px] text-brava-muted">Pedir transferência</p>
        </Link>
      </section>

      <div className="h-8" />
    </div>
  );
}
