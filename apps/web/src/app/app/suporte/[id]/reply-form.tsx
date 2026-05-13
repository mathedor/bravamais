"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { replyTicketAction, closeTicketAction } from "../actions";

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const [state, action] = useActionState(replyTicketAction, undefined);

  return (
    <div className="rounded-3xl border border-brava-border bg-brava-card p-4">
      <form action={action}>
        <input type="hidden" name="ticket_id" value={ticketId} />
        <textarea
          name="body"
          rows={3}
          required
          placeholder="Sua resposta…"
          className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow"
        />
        {state?.error && <p className="mt-2 text-xs text-rose-700">{state.error}</p>}
        {state?.ok && <p className="mt-2 text-xs text-emerald-700">{state.ok}</p>}
        <Submit />
      </form>

      <form action={closeTicketAction} className="mt-2">
        <input type="hidden" name="ticket_id" value={ticketId} />
        <button type="submit" className="w-full rounded-full border border-brava-border bg-brava-paper px-3 py-2 text-[11px] font-bold text-brava-muted hover:bg-brava-card">
          ✓ Marcar como resolvido
        </button>
      </form>
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="mt-2 w-full rounded-full bg-brava-blue px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
      {pending ? "Enviando..." : "📨 Responder"}
    </button>
  );
}
