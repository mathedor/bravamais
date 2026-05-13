"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createB2BAccountAction } from "./actions";

export function B2BAccountForm() {
  const [state, action] = useActionState(createB2BAccountAction, undefined);

  return (
    <form action={action} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Empresa *</span>
          <input name="company_name" required className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">CNPJ</span>
          <input name="cnpj" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Contato (nome)</span>
          <input name="contact_name" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Contato (email)</span>
          <input name="contact_email" type="email" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Seats contratados *</span>
          <input name="seats" type="number" min={1} defaultValue={10} required className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">R$/seat/mês</span>
          <input name="reais_per_seat" type="number" min={0} step="0.01" defaultValue={19.9} required className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
        </label>
      </div>

      {state?.error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.error}</p>}
      {state?.ok && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.ok}</p>}

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="mt-4 w-full rounded-full bg-brava-black px-5 py-3 text-sm font-black text-brava-yellow disabled:opacity-60">
      {pending ? "Criando..." : "🏢 Criar conta B2B"}
    </button>
  );
}
