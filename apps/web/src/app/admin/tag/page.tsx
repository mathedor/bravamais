import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { updateTagSettingsAction, upsertPackAction, deletePackAction } from "./actions";

export const metadata = { title: "Admin · BRAVA Tag" };

interface Summary {
  total_balance: number;
  active_wallets: number;
  monthly_subscribers: number;
  total_recharged: number;
  total_spent: number;
  total_commission_30d: number;
}

interface Settings {
  commission_pct: number;
  monthly_plan_cents: number;
  monthly_plan_credit_cents: number;
  recharge_bonus_pct: number;
}

interface Pack {
  id: string;
  name: string;
  amount_cents: number;
  bonus_cents: number;
  display_order: number;
  is_active: boolean;
}

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminTagPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: summary }, { data: settings }, { data: packs }] = await Promise.all([
    supabase.rpc("admin_tag_summary"),
    supabase.from("tag_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("tag_recharge_packs").select("*").order("display_order"),
  ]);

  const s = (summary ?? {}) as Partial<Summary>;
  const cfg = settings as Settings | null;
  const packList = (packs as Pack[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brava-muted">Carteira da rede</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">BRAVA Tag</h1>
        <p className="mt-1 text-brava-muted">Config global da carteira + KPIs em tempo real.</p>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Saldo na rede" value={centsToBRL(s.total_balance ?? 0)} highlight />
        <Kpi label="Wallets c/ saldo" value={String(s.active_wallets ?? 0)} />
        <Kpi label="Assinaturas mensais" value={String(s.monthly_subscribers ?? 0)} />
        <Kpi label="Total recarregado" value={centsToBRL(s.total_recharged ?? 0)} />
        <Kpi label="Total gasto" value={centsToBRL(s.total_spent ?? 0)} />
        <Kpi label="Comissão 30d" value={centsToBRL(s.total_commission_30d ?? 0)} tone="green" />
      </section>

      <section className="mb-10 rounded-3xl border border-brava-border bg-brava-card p-6">
        <h2 className="mb-4 text-lg font-bold text-brava-ink">Configuração</h2>
        <form action={updateTagSettingsAction} className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="text-xs font-bold text-brava-ink">Comissão sobre transação (%)</span>
            <input
              name="commission_pct"
              type="number"
              step="0.1"
              defaultValue={cfg?.commission_pct ?? 9}
              className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
            />
            <p className="mt-1 text-[11px] text-brava-muted">
              Descontada do valor pago em Tag — fica com a BRAVA+. Default 9%.
            </p>
          </label>
          <label>
            <span className="text-xs font-bold text-brava-ink">Bônus padrão de recarga (%)</span>
            <input
              name="recharge_bonus_pct"
              type="number"
              step="0.1"
              defaultValue={cfg?.recharge_bonus_pct ?? 10}
              className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
            />
            <p className="mt-1 text-[11px] text-brava-muted">Referência. Cada pack pode ter bônus próprio.</p>
          </label>
          <label>
            <span className="text-xs font-bold text-brava-ink">Plano mensal — preço (R$)</span>
            <input
              name="monthly_plan_reais"
              type="number"
              step="0.01"
              defaultValue={((cfg?.monthly_plan_cents ?? 4900) / 100).toFixed(2)}
              className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="text-xs font-bold text-brava-ink">Plano mensal — saldo creditado (R$)</span>
            <input
              name="monthly_credit_reais"
              type="number"
              step="0.01"
              defaultValue={((cfg?.monthly_plan_credit_cents ?? 6000) / 100).toFixed(2)}
              className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
            />
            <p className="mt-1 text-[11px] text-brava-muted">
              Quanto vira saldo todo mês pra quem assina o plano.
            </p>
          </label>
          <button type="submit" className="sm:col-span-2 rounded-full bg-brava-blue px-6 py-2 font-bold text-white">
            Salvar configuração
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-brava-ink">Packs de recarga avulsa</h2>

        <form
          action={upsertPackAction}
          className="mb-6 grid gap-3 rounded-2xl border border-brava-border bg-brava-card p-5 sm:grid-cols-12"
        >
          <input type="hidden" name="id" value="" />
          <label className="sm:col-span-4">
            <span className="text-xs font-bold text-brava-ink">Nome</span>
            <input name="name" placeholder="Recarga R$ 50" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-brava-ink">Valor (R$)</span>
            <input name="amount_reais" type="number" step="0.01" placeholder="50" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-brava-ink">Bônus (R$)</span>
            <input name="bonus_reais" type="number" step="0.01" placeholder="5" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-brava-ink">Ordem</span>
            <input name="display_order" type="number" defaultValue="100" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
          </label>
          <div className="flex items-end sm:col-span-2">
            <button type="submit" className="w-full rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white">
              Adicionar
            </button>
          </div>
        </form>

        <ul className="space-y-3">
          {packList.map((p) => (
            <li key={p.id} className="rounded-2xl border border-brava-border bg-brava-card p-5">
              <form action={upsertPackAction} className="grid gap-3 sm:grid-cols-12">
                <input type="hidden" name="id" value={p.id} />
                <label className="sm:col-span-4">
                  <span className="text-xs font-bold text-brava-ink">Nome</span>
                  <input name="name" defaultValue={p.name} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-bold text-brava-ink">Valor</span>
                  <input name="amount_reais" type="number" step="0.01" defaultValue={(p.amount_cents / 100).toFixed(2)} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-bold text-brava-ink">Bônus</span>
                  <input name="bonus_reais" type="number" step="0.01" defaultValue={(p.bonus_cents / 100).toFixed(2)} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-bold text-brava-ink">Ordem</span>
                  <input name="display_order" type="number" defaultValue={p.display_order} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
                </label>
                <div className="flex items-end gap-2 sm:col-span-2">
                  <button type="submit" className="flex-1 rounded-full bg-brava-blue px-3 py-2 text-xs font-bold text-white">
                    Salvar
                  </button>
                </div>
              </form>
              <form action={deletePackAction} className="mt-2 text-right">
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="text-xs text-red-600 hover:underline">excluir</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value, highlight, tone }: { label: string; value: string; highlight?: boolean; tone?: "green" }) {
  const color = tone === "green" ? "text-emerald-700 dark:text-emerald-300" : "text-brava-ink";
  return (
    <div className={`rounded-3xl border p-4 ${highlight ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-brava-card"}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</p>
      <p className={`mt-2 text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}
