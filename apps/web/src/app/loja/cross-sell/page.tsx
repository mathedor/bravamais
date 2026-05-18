import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { fdCrossSell } from "@/app/api/tools/actions";

export default async function CrossSellPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const [{ data: rules }, { data: products }] = await Promise.all([
    supabase.from("cross_sell_rules").select("*").eq("establishment_id", establishment.id).order("created_at", { ascending: false }),
    supabase.from("products").select("id, name").eq("establishment_id", establishment.id).eq("is_active", true),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">cross-sell pós-venda</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Recibo digital + cupom extra</h1>
        <p className="text-sm text-brava-muted">Após pagamento, cliente recebe cupom pra outro produto seu. Ticket sobe sem pressão de garçom.</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Nova regra</summary>
        <form action={fdCrossSell} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Sel label="Quando cliente comprar (gatilho)" name="trigger_product_id">
              <option value="">— qualquer produto —</option>
              {(products ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Sel>
            <In label="Label da oferta *" name="offer_label" placeholder="ex: 20% off em sobremesa" required />
            <Sel label="Tipo" name="discount_kind"><option value="percent">% off</option><option value="fixed">R$ fixo</option></Sel>
            <In label="Valor" name="discount_value" type="number" defaultValue={20} />
            <In label="Válido por (horas)" name="valid_hours" type="number" defaultValue={24} />
            <label className="flex items-center gap-2 self-end text-sm"><input type="checkbox" name="is_active" defaultChecked /> ativa</label>
          </div>
          <button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar regra</button>
        </form>
      </details>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Regras ({rules?.length ?? 0})</h2>
        {rules && rules.length > 0 ? (
          <ul className="space-y-2">
            {rules.map((r) => (
              <li key={r.id} className="rounded-2xl border border-brava-border bg-brava-card p-3 text-sm">
                <div className="font-bold">{r.offer_label}</div>
                <div className="text-xs text-brava-muted">
                  {r.discount_kind === "percent" ? `${r.discount_value}% off` : `R$ ${r.discount_value} off`} · válido {r.valid_hours}h · mostrado {r.shown_count ?? 0}x · resgatado {r.redeemed_count ?? 0}x
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">
            Sem regras de cross-sell. Comece com 1 ("20% off em sobremesa após pedido de prato").
          </div>
        )}
      </section>
    </div>
  );
}

function In({ label, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Sel({ label, children, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><select {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select></label>; }
