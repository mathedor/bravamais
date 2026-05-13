"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createChallengeAction } from "./actions";

export function ChallengeForm({ categorias }: { categorias: { slug: string; name: string }[] }) {
  const [state, action] = useActionState(createChallengeAction, undefined);
  const [kind, setKind] = useState("visits_in_category");
  const needsCategory = kind === "visits_in_category";

  return (
    <form action={action} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Título *</span>
          <input name="title" required placeholder="ex: Tour gastronômico do mês" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Descrição</span>
          <input name="description" placeholder="O que precisa fazer pra ganhar" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Tipo</span>
          <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm">
            <option value="visits_in_category">Visitas em categoria</option>
            <option value="coupons_redeemed">Cupons usados</option>
            <option value="distinct_estabs_visited">Lojas distintas visitadas</option>
            <option value="gift_cards_purchased">Vales-presente comprados</option>
          </select>
        </label>
        {needsCategory && (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Categoria</span>
            <select name="target_category_slug" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm">
              {categorias.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Meta (N)</span>
          <input name="target_n" type="number" min={1} defaultValue={5} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Recompensa (coins)</span>
          <input name="reward_coins" type="number" min={1} defaultValue={200} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Início</span>
          <input name="starts_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Fim</span>
          <input name="ends_at" type="date" defaultValue={new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Emoji</span>
          <input name="cover_emoji" maxLength={4} defaultValue="🏆" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
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
    <button type="submit" disabled={pending} className="mt-4 w-full rounded-full bg-brava-blue px-5 py-3 text-sm font-black text-white disabled:opacity-60">
      {pending ? "Criando..." : "🏆 Criar desafio"}
    </button>
  );
}
