import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { RechargeButtons } from "./recharge-buttons";

export const metadata = { title: "BRAVA Tag" };

interface Wallet {
  id: string;
  balance_cents: number;
  total_recharged_cents: number;
  total_spent_cents: number;
  monthly_active: boolean;
  monthly_next_charge: string | null;
}

interface Transaction {
  id: string;
  type: string;
  amount_cents: number;
  balance_after_cents: number;
  description: string | null;
  establishments: { name: string; slug: string } | null;
  created_at: string;
}

interface Pack {
  id: string;
  name: string;
  amount_cents: number;
  bonus_cents: number;
  display_order: number;
}

interface Settings {
  monthly_plan_cents: number;
  monthly_plan_credit_cents: number;
  recharge_bonus_pct: number;
}

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const TYPE_META: Record<string, { emoji: string; label: string; color: string }> = {
  recharge: { emoji: "⚡", label: "Recarga", color: "text-brava-blue" },
  bonus: { emoji: "🎁", label: "Bônus", color: "text-emerald-700 dark:text-emerald-300" },
  subscription: { emoji: "♻️", label: "Plano mensal", color: "text-brava-blue" },
  spend: { emoji: "💳", label: "Gasto", color: "text-red-700" },
  refund: { emoji: "↩️", label: "Estorno", color: "text-amber-700" },
  admin_adjust: { emoji: "⚙️", label: "Ajuste admin", color: "text-zinc-700" },
};

export default async function TagPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  // Garantir wallet
  await supabase.rpc("ensure_tag_wallet", { p_user_id: profile.id });

  const [{ data: walletRaw }, { data: txs }, { data: packs }, { data: settings }] = await Promise.all([
    supabase
      .from("tag_wallets")
      .select("id, balance_cents, total_recharged_cents, total_spent_cents, monthly_active, monthly_next_charge")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("tag_transactions")
      .select("id, type, amount_cents, balance_after_cents, description, establishments(name, slug), created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("tag_recharge_packs")
      .select("id, name, amount_cents, bonus_cents, display_order")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("tag_settings")
      .select("monthly_plan_cents, monthly_plan_credit_cents, recharge_bonus_pct")
      .maybeSingle(),
  ]);

  const wallet = walletRaw as Wallet | null;
  const transactions = (txs as unknown as Transaction[] | null) ?? [];
  const recharges = (packs as Pack[] | null) ?? [];
  const cfg = settings as Settings | null;

  const balance = wallet?.balance_cents ?? 0;
  const nextCharge = wallet?.monthly_next_charge
    ? new Date(wallet.monthly_next_charge).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">BRAVA Tag</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Sua carteira da rede</h1>
        <p className="mt-1 text-brava-muted">
          Um saldo único pra usar em qualquer parceiro que aceita Tag. Recarrega com bônus ou assina mensal.
        </p>
      </header>

      {/* Saldo destaque */}
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-brava-yellow">Saldo BRAVA Tag</p>
        <p className="mt-2 text-5xl font-black">{centsToBRL(balance)}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/70">
          <span>Recarregado: {centsToBRL(wallet?.total_recharged_cents ?? 0)}</span>
          <span>Gasto: {centsToBRL(wallet?.total_spent_cents ?? 0)}</span>
          {nextCharge && wallet?.monthly_active && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
              ♻️ Próx. recarga {nextCharge}
            </span>
          )}
        </div>
      </section>

      <RechargeButtons
        packs={recharges}
        settings={cfg}
        monthlyActive={wallet?.monthly_active ?? false}
      />

      {/* Extrato */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">
          Extrato
        </h2>
        {transactions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">
            Sem movimentações ainda. Faça sua primeira recarga acima.
          </div>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t) => {
              const meta = TYPE_META[t.type] ?? { emoji: "•", label: t.type, color: "text-brava-ink" };
              const sign = t.type === "spend" ? "−" : "+";
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card px-4 py-3 text-sm"
                >
                  <span className="text-xl">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-brava-ink">
                      {meta.label}
                      {t.establishments && ` · ${t.establishments.name}`}
                    </p>
                    <p className="text-xs text-brava-muted">
                      {new Date(t.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {t.description && ` · ${t.description}`}
                    </p>
                  </div>
                  <p className={`font-black ${meta.color}`}>
                    {sign}{centsToBRL(t.amount_cents)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-8 text-xs text-brava-muted">
        BRAVA Tag funciona como cartão da rede — você usa o saldo onde aceita. No balcão, o lojista vê
        seu saldo e cobra a venda diretamente dele.
      </p>
    </div>
  );
}
