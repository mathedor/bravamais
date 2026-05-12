"use client";

import { useTransition } from "react";
import { adminGiftSubscriptionAction } from "../actions";

export function GiftSubscriptionForm({ userId }: { userId: string }) {
  const [pending, start] = useTransition();

  return (
    <form
      action={(fd) => start(() => adminGiftSubscriptionAction(fd) as unknown as void)}
      className="grid gap-3 sm:grid-cols-[1fr_140px_140px_140px]"
    >
      <input type="hidden" name="user_id" value={userId} />
      <div className="self-end text-xs text-brava-muted">
        Adiciona X dias de assinatura gratuita à conta. Útil pra recuperação, cortesias ou influencer.
      </div>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-brava-muted">Tier</span>
        <select name="tier" defaultValue="premium" className={input}>
          <option value="basico">Básico</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-brava-muted">Dias grátis</span>
        <input name="days" type="number" min="1" max="365" defaultValue="30" className={input} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-brava-yellow px-4 py-2 text-xs font-bold text-brava-black disabled:opacity-60"
      >
        {pending ? "Aplicando…" : "🎁 Brindar"}
      </button>
    </form>
  );
}

const input = "w-full rounded-xl border border-brava-border bg-brava-card px-3 py-2 text-sm outline-none focus:border-brava-yellow";
