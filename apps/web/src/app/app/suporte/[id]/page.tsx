import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { ReplyForm } from "./reply-form";

export const metadata = { title: "Ticket de suporte" };

interface Msg {
  id: string;
  sender_user_id: string;
  is_admin_reply: boolean;
  body: string;
  created_at: string;
}

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireRole(["subscriber", "establishment", "admin"]);
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, opener_user_id, subject, category, status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!ticket) notFound();
  if (ticket.opener_user_id !== profile.id && profile.role !== "admin") notFound();

  const { data: msgs } = await supabase
    .from("support_messages")
    .select("id, sender_user_id, is_admin_reply, body, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  const messages = (msgs as Msg[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <Link href="/app/suporte" className="text-xs text-brava-blue hover:underline">← Voltar</Link>
        <h1 className="mt-2 text-2xl font-black text-brava-ink">{ticket.subject}</h1>
        <p className="mt-1 text-[11px] text-brava-muted">
          {ticket.category} · status <strong>{ticket.status}</strong>
        </p>
      </header>

      <section className="space-y-3">
        {messages.map((m) => (
          <article key={m.id} className={`rounded-2xl p-4 ${m.is_admin_reply ? "border-2 border-brava-yellow bg-brava-yellow/10" : "border border-brava-border bg-brava-card"}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">
              {m.is_admin_reply ? "🛡️ Suporte BRAVA+" : "👤 Você"}
              <span className="ml-2 text-brava-muted">{new Date(m.created_at).toLocaleString("pt-BR")}</span>
            </p>
            <p className="mt-2 whitespace-pre-line text-sm text-brava-ink">{m.body}</p>
          </article>
        ))}
      </section>

      {ticket.status !== "resolved" && ticket.status !== "closed" && (
        <div className="mt-4">
          <ReplyForm ticketId={id} />
        </div>
      )}
    </div>
  );
}
