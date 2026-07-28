"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { registrarRetiradaAction, excluirRetiradaAction } from "./actions";

const TIPOS = [
  { value: "despesa", label: "Despesa operacional" },
  { value: "pro_labore", label: "Pró-labore" },
  { value: "imposto", label: "Imposto" },
  { value: "fornecedor", label: "Fornecedor" },
  { value: "outro", label: "Outro" },
];

export function RetiradaForm() {
  const [state, action] = useActionState(registrarRetiradaAction, undefined);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Tipo</span>
          <select
            name="tipo"
            className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Valor (R$)</span>
          <input
            name="valor"
            required
            inputMode="decimal"
            placeholder="0,00"
            className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Descrição</span>
        <input
          name="descricao"
          required
          placeholder="ex.: Servidor Vercel julho"
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Observação (opcional)</span>
        <input
          name="observacao"
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
        />
      </label>
      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}
      <Submit />
    </form>
  );
}

export function ExcluirRetiradaButton({ id }: { id: string }) {
  const [state, action] = useActionState(excluirRetiradaAction, undefined);
  const [confirm, setConfirm] = useState(false);
  if (!confirm) {
    return (
      <button type="button" onClick={() => setConfirm(true)} className="text-xs text-red-600 hover:underline">
        excluir
      </button>
    );
  }
  return (
    <form action={action} className="inline">
      <input type="hidden" name="retirada_id" value={id} />
      <button type="submit" className="text-xs font-bold text-red-600 hover:underline">
        confirmar exclusão
      </button>
      {state?.error && <span className="ml-2 text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brava-blue px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
    >
      {pending ? "Registrando…" : "📤 Registrar retirada"}
    </button>
  );
}
