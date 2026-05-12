import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";
import { ContestForm } from "./form";

export const metadata = { title: "Extornos — Loja" };

interface Ticket {
  id: string;
  status: string;
  user_reason: string;
  user_message: string | null;
  establishment_contest: string | null;
  admin_decision: string | null;
  refund_amount_cents: number | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

export default async function LojaExtornosPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data } = await supabase
    .from("refund_tickets")
    .select("id, status, user_reason, user_message, establishment_contest, admin_decision, refund_amount_cents, created_at, profiles!refund_tickets_user_id_fkey(full_name)")
    .eq("establishment_id", establishment.id)
    .order("created_at", { ascending: false });

  const tickets = (data as unknown as Ticket[] | null) ?? [];
  const open = tickets.filter((t) => t.status === "open");
  const others = tickets.filter((t) => t.status !== "open");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">🔴 Extornos</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Pedidos de extorno</h1>
        <p className="mt-1 text-brava-muted">
          Cliente abriu reclamação. Você pode aceitar (extorna direto) ou contestar pra admin avaliar.
        </p>
      </header>

      {open.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-700">
            ⏳ Aguardando sua resposta ({open.length})
          </h2>
          <div className="space-y-3">
            {open.map((t) => (
              <TicketCard key={t.id} ticket={t} actionable />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">
          Histórico ({others.length})
        </h2>
        {others.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Sem extornos no histórico.
          </p>
        ) : (
          <div className="space-y-3">
            {others.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TicketCard({ ticket, actionable }: { ticket: Ticket; actionable?: boolean }) {
  return (
    <article className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">
            {ticket.profiles?.full_name ?? "Cliente"}
          </p>
          <p className="mt-1 text-lg font-black">{ticket.refund_amount_cents ? formatBRL(ticket.refund_amount_cents) : "—"}</p>
          <p className="mt-1 text-xs text-brava-muted">
            {new Date(ticket.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <span className="rounded-full bg-brava-paper px-3 py-1 text-xs font-bold uppercase">{ticket.status}</span>
      </div>
      <p className="mt-3 rounded-2xl bg-brava-paper px-3 py-2 text-sm">
        <strong>Motivo do cliente:</strong> {ticket.user_reason}
      </p>
      {ticket.user_message && (
        <p className="mt-2 px-3 text-xs text-brava-muted italic">&quot;{ticket.user_message}&quot;</p>
      )}
      {ticket.establishment_contest && (
        <p className="mt-2 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-900">
          <strong>Sua resposta:</strong> {ticket.establishment_contest}
        </p>
      )}
      {ticket.admin_decision && (
        <p className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <strong>Decisão admin:</strong> {ticket.admin_decision}
        </p>
      )}

      {actionable && <ContestForm ticketId={ticket.id} />}
    </article>
  );
}
