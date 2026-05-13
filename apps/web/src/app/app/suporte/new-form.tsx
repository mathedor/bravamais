"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { openTicketAction } from "./actions";

export function NewTicketForm() {
  const [state, action] = useActionState(openTicketAction, undefined);

  return (
    <form action={action} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <p className="text-sm font-bold text-brava-ink">📝 Abrir ticket</p>

      <label className="mt-3 block">
        <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Assunto</span>
        <input name="subject" required placeholder="Resumo do problema" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow" />
      </label>

      <label className="mt-2 block">
        <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Categoria</span>
        <select name="category" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm">
          <option value="geral">Geral</option>
          <option value="pagamento">Cobrança / assinatura</option>
          <option value="cupom">Problema com cupom / vale</option>
          <option value="estabelecimento">Problema com estabelecimento</option>
          <option value="conta">Conta / acesso</option>
          <option value="outro">Outro</option>
        </select>
      </label>

      <label className="mt-2 block">
        <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Mensagem</span>
        <textarea name="body" rows={4} required placeholder="Descreva o que aconteceu" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow" />
      </label>

      {state?.error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.error}</p>}
      {state?.ok && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.ok}</p>}

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="mt-4 w-full rounded-full bg-brava-blue px-5 py-3 text-sm font-black text-white disabled:opacity-60">
      {pending ? "Abrindo..." : "📨 Abrir ticket"}
    </button>
  );
}
