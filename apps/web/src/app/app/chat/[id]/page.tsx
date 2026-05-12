import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { ChatThread } from "./chat";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Conversa" };

export default async function ChatThreadPage({ params }: PageProps) {
  const { id } = await params;
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, user_id, establishment_id, establishments(slug, name, logo_url)")
    .eq("id", id)
    .maybeSingle();
  if (!conv) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at, read_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const estab = (conv as unknown as { establishments: { slug: string; name: string; logo_url: string | null } | null }).establishments;

  return (
    <div className="mx-auto flex h-[calc(100vh-160px)] w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center gap-3 border-b border-brava-border pb-3">
        <Link href="/app/chat" className="text-xs text-brava-muted">← Voltar</Link>
        <div className="ml-2 flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-brava-paper">
            {estab?.logo_url && <Image src={estab.logo_url} alt="" fill sizes="40px" className="object-cover" />}
          </div>
          <div>
            <p className="text-sm font-bold text-brava-ink">{estab?.name ?? "—"}</p>
            <Link href={estab ? `/app/estabelecimento/${estab.slug}` : "#"} className="text-[11px] text-brava-blue hover:underline">
              ver loja →
            </Link>
          </div>
        </div>
      </header>

      <ChatThread
        conversationId={id}
        currentUserId={profile.id}
        side="user"
        initialMessages={(messages as { id: string; sender_id: string; body: string; created_at: string }[] | null) ?? []}
      />
    </div>
  );
}
