"use client";

import Link from "next/link";
import { useTransition } from "react";
import { togglePublishedAction, deleteListAction } from "./actions";

interface List {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  is_published: boolean;
}

export function ListRow({ list }: { list: List }) {
  const [pending, startTransition] = useTransition();
  function togglePub() {
    const fd = new FormData(); fd.append("id", list.id); fd.append("published", String(list.is_published));
    startTransition(async () => { await togglePublishedAction(fd); });
  }
  function remove() {
    if (!confirm(`Apagar lista "${list.title}"?`)) return;
    const fd = new FormData(); fd.append("id", list.id);
    startTransition(async () => { await deleteListAction(fd); });
  }
  return (
    <article className="rounded-2xl border border-brava-border bg-brava-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-brava-ink">{list.title}</p>
          <p className="text-[11px] text-brava-muted">slug: <code>{list.slug}</code></p>
          {list.description && <p className="mt-1 text-xs">{list.description}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <Link href={`/admin/listas/${list.id}`} className="rounded-full bg-brava-blue px-3 py-1 text-[11px] font-bold text-white">
            Editar itens
          </Link>
          <button type="button" onClick={togglePub} disabled={pending} className="rounded-full border border-brava-border bg-brava-paper px-3 py-1 text-[11px] font-bold disabled:opacity-60">
            {pending ? "..." : list.is_published ? "Despublicar" : "Publicar"}
          </button>
          <button type="button" onClick={remove} disabled={pending} className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700 disabled:opacity-60">
            ✕
          </button>
        </div>
      </div>
    </article>
  );
}
