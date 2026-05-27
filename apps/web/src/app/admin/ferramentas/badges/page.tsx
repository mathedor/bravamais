import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { fdBadge, badgeDeleteAction } from "@/app/api/tools/actions";

export default async function AdminBadgesPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: badges } = await supabase.from("badges").select("*").order("display_order");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-black">Badges (conquistas)</h1>
        <p className="text-sm text-brava-muted">Configure regras de gamificação pros assinantes.</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Novo badge</summary>
        <form action={fdBadge} className="mt-3 grid gap-3 sm:grid-cols-3">
          <In label="Slug (único)" name="slug" required />
          <In label="Label" name="label" required />
          <In label="Ícone (emoji)" name="icon" defaultValue="🏆" />
          <In label="Descrição" name="description" className="sm:col-span-3" />
          <Sel label="Tipo de regra" name="rule_kind">
            <option value="estabs">Estabs visitados</option>
            <option value="categories">Categorias diferentes</option>
            <option value="visits">Total de visitas</option>
            <option value="cities">Cidades diferentes</option>
            <option value="streak_days">Sequência (dias)</option>
          </Sel>
          <In label="Valor da regra" name="rule_value" type="number" defaultValue={5} />
          <In label="Recompensa (coins)" name="coins_reward" type="number" defaultValue={50} />
          <In label="Ordem" name="display_order" type="number" defaultValue={100} />
          <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked /> ativa</label>
          <div className="sm:col-span-3"><button className="rounded bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar badge</button></div>
        </form>
      </details>

      <table className="w-full overflow-hidden rounded-2xl border border-brava-border bg-brava-card text-sm table-cards">
        <thead className="bg-brava-paper text-xs uppercase"><tr><th className="px-3 py-2 text-left">Badge</th><th className="px-3 py-2 text-left">Regra</th><th className="px-3 py-2 text-right">Coins</th><th className="px-3 py-2"></th></tr></thead>
        <tbody>
          {(badges ?? []).map((b) => (
            <tr key={b.id} className="border-t border-brava-border">
              <td className="px-3 py-2"><span className="text-xl">{b.icon}</span> <b>{b.label}</b><br/><span className="text-xs text-brava-muted">{b.slug}</span></td>
              <td className="px-3 py-2 text-xs">{b.rule_kind} ≥ {b.rule_value}</td>
              <td className="px-3 py-2 text-right">{b.coins_reward}</td>
              <td className="px-3 py-2 text-right"><form action={badgeDeleteAction.bind(null, b.id)}><button className="text-xs text-red-600">excluir</button></form></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function In({ label, className = "", ...p }: any) { return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Sel({ label, children, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><select {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select></label>; }
