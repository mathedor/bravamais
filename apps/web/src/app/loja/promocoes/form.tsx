"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { blastPromoAction } from "./actions";

export function PromoForm() {
  const [state, action] = useActionState(blastPromoAction, undefined);
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (fd) => {
        await action(fd);
        if (state?.ok) ref.current?.reset();
      }}
      className="space-y-3"
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Título da promoção</span>
        <input
          name="title"
          required
          maxLength={100}
          placeholder="Ex: 30% off só hoje em todo o cardápio"
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Detalhes (opcional)</span>
        <textarea
          name="body"
          rows={3}
          placeholder="Detalhes da promoção..."
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
        />
      </label>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}

      <Submit />

      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
        ⚠️ Promo será disparada pra TODOS os assinantes BRAVA+ ativos como notificação. Use com cuidado pra não saturar.
      </p>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black disabled:opacity-60"
    >
      {pending ? "Enviando..." : "📣 Disparar pra todos os assinantes"}
    </button>
  );
}
