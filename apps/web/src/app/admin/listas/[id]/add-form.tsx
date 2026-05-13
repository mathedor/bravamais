"use client";

import { useTransition } from "react";
import { addToListAction } from "../actions";

export function AddItemForm({ listId, estabs }: { listId: string; estabs: { id: string; name: string }[] }) {
  const [pending, startTransition] = useTransition();

  function fire(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("list_id", listId);
    startTransition(async () => { await addToListAction(fd); (e.target as HTMLFormElement).reset(); });
  }

  return (
    <form onSubmit={fire} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <select name="estab_id" required className="rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm">
          <option value="">Escolher parceiro…</option>
          {estabs.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <input name="position" type="number" defaultValue={100} className="w-24 rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
        <button type="submit" disabled={pending} className="rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
          {pending ? "..." : "+ Adicionar"}
        </button>
      </div>
    </form>
  );
}
