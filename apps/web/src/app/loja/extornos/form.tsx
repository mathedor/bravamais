"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { contestRefundAction } from "./actions";

export function ContestForm({ ticketId }: { ticketId: string }) {
  const [state, action] = useActionState(contestRefundAction, undefined);
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setShow(true)}
          className="rounded-full bg-brava-yellow px-4 py-2 text-xs font-bold text-brava-black"
        >
          ⚠️ Responder / contestar
        </button>
        <form action={action}>
          <input type="hidden" name="ticket_id" value={ticketId} />
          <input type="hidden" name="action" value="approve" />
          <input type="hidden" name="contest" value="" />
          <button
            type="submit"
            className="w-full rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs font-bold text-green-800 hover:bg-green-100"
          >
            ✓ Aceitar extorno (estornar direto)
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={action} className="mt-4 space-y-2">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <input type="hidden" name="action" value="contest" />
      <textarea
        name="contest"
        required
        rows={3}
        placeholder="Sua versão dos fatos. O admin BRAVA+ vai decidir."
        className="w-full rounded-xl border border-brava-border bg-brava-card px-3 py-2 text-sm outline-none focus:border-brava-yellow"
      />
      {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShow(false)}
          className="flex-1 rounded-full border border-brava-border bg-brava-card px-3 py-2 text-xs font-medium"
        >
          Cancelar
        </button>
        <Submit />
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-full bg-brava-blue px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
    >
      {pending ? "..." : "Contestar"}
    </button>
  );
}
