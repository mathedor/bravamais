"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { resolveRefundAction } from "./actions";

export function ResolveForm({ ticketId }: { ticketId: string }) {
  const [state, action] = useActionState(resolveRefundAction, undefined);
  const [mode, setMode] = useState<"none" | "approve" | "reject">("none");

  if (mode === "none") {
    return (
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("approve")}
          className="rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs font-bold text-green-800 hover:bg-green-100"
        >
          ✓ Aprovar e estornar
        </button>
        <button
          type="button"
          onClick={() => setMode("reject")}
          className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-xs font-bold text-red-800 hover:bg-red-100"
        >
          ✗ Rejeitar
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="mt-4 space-y-2 rounded-2xl border border-brava-border bg-brava-paper p-3">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <input type="hidden" name="decision" value={mode} />
      <textarea
        name="note"
        required
        rows={2}
        placeholder={mode === "approve" ? "Notas internas (opcional)" : "Motivo da rejeição"}
        className="w-full rounded-lg border border-brava-border bg-brava-card px-3 py-2 text-sm"
      />
      {mode === "approve" && (
        <label className="block text-xs">
          <span className="mb-1 block">Comprovante da transferência</span>
          <input type="file" name="receipt" accept="image/*,application/pdf" required />
        </label>
      )}
      {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("none")}
          className="flex-1 rounded-full border border-brava-border bg-brava-card px-3 py-2 text-xs"
        >
          Cancelar
        </button>
        <Submit mode={mode} />
      </div>
    </form>
  );
}

function Submit({ mode }: { mode: "approve" | "reject" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex-1 rounded-full px-3 py-2 text-xs font-bold text-white disabled:opacity-60 ${
        mode === "approve" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {pending ? "..." : mode === "approve" ? "Confirmar estorno" : "Confirmar rejeição"}
    </button>
  );
}
