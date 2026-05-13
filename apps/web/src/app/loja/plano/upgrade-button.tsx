"use client";

import { useState, useTransition } from "react";
import { upgradePlanAction } from "./actions";

export function UpgradeButton({ tier, priceCents }: { tier: string; priceCents: number }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function fire() {
    setMsg(null);
    const fd = new FormData();
    fd.append("tier", tier);
    startTransition(async () => {
      const r = await upgradePlanAction(fd);
      setMsg(r.message);
    });
  }

  const isFree = priceCents === 0;

  return (
    <>
      <button
        type="button"
        onClick={fire}
        disabled={pending}
        className={`block w-full rounded-full px-4 py-2.5 text-center text-xs font-bold transition disabled:opacity-60 ${
          isFree
            ? "border border-brava-border bg-brava-card text-brava-ink hover:bg-brava-paper"
            : "bg-brava-yellow text-brava-black hover:scale-[1.02]"
        }`}
      >
        {pending ? "..." : isFree ? "Fazer downgrade" : "💳 Assinar este plano"}
      </button>
      {msg && <p className="mt-2 text-center text-[11px] text-amber-700">{msg}</p>}
    </>
  );
}
