"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export interface Story {
  id: string;
  media_url: string;
  caption: string | null;
  created_at: string;
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

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const start = Date.now();
    let raf = 0;

    function tick() {
      const elapsed = Date.now() - start;
      const pct = Math.min(1, elapsed / DURATION_MS);
      setProgress(pct);
      if (pct >= 1) {
        if (index < stories.length - 1) {
          setIndex((i) => i + 1);
        } else {
          onClose();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, paused, stories.length, onClose]);

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

  const story = stories[index];
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
                  className="h-full bg-white transition-all"
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
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white">
                {logoUrl && <Image src={logoUrl} alt="" fill sizes="32px" className="object-cover" />}
              </div>
              <span className="text-sm font-bold text-white">{establishmentName}</span>
              <span className="text-xs text-white/55">
                {timeAgo(story.created_at)}
              </span>
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
            {/* Tap zones */}
            <button
              type="button"
              onClick={goPrev}
              className="absolute inset-y-0 left-0 w-1/3 cursor-default opacity-0"
              aria-label="Anterior"
            />
            <button
              type="button"
              onClick={goNext}
              className="absolute inset-y-0 right-0 w-1/3 cursor-default opacity-0"
              aria-label="Próximo"
            />
          </div>

          {/* Caption */}
          {story.caption && (
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 to-transparent px-6 pb-8 pt-12">
              <p className="text-base font-medium text-white">{story.caption}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}min`;
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
