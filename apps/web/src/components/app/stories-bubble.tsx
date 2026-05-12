"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { StoriesViewer, type Story } from "./stories-viewer";

interface Props {
  establishmentName: string;
  logoUrl: string | null;
  stories: Story[];
}

export function StoriesBubble({ establishmentName, logoUrl, stories }: Props) {
  const [open, setOpen] = useState(false);
  if (stories.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex flex-col items-center gap-2"
      >
        <div className="relative h-20 w-20">
          {/* Animated gradient ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #FBBF24, #1E3A8A, #FBBF24, #2563EB, #FBBF24)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-[3px] overflow-hidden rounded-full bg-brava-card">
            {logoUrl ? (
              <Image src={logoUrl} alt="" fill sizes="76px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brava-paper text-2xl font-black text-brava-blue">
                +
              </div>
            )}
          </div>
        </div>
        <span className="max-w-[88px] truncate text-xs font-medium text-brava-ink">Hoje</span>
      </button>

      {open && (
        <StoriesViewer
          establishmentName={establishmentName}
          logoUrl={logoUrl}
          stories={stories}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
