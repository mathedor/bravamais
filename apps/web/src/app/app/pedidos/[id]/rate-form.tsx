"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { rateDelivererAction } from "./actions";

export function RateDelivererForm({ deliveryId }: { deliveryId: string }) {
  const [state, action] = useActionState(rateDelivererAction, undefined);
  const [stars, setStars] = useState(5);

  if (state?.ok) {
    return (
      <p className="rounded-2xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
        ✅ Obrigado pelo feedback!
      </p>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-brava-border bg-brava-card p-5">
      <input type="hidden" name="delivery_id" value={deliveryId} />
      <input type="hidden" name="stars" value={stars} />
      <p className="text-sm font-bold text-brava-ink">Como foi a entrega?</p>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStars(i)}
            className={`text-3xl transition ${i <= stars ? "" : "opacity-30"}`}
          >
            ⭐
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={2}
        placeholder="Comentário (opcional)"
        className="mt-3 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
      />
      {state?.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 w-full rounded-full bg-brava-blue px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
    >
      {pending ? "Enviando..." : "Enviar avaliação"}
    </button>
  );
}
