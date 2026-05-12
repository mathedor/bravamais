"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestRefundAction } from "./actions";
import { formatBRL } from "@/lib/format";

interface OrderOption {
  id: string;
  total_cents: number;
  created_at: string;
  establishments: { name: string } | null;
}

export function RefundForm({ orders }: { orders: OrderOption[] }) {
  const [state, action] = useActionState(requestRefundAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Pedido</span>
        <select name="order_id" required className={input}>
          <option value="">— Selecione um pedido —</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.establishments?.name ?? "—"} · {formatBRL(o.total_cents)} · {new Date(o.created_at).toLocaleDateString("pt-BR")}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Motivo</span>
        <input
          name="reason"
          required
          maxLength={120}
          placeholder="Ex: Produto chegou com defeito"
          className={input}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Detalhes (opcional)</span>
        <textarea name="message" rows={3} className={input} />
      </label>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}

      <Submit />
    </form>
  );
}

const input = "w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brava-yellow px-5 py-3 text-sm font-bold text-brava-black disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Abrir pedido de extorno"}
    </button>
  );
}
