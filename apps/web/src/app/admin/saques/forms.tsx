"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  approveWithdrawalAction,
  payWithdrawalAction,
  rejectWithdrawalAction,
} from "./actions";

export function ApproveButton({ withdrawalId }: { withdrawalId: string }) {
  const [state, action] = useActionState(approveWithdrawalAction, undefined);
  return (
    <form action={action} className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3">
      <p className="text-xs font-bold text-brava-blue">✅ Aprovar (entra na fila de pagamento)</p>
      <input type="hidden" name="withdrawal_id" value={withdrawalId} />
      {state?.error && <p className="mt-2 text-xs text-red-700">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-xs text-green-700">{state.ok}</p>}
      <Submit label="Aprovar saque" pendingLabel="Aprovando…" cls="bg-brava-blue" />
    </form>
  );
}

export function PayForm({ withdrawalId }: { withdrawalId: string }) {
  const [state, action] = useActionState(payWithdrawalAction, undefined);
  return (
    <form action={action} className="rounded-2xl border border-brava-yellow bg-brava-yellow/5 p-3">
      <p className="text-xs font-bold text-green-700">💸 Pagar (anexar comprovante)</p>
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
      <Submit label="Marcar como pago" pendingLabel="Pagando…" cls="bg-green-600" />
    </form>
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
        ❌ Recusar
      </button>
    );
  }
  return (
    <form action={action} className="rounded-2xl border border-red-200 bg-red-50/50 p-3">
      <p className="text-xs font-bold text-red-700">❌ Recusar</p>
      <input type="hidden" name="withdrawal_id" value={withdrawalId} />
      <input
        name="reason"
        required
        placeholder="Motivo"
        className="mt-2 w-full rounded-lg border border-red-200 bg-brava-card px-3 py-1.5 text-xs"
      />
      {state?.error && <p className="mt-2 text-xs text-red-700">{state.error}</p>}
      <Submit label="Recusar" pendingLabel="…" cls="bg-red-600" />
    </form>
  );
}

function Submit({ label, pendingLabel, cls }: { label: string; pendingLabel: string; cls: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`mt-2 w-full rounded-full px-4 py-2 text-xs font-bold text-white disabled:opacity-60 ${cls}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
