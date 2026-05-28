import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { listFeatureCatalog, centsToBRL } from "@/lib/feature-gate";
import { upsertFeatureAction, toggleFeatureAction, deleteFeatureAction } from "./actions";

export const metadata = { title: "Admin · Ferramentas" };

export default async function AdminFeaturesPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [catalog, { data: kpis }] = await Promise.all([
    listFeatureCatalog({ onlyActive: false }),
    supabase.rpc("admin_modular_kpis"),
  ]);

  const k = (kpis ?? {}) as {
    mrr_base_cents?: number;
    mrr_features_cents?: number;
    pending_requests?: number;
    top_features?: Array<{ slug: string; name: string; estabs: number; monthly_cents: number; mrr_cents: number }>;
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-brava-ink">Catálogo de Ferramentas</h1>
        <p className="mt-1 text-brava-muted">
          {catalog.length} features no marketplace. Define preço, dependências e visibilidade.
        </p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <KpiCard label="MRR Base" value={centsToBRL(k.mrr_base_cents ?? 0)} />
        <KpiCard label="MRR Features" value={centsToBRL(k.mrr_features_cents ?? 0)} highlight />
        <KpiCard label="MRR Total" value={centsToBRL((k.mrr_base_cents ?? 0) + (k.mrr_features_cents ?? 0))} highlight />
        <KpiCard label="Pedidos pendentes" value={String(k.pending_requests ?? 0)} link="/admin/feature-requests" />
      </section>

      {k.top_features && k.top_features.length > 0 && (
        <section className="mb-10 rounded-3xl border border-brava-border bg-brava-card p-6">
          <h2 className="mb-4 text-base font-bold text-brava-ink">Top features por MRR</h2>
          <div className="space-y-2">
            {k.top_features.map((t) => (
              <div key={t.slug} className="flex items-center justify-between rounded-xl bg-brava-paper px-4 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-bold text-brava-ink">{t.name}</p>
                  <p className="text-xs text-brava-muted">{t.estabs} estabs × {centsToBRL(t.monthly_cents)}</p>
                </div>
                <p className="text-base font-black text-brava-blue">{centsToBRL(t.mrr_cents)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10 rounded-3xl border border-brava-border bg-brava-card p-6">
        <h2 className="text-lg font-bold text-brava-ink">Adicionar / atualizar feature</h2>
        <form action={upsertFeatureAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <Field name="slug" label="Slug (identificador)" placeholder="ex: meu_novo_modulo" required />
          <Field name="name" label="Nome comercial" placeholder="ex: Meu Novo Módulo" required />
          <Field name="short_desc" label="Descrição curta" placeholder="O que faz, em 1 linha" required className="md:col-span-2" />
          <Field name="sales_pitch" label="Pitch comercial" placeholder="Frase de venda (vai no marketplace do lojista)" className="md:col-span-2" />
          <SelectField name="category" label="Categoria" options={[
            { value: "vendas", label: "Vendas" },
            { value: "engajamento", label: "Engajamento" },
            { value: "bi", label: "BI & CRM" },
            { value: "operacao", label: "Operação" },
            { value: "crescimento", label: "Crescimento" },
            { value: "base", label: "Base (incluso)" },
          ]} />
          <Field name="monthly_reais" label="Preço mensal (R$)" placeholder="49" type="number" />
          <Field name="depends_on" label="Dependências (slugs separados por vírgula)" placeholder="cupom_unico,catalogo_basico" className="md:col-span-2" />
          <Field name="pricing_note" label="Observação de preço (opcional)" placeholder="ex: R$ 29 por filial extra" className="md:col-span-2" />
          <Field name="display_order" label="Ordem (menor = primeiro)" placeholder="100" type="number" />
          <div className="flex items-center gap-4 md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_base" /> É feature base (incluso no R$ 49)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked /> Ativa no marketplace
            </label>
          </div>
          <button type="submit" className="md:col-span-2 rounded-full bg-brava-blue px-6 py-2 font-bold text-white">
            Salvar feature
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-brava-ink">Catálogo completo</h2>
        <div className="overflow-hidden rounded-3xl border border-brava-border bg-brava-card">
          <table className="w-full text-sm table-cards">
            <thead className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
              <tr>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">R$/mês</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brava-border">
              {catalog.map((f) => (
                <tr key={f.slug}>
                  <td className="px-4 py-3 font-mono text-xs">{f.slug}</td>
                  <td className="px-4 py-3 font-bold">{f.name}</td>
                  <td className="px-4 py-3 capitalize">{f.category}</td>
                  <td className="px-4 py-3 text-right">{f.is_base ? "—" : centsToBRL(f.monthly_cents)}</td>
                  <td className="px-4 py-3">
                    {f.is_base ? (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">base</span>
                    ) : f.is_active ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">ativa</span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">desativada</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      {!f.is_base && (
                        <form action={toggleFeatureAction}>
                          <input type="hidden" name="slug" value={f.slug} />
                          <input type="hidden" name="is_active" value={String(f.is_active)} />
                          <button className="text-brava-blue hover:underline" type="submit">
                            {f.is_active ? "desativar" : "ativar"}
                          </button>
                        </form>
                      )}
                      {!f.is_base && (
                        <form action={deleteFeatureAction}>
                          <input type="hidden" name="slug" value={f.slug} />
                          <button className="text-red-600 hover:underline" type="submit">
                            excluir
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, highlight, link }: { label: string; value: string; highlight?: boolean; link?: string }) {
  const inner = (
    <div className={`rounded-3xl border p-5 ${highlight ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-brava-card"}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</p>
      <p className={`mt-2 text-2xl font-black ${highlight ? "text-brava-black" : "text-brava-ink"}`}>{value}</p>
    </div>
  );
  if (link) return <a href={link} className="block transition hover:scale-[1.02]">{inner}</a>;
  return inner;
}

function Field({ name, label, placeholder, type, required, className }: { name: string; label: string; placeholder?: string; type?: string; required?: boolean; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs font-bold text-brava-ink">{label}</span>
      <input
        name={name}
        type={type ?? "text"}
        placeholder={placeholder}
        required={required}
        step={type === "number" ? "any" : undefined}
        className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
      />
    </label>
  );
}

function SelectField({ name, label, options }: { name: string; label: string; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-brava-ink">{label}</span>
      <select name={name} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
