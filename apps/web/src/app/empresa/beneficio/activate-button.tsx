"use client";

import { useState, useTransition } from "react";
import { acceptB2BInviteAction } from "./actions";

type State = { error?: string; ok?: string } | undefined;

export function ActivateButton() {
  const [state, setState] = useState<State>(undefined);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={pending || !!state?.ok}
        onClick={() => startTransition(async () => setState(await acceptB2BInviteAction()))}
        className="w-full rounded-full bg-brava-black px-6 py-4 text-base font-black text-brava-yellow disabled:opacity-60"
      >
        {pending ? "Ativando…" : state?.ok ? "✅ Ativado!" : "🎁 Ativar meu benefício"}
      </button>
      {state?.error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
      {state?.ok && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.ok}</p>}
    </div>
  );
}
