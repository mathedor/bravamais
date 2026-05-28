"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/browser";
import { markNotificationReadAction, markAllReadAction } from "@/app/app/notificacoes/actions";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

interface Props {
  userId: string;
  initialNotifs: Notification[];
  initialUnread: number;
}

const TYPE_EMOJI: Record<string, string> = {
  subscription: "💎",
  order: "🛒",
  message: "💬",
  loyalty_reward: "🎁",
  establishment_news: "📣",
  system: "🔔",
};

export function NotificationBell({ userId, initialNotifs, initialUnread }: Props) {
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifs);
  const [unread, setUnread] = useState(initialUnread);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifs:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as Notification;
          setNotifs((prev) => [n, ...prev].slice(0, 20));
          if (!n.read_at) setUnread((u) => u + 1);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function handleClickNotif(n: Notification) {
    if (!n.read_at) {
      await markNotificationReadAction(n.id);
      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
  }

  async function handleMarkAll() {
    await markAllReadAction();
    setNotifs((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnread(0);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificações"
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-brava-border bg-brava-card transition hover:bg-brava-paper sm:h-9 sm:w-9"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brava-ink">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 21a2 2 0 0 0 4 0" strokeLinecap="round" />
        </svg>
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brava-yellow px-1.5 text-[10px] font-bold text-brava-black"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border border-brava-border bg-brava-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brava-border px-4 py-3">
              <p className="text-sm font-bold text-brava-ink">Notificações</p>
              {unread > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-brava-blue hover:underline">
                  Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {notifs.length === 0 ? (
                <p className="p-6 text-center text-sm text-brava-muted">Sem notificações.</p>
              ) : (
                <ul>
                  {notifs.map((n) => (
                    <li key={n.id}>
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => handleClickNotif(n)}
                          className={`flex gap-3 border-b border-brava-border px-4 py-3 transition hover:bg-brava-paper ${
                            !n.read_at ? "bg-brava-yellow/5" : ""
                          }`}
                        >
                          <NotifRow n={n} />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleClickNotif(n)}
                          className={`flex w-full gap-3 border-b border-brava-border px-4 py-3 text-left transition hover:bg-brava-paper ${
                            !n.read_at ? "bg-brava-yellow/5" : ""
                          }`}
                        >
                          <NotifRow n={n} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              href="/app/notificacoes"
              onClick={() => setOpen(false)}
              className="block border-t border-brava-border px-4 py-3 text-center text-xs font-bold text-brava-blue hover:bg-brava-paper"
            >
              Ver todas →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotifRow({ n }: { n: Notification }) {
  return (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brava-paper text-lg">
        {TYPE_EMOJI[n.type] ?? "🔔"}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`line-clamp-1 text-sm ${!n.read_at ? "font-bold text-brava-ink" : "text-brava-ink"}`}>{n.title}</p>
        {n.body && <p className="line-clamp-2 text-xs text-brava-muted">{n.body}</p>}
        <p className="mt-1 text-[10px] text-brava-muted">
          {timeAgo(n.created_at)}
        </p>
      </div>
      {!n.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brava-blue" />}
    </>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}min`;
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
