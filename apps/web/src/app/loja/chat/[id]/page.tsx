import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { ChatThread } from "@/app/app/chat/[id]/chat";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Conversa — Loja" };

export default async function LojaChatThreadPage({ params }: PageProps) {
  const { id } = await params;
  const { profile, establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, user_id, establishment_id, profiles!conversations_user_id_fkey(full_name)")
    .eq("id", id)
    .maybeSingle();
  if (!conv || conv.establishment_id !== establishment.id) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at, read_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const profileData = (conv as unknown as { profiles: { full_name: string | null } | null }).profiles;

  return (
    <div className="mx-auto flex h-[calc(100vh-160px)] w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center gap-3 border-b border-brava-border pb-3">
        <Link href="/loja/chat" className="text-xs text-brava-muted">← Voltar</Link>
        <div className="ml-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brava-paper text-lg font-black text-brava-blue">
            {(profileData?.full_name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-brava-ink">{profileData?.full_name ?? "Cliente"}</p>
          </div>
        </div>
      </header>

      <ChatThread
        conversationId={id}
        currentUserId={profile.id}
        side="establishment"
        initialMessages={(messages as { id: string; sender_id: string; body: string; created_at: string }[] | null) ?? []}
      />
    </div>
  );
}
