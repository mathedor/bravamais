"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  paymentId: string;
  pixCode: string;
  qrBase64: string;
  expiresAt: string;
  successUrl: string;
}

export function PixPanel({ paymentId, pixCode, qrBase64, expiresAt, successUrl }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const [secsLeft, setSecsLeft] = useState<number>(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
  );
  const stopped = useRef(false);

  // countdown
  useEffect(() => {
    const t = setInterval(() => {
      setSecsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // polling de status
  useEffect(() => {
    let active = true;
    const tick = async () => {
      if (stopped.current) return;
      try {
        const r = await fetch(`/api/payments/${paymentId}/status?_=${Date.now()}`, {
          cache: "no-store",
        });
        const j = (await r.json()) as { status: string; paid: boolean };
        if (!active) return;
        if (j.paid) {
          stopped.current = true;
          setPaid(true);
          setTimeout(() => router.push(successUrl), 1200);
          return;
        }
        if (j.status === "expired" || j.status === "failed") {
          stopped.current = true;
          return;
        }
      } catch {
        /* ignora, tenta de novo */
      }
      if (active && !stopped.current) setTimeout(tick, 3000);
    };
    const id = setTimeout(tick, 3000);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [paymentId, successUrl, router]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  const mm = String(Math.floor(secsLeft / 60)).padStart(2, "0");
  const ss = String(secsLeft % 60).padStart(2, "0");

  if (paid) {
    return (
      <div className="rounded-2xl border border-green-300 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/40">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl text-white">
          ✓
        </div>
        <p className="text-lg font-black text-green-800 dark:text-green-300">Pagamento recebido!</p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-400">Redirecionando…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brava-border bg-brava-paper p-6 text-center">
      {qrBase64 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`data:image/png;base64,${qrBase64}`}
          alt="QR Code PIX"
          width={224}
          height={224}
          className="mx-auto h-56 w-56 rounded-2xl bg-white p-3"
        />
      ) : (
        <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-2xl bg-white text-xs text-brava-muted">
          QR indisponível — use o copia e cola
        </div>
      )}

      <p className="mt-4 text-sm font-semibold text-brava-ink">Escaneie no app do seu banco</p>
      <p className="mt-1 text-xs text-brava-muted">
        {secsLeft > 0 ? (
          <>
            Expira em <span className="font-mono font-bold">{mm}:{ss}</span> · aguardando pagamento…
          </>
        ) : (
          <>QR expirado. Gere um novo.</>
        )}
      </p>

      <button
        type="button"
        onClick={copy}
        className="mt-4 w-full rounded-full bg-brava-black px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
      >
        {copied ? "Copiado!" : "Copiar código PIX"}
      </button>

      <details className="mt-3 text-left">
        <summary className="cursor-pointer text-center text-xs text-brava-muted">ver copia e cola</summary>
        <textarea
          readOnly
          value={pixCode}
          rows={3}
          className="mt-2 w-full break-all rounded-xl border border-brava-border bg-white px-3 py-2 font-mono text-[11px]"
        />
      </details>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brava-muted">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brava-yellow" />
        Confirma sozinho assim que o PIX cair
      </div>
    </div>
  );
}
