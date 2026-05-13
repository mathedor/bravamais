"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { sendPersonalCouponAction } from "./actions";

export function PersonalCouponForm({ userId, userName, estabId }: { userId: string; userName: string; estabId: string }) {
  const [state, action] = useActionState(sendPersonalCouponAction, undefined);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white hover:opacity-90"
      >
        🎁 Mandar cupom pessoal
      </button>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-brava-border bg-brava-paper p-3">
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="user_name" value={userName} />
      <input type="hidden" name="estab_id" value={estabId} />

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">Desconto (%)</span>
          <input
            name="discount_percent"
            type="number"
            min={1}
            max={100}
            defaultValue={10}
            className="mt-0.5 w-full rounded-lg border border-brava-border bg-brava-card px-2 py-1.5 text-sm outline-none focus:border-brava-yellow"
            required
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">Válido (dias)</span>
          <input
            name="days"
            type="number"
            min={1}
            max={90}
            defaultValue={7}
            className="mt-0.5 w-full rounded-lg border border-brava-border bg-brava-card px-2 py-1.5 text-sm outline-none focus:border-brava-yellow"
            required
          />
        </label>
      </div>
      <input
        name="note"
        type="text"
        placeholder="Mensagem (opcional)"
        className="mt-2 w-full rounded-lg border border-brava-border bg-brava-card px-2 py-1.5 text-sm outline-none focus:border-brava-yellow"
      />

      {state?.error && <p className="mt-1 text-[11px] text-rose-600">{state.error}</p>}
      {state?.ok && <p className="mt-1 text-[11px] text-emerald-700">{state.ok}</p>}

      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-xs font-medium">
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
      className="flex-1 rounded-full bg-brava-blue px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
    >
      {pending ? "..." : "Enviar"}
    </button>
  );
}
