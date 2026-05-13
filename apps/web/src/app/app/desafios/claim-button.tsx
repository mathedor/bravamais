"use client";

import { useState, useTransition } from "react";
import { claimChallengeAction } from "./actions";

export function ClaimButton({ challengeId, reward }: { challengeId: string; reward: number }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function fire() {
    setMsg(null);
    startTransition(async () => {
      const r = await claimChallengeAction(challengeId);
      setMsg(r.message);
      if (r.ok) setTimeout(() => window.location.reload(), 1000);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={fire}
        disabled={pending}
        className="w-full rounded-full bg-gradient-to-br from-brava-yellow to-amber-500 px-5 py-3 text-sm font-black text-brava-black shadow-lg disabled:opacity-60"
      >
        {pending ? "Resgatando..." : `🪙 Resgatar ${reward} coins`}
      </button>
      {msg && <p className="mt-2 text-center text-xs">{msg}</p>}
    </>
  );
}
