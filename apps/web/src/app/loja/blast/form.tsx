"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { fireBlastAction } from "./actions";

export function BlastForm({ recent, all, ambassadors }: { recent: number; all: number; ambassadors: number }) {
  const [state, action] = useActionState(fireBlastAction, undefined);

  return (
    <form action={action} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Para quem disparar</span>
        <div className="mt-1 grid grid-cols-3 gap-2">
          <AudRadio name="audience" value="recent_visitors" defaultChecked label={`Recentes (${recent})`} desc="Últimos 90 dias" />
          <AudRadio name="audience" value="all_visitors" label={`Todos (${all})`} desc="Histórico completo" />
          <AudRadio name="audience" value="ambassadors" label={`VIPs (${ambassadors})`} desc="Só embaixadores" />
        </div>
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Título da push</span>
        <input
          name="title"
          required
          defaultValue="⚡ Promo flash agora!"
          className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Mensagem</span>
        <textarea
          name="body"
          rows={2}
          required
          defaultValue="20% off válido pelas próximas 2 horas. Corre aqui!"
          className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Desconto (%)</span>
          <input
            name="discount_percent"
            type="number"
            min={0}
            max={100}
            defaultValue={20}
            className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Vale por (horas)</span>
          <input
            name="hours"
            type="number"
            min={1}
            max={48}
            defaultValue={2}
            className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow"
          />
        </label>
      </div>

      {state?.error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.error}</p>}
      {state?.ok && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.ok}</p>}

      <Submit />
    </form>
  );
}

function AudRadio({
  name,
  value,
  label,
  desc,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="block cursor-pointer rounded-2xl border border-brava-border bg-brava-paper p-3 text-center transition hover:border-brava-yellow has-[:checked]:border-brava-yellow has-[:checked]:bg-brava-yellow/15">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="sr-only" />
      <p className="text-xs font-black text-brava-ink">{label}</p>
      <p className="mt-0.5 text-[10px] text-brava-muted">{desc}</p>
    </label>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-full bg-gradient-to-br from-brava-yellow to-amber-500 px-5 py-3 text-sm font-black text-brava-black shadow-lg shadow-brava-yellow/40 disabled:opacity-60"
    >
      {pending ? "Disparando..." : "🚀 Disparar promo agora"}
    </button>
  );
}
