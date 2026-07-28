import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import {
  NewAcquirerButton,
  EditAcquirerButton,
  ToggleAcquirerForm,
  NewFeeButton,
  EditFeeButton,
  DeleteFeeButton,
  type AcquirerData,
  type FeeData,
} from "./forms";

export const metadata = { title: "Adquirentes — Admin" };

const FORMA_LABEL: Record<string, string> = {
  pix: "💠 PIX",
  credito: "💳 Crédito",
  debito: "💳 Débito",
};

export default async function AdquirentesPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: acquirersData }, { data: feesData }] = await Promise.all([
    supabase
      .from("acquirers")
      .select("id, nome, slug, ativo, observacao, custo_transferencia_centavos")
      .order("nome"),
    supabase
      .from("acquirer_fees")
      .select(
        "id, acquirer_id, forma, rotulo, taxa_percentual, taxa_fixa_centavos, parcelado, taxa_parcela_percentual, max_parcelas, prazo_liberacao_dias, ativo",
      )
      .order("forma"),
  ]);

  const acquirers = (acquirersData as AcquirerData[] | null) ?? [];
  const fees = (feesData as (FeeData & { ativo: boolean })[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-brava-ink">Adquirentes</h1>
          <p className="mt-1 text-brava-muted">
            Gateways de pagamento, taxas por forma e custo de transferência dos saques.
          </p>
        </div>
        <NewAcquirerButton />
      </header>

      <div className="space-y-4">
        {acquirers.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Nenhum adquirente cadastrado. A migration cria SyncPay e Stripe automaticamente.
          </p>
        ) : (
          acquirers.map((a) => {
            const acqFees = fees.filter((f) => f.acquirer_id === a.id);
            return (
              <article key={a.id} className="rounded-3xl border border-brava-border bg-brava-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-brava-ink">{a.nome}</h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          a.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {a.ativo ? "ATIVO" : "INATIVO"}
                      </span>
                      <code className="rounded bg-brava-paper px-2 py-0.5 text-xs text-brava-muted">
                        {a.slug}
                      </code>
                    </div>
                    {a.observacao && <p className="mt-1 text-sm text-brava-muted">{a.observacao}</p>}
                    <p className="mt-1 text-xs text-brava-muted">
                      Custo de transferência (desconto no saque):{" "}
                      <strong className="text-brava-ink">
                        {formatBRL(a.custo_transferencia_centavos)}
                      </strong>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <NewFeeButton acquirerId={a.id} />
                    <EditAcquirerButton acquirer={a} />
                    <ToggleAcquirerForm id={a.id} ativo={a.ativo} />
                  </div>
                </div>

                {acqFees.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-2xl border border-brava-border">
                    <table className="table-cards w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
                          <th className="px-4 py-2.5">Forma</th>
                          <th className="px-4 py-2.5">Rótulo</th>
                          <th className="px-4 py-2.5 text-right">Taxa</th>
                          <th className="px-4 py-2.5 text-right">Fixa</th>
                          <th className="px-4 py-2.5 text-right">Liberação</th>
                          <th className="px-4 py-2.5 text-right">Parcelas</th>
                          <th className="px-4 py-2.5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acqFees.map((f) => (
                          <tr key={f.id} className="border-t border-brava-border">
                            <td data-label="Forma" className="px-4 py-2.5 font-bold">
                              {FORMA_LABEL[f.forma] ?? f.forma}
                            </td>
                            <td data-label="Rótulo" className="px-4 py-2.5">{f.rotulo ?? "—"}</td>
                            <td data-label="Taxa" className="px-4 py-2.5 text-right">
                              {Number(f.taxa_percentual).toFixed(2).replace(".", ",")}%
                            </td>
                            <td data-label="Fixa" className="px-4 py-2.5 text-right">
                              {formatBRL(f.taxa_fixa_centavos)}
                            </td>
                            <td data-label="Liberação" className="px-4 py-2.5 text-right">
                              D+{f.prazo_liberacao_dias}
                            </td>
                            <td data-label="Parcelas" className="px-4 py-2.5 text-right">
                              {f.parcelado
                                ? `até ${f.max_parcelas}x (+${Number(f.taxa_parcela_percentual).toFixed(2).replace(".", ",")}%/mês)`
                                : "à vista"}
                            </td>
                            <td data-label="Ações" className="px-4 py-2.5 text-right">
                              <span className="inline-flex gap-3">
                                <EditFeeButton fee={f} />
                                <DeleteFeeButton feeId={f.id} />
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
