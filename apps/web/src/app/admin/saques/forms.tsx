"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { approveWithdrawalAction, rejectWithdrawalAction } from "./actions";

export function ApproveForm({ withdrawalId }: { withdrawalId: string }) {
  const [state, action] = useActionState(approveWithdrawalAction, undefined);
  return (
    <form action={action} className="rounded-2xl border border-brava-yellow bg-brava-yellow/5 p-3">
      <p className="text-xs font-bold text-brava-blue">✅ Aprovar (anexar comprovante)</p>
      <input type="hidden" name="withdrawal_id" value={withdrawalId} />
      <input
        type="file"
        name="receipt"
        accept="image/*,application/pdf"
        required
        className="mt-2 block w-full text-xs"
      />
      {state?.error && <p className="mt-2 text-xs text-red-700">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-xs text-green-700">{state.ok}</p>}
      <ApproveSubmit />
    </form>
  );
}

function ApproveSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
    >
      {pending ? "Aprovando…" : "Marcar como pago"}
    </button>
  );
}

export function RejectForm({ withdrawalId }: { withdrawalId: string }) {
  const [state, action] = useActionState(rejectWithdrawalAction, undefined);
  const [show, setShow] = useState(false);
  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="rounded-2xl border border-red-200 bg-red-50/50 p-3 text-xs text-red-700 hover:bg-red-50"
      >
        ❌ Rejeitar
      </button>
    );
  }
  return (
    <form action={action} className="rounded-2xl border border-red-200 bg-red-50/50 p-3">
      <p className="text-xs font-bold text-red-700">❌ Rejeitar</p>
      <input type="hidden" name="withdrawal_id" value={withdrawalId} />
      <input
        name="reason"
        required
        placeholder="Motivo"
        className="mt-2 w-full rounded-lg border border-red-200 bg-brava-card px-3 py-1.5 text-xs"
      />
      {state?.error && <p className="mt-2 text-xs text-red-700">{state.error}</p>}
      <RejectSubmit />
    </form>
  );
}

function RejectSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
    >
      {pending ? "..." : "Rejeitar"}
    </button>
  );
}
