import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { NewTicketForm } from "./new-form";

export const metadata = { title: "Suporte" };

interface Ticket {
  id: string;
  subject: string;
  category: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
}

export default async function SuportePage() {
  const { profile } = await requireRole(["subscriber", "establishment", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("support_tickets")
    .select("id, subject, category, status, last_message_at, created_at")
    .eq("opener_user_id", profile.id)
    .order("last_message_at", { ascending: false });

  const tickets = (data as Ticket[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Suporte</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Como podemos ajudar?</h1>
      </header>

      <NewTicketForm />

      {tickets.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-brava-muted">Seus tickets</h2>
          <div className="space-y-2">
            {tickets.map((t) => (
              <Link
                key={t.id}
                href={`/app/suporte/${t.id}`}
                className="block rounded-2xl border border-brava-border bg-brava-card p-4 hover:bg-brava-paper"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-brava-ink">{t.subject}</p>
                    <p className="text-[11px] text-brava-muted">
                      {t.category} · atualizado {new Date(t.last_message_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <StatusBadge s={t.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: "Aberto", cls: "bg-blue-100 text-blue-700" },
    waiting_user: { label: "Aguardando você", cls: "bg-amber-100 text-amber-700" },
    waiting_admin: { label: "Aguardando admin", cls: "bg-purple-100 text-purple-700" },
    resolved: { label: "Resolvido", cls: "bg-emerald-100 text-emerald-700" },
    closed: { label: "Fechado", cls: "bg-slate-100 text-slate-600" },
  };
  const v = map[s] ?? { label: s, cls: "bg-brava-paper text-brava-ink" };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${v.cls}`}>{v.label}</span>;
}
