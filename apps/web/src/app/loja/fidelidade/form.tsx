"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { upsertLoyaltyAction } from "./actions";

interface Club {
  id: string;
  name: string;
  description: string | null;
  visits_required: number;
  benefit_description: string;
  is_active: boolean;
  reward_type?: string | null;
  reward_discount_percent?: number | null;
  reward_discount_cents?: number | null;
  reward_value_cents?: number | null;
}

export function LoyaltyForm({ club }: { club: Club | null }) {
  const [state, action] = useActionState(upsertLoyaltyAction, undefined);
  const [rewardType, setRewardType] = useState<string>(club?.reward_type ?? "manual");

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

      <fieldset className="rounded-2xl border border-brava-border bg-brava-paper p-4">
        <legend className="px-2 text-xs font-bold uppercase tracking-wider text-brava-blue">
          Recompensa automática
        </legend>
        <p className="mb-3 text-xs text-brava-muted">
          O que o cliente ganha ao completar o clube. Cupom e vale-presente são gerados na hora do resgate.
        </p>

        <div className="grid gap-2 sm:grid-cols-3">
          <RewardTypeCard
            value="manual"
            label="Manual"
            emoji="🎁"
            desc="Você entrega na hora"
            active={rewardType === "manual"}
            onSelect={setRewardType}
          />
          <RewardTypeCard
            value="coupon"
            label="Cupom"
            emoji="🎟️"
            desc="Gera um cupom de desconto"
            active={rewardType === "coupon"}
            onSelect={setRewardType}
          />
          <RewardTypeCard
            value="gift_card"
            label="Vale-presente"
            emoji="💝"
            desc="Gera saldo pra usar na loja"
            active={rewardType === "gift_card"}
            onSelect={setRewardType}
          />
        </div>
        <input type="hidden" name="reward_type" value={rewardType} />

        {rewardType === "coupon" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-brava-muted">% desconto</span>
              <input
                name="reward_discount_percent"
                type="number"
                min="1"
                max="100"
                defaultValue={club?.reward_discount_percent ?? ""}
                placeholder="10"
                className={input}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-brava-muted">ou R$ fixo</span>
              <input
                name="reward_discount_value"
                placeholder="20,00"
                defaultValue={club?.reward_discount_cents ? (club.reward_discount_cents / 100).toFixed(2) : ""}
                className={input}
              />
            </label>
          </div>
        )}
        {rewardType === "gift_card" && (
          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-medium text-brava-muted">Valor do vale-presente (R$)</span>
            <input
              name="reward_value"
              placeholder="50,00"
              defaultValue={club?.reward_value_cents ? (club.reward_value_cents / 100).toFixed(2) : ""}
              className={input}
            />
          </label>
        )}
      </fieldset>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-brava-ink">
          Descrição (visível pro cliente)
        </span>
        <input
          name="benefit_description"
          required
          defaultValue={club?.benefit_description ?? ""}
          placeholder="Ex: 10% off na próxima compra"
          className={input}
        />
      </label>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
          Clube {club ? "atualizado" : "criado"} com sucesso.
        </p>
      )}

      <Submit isUpdate={!!club} />
    </form>
  );
}

function RewardTypeCard({
  value,
  label,
  emoji,
  desc,
  active,
  onSelect,
}: {
  value: string;
  label: string;
  emoji: string;
  desc: string;
  active: boolean;
  onSelect: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition ${
        active ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-brava-card hover:border-brava-yellow/60"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-bold text-brava-ink">{label}</span>
      <span className="text-[11px] text-brava-muted leading-tight">{desc}</span>
    </button>
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
