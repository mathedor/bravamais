import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { fdRenewableBenefit, renewableDispatchNowAction } from "@/app/api/renewable/actions";

function brl(c: number | null | undefined) {
  return `R$ ${((c ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default async function BeneficioRenovavelPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data: benefit } = await supabase
    .from("renewable_benefits")
    .select("*")
    .eq("establishment_id", establishment.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .maybeSingle();

  const { data: stats } = await supabase.rpc("renewable_benefit_stats", { p_estab_id: establishment.id });
  const s = stats?.[0] ?? null;

  async function dispatchNow() {
    "use server";
    await renewableDispatchNowAction();
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">★ obrigatório · hook de retenção</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Benefício Renovável</h1>
        <p className="text-sm text-brava-muted">
          Toda loja BRAVA+ DEVE ter um benefício ativo. Ele é entregue aos membros, renova automaticamente a cada X dias e <strong>não acumula</strong> — quem não usar perde e recebe outro. É o que faz o cliente voltar.
        </p>
      </header>

      {!benefit && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-sm">
          <strong className="text-red-800">⚠ Você ainda não tem benefício ativo.</strong>
          <p className="mt-1 text-red-700">Sua loja só aparece destacada no app quando tem um benefício renovável. Configure abaixo agora — leva 1 minuto.</p>
        </div>
      )}

      {benefit && s && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Ativos agora" value={String(s.active_grants)} tone="yellow" />
          <Kpi label="Já usados" value={String(s.used_grants)} tone="green" />
          <Kpi label="Expiraram (não usados)" value={String(s.expired_grants)} />
          <Kpi label="Conversão" value={`${s.conversion_pct}%`} tone="blue" />
        </section>
      )}

      <section className="rounded-2xl border border-brava-border bg-brava-card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-brava-muted">
          {benefit ? "Editar benefício" : "Criar seu benefício"}
        </h2>
        <form action={fdRenewableBenefit} className="space-y-4">
          {benefit && <input type="hidden" name="id" value={benefit.id} />}

          <div className="grid gap-3 sm:grid-cols-2">
            <Sel label="Tipo *" name="kind" defaultValue={benefit?.kind ?? "percent"}>
              <option value="percent">Cupom de desconto (% off)</option>
              <option value="voucher">Vale-compras (R$)</option>
            </Sel>
            <In
              label="Valor *"
              name="value"
              type="number"
              step="0.01"
              defaultValue={benefit ? (benefit.kind === "voucher" ? (benefit.value / 100).toFixed(2) : benefit.value) : "20"}
              helper="se % digite 20 (=20% off); se vale digite o R$ (ex: 15)"
            />
            <In
              label="Renova a cada (dias) *"
              name="renew_days"
              type="number"
              defaultValue={benefit?.renew_days ?? 30}
              helper="ex: 30 = mensal · 15 = quinzenal. Depois desse prazo, expira e renova."
            />
            <Sel label="Para quem *" name="audience" defaultValue={benefit?.audience ?? "clientes"}>
              <option value="clientes">Meus clientes (favoritaram/visitaram/compraram)</option>
              <option value="cidade">Todos os assinantes da minha cidade</option>
              <option value="todos">Todos os assinantes BRAVA+</option>
            </Sel>
            <In label="Manchete (opcional)" name="headline" defaultValue={benefit?.headline ?? ""} placeholder="ex: 20% off no almoço" />
            <In label="Pedido mínimo R$ (opcional)" name="min_order_brl" type="number" step="0.01"
              defaultValue={benefit?.min_order_cents ? (benefit.min_order_cents / 100).toFixed(2) : ""} />
            <Tx label="Descrição (opcional)" name="description" className="sm:col-span-2" rows={2} defaultValue={benefit?.description ?? ""} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={benefit?.is_active ?? true} /> Ativo
          </label>

          <div className="flex flex-wrap gap-2 border-t border-brava-border pt-4">
            <button type="submit" className="rounded-lg bg-brava-blue px-5 py-2 text-sm font-black text-white hover:bg-brava-blue-bright">
              {benefit ? "Salvar alterações" : "Criar benefício"}
            </button>
          </div>
        </form>
      </section>

      {benefit && (
        <section className="rounded-2xl border-2 border-brava-yellow/40 bg-brava-yellow/5 p-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-brava-muted">Disparar agora</h2>
          <p className="text-sm text-brava-ink">
            Normalmente o sistema entrega automaticamente todo dia. Mas você pode <strong>disparar agora</strong> pra todos os membros elegíveis (até 500 por vez), sem esperar.
          </p>
          <form action={dispatchNow} className="mt-3">
            <button type="submit" className="rounded-lg bg-brava-yellow px-5 py-2 text-sm font-black text-brava-black hover:brightness-95">
              🚀 Entregar benefício agora
            </button>
          </form>
        </section>
      )}

      <section className="rounded-2xl border border-brava-blue/30 bg-brava-blue/5 p-4 text-sm">
        <h3 className="font-bold text-brava-blue">Como funciona (resumo)</h3>
        <ul className="mt-2 space-y-1 text-brava-ink">
          <li>• Cada membro elegível recebe 1 benefício seu — com arte bonita gerada automaticamente, com sua logo.</li>
          <li>• Vale por {benefit?.renew_days ?? 30} dias. Se o cliente NÃO usar, perde — e recebe outro automaticamente.</li>
          <li>• Não acumula: o cliente sempre tem só 1 benefício seu ativo por vez. Isso cria urgência e traz ele de volta.</li>
          <li>• Você acompanha quantos resgataram (conversão) nos KPIs acima.</li>
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "yellow" | "blue" | "green" }) {
  const cls = tone === "yellow" ? "border-brava-yellow/40 bg-brava-yellow/5"
    : tone === "blue" ? "border-brava-blue/30 bg-brava-blue/5"
    : tone === "green" ? "border-green-300 bg-green-50"
    : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border ${cls} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}
function In({ label, helper, className = "", ...p }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span>
      <input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
      {helper && <span className="mt-1 block text-[10px] text-brava-muted">{helper}</span>}
    </label>
  );
}
function Sel({ label, children, className = "", ...p }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span>
      <select {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select>
    </label>
  );
}
function Tx({ label, className = "", ...p }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span>
      <textarea {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
    </label>
  );
}
