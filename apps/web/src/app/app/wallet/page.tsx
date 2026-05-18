import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { walletDepositAction } from "@/app/api/tools/actions";

function brl(c: number | null | undefined) {
  return `R$ ${((c ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default async function WalletPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: balance }, { data: packs }, { data: txns }] = await Promise.all([
    supabase.from("wallet_balances").select("*").eq("user_id", profile.id).maybeSingle(),
    supabase.from("wallet_bonus_packs").select("*").eq("is_active", true).order("display_order"),
    supabase.from("wallet_transactions").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(20),
  ]);

  async function depositForm(fd: FormData) {
    "use server";
    await walletDepositAction(String(fd.get("pack_id")));
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">brava wallet</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Sua carteira BRAVA+</h1>
        <p className="text-sm text-brava-muted">Deposite, ganhe bônus e use em qualquer parceiro como dinheiro.</p>
      </header>

      <section className="rounded-3xl border-2 border-brava-yellow/50 bg-gradient-to-br from-brava-yellow/10 to-brava-blue/5 p-6">
        <div className="text-xs font-bold uppercase tracking-wider text-brava-muted">Saldo disponível</div>
        <div className="mt-1 text-4xl font-black sm:text-5xl">{brl(balance?.balance_cents)}</div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-brava-muted">
          <div>📥 Depositado: {brl(balance?.total_deposited_cents)}</div>
          <div>💸 Gasto: {brl(balance?.total_spent_cents)}</div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">+ Recarregar com bônus</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(packs ?? []).map((p) => {
            const bonusPct = ((p.bonus_cents / p.deposit_cents) * 100).toFixed(0);
            return (
              <form key={p.id} action={depositForm} className="rounded-2xl border-2 border-brava-border bg-brava-card p-4 transition hover:border-brava-yellow">
                <div className="text-xs font-bold uppercase text-brava-blue">{p.label}</div>
                <div className="mt-2 text-2xl font-black">{brl(p.deposit_cents + p.bonus_cents)}</div>
                <div className="text-xs text-brava-muted">
                  Você paga {brl(p.deposit_cents)} · <span className="text-green-700 font-bold">+{bonusPct}% bônus</span>
                </div>
                <input type="hidden" name="pack_id" value={p.id} />
                <button type="submit" className="mt-3 w-full rounded-lg bg-brava-blue px-3 py-2 text-sm font-bold text-white hover:bg-brava-blue-bright">
                  Recarregar
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Histórico ({txns?.length ?? 0})</h2>
        {txns && txns.length > 0 ? (
          <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
            {txns.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-bold">{t.description ?? t.kind}</div>
                  <div className="text-xs text-brava-muted">{new Date(t.created_at).toLocaleString("pt-BR")}</div>
                </div>
                <div className={`font-mono font-bold ${t.kind === "spend" ? "text-red-600" : "text-green-700"}`}>
                  {t.kind === "spend" ? "−" : "+"}{brl(t.amount_cents)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">
            Sem movimentação ainda. Faça sua 1ª recarga.
          </div>
        )}
      </section>
    </div>
  );
}
