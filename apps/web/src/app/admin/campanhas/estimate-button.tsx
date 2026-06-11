"use client";

import { useRef, useState, useTransition } from "react";
import { estimateAudienceAction } from "./actions";

export function EstimateAudienceButton() {
  const [pending, start] = useTransition();
  const [count, setCount] = useState<number | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  function go() {
    const form = ref.current?.closest("form");
    if (!form) return;
    const fd = new FormData(form as HTMLFormElement);
    start(async () => {
      const res = await estimateAudienceAction(fd);
      setCount(res.count);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
      <button
        ref={ref}
        type="button"
        onClick={go}
        disabled={pending}
        className="rounded-full border border-brava-border bg-brava-paper px-4 py-2 text-sm font-bold text-brava-ink disabled:opacity-60"
      >
        {pending ? "Calculando..." : "📊 Estimar audiência"}
      </button>
      {count !== null && (
        <span className="text-sm font-bold text-brava-blue">≈ {count} pessoa(s) neste segmento</span>
      )}
    </div>
  );
}
