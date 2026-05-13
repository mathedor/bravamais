"use client";

import Link from "next/link";
import { useEffect } from "react";

export function ErrorDisplay({
  error,
  reset,
  variant = "default",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: "default" | "app" | "loja" | "admin";
}) {
  useEffect(() => {
    console.error("[boundary]", error);
  }, [error]);

  const home = {
    app: { href: "/app", label: "Voltar pro app" },
    loja: { href: "/loja", label: "Voltar pra loja" },
    admin: { href: "/admin", label: "Voltar pro admin" },
    default: { href: "/", label: "Voltar pra home" },
  }[variant];

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-6xl">😬</p>
      <h1 className="mt-4 text-2xl font-black text-brava-ink">Algo deu errado aqui</h1>
      <p className="mt-2 text-sm text-brava-muted">
        A gente foi avisado e tá olhando. Tente recarregar ou volte e tente de novo.
      </p>
      {error.digest && (
        <p className="mt-1 font-mono text-[10px] text-brava-muted">id: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brava-yellow px-5 py-2.5 text-xs font-black text-brava-black"
        >
          🔄 Tentar de novo
        </button>
        <Link href={home.href} className="rounded-full border border-brava-border bg-brava-card px-5 py-2.5 text-xs font-bold text-brava-ink">
          {home.label}
        </Link>
      </div>
    </div>
  );
}
