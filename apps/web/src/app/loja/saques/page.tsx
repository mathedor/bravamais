import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { WithdrawalForm } from "./form";
import { getAvailableBalance } from "./actions";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Saques — Loja" };

interface Row {
  id: string;
  amount_cents: number;
  status: string;
  requested_at: string;
  paid_at: string | null;
  receipt_url: string | null;
  rejected_reason: string | null;
}

export default async function SaquesPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const available = await getAvailableBalance(establishment.id);

  const { data } = await supabase
    .from("withdrawals")
    .select("id, amount_cents, status, requested_at, paid_at, receipt_url, rejected_reason")
    .eq("establishment_id", establishment.id)
    .order("requested_at", { ascending: false });

  const rows = (data as Row[] | null) ?? [];
  const pending = rows.filter((r) => r.status === "pending");
  const history = rows.filter((r) => r.status !== "pending");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">💰 Saques</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Receber suas vendas</h1>
        <p className="mt-1 text-brava-muted">
          Solicite a transferência das vendas via PIX. Admin processa e anexa o comprovante.
        </p>
      </header>

      <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-base font-bold">Nova solicitação</h2>
        <div className="mt-4">
          <WithdrawalForm available={available} />
        </div>
      </section>

      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-yellow-deep">
            ⏳ Aguardando processamento ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((r) => (
              <article key={r.id} className="flex items-center justify-between rounded-2xl border border-brava-yellow bg-brava-yellow/10 p-4">
                <div>
                  <p className="text-2xl font-black text-brava-blue">{formatBRL(r.amount_cents)}</p>
                  <p className="text-xs text-brava-muted">
                    solicitado em {new Date(r.requested_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  PENDENTE
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">
          Histórico
        </h2>
        {history.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Sem saques anteriores.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((r) => (
              <article key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-brava-border bg-brava-card p-4">
                <div>
                  <p className="text-lg font-black text-brava-ink">{formatBRL(r.amount_cents)}</p>
                  <p className="text-xs text-brava-muted">
                    {r.status === "paid"
                      ? `pago em ${r.paid_at ? new Date(r.paid_at).toLocaleDateString("pt-BR") : "—"}`
                      : `rejeitado: ${r.rejected_reason ?? "—"}`}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {r.status.toUpperCase()}
                </span>
                {r.receipt_url && (
                  <a href={r.receipt_url} target="_blank" rel="noopener" className="text-xs text-brava-blue hover:underline">
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
