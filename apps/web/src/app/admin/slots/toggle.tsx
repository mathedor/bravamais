"use client";

import { useTransition } from "react";
import { toggleSlotPaidAction } from "./actions";

export function TogglePaid({ slotId, paid }: { slotId: string; paid: boolean }) {
  const [pending, startTransition] = useTransition();
  function fire() {
    const fd = new FormData();
    fd.append("slot_id", slotId);
    fd.append("paid", String(paid));
    startTransition(async () => {
      await toggleSlotPaidAction(fd);
    });
  }
  return (
    <button
      type="button"
      onClick={fire}
      disabled={pending}
      className="rounded-full border border-brava-border bg-brava-paper px-3 py-1 text-[11px] font-bold hover:bg-brava-card disabled:opacity-60"
    >
      {pending ? "..." : paid ? "Marcar como pendente" : "Marcar como pago"}
    </button>
  );
}
