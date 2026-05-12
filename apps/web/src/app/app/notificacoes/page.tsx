import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { markNotificationReadAction, markAllReadAction } from "./actions";

export const metadata = { title: "Notificações" };

interface NotifRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

const TYPE_EMOJI: Record<string, string> = {
  subscription: "💎",
  order: "🛒",
  message: "💬",
  loyalty_reward: "🎁",
  establishment_news: "📣",
  system: "🔔",
};

export default async function NotificacoesPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const notifs = (data as NotifRow[] | null) ?? [];
  const unread = notifs.filter((n) => !n.read_at).length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Notificações</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Sua caixa de avisos</h1>
        </div>
        {unread > 0 && (
          <form action={markAllReadAction}>
            <button className="rounded-full bg-brava-yellow px-4 py-2 text-xs font-bold text-brava-black">
              Marcar todas como lidas ({unread})
            </button>
          </form>
        )}
      </header>

      {notifs.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Sem notificações ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {notifs.map((n) => (
            <li key={n.id}>
              <NotifCard n={n} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NotifCard({ n }: { n: NotifRow }) {
  const content = (
    <div className={`flex items-start gap-3 rounded-2xl border bg-brava-card p-4 transition hover:-translate-y-0.5 hover:shadow-md ${!n.read_at ? "border-brava-yellow" : "border-brava-border"}`}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brava-paper text-2xl">
        {TYPE_EMOJI[n.type] ?? "🔔"}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-base ${!n.read_at ? "font-bold text-brava-ink" : "text-brava-ink"}`}>{n.title}</p>
        {n.body && <p className="mt-1 text-sm text-brava-muted">{n.body}</p>}
        <p className="mt-2 text-xs text-brava-muted">
          {new Date(n.created_at).toLocaleString("pt-BR")}
        </p>
      </div>
      {!n.read_at && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brava-blue" />}
    </div>
  );

  if (n.link) {
    return (
      <form action={async () => { "use server"; await markNotificationReadAction(n.id); }}>
        <Link href={n.link} className="block">{content}</Link>
      </form>
    );
  }
  return content;
}
