"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitReviewAction } from "./review-actions";

export function ReviewForm({ estabId, hasVisited, existingRating }: { estabId: string; hasVisited: boolean; existingRating: number | null }) {
  const [state, action] = useActionState(submitReviewAction, undefined);
  const [rating, setRating] = useState(existingRating ?? 0);

  if (!hasVisited) {
    return (
      <p className="text-xs text-brava-muted">
        💡 Faça check-in pelo QR pra desbloquear avaliação.
      </p>
    );
  }

  return (
    <form action={action} className="rounded-2xl bg-brava-paper p-4">
      <input type="hidden" name="estab_id" value={estabId} />
      <input type="hidden" name="rating" value={rating} />

      <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">
        {existingRating ? "Sua avaliação" : "Como foi sua experiência?"}
      </p>

      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            className="text-3xl transition hover:scale-125"
            aria-label={`${i} estrelas`}
          >
            {i <= rating ? "⭐" : "☆"}
          </button>
        ))}
      </div>

      <textarea
        name="body"
        rows={2}
        placeholder="Conta o que achou (opcional)"
        className="mt-3 w-full rounded-xl border border-brava-border bg-brava-card px-3 py-2 text-sm outline-none focus:border-brava-yellow"
      />

      {state?.error && <p className="mt-2 text-xs text-rose-700">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-xs text-emerald-700">{state.ok}</p>}

      <Submit canSubmit={rating > 0} />
    </form>
  );
}

function Submit({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || !canSubmit}
      className="mt-3 w-full rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
    >
      {pending ? "Enviando..." : "Publicar avaliação"}
    </button>
  );
}
