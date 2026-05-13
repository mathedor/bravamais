"use client";

import { useState, useTransition } from "react";
import { toggleProductAlertAction } from "@/app/app/_actions/product-alert";

export function ProductAlertButton({ productId, initialOn, outOfStock }: { productId: string; initialOn: boolean; outOfStock: boolean }) {
  const [on, setOn] = useState(initialOn);
  const [pending, startTransition] = useTransition();

  function fire(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await toggleProductAlertAction(productId);
      if (r.ok) setOn(r.isOn);
    });
  }

  if (!outOfStock && !on) return null;

  return (
    <button
      type="button"
      onClick={fire}
      disabled={pending}
      className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition disabled:opacity-60 ${
        on ? "bg-emerald-100 text-emerald-700" : "border border-brava-border bg-brava-paper text-brava-ink hover:bg-brava-card"
      }`}
    >
      {pending ? "..." : on ? "🔔 ✓ Avisaremos" : "🔔 Avise quando voltar"}
    </button>
  );
}
