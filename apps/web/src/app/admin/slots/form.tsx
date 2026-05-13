"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createSlotAction } from "./actions";

export function SlotForm({ estabs }: { estabs: { id: string; name: string; slug: string }[] }) {
  const [state, action] = useActionState(createSlotAction, undefined);

  return (
    <form action={action} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Estabelecimento</span>
          <select
            name="estab_id"
            required
            className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none"
          >
            <option value="">Escolha…</option>
            {estabs.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Onde aparece</span>
          <select
            name="placement"
            defaultValue="home_hero"
            className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none"
          >
            <option value="home_hero">🏠 Home hero</option>
            <option value="category_top">🗂️ Topo da categoria</option>
            <option value="nearby_top">📍 Topo do perto de mim</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Categoria (slug, opcional)</span>
          <input name="category_slug" placeholder="restaurantes" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Cidade (opcional)</span>
          <input name="city" placeholder="São Paulo" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Valor (R$/mês)</span>
          <input name="monthly_reais" type="number" min={49} defaultValue={199} step="1" required className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Validade (dias)</span>
          <input name="days" type="number" min={7} max={365} defaultValue={30} required className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none" />
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
    <button type="submit" disabled={pending} className="mt-4 w-full rounded-full bg-brava-yellow px-5 py-3 text-sm font-black text-brava-black disabled:opacity-60">
      {pending ? "Salvando..." : "💰 Criar slot"}
    </button>
  );
}
