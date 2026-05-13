"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import { voteStoryPollAction } from "@/app/app/_actions/story-poll";
import { useCouponAction } from "@/app/app/estabelecimento/[slug]/actions";

export interface PollOption {
  id: string;
  label: string;
}

export interface Story {
  id: string;
  media_url: string;
  caption: string | null;
  created_at: string;
  coupon_id?: string | null;
  coupon_code?: string | null;
  coupon_discount_label?: string | null;
  poll_question?: string | null;
  poll_options?: PollOption[] | null;
  poll_user_vote?: string | null;
  poll_tally?: Record<string, number>;
}

interface Props {
  establishmentName: string;
  logoUrl: string | null;
  stories: Story[];
  onClose: () => void;
}

const DURATION_MS = 5000;

export function StoriesViewer({ establishmentName, logoUrl, stories, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-pause se story tem sticker/poll (não dá pra clicar correndo)
  const story = stories[index];
  const hasInteraction = !!(story?.coupon_id || story?.poll_question);

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const start = Date.now();
    let raf = 0;
    const totalMs = hasInteraction ? DURATION_MS * 2 : DURATION_MS;

    function tick() {
      const elapsed = Date.now() - start;
      const pct = Math.min(1, elapsed / totalMs);
      setProgress(pct);
      if (pct >= 1) {
        if (index < stories.length - 1) setIndex((i) => i + 1);
        else onClose();
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, paused, stories.length, onClose, hasInteraction]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function goNext() {
    if (index < stories.length - 1) setIndex(index + 1);
    else onClose();
  }
  function goPrev() {
    if (index > 0) setIndex(index - 1);
  }

  if (!story) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full max-h-[800px] w-full max-w-md overflow-hidden rounded-3xl bg-black"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
        >
          {/* Progress bars */}
          <div className="absolute inset-x-0 top-0 z-10 flex gap-1 px-3 pt-3">
            {stories.map((_, i) => (
              <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full bg-brava-card transition-all"
                  style={{
                    width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pb-2 pt-6">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-brava-card">
                {logoUrl && <Image src={logoUrl} alt="" fill sizes="32px" className="object-cover" />}
              </div>
              <span className="text-sm font-bold text-white">{establishmentName}</span>
              <span className="text-xs text-white/55">{timeAgo(story.created_at)}</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Fechar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Media */}
          <div className="relative h-full w-full">
            <Image
              key={story.id}
              src={story.media_url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
              priority
            />
            {/* Tap zones (não cobrem área de interação inferior quando há sticker) */}
            <button type="button" onClick={goPrev} className="absolute inset-y-0 left-0 top-0 h-2/3 w-1/3 cursor-default opacity-0" aria-label="Anterior" />
            <button type="button" onClick={goNext} className="absolute inset-y-0 right-0 top-0 h-2/3 w-1/3 cursor-default opacity-0" aria-label="Próximo" />
          </div>

          {/* Caption */}
          {story.caption && !hasInteraction && (
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 to-transparent px-6 pb-8 pt-12">
              <p className="text-base font-medium text-white">{story.caption}</p>
            </div>
          )}

          {/* Sticker: cupom resgatar */}
          {story.coupon_id && story.coupon_code && (
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 to-transparent px-5 pb-6 pt-16">
              {story.caption && <p className="mb-3 text-sm font-medium text-white/85">{story.caption}</p>}
              <CouponSticker couponId={story.coupon_id} couponCode={story.coupon_code} discountLabel={story.coupon_discount_label ?? null} />
            </div>
          )}

          {/* Sticker: enquete */}
          {story.poll_question && story.poll_options && story.poll_options.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 to-transparent px-5 pb-6 pt-16">
              {story.caption && <p className="mb-3 text-sm font-medium text-white/85">{story.caption}</p>}
              <PollSticker
                storyId={story.id}
                question={story.poll_question}
                options={story.poll_options}
                userVote={story.poll_user_vote ?? null}
                tally={story.poll_tally ?? {}}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CouponSticker({ couponId, couponCode, discountLabel }: { couponId: string; couponCode: string; discountLabel: string | null }) {
  const [pending, startTransition] = useTransition();
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fire() {
    if (redeemed || pending) return;
    setError(null);
    startTransition(async () => {
      const r = await useCouponAction(couponId);
      if (r.ok) setRedeemed(true);
      else setError(r.error);
    });
  }

  return (
    <button
      type="button"
      onClick={fire}
      disabled={pending || redeemed}
      className="group flex w-full items-center gap-3 rounded-3xl bg-gradient-to-br from-brava-yellow to-amber-500 p-4 text-brava-black shadow-2xl shadow-brava-yellow/30 transition hover:scale-[1.01] disabled:opacity-80"
    >
      <span className="text-3xl">🎁</span>
      <div className="flex-1 text-left">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brava-blue">
          {redeemed ? "Cupom seu!" : "Resgatar cupom"}
        </p>
        <p className="text-base font-black">
          {discountLabel ? `${discountLabel} · ${couponCode}` : couponCode}
        </p>
        {error && <p className="mt-0.5 text-[10px] text-rose-700">{error}</p>}
      </div>
      <span className="text-2xl">{redeemed ? "✓" : pending ? "..." : "→"}</span>
    </button>
  );
}

function PollSticker({
  storyId,
  question,
  options,
  userVote,
  tally,
}: {
  storyId: string;
  question: string;
  options: PollOption[];
  userVote: string | null;
  tally: Record<string, number>;
}) {
  const [voted, setVoted] = useState<string | null>(userVote);
  const [pending, startTransition] = useTransition();
  const [localTally, setLocalTally] = useState<Record<string, number>>(tally);

  function vote(optId: string) {
    if (voted || pending) return;
    setVoted(optId); // optimistic
    setLocalTally((t) => ({ ...t, [optId]: (t[optId] ?? 0) + 1 }));
    const fd = new FormData();
    fd.append("story_id", storyId);
    fd.append("option_id", optId);
    startTransition(async () => {
      await voteStoryPollAction(fd);
    });
  }

  const total = Object.values(localTally).reduce((s, n) => s + n, 0) || 1;

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur p-4">
      <p className="text-sm font-black text-white">{question}</p>
      <div className="mt-3 grid gap-2">
        {options.map((opt) => {
          const count = localTally[opt.id] ?? 0;
          const pct = voted ? Math.round((count / total) * 100) : 0;
          const isMine = voted === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => vote(opt.id)}
              disabled={!!voted}
              className={`relative w-full overflow-hidden rounded-2xl border-2 px-3 py-2.5 text-left text-sm font-bold text-white transition ${
                isMine ? "border-brava-yellow bg-brava-yellow/20" : "border-white/15 bg-white/5 hover:bg-white/10"
              } disabled:cursor-default`}
            >
              {voted && (
                <span
                  className={`absolute inset-y-0 left-0 ${isMine ? "bg-brava-yellow/30" : "bg-white/10"}`}
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex justify-between">
                <span>{opt.label}</span>
                {voted && <span className="text-white/65">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
      {voted && <p className="mt-2 text-center text-[10px] text-white/55">Obrigado pelo voto · {total} respostas</p>}
    </div>
  );
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}min`;
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
