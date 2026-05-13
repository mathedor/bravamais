"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCategoryAction } from "./actions";

export function CategoryForm() {
  const [state, action] = useActionState(createCategoryAction, undefined);

  return (
    <form action={action} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Slug *</span>
          <input name="slug" required placeholder="restaurantes" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Nome *</span>
          <input name="name" required placeholder="Restaurantes" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Ícone (slug)</span>
          <input name="icon" placeholder="utensils-crossed" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow" />
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
    <button type="submit" disabled={pending} className="mt-4 w-full rounded-full bg-brava-blue px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
      {pending ? "..." : "+ Adicionar categoria"}
    </button>
  );
}
