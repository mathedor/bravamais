"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestDeletionAction, cancelDeletionAction } from "./actions";

export function DeleteAccountForm({ cancellable }: { cancellable?: boolean }) {
  const [state, action] = useActionState(cancellable ? cancelDeletionAction : requestDeletionAction, undefined);

  if (cancellable) {
    return (
      <form action={action} className="mt-3">
        {state?.ok && <p className="mb-2 text-xs text-emerald-700">{state.ok}</p>}
        <SubmitCancel />
      </form>
    );
  }

  return (
    <form action={action} className="mt-3">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Motivo (opcional)</span>
        <textarea
          name="reason"
          rows={2}
          className="mt-1 w-full rounded-xl border border-rose-200 bg-brava-card px-3 py-2 text-sm outline-none focus:border-rose-400"
          placeholder="O que motivou? Nos ajuda a melhorar."
        />
      </label>

      {state?.error && <p className="mt-2 text-xs text-rose-900">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-xs text-emerald-700">{state.ok}</p>}

      <SubmitDelete />
    </form>
  );
}

function SubmitDelete() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 w-full rounded-full bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-60"
    >
      {pending ? "Enviando..." : "Quero excluir minha conta"}
    </button>
  );
}

function SubmitCancel() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending ? "Cancelando..." : "Cancelar exclusão"}
    </button>
  );
}
