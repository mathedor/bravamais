"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { criarBloqueioAction, resolverBloqueioAction } from "./actions";

const RAZOES = [
  { value: "chargeback_cartao", label: "Chargeback cartão" },
  { value: "contestacao_pix", label: "Contestação PIX" },
  { value: "reembolso", label: "Reembolso" },
  { value: "repasse_excedente", label: "Repasse excedente" },
  { value: "outro", label: "Outro" },
];

export function BloqueioForm({ estabs }: { estabs: { id: string; name: string }[] }) {
  const [state, action] = useActionState(criarBloqueioAction, undefined);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-1">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Lojista</span>
          <select
            name="establishment_id"
            required
            className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none"
          >
            <option value="">Escolha…</option>
            {estabs.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Razão</span>
          <select
            name="razao"
            className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none"
          >
            {RAZOES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
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
        <span className="mb-1 block text-sm font-medium text-brava-ink">Observação</span>
        <input
          name="observacao"
          placeholder="ex.: chargeback pedido #1234"
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
        />
      </label>
      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}
      <Submit />
    </form>
  );
}

export function ResolverBloqueioButton({ id }: { id: string }) {
  const [state, action] = useActionState(resolverBloqueioAction, undefined);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="block_id" value={id} />
      <button
        type="submit"
        className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100"
      >
        ✓ Resolver
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
      className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
    >
      {pending ? "Criando…" : "🚫 Criar bloqueio"}
    </button>
  );
}
