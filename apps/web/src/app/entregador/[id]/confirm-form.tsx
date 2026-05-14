"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { confirmDeliveredAction } from "../actions";

export function ConfirmDeliveredForm({ deliveryId }: { deliveryId: string }) {
  const [state, action] = useActionState(confirmDeliveredAction, undefined);

  return (
    <form action={action} className="rounded-3xl border-2 border-brava-yellow bg-brava-yellow/10 p-5">
      <input type="hidden" name="delivery_id" value={deliveryId} />
      <p className="text-sm font-bold text-brava-yellow">🔢 Peça os 4 dígitos pro cliente:</p>
      <p className="mt-1 text-xs text-white/60">
        O cliente vê o código no app dele. Confirme que é o destinatário correto.
      </p>
      <input
        name="code"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        placeholder="0000"
        className="mt-3 w-full rounded-xl border border-brava-yellow/40 bg-brava-black px-4 py-4 text-center text-2xl font-black tracking-[0.5em] text-brava-yellow placeholder:text-brava-yellow/30"
        required
      />
      {state?.error && <p className="mt-2 text-sm text-red-300">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 w-full rounded-full bg-brava-yellow py-3 text-sm font-black text-brava-black disabled:opacity-60"
    >
      {pending ? "Confirmando..." : "✔️ Confirmar entrega"}
    </button>
  );
}
