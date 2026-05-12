"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { sendMessageAction, markConversationReadAction } from "../actions";

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export function ChatThread({
  conversationId,
  currentUserId,
  side,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  side: "user" | "establishment";
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark conversation as read on mount
  useEffect(() => {
    markConversationReadAction(conversationId, side);
  }, [conversationId, side]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Mark read on receive
          if (msg.sender_id !== currentUserId) {
            markConversationReadAction(conversationId, side);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, side]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    const fd = new FormData();
    fd.set("conversation_id", conversationId);
    fd.set("body", body.trim());
    // Optimistic add
    const tempId = `tmp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, sender_id: currentUserId, body: body.trim(), created_at: new Date().toISOString() },
    ]);
    setBody("");
    try {
      await sendMessageAction(fd);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-brava-muted">
            Mande a primeira mensagem.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? "bg-brava-blue text-white rounded-br-sm"
                      : "bg-brava-paper text-brava-ink rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-brava-muted"}`}>
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-brava-border pt-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Digite uma mensagem…"
          className="flex-1 rounded-full border border-brava-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brava-yellow"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black disabled:opacity-60"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </form>
    </>
  );
}
