"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelRenewalAction } from "./actions";

export function CancelRenewalButton({ alreadyCanceled }: { alreadyCanceled: boolean }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(alreadyCanceled);
  const router = useRouter();

  if (done) {
    return (
      <span className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-white/60">
        Renovação automática cancelada
      </span>
    );
  }

  function go() {
    if (!confirm("Cancelar a renovação automática? Você mantém o acesso até o fim do período já pago.")) return;
    start(async () => {
      await cancelRenewalAction();
      setDone(true);
      router.refresh();
    });
  }

  return (
    <button
      onClick={go}
      disabled={pending}
      className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-white backdrop-blur hover:bg-white/10 disabled:opacity-60"
    >
      {pending ? "Cancelando..." : "Cancelar renovação"}
    </button>
  );
}
