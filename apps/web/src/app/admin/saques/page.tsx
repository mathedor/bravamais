import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { ApproveButton, PayForm, RejectForm } from "./forms";

export const metadata = { title: "Saques — Admin" };

interface ContaSnapshot {
  apelido?: string | null;
  pix_chave?: string | null;
  banco?: string | null;
  agencia?: string | null;
  conta?: string | null;
  tipo_conta?: string | null;
  titular?: string | null;
  doc_titular?: string | null;
}

interface Row {
  id: string;
  amount_cents: number;
  status: string;
  forma: string | null;
  pix_key: string | null;
  notes: string | null;
  conta_snapshot: ContaSnapshot | null;
  taxa_transferencia_centavos: number | null;
  rejected_reason: string | null;
  receipt_url: string | null;
  requested_at: string;
  approved_at: string | null;
  paid_at: string | null;
  establishment_id: string;
  establishments: { name: string; slug: string } | null;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "PENDENTE",
  approved: "APROVADO",
  paid: "PAGO",
  rejected: "RECUSADO",
};

export default async function AdminSaquesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("withdrawals")
    .select(
      "id, amount_cents, status, forma, pix_key, notes, conta_snapshot, taxa_transferencia_centavos, rejected_reason, receipt_url, requested_at, approved_at, paid_at, establishment_id, establishments(name, slug)",
    )
    .order("requested_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const [{ data }, { data: blocksData }] = await Promise.all([
    query,
    supabase
      .from("financial_blocks")
      .select("establishment_id, valor_centavos")
      .eq("status", "ativo"),
  ]);
  const rows = (data as unknown as Row[] | null) ?? [];

  const debitosPorEstab = new Map<string, number>();
  for (const b of blocksData ?? []) {
    debitosPorEstab.set(
      b.establishment_id,
      (debitosPorEstab.get(b.establishment_id) ?? 0) + b.valor_centavos,
    );
  }

  const totalPending = rows
    .filter((r) => r.status === "pending")
    .reduce((s, r) => s + r.amount_cents, 0);
  const totalApproved = rows
    .filter((r) => r.status === "approved")
    .reduce((s, r) => s + r.amount_cents, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-brava-ink">Saques</h1>
          <p className="mt-1 text-brava-muted">{rows.length} solicitações</p>
        </div>
        <div className="flex gap-2">
          {totalPending > 0 && (
            <span className="rounded-2xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">
              ⏳ {formatBRL(totalPending)} pendentes
            </span>
          )}
          {totalApproved > 0 && (
            <span className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800">
              💸 {formatBRL(totalApproved)} na fila
            </span>
          )}
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterLink href="/admin/saques" active={!status}>Todos</FilterLink>
        <FilterLink href="/admin/saques?status=pending" active={status === "pending"}>Pendentes</FilterLink>
        <FilterLink href="/admin/saques?status=approved" active={status === "approved"}>Aprovados</FilterLink>
        <FilterLink href="/admin/saques?status=paid" active={status === "paid"}>Pagos</FilterLink>
        <FilterLink href="/admin/saques?status=rejected" active={status === "rejected"}>Recusados</FilterLink>
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Sem saques {status ? STATUS_LABEL[status]?.toLowerCase() : "registrados"}.
          </p>
        ) : (
          rows.map((r) => {
            const debitos = debitosPorEstab.get(r.establishment_id) ?? 0;
            const conta = r.conta_snapshot;
            return (
              <article key={r.id} className="rounded-3xl border border-brava-border bg-brava-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">
                      {r.establishments?.name ?? "—"} · {r.forma === "CARTAO" ? "💳 Cartão" : "💠 PIX"}
                    </p>
                    <p className="mt-1 text-3xl font-black text-brava-ink">{formatBRL(r.amount_cents)}</p>
                    {(r.taxa_transferencia_centavos ?? 0) > 0 && (
                      <p className="text-xs text-brava-muted">
                        Transferir: {formatBRL(r.amount_cents - (r.taxa_transferencia_centavos ?? 0))}{" "}
                        (taxa {formatBRL(r.taxa_transferencia_centavos!)})
                      </p>
                    )}
                    <div className="mt-2 rounded-2xl bg-brava-paper px-3 py-2 text-xs">
                      {conta ? (
                        <>
                          <p className="font-bold text-brava-ink">
                            {conta.apelido || conta.banco || "Conta"} · {conta.titular ?? "—"}
                            {conta.doc_titular ? ` (${conta.doc_titular})` : ""}
                          </p>
                          <p className="text-brava-muted">
                            {conta.pix_chave
                              ? `PIX: ${conta.pix_chave}`
                              : `${conta.banco ?? "—"} ag ${conta.agencia ?? "—"} cc ${conta.conta ?? "—"} (${conta.tipo_conta ?? "corrente"})`}
                          </p>
                        </>
                      ) : (
                        <p className="text-brava-muted">PIX: {r.pix_key ?? "—"}</p>
                      )}
                    </div>
                    {r.notes && <p className="mt-1 text-xs text-brava-muted">📝 {r.notes}</p>}
                    {debitos > 0 && (
                      <p className="mt-1 text-xs font-bold text-red-600">
                        ⚠️ Estab. com débitos ativos: {formatBRL(debitos)}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-brava-muted">
                      solicitado {new Date(r.requested_at).toLocaleString("pt-BR")}
                      {r.approved_at && ` · aprovado ${new Date(r.approved_at).toLocaleString("pt-BR")}`}
                      {r.paid_at && ` · pago ${new Date(r.paid_at).toLocaleString("pt-BR")}`}
                    </p>
                    {r.status === "rejected" && r.rejected_reason && (
                      <p className="mt-1 text-xs text-red-600">Motivo: {r.rejected_reason}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[r.status] ?? "bg-brava-paper text-brava-muted"}`}
                  >
                    {STATUS_LABEL[r.status] ?? r.status.toUpperCase()}
                  </span>
                </div>

                {r.status === "pending" && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <ApproveButton withdrawalId={r.id} />
                    <PayForm withdrawalId={r.id} />
                    <RejectForm withdrawalId={r.id} />
                  </div>
                )}
                {r.status === "approved" && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <PayForm withdrawalId={r.id} />
                    <RejectForm withdrawalId={r.id} />
                  </div>
                )}
                {r.receipt_url && (
                  <p className="mt-3 text-xs">
                    <a
                      href={r.receipt_url}
                      target="_blank"
                      rel="noopener"
                      className="text-brava-blue hover:underline"
                    >
                      📎 Ver comprovante
                    </a>
                  </p>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-brava-blue text-white" : "bg-brava-card border border-brava-border text-brava-ink"}`}
    >
      {children}
    </Link>
  );
}
