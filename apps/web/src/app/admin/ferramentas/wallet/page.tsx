import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { fdWalletPackUpsert, walletPackDeleteAction } from "@/app/api/tools/actions";

export default async function AdminWalletPacks() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: packs } = await supabase.from("wallet_bonus_packs").select("*").order("display_order");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-black">Packs de bônus — BRAVA Wallet</h1>
        <p className="text-sm text-brava-muted">Configure "deposita X, ganha Y de bônus" pra cada faixa.</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Novo pack</summary>
        <form action={fdWalletPackUpsert} className="mt-3 grid gap-3 sm:grid-cols-4">
          <In label="Label *" name="label" placeholder="ex: R$ 500 + R$ 100 bônus" />
          <In label="Depósito (R$) *" name="deposit_brl" type="number" step="0.01" />
          <In label="Bônus (R$) *" name="bonus_brl" type="number" step="0.01" />
          <In label="Ordem" name="display_order" type="number" defaultValue={100} />
          <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked /> ativa</label>
          <div className="sm:col-span-4"><button className="rounded bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar</button></div>
        </form>
      </details>

      <table className="w-full overflow-hidden rounded-2xl border border-brava-border bg-brava-card text-sm">
        <thead className="bg-brava-paper text-xs uppercase">
          <tr>
            <th className="px-3 py-2 text-left">Label</th>
            <th className="px-3 py-2 text-right">Depósito</th>
            <th className="px-3 py-2 text-right">Bônus</th>
            <th className="px-3 py-2 text-right">Total</th>
            <th className="px-3 py-2 text-center">Ativo</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {(packs ?? []).map((p) => (
            <tr key={p.id} className="border-t border-brava-border">
              <td className="px-3 py-2 font-bold">{p.label}</td>
              <td className="px-3 py-2 text-right">R$ {(p.deposit_cents / 100).toFixed(2)}</td>
              <td className="px-3 py-2 text-right text-green-700">+R$ {(p.bonus_cents / 100).toFixed(2)}</td>
              <td className="px-3 py-2 text-right font-bold">R$ {((p.deposit_cents + p.bonus_cents) / 100).toFixed(2)}</td>
              <td className="px-3 py-2 text-center">{p.is_active ? "✓" : "—"}</td>
              <td className="px-3 py-2 text-right">
                <form action={walletPackDeleteAction.bind(null, p.id)}><button className="text-xs text-red-600">excluir</button></form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function In({ label, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
