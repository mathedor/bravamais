import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Mensagens" };

interface Row {
  id: string;
  last_message_at: string | null;
  unread_by_user: number;
  establishments: { slug: string; name: string; logo_url: string | null; cover_url: string | null } | null;
}

export default async function ChatListPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("conversations")
    .select("id, last_message_at, unread_by_user, establishments(slug, name, logo_url, cover_url)")
    .eq("user_id", profile.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const list = (data as unknown as Row[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Mensagens</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Conversas com lojas</h1>
      </header>

      {list.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Nenhuma conversa iniciada. Abra um estabelecimento e clique em &quot;Falar com a loja&quot;.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c.id}>
              <Link
                href={`/app/chat/${c.id}`}
                className="flex items-center gap-3 rounded-3xl border border-brava-border bg-brava-card p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-brava-paper">
                  {c.establishments?.logo_url && (
                    <Image src={c.establishments.logo_url} alt="" fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-bold text-brava-ink">{c.establishments?.name ?? "—"}</p>
                  <p className="text-xs text-brava-muted">
                    {c.last_message_at ? new Date(c.last_message_at).toLocaleString("pt-BR") : "sem mensagens"}
                  </p>
                </div>
                {c.unread_by_user > 0 && (
                  <span className="rounded-full bg-brava-yellow px-2 py-0.5 text-xs font-bold text-brava-black">
                    {c.unread_by_user}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="h-6" />
    </div>
  );
}
