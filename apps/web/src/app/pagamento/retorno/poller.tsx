"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ReturnPoller({ paymentId, next }: { paymentId: string; next: string }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "paid" | "failed">("checking");

  useEffect(() => {
    let active = true;
    let tries = 0;
    const tick = async () => {
      if (!active) return;
      tries++;
      try {
        const r = await fetch(`/api/payments/${paymentId}/status?_=${Date.now()}`, { cache: "no-store" });
        const j = (await r.json()) as { status: string; paid: boolean };
        if (!active) return;
        if (j.paid) {
          setState("paid");
          setTimeout(() => router.push(next), 1000);
          return;
        }
        if (j.status === "failed" || j.status === "expired") {
          setState("failed");
          return;
        }
      } catch {
        /* tenta de novo */
      }
      if (tries > 40) {
        setState("failed");
        return;
      }
      if (active) setTimeout(tick, 2000);
    };
    tick();
    return () => {
      active = false;
    };
  }, [paymentId, next, router]);

  if (state === "paid") {
    return (
      <div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-3xl text-white">
          ✓
        </div>
        <h1 className="text-2xl font-black text-brava-ink">Pagamento confirmado!</h1>
        <p className="mt-2 text-sm text-brava-muted">Redirecionando…</p>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div>
        <h1 className="text-2xl font-black text-brava-ink">Não conseguimos confirmar</h1>
        <p className="mt-2 text-sm text-brava-muted">
          Se o valor foi debitado, a confirmação chega em instantes. Você pode verificar no seu histórico.
        </p>
        <button
          onClick={() => router.push(next)}
          className="mt-5 rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brava-yellow border-t-transparent" />
      <h1 className="text-xl font-black text-brava-ink">Confirmando seu pagamento…</h1>
      <p className="mt-2 text-sm text-brava-muted">Só um instante.</p>
    </div>
  );
}
