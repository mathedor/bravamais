import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Carteiras (float) — Admin" };

function brl(c: number | null | undefined) {
  return `R$ ${((c ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

interface WTx { id: string; kind: string; amount_cents: number; description: string | null; created_at: string; profile: { full_name: string | null } | null }
interface TTx { id: string; type: string; amount_cents: number; description: string | null; created_at: string; commission_cents: number | null; profile: { full_name: string | null } | null }

export default async function CarteirasPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: tools }, { data: tagWallets }, { data: wTx }, { data: tTx }] = await Promise.all([
    admin.rpc("admin_tools_kpis"),
    admin.from("tag_wallets").select("balance_cents, total_recharged_cents, total_spent_cents").limit(5000),
    admin.from("wallet_transactions").select("id, kind, amount_cents, description, created_at, profile:user_id(full_name)").order("created_at", { ascending: false }).limit(25),
    admin.from("tag_transactions").select("id, type, amount_cents, description, created_at, commission_cents, profile:user_id(full_name)").order("created_at", { ascending: false }).limit(25),
  ]);

  const k = (Array.isArray(tools) ? tools[0] : tools) as { wallet_total_cents?: number; wallet_active_users?: number } | null;
  const tw = (tagWallets ?? []) as { balance_cents: number; total_recharged_cents: number; total_spent_cents: number }[];
  const tagFloat = tw.reduce((s, w) => s + (w.balance_cents ?? 0), 0);
  const tagRecharged = tw.reduce((s, w) => s + (w.total_recharged_cents ?? 0), 0);
  const tagSpent = tw.reduce((s, w) => s + (w.total_spent_cents ?? 0), 0);
  const wtx = (wTx ?? []) as unknown as WTx[];
  const ttx = (tTx ?? []) as unknown as TTx[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Relatório</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Carteiras — saldo em circulação</h1>
        <p className="mt-1 text-sm text-brava-muted">Passivo financeiro: saldo que os usuários têm pra gastar na rede (Wallet + BRAVA Tag).</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Float Wallet" value={brl(k?.wallet_total_cents)} highlight />
        <Kpi label="Users c/ saldo Wallet" value={String(k?.wallet_active_users ?? 0)} />
        <Kpi label="Float BRAVA Tag" value={brl(tagFloat)} highlight />
        <Kpi label="Carteiras Tag" value={String(tw.length)} />
      </section>
      <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Tag recarregado (acum.)" value={brl(tagRecharged)} />
        <Kpi label="Tag gasto (acum.)" value={brl(tagSpent)} />
        <Kpi label="Passivo total (Wallet+Tag)" value={brl((k?.wallet_total_cents ?? 0) + tagFloat)} highlight />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Feed title="Wallet — últimas transações">
          {wtx.length === 0 ? <Empty /> : wtx.map((t) => (
            <FeedRow key={t.id} who={t.profile?.full_name} desc={t.description ?? t.kind} when={t.created_at}
              amount={t.amount_cents} negative={t.kind === "spend"} />
          ))}
        </Feed>
        <Feed title="BRAVA Tag — últimas transações">
          {ttx.length === 0 ? <Empty /> : ttx.map((t) => (
            <FeedRow key={t.id} who={t.profile?.full_name} desc={t.description ?? t.type} when={t.created_at}
              amount={t.amount_cents} negative={t.type === "spend"}
              extra={t.commission_cents ? `comissão ${brl(t.commission_cents)}` : undefined} />
          ))}
        </Feed>
      </div>
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 p-4 ${highlight ? "border-brava-yellow/50 bg-brava-yellow/10" : "border-brava-border bg-brava-card"}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-lg font-black text-brava-ink sm:text-xl">{value}</div>
    </div>
  );
}
function Feed({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brava-border bg-brava-card p-4">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">{title}</h2>
      <div className="divide-y divide-brava-border">{children}</div>
    </div>
  );
}
function FeedRow({ who, desc, when, amount, negative, extra }: { who: string | null | undefined; desc: string; when: string; amount: number; negative?: boolean; extra?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate text-brava-ink">{desc}</p>
        <p className="text-[10px] text-brava-muted">{who ?? "—"} · {new Date(when).toLocaleString("pt-BR")}{extra ? ` · ${extra}` : ""}</p>
      </div>
      <span className={`shrink-0 font-mono font-bold ${negative ? "text-rose-600" : "text-emerald-700"}`}>
        {negative ? "−" : "+"}R$ {(Math.abs(amount) / 100).toFixed(2)}
      </span>
    </div>
  );
}
function Empty() {
  return <p className="py-6 text-center text-xs text-brava-muted">Sem movimentação.</p>;
}
