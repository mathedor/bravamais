import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { RetiradaForm, ExcluirRetiradaButton } from "./forms";

export const metadata = { title: "Retiradas — Admin" };

const TIPO_LABEL: Record<string, string> = {
  despesa: "Despesa",
  pro_labore: "Pró-labore",
  imposto: "Imposto",
  fornecedor: "Fornecedor",
  outro: "Outro",
};

interface Row {
  id: string;
  tipo: string;
  descricao: string;
  valor_centavos: number;
  observacao: string | null;
  criado_por_nome: string | null;
  created_at: string;
}

export default async function RetiradasPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const { data } = await admin
    .from("retiradas")
    .select("id, tipo, descricao, valor_centavos, observacao, criado_por_nome, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (data as Row[] | null) ?? [];
  const total = rows.reduce((s, r) => s + r.valor_centavos, 0);
  const mesAtual = rows
    .filter((r) => {
      const d = new Date(r.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, r) => s + r.valor_centavos, 0);

  const porTipo = new Map<string, number>();
  for (const r of rows) porTipo.set(r.tipo, (porTipo.get(r.tipo) ?? 0) + r.valor_centavos);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Financeiro</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Retiradas</h1>
        <p className="mt-1 text-sm text-brava-muted">
          Saídas do caixa da BRAVA+ (despesas, pró-labore, impostos). Reduzem o líquido e a conta
          corrente — não são saques de lojista.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Total retirado" value={formatBRL(total)} highlight />
        <Kpi label="Este mês" value={formatBRL(mesAtual)} />
        {[...porTipo.entries()].slice(0, 2).map(([t, v]) => (
          <Kpi key={t} label={TIPO_LABEL[t] ?? t} value={formatBRL(v)} />
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-base font-bold">Nova retirada</h2>
        <div className="mt-4">
          <RetiradaForm />
        </div>
      </section>

      <section className="mt-6">
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">
            Nenhuma retirada registrada.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brava-border">
            <table className="table-cards w-full min-w-[640px] text-sm">
              <thead className="bg-brava-paper text-left text-xs uppercase text-brava-muted">
                <tr>
                  <th className="p-3">Quando</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Por</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-brava-border">
                    <td data-label="Quando" className="p-3 text-xs text-brava-muted">
                      {new Date(r.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td data-label="Tipo" className="p-3">
                      <span className="rounded-full bg-brava-paper px-2 py-0.5 text-[11px] font-bold">
                        {TIPO_LABEL[r.tipo] ?? r.tipo}
                      </span>
                    </td>
                    <td data-label="Descrição" className="p-3 font-medium text-brava-ink">
                      {r.descricao}
                      {r.observacao && (
                        <span className="block text-xs font-normal text-brava-muted">{r.observacao}</span>
                      )}
                    </td>
                    <td data-label="Por" className="p-3 text-xs text-brava-muted">
                      {r.criado_por_nome ?? "—"}
                    </td>
                    <td data-label="Valor" className="p-3 text-right font-bold text-red-600">
                      −{formatBRL(r.valor_centavos)}
                    </td>
                    <td data-label="Ações" className="p-3 text-right">
                      <ExcluirRetiradaButton id={r.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const base = highlight ? "border-brava-yellow/50 bg-brava-yellow/10" : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border-2 p-4 ${base}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-lg font-black text-brava-ink sm:text-xl">{value}</div>
    </div>
  );
}
