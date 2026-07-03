"use client";

import { useActionState, useTransition, useState } from "react";
import { useFormStatus } from "react-dom";
import { seedDemoAction, clearDemoAction } from "./actions";

type State = { error?: string; ok?: string; detail?: string } | undefined;

function Feedback({ state }: { state: State }) {
  if (!state) return null;
  return (
    <>
      {state.error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.error}</p>}
      {state.ok && (
        <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <p className="font-bold">{state.ok}</p>
          {state.detail && <p className="mt-1 break-words opacity-80">{state.detail}</p>}
        </div>
      )}
    </>
  );
}

export function SeedPanel() {
  const [state, setState] = useState<State>(undefined);
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <h2 className="text-lg font-black text-brava-ink">🌱 Popular dados demo</h2>
      <p className="mt-1 text-sm text-brava-muted">
        Recria o mundo de demonstração completo: ~50 estabelecimentos com produtos, cupons e clubes de
        fidelidade, os 5 logins demo por role, 5 assinantes fictícios e a atividade deles (visitas, pedidos,
        resgates, vale-presentes, saques, estornos, stories e notificações). Pode rodar quantas vezes quiser
        — é idempotente.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => setState(await seedDemoAction()))}
        className="mt-4 w-full rounded-full bg-brava-black px-5 py-3 text-sm font-black text-brava-yellow disabled:opacity-60"
      >
        {pending ? "Populando… (pode levar ~1 min)" : "🌱 Popular dados demo"}
      </button>
      <Feedback state={state} />
    </section>
  );
}

function ClearSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
    >
      {pending ? "Limpando…" : "🧹 Limpar dados fictícios"}
    </button>
  );
}

export function ClearPanel() {
  const [state, action] = useActionState(clearDemoAction, undefined);

  return (
    <section className="rounded-3xl border border-rose-200 bg-brava-card p-5">
      <h2 className="text-lg font-black text-brava-ink">🧹 Limpar dados fictícios</h2>
      <p className="mt-1 text-sm text-brava-muted">
        Remove <b>tudo</b> que é demo: usuários com email <code>@bravamais.app</code>, os estabelecimentos
        deles e toda a atividade ligada (visitas, pedidos, pagamentos, vendas de balcão, stories, saques,
        estornos…). Dados de usuários e lojas reais <b>não são tocados</b>. Use antes de ativar pra valer,
        ou entre rodadas de teste.
      </p>
      <form action={action} className="mt-4 space-y-3">
        <label className="flex items-start gap-2 text-sm text-brava-ink">
          <input type="checkbox" name="keep_logins" defaultChecked className="mt-0.5" />
          <span>
            Manter os 5 logins demo (<code>demo.*@bravamais.app</code>) pra continuar acessando os painéis
            de demonstração
          </span>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">
            Digite <b>LIMPAR</b> pra confirmar
          </span>
          <input
            name="confirm"
            required
            placeholder="LIMPAR"
            className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none"
          />
        </label>
        <ClearSubmit />
      </form>
      <Feedback state={state} />
    </section>
  );
}
