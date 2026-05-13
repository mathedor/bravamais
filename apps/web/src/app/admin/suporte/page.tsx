import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Suporte — Admin" };

interface Ticket {
  id: string;
  subject: string;
  category: string | null;
  status: string;
  priority: number;
  last_message_at: string;
  created_at: string;
  opener_user_id: string;
  opener_role: string;
  profiles: { full_name: string | null } | null;
}

export default async function AdminSuportePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole("admin");
  const { status } = await searchParams;
  const admin = createAdminClient();

  let q = admin
    .from("support_tickets")
    .select("id, subject, category, status, priority, last_message_at, created_at, opener_user_id, opener_role, profiles!support_tickets_opener_user_id_fkey(full_name)")
    .order("last_message_at", { ascending: false })
    .limit(100);
  if (status) q = q.eq("status", status);

  const { data } = await q;
  const tickets = (data as unknown as Ticket[] | null) ?? [];
  const openCount = tickets.filter((t) => ["open", "waiting_admin"].includes(t.status)).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Suporte</h1>
        <p className="mt-1 text-sm text-brava-muted">{openCount} esperando resposta · {tickets.length} no filtro</p>
      </header>

      <nav className="mb-4 flex gap-2 text-xs">
        <FLink href="/admin/suporte" label="Todos" active={!status} />
        <FLink href="/admin/suporte?status=waiting_admin" label="Aguardando admin" active={status === "waiting_admin"} />
        <FLink href="/admin/suporte?status=waiting_user" label="Aguardando user" active={status === "waiting_user"} />
        <FLink href="/admin/suporte?status=resolved" label="Resolvidos" active={status === "resolved"} />
      </nav>

      {tickets.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
          🛡️ Sem tickets nesse filtro.
        </p>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <Link key={t.id} href={`/app/suporte/${t.id}`} className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${t.status === "waiting_admin" ? "border-amber-300 bg-amber-50" : "border-brava-border bg-brava-card"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-brava-ink">{t.subject}</p>
                  <p className="text-[11px] text-brava-muted">
                    {t.profiles?.full_name ?? "Cliente"} ({t.opener_role}) · {t.category}
                  </p>
                </div>
                <span className="rounded-full bg-brava-paper px-2 py-0.5 text-[10px] font-bold uppercase">{t.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`rounded-full px-3 py-1.5 font-medium ${active ? "bg-brava-blue text-white" : "border border-brava-border bg-brava-card text-brava-ink"}`}>
      {label}
    </Link>
  );
}
