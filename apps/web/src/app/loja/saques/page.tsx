import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { WithdrawalForm, BankAccountForm, DeleteAccountButton } from "./form";
import { formatBRL } from "@/lib/format";
import {
  saqueResumoEstab,
  custoTransferencia,
  JANELA_PIX_DIAS,
  JANELA_CARTAO_DIAS,
} from "@/lib/financeiro";

export const metadata = { title: "Saques — Loja" };

interface Row {
  id: string;
  amount_cents: number;
  status: string;
  forma: string | null;
  taxa_transferencia_centavos: number | null;
  requested_at: string;
  paid_at: string | null;
  receipt_url: string | null;
  rejected_reason: string | null;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "PENDENTE", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "APROVADO", cls: "bg-blue-100 text-blue-700" },
  paid: { label: "PAGO", cls: "bg-green-100 text-green-700" },
  rejected: { label: "RECUSADO", cls: "bg-red-100 text-red-700" },
};

export default async function SaquesPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const [resumo, taxaPix, taxaCartao, { data: contasData }, { data: saquesData }] =
    await Promise.all([
      saqueResumoEstab(establishment.id),
      custoTransferencia("PIX"),
      custoTransferencia("CARTAO"),
      supabase
        .from("establishment_bank_accounts")
        .select("id, apelido, pix_chave, banco, agencia, conta, tipo_conta, titular")
        .eq("establishment_id", establishment.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("withdrawals")
        .select(
          "id, amount_cents, status, forma, taxa_transferencia_centavos, requested_at, paid_at, receipt_url, rejected_reason",
        )
        .eq("establishment_id", establishment.id)
        .order("requested_at", { ascending: false }),
    ]);

  const contas = contasData ?? [];
  const rows = (saquesData as Row[] | null) ?? [];
  const emAndamento = rows.filter((r) => r.status === "pending" || r.status === "approved");
  const historico = rows.filter((r) => r.status === "paid" || r.status === "rejected");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">💰 Saques</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Receber suas vendas</h1>
        <p className="mt-1 text-brava-muted">
          PIX libera em D+{JANELA_PIX_DIAS}, cartão em D+{JANELA_CARTAO_DIAS}. A BRAVA+ processa e
          anexa o comprovante.
        </p>
      </header>

      {/* 4 cards de resumo */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card titulo="Disponível" valor={resumo.total_disponivel_cents} tom="text-green-600" />
        <Card
          titulo="Bloqueado (janela)"
          valor={resumo.total_bloqueado_cents}
          tom="text-amber-600"
          rodape={
            resumo.proxima_liberacao
              ? `libera ${new Date(resumo.proxima_liberacao).toLocaleDateString("pt-BR")}`
              : undefined
          }
        />
        <Card titulo="Solicitado" valor={resumo.total_solicitado_cents} tom="text-brava-blue" />
        <Card titulo="Realizado" valor={resumo.total_realizado_cents} tom="text-brava-ink" />
      </section>

      {resumo.debitos_cents > 0 && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ Há débitos ativos de <strong>{formatBRL(resumo.debitos_cents)}</strong> sendo cobertos
          pelo seu saldo na plataforma
          {resumo.debito_deduzido_cents > 0 &&
            ` (${formatBRL(resumo.debito_deduzido_cents)} deduzidos do disponível)`}
          .
        </p>
      )}

      {/* Linhas por forma */}
      <section className="mt-6 overflow-x-auto rounded-2xl border border-brava-border">
        <table className="table-cards w-full min-w-[520px] text-sm">
          <thead>
            <tr className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
              <th className="px-4 py-3">Forma</th>
              <th className="px-4 py-3 text-right">Faturado</th>
              <th className="px-4 py-3 text-right">Liberado</th>
              <th className="px-4 py-3 text-right">Em janela</th>
              <th className="px-4 py-3 text-right">Sacado</th>
              <th className="px-4 py-3 text-right">Restante</th>
            </tr>
          </thead>
          <tbody>
            {resumo.linhas.map((l) => (
              <tr key={l.forma} className="border-t border-brava-border bg-brava-card">
                <td data-label="Forma" className="px-4 py-3 font-bold">
                  {l.forma === "PIX" ? "💠 PIX" : "💳 Cartão"}
                </td>
                <td data-label="Faturado" className="px-4 py-3 text-right">{formatBRL(l.total_cents)}</td>
                <td data-label="Liberado" className="px-4 py-3 text-right text-green-600">
                  {formatBRL(l.liberado_cents)}
                </td>
                <td data-label="Em janela" className="px-4 py-3 text-right text-amber-600">
                  {formatBRL(l.bloqueado_cents)}
                </td>
                <td data-label="Sacado" className="px-4 py-3 text-right">{formatBRL(l.sacado_cents)}</td>
                <td data-label="Restante" className="px-4 py-3 text-right font-bold text-brava-blue">
                  {formatBRL(l.restante_cents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Nova solicitação */}
      <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-base font-bold">Nova solicitação</h2>
        <div className="mt-4">
          <WithdrawalForm
            disponivel={resumo.total_disponivel_cents}
            linhas={resumo.linhas.map((l) => ({
              forma: l.forma,
              restante_cents: l.restante_cents,
              taxa_transferencia_cents: l.forma === "CARTAO" ? taxaCartao : taxaPix,
            }))}
            contas={contas}
          />
        </div>
      </section>

      {/* Contas bancárias */}
      <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">🏦 Contas bancárias</h2>
          <BankAccountForm />
        </div>
        {contas.length === 0 ? (
          <p className="mt-3 text-sm text-brava-muted">Nenhuma conta cadastrada ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {contas.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-brava-border bg-brava-paper px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-bold">{c.apelido || c.banco || "Conta"}</p>
                  <p className="text-xs text-brava-muted">
                    {c.pix_chave ? `PIX: ${c.pix_chave}` : `${c.banco} ag ${c.agencia} cc ${c.conta}`}
                    {c.titular ? ` · ${c.titular}` : ""}
                  </p>
                </div>
                <DeleteAccountButton accountId={c.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Em andamento */}
      {emAndamento.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-yellow-deep">
            ⏳ Em andamento ({emAndamento.length})
          </h2>
          <div className="space-y-2">
            {emAndamento.map((r) => (
              <article
                key={r.id}
                className="flex items-center justify-between rounded-2xl border border-brava-yellow bg-brava-yellow/10 p-4"
              >
                <div>
                  <p className="text-2xl font-black text-brava-blue">{formatBRL(r.amount_cents)}</p>
                  <p className="text-xs text-brava-muted">
                    {r.forma === "CARTAO" ? "Cartão" : "PIX"} · solicitado em{" "}
                    {new Date(r.requested_at).toLocaleString("pt-BR")}
                    {(r.taxa_transferencia_centavos ?? 0) > 0 &&
                      ` · taxa ${formatBRL(r.taxa_transferencia_centavos!)}`}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Histórico */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">Histórico</h2>
        {historico.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Sem saques anteriores.
          </p>
        ) : (
          <div className="space-y-2">
            {historico.map((r) => (
              <article
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-brava-border bg-brava-card p-4"
              >
                <div>
                  <p className="text-lg font-black text-brava-ink">{formatBRL(r.amount_cents)}</p>
                  <p className="text-xs text-brava-muted">
                    {r.forma === "CARTAO" ? "Cartão" : "PIX"} ·{" "}
                    {r.status === "paid"
                      ? `pago em ${r.paid_at ? new Date(r.paid_at).toLocaleDateString("pt-BR") : "—"}`
                      : `recusado: ${r.rejected_reason ?? "—"}`}
                  </p>
                </div>
                <StatusBadge status={r.status} />
                {r.receipt_url && (
                  <a
                    href={r.receipt_url}
                    target="_blank"
                    rel="noopener"
                    className="text-xs text-brava-blue hover:underline"
                  >
                    Ver comprovante →
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Card({
  titulo,
  valor,
  tom,
  rodape,
}: {
  titulo: string;
  valor: number;
  tom: string;
  rodape?: string;
}) {
  return (
    <div className="rounded-3xl border border-brava-border bg-brava-card p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">{titulo}</p>
      <p className={`mt-1 text-xl font-black sm:text-2xl ${tom}`}>{formatBRL(valor)}</p>
      {rodape && <p className="mt-1 text-[11px] text-brava-muted">{rodape}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { label: status.toUpperCase(), cls: "bg-brava-paper text-brava-muted" };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}
