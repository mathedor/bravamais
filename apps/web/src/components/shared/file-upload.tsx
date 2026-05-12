"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  bucket: "stories" | "catalog" | "establishments" | "receipts";
  prefix?: string;
  /** name do input hidden onde a URL é colocada pra submit via form */
  name: string;
  /** valor inicial do hidden (caso edição) */
  defaultUrl?: string;
  label?: string;
  accept?: string;
  className?: string;
  /** Callback opcional ao concluir upload */
  onUploaded?: (url: string) => void;
}

export function FileUpload({
  bucket,
  prefix,
  name,
  defaultUrl,
  label = "Enviar foto",
  accept = "image/*",
  className,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("bucket", bucket);
      if (prefix) fd.set("prefix", prefix);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok || j.error) {
        setError(j.error ?? "Falha no upload");
        return;
      }
      setUrl(j.url);
      onUploaded?.(j.url);
    } catch {
      setError("Erro ao subir o arquivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {url ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-brava-border bg-brava-paper">
          <Image src={url} alt="" fill sizes="128px" className="object-cover" />
          <button
            type="button"
            onClick={() => {
              setUrl("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
            aria-label="Remover"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brava-border bg-brava-paper text-xs font-medium text-brava-muted transition hover:border-brava-yellow hover:bg-brava-yellow/10 disabled:opacity-60"
        >
          {loading ? "Subindo…" : (
            <>
              <span className="text-2xl">📷</span>
              <span>{label}</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
