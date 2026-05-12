"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { upsertLoyaltyAction } from "./actions";

interface Club {
  id: string;
  name: string;
  description: string | null;
  visits_required: number;
  benefit_description: string;
  is_active: boolean;
}

export function LoyaltyForm({ club }: { club: Club | null }) {
  const [state, action] = useActionState(upsertLoyaltyAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-brava-ink">Nome do clube</span>
        <input
          name="name"
          required
          defaultValue={club?.name ?? ""}
          placeholder="Ex: Cliente Top"
          className={input}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-brava-ink">Visitas necessárias</span>
        <input
          name="visits_required"
          type="number"
          min="1"
          max="50"
          required
          defaultValue={club?.visits_required ?? 5}
          className={input}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-brava-ink">Benefício</span>
        <input
          name="benefit_description"
          required
          defaultValue={club?.benefit_description ?? ""}
          placeholder="Ex: chopp em dobro, sobremesa por conta da casa, 30% off"
          className={input}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-brava-ink">Descrição (opcional)</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={club?.description ?? ""}
          className={input}
          placeholder="Detalhes da regra"
        />
      </label>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
          Clube {club ? "atualizado" : "criado"} com sucesso.
        </p>
      )}

      <Submit isUpdate={!!club} />
    </form>
  );
}

const input =
  "w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow";

function Submit({ isUpdate }: { isUpdate: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black disabled:opacity-60"
    >
      {pending ? "Salvando…" : isUpdate ? "Atualizar clube" : "Criar clube"}
    </button>
  );
}
