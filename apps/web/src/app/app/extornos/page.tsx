import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { RefundForm } from "./form";

export const metadata = { title: "Extornos" };

interface Ticket {
  id: string;
  status: string;
  user_reason: string;
  user_message: string | null;
  establishment_contest: string | null;
  admin_decision: string | null;
  refund_amount_cents: number | null;
  created_at: string;
  resolved_at: string | null;
  establishments: { name: string; slug: string } | null;
}

interface OrderOption {
  id: string;
  total_cents: number;
  created_at: string;
  establishments: { name: string } | null;
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  open: { label: "Aguardando lojista", tone: "bg-amber-100 text-amber-700" },
  contested: { label: "Contestado — admin avalia", tone: "bg-orange-100 text-orange-700" },
  approved: { label: "Aprovado", tone: "bg-blue-100 text-blue-700" },
  refunded: { label: "Estornado ✓", tone: "bg-green-100 text-green-700" },
  rejected: { label: "Negado", tone: "bg-red-100 text-red-700" },
};

export default async function ExtornosPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: ticketsRaw }, { data: ordersRaw }] = await Promise.all([
    supabase
      .from("refund_tickets")
      .select("id, status, user_reason, user_message, establishment_contest, admin_decision, refund_amount_cents, created_at, resolved_at, establishments(name, slug)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, total_cents, created_at, establishments(name)")
      .eq("user_id", profile.id)
      .in("status", ["paid", "completed"])
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const tickets = (ticketsRaw as unknown as Ticket[] | null) ?? [];
  const orders = (ordersRaw as unknown as OrderOption[] | null) ?? [];
  const refundableIds = new Set(
    tickets.filter((t) => ["open", "contested", "approved"].includes(t.status)).map(() => "")
  );
  const refundableOrders = orders.filter(() => !refundableIds.has(""));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Extornos</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Pedir estorno</h1>
        <p className="mt-1 text-brava-muted">
          Abra um chamado e o lojista responde. Se houver impasse, o admin decide.
        </p>
      </header>

      <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-base font-bold">Novo pedido</h2>
        {refundableOrders.length === 0 ? (
          <p className="mt-3 text-sm text-brava-muted">
            Você não tem pedidos pagos ainda. Faça uma compra primeiro pra poder pedir extorno.
          </p>
        ) : (
          <div className="mt-4">
            <RefundForm orders={refundableOrders} />
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">
          Meus pedidos de extorno ({tickets.length})
        </h2>
        {tickets.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Nenhum extorno solicitado.
          </p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const st = STATUS_LABEL[t.status] ?? { label: t.status, tone: "bg-brava-paper" };
              return (
                <article key={t.id} className="rounded-3xl border border-brava-border bg-brava-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">
                        {t.establishments?.name ?? "—"}
                      </p>
                      <p className="mt-1 text-lg font-black">{t.refund_amount_cents ? formatBRL(t.refund_amount_cents) : "—"}</p>
                      <p className="mt-1 text-xs text-brava-muted">
                        {new Date(t.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.tone}`}>{st.label}</span>
                  </div>
                  <p className="mt-3 rounded-2xl bg-brava-paper px-3 py-2 text-sm">
                    <strong>Motivo:</strong> {t.user_reason}
                  </p>
                  {t.establishment_contest && (
                    <p className="mt-2 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-900">
                      <strong>Lojista contestou:</strong> {t.establishment_contest}
                    </p>
                  )}
                  {t.admin_decision && (
                    <p className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                      <strong>Decisão admin:</strong> {t.admin_decision}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
