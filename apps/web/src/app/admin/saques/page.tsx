import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { ApproveForm, RejectForm } from "./forms";

export const metadata = { title: "Saques — Admin" };

interface Row {
  id: string;
  amount_cents: number;
  status: string;
  pix_key: string | null;
  notes: string | null;
  rejected_reason: string | null;
  receipt_url: string | null;
  requested_at: string;
  paid_at: string | null;
  establishment_id: string;
  establishments: { name: string; slug: string } | null;
}

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
    .select("id, amount_cents, status, pix_key, notes, rejected_reason, receipt_url, requested_at, paid_at, establishment_id, establishments(name, slug)")
    .order("requested_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const { data } = await query;
  const rows = (data as unknown as Row[] | null) ?? [];

  const totalPending = rows.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount_cents, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-brava-ink">Saques</h1>
          <p className="mt-1 text-brava-muted">{rows.length} solicitações</p>
        </div>
        {totalPending > 0 && (
          <span className="rounded-2xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">
            ⏳ {formatBRL(totalPending)} pendentes
          </span>
        )}
      </header>

      <div className="mb-6 flex gap-2">
        <FilterLink href="/admin/saques" active={!status}>Todos</FilterLink>
        <FilterLink href="/admin/saques?status=pending" active={status === "pending"}>Pendentes</FilterLink>
        <FilterLink href="/admin/saques?status=paid" active={status === "paid"}>Pagos</FilterLink>
        <FilterLink href="/admin/saques?status=rejected" active={status === "rejected"}>Rejeitados</FilterLink>
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Sem saques {status ?? "registrados"}.
          </p>
        ) : (
          rows.map((r) => (
            <article key={r.id} className="rounded-3xl border border-brava-border bg-brava-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">
                    {r.establishments?.name ?? "—"}
                  </p>
                  <p className="mt-1 text-3xl font-black text-brava-ink">{formatBRL(r.amount_cents)}</p>
                  <p className="mt-1 text-xs text-brava-muted">
                    PIX: <strong className="text-brava-ink">{r.pix_key ?? "—"}</strong>
                  </p>
                  {r.notes && <p className="mt-1 text-xs text-brava-muted">📝 {r.notes}</p>}
                  <p className="mt-2 text-[11px] text-brava-muted">
                    {new Date(r.requested_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  r.status === "pending" ? "bg-amber-100 text-amber-700"
                  : r.status === "paid" ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}>
                  {r.status.toUpperCase()}
                </span>
              </div>

              {r.status === "pending" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ApproveForm withdrawalId={r.id} />
                  <RejectForm withdrawalId={r.id} />
                </div>
              )}
              {r.receipt_url && (
                <p className="mt-3 text-xs">
                  <a href={r.receipt_url} target="_blank" rel="noopener" className="text-brava-blue hover:underline">
                    📎 Ver comprovante
                  </a>
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

import Link from "next/link";

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-brava-blue text-white" : "bg-brava-card border border-brava-border text-brava-ink"}`}>
      {children}
    </Link>
  );
}
