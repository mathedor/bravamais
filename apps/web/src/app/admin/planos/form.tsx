"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminUpdatePlanAction } from "./actions";

interface Plan {
  tier: "basico" | "premium" | "vip";
  name: string;
  monthly_cents: number;
  yearly_cents: number | null;
}

export function PlansForm({ plan }: { plan: Plan }) {
  const [state, action] = useActionState(adminUpdatePlanAction, undefined);
  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_140px_120px]">
      <input type="hidden" name="tier" value={plan.tier} />
      <Field name="name" defaultValue={plan.name} label="Nome" />
      <Field name="monthly" defaultValue={(plan.monthly_cents / 100).toFixed(2)} label="Mensal (R$)" />
      <Field name="yearly" defaultValue={plan.yearly_cents ? (plan.yearly_cents / 100).toFixed(2) : ""} label="Anual (R$)" />
      <Submit />
      {state?.error && <p className="sm:col-span-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>}
      {state?.ok && <p className="sm:col-span-4 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-700">{state.ok}</p>}
    </form>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-brava-muted">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-brava-border bg-white px-3 py-2 text-sm outline-none focus:border-brava-yellow"
      />
    </label>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-end rounded-full bg-brava-black px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
    >
      {pending ? "Salvando…" : "Salvar"}
    </button>
  );
}
