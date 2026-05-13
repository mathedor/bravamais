"use client";

import { useTransition } from "react";
import { toggleAmbassadorAction } from "./actions";

export function AmbassadorToggle({
  userId,
  estabId,
  isAmbassador,
}: {
  userId: string;
  estabId: string;
  isAmbassador: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    const fd = new FormData();
    fd.append("user_id", userId);
    fd.append("estab_id", estabId);
    fd.append("currently_is", String(isAmbassador));
    startTransition(async () => {
      await toggleAmbassadorAction(fd);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`rounded-full px-4 py-2 text-xs font-bold transition ${
        isAmbassador
          ? "bg-brava-yellow text-brava-black hover:bg-amber-300"
          : "border border-brava-border bg-brava-card text-brava-ink hover:bg-brava-paper"
      } disabled:opacity-60`}
    >
      {pending ? "..." : isAmbassador ? "⭐ Remover embaixador" : "⭐ Marcar como embaixador"}
    </button>
  );
}
