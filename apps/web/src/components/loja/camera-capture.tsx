"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Recebe a URL pública depois do upload */
  onCaptured: (url: string) => void;
}

export function CameraCapture({ open, onClose, onCaptured }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!open) return;
    if (preview) return; // já tem preview, não pede câmera
    let mounted = true;
    setError(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((s) => {
        if (!mounted) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {
        setError("Sem permissão. Tente subir uma foto da galeria.");
      });
    return () => {
      mounted = false;
    };
  }, [open, preview]);

  // Cleanup stream ao fechar
  useEffect(() => {
    if (!open && stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [open, stream]);

  function reset() {
    setPreview(null);
    setBlob(null);
    setError(null);
  }

  function capture() {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    canvas.toBlob(
      (b) => {
        if (b) {
          setBlob(b);
          setPreview(URL.createObjectURL(b));
          stream?.getTracks().forEach((t) => t.stop());
          setStream(null);
        }
      },
      "image/jpeg",
      0.85,
    );
  }

  function pickFromGallery() {
    fileRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBlob(f);
    setPreview(URL.createObjectURL(f));
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  async function uploadCaptured() {
    if (!blob) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", blob, "story.jpg");
      fd.set("bucket", "stories");
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (r.ok && j.url) {
        onCaptured(j.url);
        reset();
        onClose();
      } else {
        setError(j.error ?? "Falha no upload");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2"
        >
          <motion.div
            initial={{ y: 80, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 80, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative h-full max-h-[800px] w-full max-w-md overflow-hidden rounded-3xl bg-black"
          >
            <button
              onClick={() => {
                reset();
                onClose();
              }}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Fechar"
            >
              ✕
            </button>

            {preview ? (
              <div className="relative h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black to-transparent p-5">
                  <button
                    onClick={uploadCaptured}
                    disabled={uploading}
                    className="w-full rounded-full bg-brava-yellow py-3 text-sm font-bold text-brava-black disabled:opacity-60"
                  >
                    {uploading ? "Publicando…" : "🚀 Publicar agora"}
                  </button>
                  <button
                    onClick={reset}
                    className="w-full rounded-full border border-white/15 bg-white/10 py-2.5 text-xs font-medium text-white"
                  >
                    Refazer
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative h-full">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-white">
                    <div>
                      <p className="text-base font-bold">{error}</p>
                      <button
                        onClick={pickFromGallery}
                        className="mt-4 rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black"
                      >
                        Escolher da galeria
                      </button>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 bg-gradient-to-t from-black to-transparent p-6">
                  <button
                    onClick={pickFromGallery}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white backdrop-blur"
                    aria-label="Galeria"
                  >
                    🖼️
                  </button>
                  <button
                    onClick={capture}
                    disabled={!stream}
                    className="h-20 w-20 rounded-full border-4 border-white bg-white/20 transition active:scale-90 disabled:opacity-40"
                    aria-label="Bater foto"
                  >
                    <span className="block h-full w-full rounded-full bg-white"></span>
                  </button>
                  <div className="w-12" />
                </div>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
