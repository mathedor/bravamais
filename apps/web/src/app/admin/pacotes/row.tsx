"use client";

import Link from "next/link";
import { useTransition } from "react";
import { togglePackageActiveAction, deletePackageAction } from "./actions";

interface Pkg {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  theme_emoji: string | null;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

export function PackageRow({ pkg }: { pkg: Pkg }) {
  const [pending, startTransition] = useTransition();
  function toggle() {
    const fd = new FormData(); fd.append("id", pkg.id); fd.append("active", String(pkg.is_active));
    startTransition(async () => { await togglePackageActiveAction(fd); });
  }
  function remove() {
    if (!confirm(`Apagar pacote "${pkg.title}"?`)) return;
    const fd = new FormData(); fd.append("id", pkg.id);
    startTransition(async () => { await deletePackageAction(fd); });
  }
  const isPast = new Date(pkg.ends_at) < new Date();
  return (
    <article className={`flex items-center justify-between gap-2 rounded-2xl border p-3 ${pkg.is_active && !isPast ? "border-brava-border bg-brava-card" : "border-brava-border bg-brava-paper opacity-70"}`}>
      <div>
        <p className="font-bold text-brava-ink">{pkg.theme_emoji} {pkg.title}{isPast && <span className="ml-2 rounded-full bg-brava-paper px-2 py-0.5 text-[10px] uppercase">expirado</span>}</p>
        {pkg.subtitle && <p className="text-[11px] text-brava-muted">{pkg.subtitle}</p>}
        <p className="text-[10px] text-brava-muted">{new Date(pkg.starts_at).toLocaleDateString("pt-BR")} → {new Date(pkg.ends_at).toLocaleDateString("pt-BR")}</p>
      </div>
      <div className="flex gap-2">
        <Link href={`/admin/pacotes/${pkg.id}`} className="rounded-full bg-brava-blue px-3 py-1 text-[11px] font-bold text-white">Editar cupons</Link>
        <button type="button" onClick={toggle} disabled={pending} className="rounded-full border border-brava-border bg-brava-paper px-3 py-1 text-[11px] font-bold disabled:opacity-60">
          {pending ? "..." : pkg.is_active ? "Pausar" : "Ativar"}
        </button>
        <button type="button" onClick={remove} disabled={pending} className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700 disabled:opacity-60">✕</button>
      </div>
    </article>
  );
}
