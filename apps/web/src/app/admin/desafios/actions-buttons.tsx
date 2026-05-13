"use client";

import { useTransition } from "react";
import { toggleChallengeActiveAction, deleteChallengeAction } from "./actions";

export function ToggleActive({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  function fire() {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("active", String(active));
    startTransition(async () => { await toggleChallengeActiveAction(fd); });
  }
  return (
    <button type="button" onClick={fire} disabled={pending} className="rounded-full border border-brava-border bg-brava-paper px-3 py-1 text-[11px] font-bold disabled:opacity-60">
      {pending ? "..." : active ? "Pausar" : "Ativar"}
    </button>
  );
}

export function DeleteBtn({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  function fire() {
    if (!confirm("Apagar esse desafio?")) return;
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => { await deleteChallengeAction(fd); });
  }
  return (
    <button type="button" onClick={fire} disabled={pending} className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700 disabled:opacity-60">
      {pending ? "..." : "✕"}
    </button>
  );
}
