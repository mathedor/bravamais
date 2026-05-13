"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPackageAction } from "./actions";

export function PackageForm() {
  const [state, action] = useActionState(createPackageAction, undefined);
  return (
    <form action={action} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Slug *</span>
          <input name="slug" required placeholder="black-friday-2026" className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Título *</span>
          <input name="title" required placeholder="BRAVA+ Black Friday" className={input} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Subtítulo</span>
          <input name="subtitle" placeholder="Os melhores descontos do ano" className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Emoji</span>
          <input name="theme_emoji" defaultValue="🎉" maxLength={4} className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Cor (hex)</span>
          <input name="theme_color" defaultValue="#FFD400" maxLength={7} className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Início</span>
          <input name="starts_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Fim</span>
          <input name="ends_at" type="date" defaultValue={new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)} className={input} />
        </label>
      </div>

      {state?.error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.error}</p>}
      {state?.ok && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.ok}</p>}

      <Submit />
    </form>
  );
}

const input = "mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="mt-4 w-full rounded-full bg-brava-blue px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
      {pending ? "..." : "+ Criar pacote"}
    </button>
  );
}
