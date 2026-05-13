"use client";

import { useTransition } from "react";
import { toggleCategoryAction, deleteCategoryAction } from "./actions";

interface Cat {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

export function CategoryRow({ cat }: { cat: Cat }) {
  const [pending, startTransition] = useTransition();
  function toggle() {
    const fd = new FormData(); fd.append("id", cat.id); fd.append("active", String(cat.is_active));
    startTransition(async () => { await toggleCategoryAction(fd); });
  }
  function remove() {
    if (!confirm(`Apagar categoria "${cat.name}"?`)) return;
    const fd = new FormData(); fd.append("id", cat.id);
    startTransition(async () => { await deleteCategoryAction(fd); });
  }
  return (
    <article className={`flex items-center justify-between gap-2 rounded-2xl border p-3 ${cat.is_active ? "border-brava-border bg-brava-card" : "border-brava-border bg-brava-paper opacity-60"}`}>
      <div>
        <p className="font-bold text-brava-ink">{cat.name}</p>
        <p className="text-[11px] text-brava-muted">slug: <code className="font-mono">{cat.slug}</code> · ícone: {cat.icon ?? "—"} · ordem {cat.display_order}</p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={toggle} disabled={pending} className="rounded-full border border-brava-border bg-brava-paper px-3 py-1 text-[11px] font-bold disabled:opacity-60">
          {pending ? "..." : cat.is_active ? "Desativar" : "Ativar"}
        </button>
        <button type="button" onClick={remove} disabled={pending} className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700 disabled:opacity-60">
          ✕
        </button>
      </div>
    </article>
  );
}
