import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

function brl(c: number | null | undefined) { return `R$ ${((c ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`; }

export default async function FerramentasRelatorio() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: rows } = await supabase.rpc("admin_tools_kpis");
  const k = rows?.[0] ?? null;

  // Drilldowns extras
  const [
    { data: walletTop }, { data: badgesEarn }, { data: mesaTop }, { data: partnersActive }, { data: abFinished },
  ] = await Promise.all([
    supabase.from("wallet_balances").select("user_id, balance_cents, profile:user_id(full_name)").order("balance_cents", { ascending: false }).limit(10),
    supabase.from("user_badges").select("badge:badge_id(label, icon)").order("earned_at", { ascending: false }).limit(10),
    supabase.from("mesa_qr").select("label, scans, establishment:establishment_id(name)").order("scans", { ascending: false }).limit(10),
    supabase.from("partnerships").select("combo_label, status, a:estab_a(name), b:estab_b(name)").in("status", ["ativa","aceita"]).limit(10),
    supabase.from("coupon_ab_tests").select("hypothesis, winner, variant_a_redeemed, variant_b_redeemed, establishment:establishment_id(name)").eq("status", "concluido").order("ended_at", { ascending: false }).limit(10),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">relatório consolidado</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Performance das ferramentas novas</h1>
        <p className="text-sm text-brava-muted">KPIs sistêmicos pra cada feature lançada na sprint de ferramentas.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Caixa Wallet" value={brl(k?.wallet_total_cents)} tone="yellow" />
        <Kpi label="Users com saldo" value={String(k?.wallet_active_users ?? 0)} />
        <Kpi label="Rolês ativos" value={String(k?.outings_active ?? 0)} />
        <Kpi label="Avisos hoje (vou aí)" value={String(k?.arrivals_today ?? 0)} />
        <Kpi label="Badges 30d" value={String(k?.badges_earned_30d ?? 0)} />
        <Kpi label="Mesas QR ativas" value={String(k?.mesa_qr_total ?? 0)} />
        <Kpi label="Parcerias ativas" value={String(k?.partnerships_active ?? 0)} />
        <Kpi label="AB tests rodando" value={String(k?.ab_tests_running ?? 0)} />
        <Kpi label="Cross-sell ativas" value={String(k?.cross_sell_offers ?? 0)} />
        <Kpi label="Filas ativas" value={String(k?.waitlist_active ?? 0)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Block title="Top 10 saldos Wallet">
          <ul className="divide-y divide-brava-border text-sm">
            {(walletTop ?? []).map((w: any) => (
              <li key={w.user_id} className="flex items-center justify-between px-1 py-2">
                <span>{w.profile?.full_name ?? "—"}</span>
                <span className="font-mono font-bold">{brl(w.balance_cents)}</span>
              </li>
            ))}
          </ul>
        </Block>
        <Block title="Top 10 mesas QR (mais scans)">
          <ul className="divide-y divide-brava-border text-sm">
            {(mesaTop ?? []).map((m: any, i) => (
              <li key={i} className="flex items-center justify-between px-1 py-2">
                <span>{m.establishment?.name} · {m.label}</span>
                <span className="font-mono font-bold">{m.scans} scans</span>
              </li>
            ))}
          </ul>
        </Block>
        <Block title="Parcerias ativas">
          <ul className="divide-y divide-brava-border text-sm">
            {(partnersActive ?? []).map((p: any, i) => (
              <li key={i} className="px-1 py-2">
                <div className="font-bold">{p.combo_label ?? "Combo"}</div>
                <div className="text-xs text-brava-muted">{p.a?.name} × {p.b?.name}</div>
              </li>
            ))}
          </ul>
        </Block>
        <Block title="A/B tests concluídos">
          <ul className="divide-y divide-brava-border text-sm">
            {(abFinished ?? []).map((t: any, i) => (
              <li key={i} className="px-1 py-2">
                <div className="font-bold">{t.hypothesis}</div>
                <div className="text-xs">
                  {t.establishment?.name} · <b>{t.winner?.toUpperCase()}</b> venceu · A: {t.variant_a_redeemed} / B: {t.variant_b_redeemed}
                </div>
              </li>
            ))}
          </ul>
        </Block>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "yellow" }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone === "yellow" ? "border-brava-yellow/40 bg-brava-yellow/5" : "border-brava-border bg-brava-card"}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-xl font-black sm:text-2xl">{value}</div>
    </div>
  );
}
function Block({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-2xl border border-brava-border bg-brava-card p-4">
      <h3 className="mb-2 text-xs font-bold uppercase text-brava-muted">{title}</h3>
      {children}
    </div>
  );
}
