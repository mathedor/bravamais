import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

export const metadata = { title: "Mensagens — Loja" };

interface Row {
  id: string;
  last_message_at: string | null;
  unread_by_establishment: number;
  profiles: { id: string; full_name: string | null; avatar_url: string | null } | null;
}

export default async function LojaChatList() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data } = await supabase
    .from("conversations")
    .select(
      "id, last_message_at, unread_by_establishment, profiles!conversations_user_id_fkey(id, full_name, avatar_url)",
    )
    .eq("establishment_id", establishment.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const list = (data as unknown as Row[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Mensagens</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Clientes querem falar contigo</h1>
      </header>

      {list.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Nenhuma conversa ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c.id}>
              <Link
                href={`/loja/chat/${c.id}`}
                className="flex items-center gap-3 rounded-3xl border border-brava-border bg-brava-card p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brava-paper text-xl font-black text-brava-blue">
                  {(c.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-bold text-brava-ink">{c.profiles?.full_name ?? "Cliente"}</p>
                  <p className="text-xs text-brava-muted">
                    {c.last_message_at ? new Date(c.last_message_at).toLocaleString("pt-BR") : "sem mensagens"}
                  </p>
                </div>
                {c.unread_by_establishment > 0 && (
                  <span className="rounded-full bg-brava-yellow px-2 py-0.5 text-xs font-bold text-brava-black">
                    {c.unread_by_establishment}
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
