import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { ResolveForm } from "./form";

export const metadata = { title: "Extornos — Admin" };

interface Ticket {
  id: string;
  status: string;
  user_reason: string;
  user_message: string | null;
  establishment_contest: string | null;
  admin_decision: string | null;
  refund_amount_cents: number | null;
  refund_receipt_url: string | null;
  created_at: string;
  user_id: string;
  establishments: { name: string; slug: string } | null;
  profiles: { full_name: string | null } | null;
}

export default async function AdminExtornosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("refund_tickets")
    .select("id, status, user_reason, user_message, establishment_contest, admin_decision, refund_amount_cents, refund_receipt_url, created_at, user_id, establishments(name, slug), profiles!refund_tickets_user_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const { data } = await query;
  const tickets = (data as unknown as Ticket[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-brava-ink">Extornos (tickets)</h1>
        <p className="mt-1 text-brava-muted">{tickets.length} tickets</p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterLink href="/admin/extornos" active={!status}>Todos</FilterLink>
        <FilterLink href="/admin/extornos?status=open" active={status === "open"}>Abertos</FilterLink>
        <FilterLink href="/admin/extornos?status=contested" active={status === "contested"}>Contestados</FilterLink>
        <FilterLink href="/admin/extornos?status=refunded" active={status === "refunded"}>Estornados</FilterLink>
        <FilterLink href="/admin/extornos?status=rejected" active={status === "rejected"}>Negados</FilterLink>
      </div>

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Sem tickets.
          </p>
        ) : (
          tickets.map((t) => {
            const actionable = ["open", "contested", "approved"].includes(t.status);
            return (
              <article key={t.id} className="rounded-3xl border border-brava-border bg-brava-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">
                      <Link href={`/admin/usuarios/${t.user_id}`} className="hover:underline">
                        {t.profiles?.full_name ?? "Cliente"}
                      </Link>
                      {" · "}
                      <Link href={`/admin/estabelecimentos/${t.establishments?.slug ?? ""}`} className="hover:underline">
                        {t.establishments?.name ?? "—"}
                      </Link>
                    </p>
                    <p className="mt-1 text-2xl font-black">{t.refund_amount_cents ? formatBRL(t.refund_amount_cents) : "—"}</p>
                    <p className="mt-1 text-xs text-brava-muted">
                      {new Date(t.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <span className="rounded-full bg-brava-paper px-3 py-1 text-xs font-bold uppercase">{t.status}</span>
                </div>

                <p className="mt-3 rounded-2xl bg-brava-paper px-3 py-2 text-sm">
                  <strong>Cliente:</strong> {t.user_reason}
                </p>
                {t.user_message && <p className="mt-1 px-3 text-xs text-brava-muted italic">&quot;{t.user_message}&quot;</p>}
                {t.establishment_contest && (
                  <p className="mt-2 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-900">
                    <strong>Lojista:</strong> {t.establishment_contest}
                  </p>
                )}
                {t.admin_decision && (
                  <p className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                    <strong>Sua decisão:</strong> {t.admin_decision}
                  </p>
                )}
                {t.refund_receipt_url && (
                  <p className="mt-2 text-xs">
                    <a href={t.refund_receipt_url} target="_blank" rel="noopener" className="text-brava-blue hover:underline">
                      📎 Comprovante do estorno
                    </a>
                  </p>
                )}

                {actionable && <ResolveForm ticketId={t.id} />}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-brava-blue text-white" : "bg-brava-card border border-brava-border text-brava-ink"}`}>
      {children}
    </Link>
  );
}
