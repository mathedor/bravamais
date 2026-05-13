"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createAffiliateAction } from "./actions";

export function AffiliateForm() {
  const [state, action] = useActionState(createAffiliateAction, undefined);

  return (
    <form action={action} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Nome *</span>
          <input name="name" required className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Código (opcional)</span>
          <input name="code" placeholder="auto-gerado se vazio" className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Email</span>
          <input name="email" type="email" className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Telefone</span>
          <input name="phone" className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Comissão (%)</span>
          <input name="commission_rate" type="number" min={0} max={100} step="0.5" defaultValue={20} className={input} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Duração (meses)</span>
          <input name="duration_months" type="number" min={1} max={36} defaultValue={12} className={input} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">PIX (chave pra payout)</span>
          <input name="pix_key" className={input} />
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
      {pending ? "..." : "+ Cadastrar afiliado"}
    </button>
  );
}
