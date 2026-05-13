"use client";

import { useTransition } from "react";
import { addCouponToPackageAction } from "../actions";

export function AddCouponForm({ packageId, coupons }: { packageId: string; coupons: { id: string; code: string; discount_percent: number | null; discount_cents: number | null; establishments: { name: string } | null }[] }) {
  const [pending, startTransition] = useTransition();
  function fire(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("package_id", packageId);
    startTransition(async () => { await addCouponToPackageAction(fd); (e.target as HTMLFormElement).reset(); });
  }
  return (
    <form onSubmit={fire} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <select name="coupon_id" required className="rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm">
          <option value="">Escolher cupom ativo…</option>
          {coupons.map((c) => {
            const desc = c.discount_percent ? `-${c.discount_percent}%` : c.discount_cents ? `R$ ${(c.discount_cents / 100).toFixed(2)}` : "";
            return <option key={c.id} value={c.id}>{c.code} · {desc} · {c.establishments?.name ?? ""}</option>;
          })}
        </select>
        <label className="inline-flex items-center gap-1 text-xs">
          <input type="checkbox" name="highlight" className="h-4 w-4 accent-brava-yellow" />
          ⭐ Destaque
        </label>
        <button type="submit" disabled={pending} className="rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
          {pending ? "..." : "+ Adicionar"}
        </button>
      </div>
    </form>
  );
}
