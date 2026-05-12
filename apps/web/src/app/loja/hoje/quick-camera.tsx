"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/loja/camera-capture";
import { createStoryFromUrlAction } from "./actions";

interface Props {
  caption?: string;
}

export function QuickCameraStory({ caption }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleCaptured(url: string) {
    const fd = new FormData();
    fd.set("media_url", url);
    if (caption) fd.set("caption", caption);
    fd.set("ttl_hours", "24");
    await createStoryFromUrlAction(fd);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-between gap-3 rounded-3xl bg-gradient-to-br from-brava-yellow via-amber-400 to-brava-yellow-deep p-5 text-brava-black shadow-xl shadow-brava-yellow/30 transition hover:-translate-y-1"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brava-black text-2xl text-brava-yellow">
            📷
          </span>
          <span className="text-left">
            <span className="block text-base font-black">📸 Bater foto agora</span>
            <span className="block text-xs text-brava-black/70">
              Abre a câmera e publica direto em &quot;Ao vivo hoje&quot;
            </span>
          </span>
        </span>
        <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
      </button>

      <CameraCapture open={open} onClose={() => setOpen(false)} onCaptured={handleCaptured} />
    </>
  );
}
