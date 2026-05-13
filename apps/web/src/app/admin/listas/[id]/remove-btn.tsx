"use client";

import { useTransition } from "react";
import { removeFromListAction } from "../actions";

export function RemoveBtn({ listId, estabId }: { listId: string; estabId: string }) {
  const [pending, startTransition] = useTransition();
  function fire() {
    const fd = new FormData(); fd.append("list_id", listId); fd.append("estab_id", estabId);
    startTransition(async () => { await removeFromListAction(fd); });
  }
  return (
    <button type="button" onClick={fire} disabled={pending} className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700 disabled:opacity-60">
      {pending ? "..." : "Remover"}
    </button>
  );
}
