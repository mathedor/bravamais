import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Financeiro — Admin" };

interface Summary {
  total_paid_cents: number;
  paid_30d_cents: number;
  count_paid: number;
  count_pending: number;
  count_failed: number;
  count_refunded: number;
  by_method: Array<{ method: string; cnt: number; paid_cents: number }>;
  by_gateway: Array<{ gateway: string; cnt: number }>;
  by_kind: Array<{ kind: string; cnt: number; paid_cents: number }>;
  mrr_cents: number;
  recurring_active: number;
  recurring_past_due: number;
  recurring_canceled: number;
  recurring_cancel_scheduled: number;
}

function brl(c: number | null | undefined) {
  return `R$ ${((c ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

const KIND_LABEL: Record<string, string> = {
  subscription: "Assinatura",
  category_subscription: "Categorias",
  tag_recharge: "Recarga Tag",
  tag_monthly: "Tag mensal",
  establishment_plan: "Plano lojista",
  gift_card: "Vale-presente",
  wallet_deposit: "Depósito Wallet",
  order: "Pedido",
};
const STATUS_TONE: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  expired: "bg-zinc-200 text-zinc-700",
  refunded: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  past_due: "bg-rose-100 text-rose-800",
  canceled: "bg-zinc-200 text-zinc-700",
};

export default async function FinanceiroPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: sumRaw }, { data: payments }, { data: recurring }] = await Promise.all([
    admin.rpc("admin_financeiro_summary"),
    admin
      .from("payments")
      .select("id, kind, method, gateway, amount_cents, status, created_at, paid_at, profile:user_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(40),
    admin
      .from("recurring_subscriptions")
      .select("kind, ref_id, amount_cents, method, gateway, status, current_period_end, next_charge_at, cancel_at_period_end, retries, profile:user_id(full_name)")
      .order("next_charge_at", { ascending: true })
      .limit(40),
  ]);

  const s = (sumRaw as Summary | null) ?? ({} as Summary);
  type Pay = { id: string; kind: string; method: string; gateway: string; amount_cents: number; status: string; created_at: string; paid_at: string | null; profile: { full_name: string | null } | null };
  type Rec = { kind: string; ref_id: string; amount_cents: number; method: string; gateway: string; status: string; current_period_end: string; next_charge_at: string; cancel_at_period_end: boolean; retries: number; profile: { full_name: string | null } | null };
  const pays = (payments ?? []) as unknown as Pay[];
  const recs = (recurring ?? []) as unknown as Rec[];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Financeiro</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Pagamentos &amp; Recorrência</h1>
        <p className="mt-1 text-sm text-brava-muted">Transações reais (SyncPay PIX + Stripe cartão) e saúde das assinaturas recorrentes.</p>
      </header>

      {/* KPIs principais */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Recebido (total)" value={brl(s.total_paid_cents)} highlight />
        <Kpi label="Recebido (30d)" value={brl(s.paid_30d_cents)} />
        <Kpi label="MRR (recorrência ativa)" value={brl(s.mrr_cents)} highlight />
        <Kpi label="Pagamentos confirmados" value={String(s.count_paid ?? 0)} />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Recorrências ativas" value={String(s.recurring_active ?? 0)} />
        <Kpi label="Inadimplentes (past due)" value={String(s.recurring_past_due ?? 0)} tone="rose" />
        <Kpi label="Cancelam no fim do ciclo" value={String(s.recurring_cancel_scheduled ?? 0)} tone="amber" />
        <Kpi label="Pendentes / falharam" value={`${s.count_pending ?? 0} / ${s.count_failed ?? 0}`} />
      </section>

      {/* Splits */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <SplitCard title="Por método">
          {(s.by_method ?? []).map((m) => (
            <Row key={m.method} k={m.method === "pix" ? "PIX" : "Cartão"} v={`${m.cnt} · ${brl(m.paid_cents)}`} />
          ))}
        </SplitCard>
        <SplitCard title="Por gateway">
          {(s.by_gateway ?? []).map((g) => (
            <Row key={g.gateway} k={g.gateway} v={`${g.cnt}`} />
          ))}
        </SplitCard>
        <SplitCard title="Por tipo de cobrança">
          {(s.by_kind ?? []).map((k) => (
            <Row key={k.kind} k={KIND_LABEL[k.kind] ?? k.kind} v={`${k.cnt} · ${brl(k.paid_cents)}`} />
          ))}
        </SplitCard>
      </section>

      {/* Recorrências (saúde) */}
      <section className="mt-8">
        <h2 className="mb-2 text-base font-bold text-brava-ink">Assinaturas recorrentes ({recs.length})</h2>
        {recs.length === 0 ? (
          <Empty>Nenhuma assinatura recorrente ainda.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brava-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-brava-paper text-left text-xs uppercase text-brava-muted">
                <tr><th className="p-3">Cliente</th><th className="p-3">Tipo</th><th className="p-3">Valor</th><th className="p-3">Método</th><th className="p-3">Status</th><th className="p-3">Próx. cobrança</th></tr>
              </thead>
              <tbody>
                {recs.map((r, i) => (
                  <tr key={i} className="border-t border-brava-border">
                    <td className="p-3 font-bold text-brava-ink">{r.profile?.full_name ?? "—"}</td>
                    <td className="p-3">{KIND_LABEL[r.kind] ?? r.kind}</td>
                    <td className="p-3">{brl(r.amount_cents)}/mês</td>
                    <td className="p-3">{r.method === "pix" ? "PIX" : "Cartão"}</td>
                    <td className="p-3">
                      <Badge status={r.status} />
                      {r.cancel_at_period_end && <span className="ml-1 text-[10px] text-amber-700">(cancela)</span>}
                      {r.retries > 0 && <span className="ml-1 text-[10px] text-rose-700">{r.retries} tent.</span>}
                    </td>
                    <td className="p-3 text-xs text-brava-muted">{new Date(r.next_charge_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Transações recentes */}
      <section className="mt-8">
        <h2 className="mb-2 text-base font-bold text-brava-ink">Transações recentes</h2>
        {pays.length === 0 ? (
          <Empty>Nenhuma transação ainda.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brava-border">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-brava-paper text-left text-xs uppercase text-brava-muted">
                <tr><th className="p-3">Quando</th><th className="p-3">Cliente</th><th className="p-3">Tipo</th><th className="p-3">Método</th><th className="p-3">Valor</th><th className="p-3">Status</th></tr>
              </thead>
              <tbody>
                {pays.map((p) => (
                  <tr key={p.id} className="border-t border-brava-border">
                    <td className="p-3 text-xs text-brava-muted">{new Date(p.created_at).toLocaleString("pt-BR")}</td>
                    <td className="p-3 font-bold text-brava-ink">{p.profile?.full_name ?? "—"}</td>
                    <td className="p-3">{KIND_LABEL[p.kind] ?? p.kind}</td>
                    <td className="p-3">{p.method === "pix" ? "PIX" : "Cartão"} <span className="text-[10px] text-brava-muted">({p.gateway})</span></td>
                    <td className="p-3 font-bold">{brl(p.amount_cents)}</td>
                    <td className="p-3"><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs text-brava-muted">
        Saques e estornos têm telas próprias: <Link href="/admin/saques" className="text-brava-blue hover:underline">Saques</Link> ·{" "}
        <Link href="/admin/extornos" className="text-brava-blue hover:underline">Estornos</Link>.
      </p>
    </div>
  );
}

function Kpi({ label, value, highlight, tone }: { label: string; value: string; highlight?: boolean; tone?: "rose" | "amber" }) {
  const base = tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "amber" ? "border-amber-200 bg-amber-50" : highlight ? "border-brava-yellow/50 bg-brava-yellow/10" : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border-2 p-4 ${base}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-xl font-black text-brava-ink sm:text-2xl">{value}</div>
    </div>
  );
}
function SplitCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brava-border bg-brava-card p-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-brava-ink">{k}</span>
      <span className="font-bold text-brava-blue">{v}</span>
    </div>
  );
}
function Badge({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[status] ?? "bg-zinc-200 text-zinc-700"}`}>{status}</span>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">{children}</p>;
}
