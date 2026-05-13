"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveDrawAction } from "./actions";

interface Prize {
  id: string;
  label: string;
  kind: "coupon" | "coins" | "nothing";
  value: number;
  weight: number;
}

const DEFAULT_PRIZES: Prize[] = [
  { id: "p1", label: "10% off", kind: "coupon", value: 10, weight: 35 },
  { id: "p2", label: "20 coins", kind: "coins", value: 20, weight: 30 },
  { id: "p3", label: "20% off", kind: "coupon", value: 20, weight: 15 },
  { id: "p4", label: "50 coins", kind: "coins", value: 50, weight: 10 },
  { id: "p5", label: "Quase!", kind: "nothing", value: 0, weight: 10 },
];

export function RoletaConfigForm({
  existing,
}: {
  existing: { name: string; prizes: Prize[]; maxSpinsPerDay: number; isActive: boolean } | null;
}) {
  const [state, action] = useActionState(saveDrawAction, undefined);
  const [prizes, setPrizes] = useState<Prize[]>(existing?.prizes ?? DEFAULT_PRIZES);
  const [name, setName] = useState(existing?.name ?? "Roleta da Sorte");
  const [maxSpins, setMaxSpins] = useState(existing?.maxSpinsPerDay ?? 1);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);

  function updatePrize(i: number, patch: Partial<Prize>) {
    setPrizes((p) => p.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function removePrize(i: number) {
    setPrizes((p) => p.filter((_, idx) => idx !== i));
  }
  function addPrize() {
    setPrizes((p) => [...p, { id: `p${Date.now()}`, label: "Novo prêmio", kind: "coupon", value: 5, weight: 10 }]);
  }

  return (
    <form action={action} className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <input type="hidden" name="prizes_json" value={JSON.stringify(prizes)} />

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Nome da roleta</span>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Giros/dia/usuário</span>
          <input
            name="max_spins"
            type="number"
            min={1}
            max={10}
            value={maxSpins}
            onChange={(e) => setMaxSpins(parseInt(e.target.value, 10) || 1)}
            className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-yellow"
          />
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-brava-yellow"
        />
        Roleta ativa
      </label>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-brava-ink">Prêmios (peso = probabilidade)</p>
          <button type="button" onClick={addPrize} className="rounded-full bg-brava-blue px-3 py-1 text-[11px] font-bold text-white">
            + Adicionar prêmio
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {prizes.map((p, i) => (
            <div key={p.id} className="grid grid-cols-12 items-end gap-2 rounded-xl bg-brava-paper p-2">
              <div className="col-span-4">
                <span className="text-[10px] uppercase text-brava-muted">Rótulo</span>
                <input
                  value={p.label}
                  onChange={(e) => updatePrize(i, { label: e.target.value })}
                  className="w-full rounded-lg border border-brava-border bg-brava-card px-2 py-1.5 text-xs"
                />
              </div>
              <div className="col-span-3">
                <span className="text-[10px] uppercase text-brava-muted">Tipo</span>
                <select
                  value={p.kind}
                  onChange={(e) => updatePrize(i, { kind: e.target.value as Prize["kind"] })}
                  className="w-full rounded-lg border border-brava-border bg-brava-card px-2 py-1.5 text-xs"
                >
                  <option value="coupon">Cupom %</option>
                  <option value="coins">Coins</option>
                  <option value="nothing">Nada</option>
                </select>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase text-brava-muted">Valor</span>
                <input
                  type="number"
                  min={0}
                  value={p.value}
                  onChange={(e) => updatePrize(i, { value: parseInt(e.target.value, 10) || 0 })}
                  className="w-full rounded-lg border border-brava-border bg-brava-card px-2 py-1.5 text-xs"
                />
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase text-brava-muted">Peso</span>
                <input
                  type="number"
                  min={1}
                  value={p.weight}
                  onChange={(e) => updatePrize(i, { weight: parseInt(e.target.value, 10) || 1 })}
                  className="w-full rounded-lg border border-brava-border bg-brava-card px-2 py-1.5 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => removePrize(i)}
                className="col-span-1 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {state?.error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.error}</p>}
      {state?.ok && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.ok}</p>}

      <Save />
    </form>
  );
}

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-full bg-brava-yellow px-5 py-3 text-sm font-black text-brava-black disabled:opacity-60"
    >
      {pending ? "Salvando..." : "💾 Salvar roleta"}
    </button>
  );
}
