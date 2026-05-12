"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestWithdrawalAction } from "./actions";
import { formatBRL } from "@/lib/format";

export function WithdrawalForm({ available }: { available: number }) {
  const [state, action] = useActionState(requestWithdrawalAction, undefined);
  const canRequest = available >= 10000;

  return (
    <form action={action} className="space-y-3">
      <p className="rounded-2xl bg-brava-paper px-4 py-3 text-sm">
        Disponível pra saque: <strong className="text-brava-blue">{formatBRL(available)}</strong>
        <span className="ml-2 text-xs text-brava-muted">· mínimo R$ 100,00</span>
      </p>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Valor a sacar (R$)</span>
        <input
          name="amount"
          required
          inputMode="decimal"
          placeholder={`Máximo ${(available / 100).toFixed(2)}`}
          disabled={!canRequest}
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow disabled:bg-brava-paper disabled:opacity-60"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Chave PIX</span>
        <input
          name="pix_key"
          required
          disabled={!canRequest}
          placeholder="CPF, email, telefone ou chave aleatória"
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow disabled:opacity-60"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Observações (opcional)</span>
        <textarea
          name="notes"
          rows={2}
          disabled={!canRequest}
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow disabled:opacity-60"
        />
      </label>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}

      <Submit disabled={!canRequest} />
      {!canRequest && (
        <p className="text-xs text-brava-muted">
          Você precisa ter pelo menos R$ 100,00 disponíveis pra solicitar um saque.
        </p>
      )}
    </form>
  );
}

function Submit({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black disabled:opacity-60"
    >
      {pending ? "Solicitando…" : "💰 Solicitar saque"}
    </button>
  );
}
