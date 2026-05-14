"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveDeliverySettingsAction, upsertZoneAction } from "./actions";

interface Settings {
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  max_radius_km: number;
  default_prep_minutes: number;
  notify_template_whatsapp: string | null;
}

export function SettingsForm({ initial }: { initial: Settings }) {
  const [state, action] = useActionState(saveDeliverySettingsAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Toggle name="delivery_enabled" label="🛵 Aceitar entrega" defaultChecked={initial.delivery_enabled} />
        <Toggle name="pickup_enabled" label="🏪 Aceitar retirada" defaultChecked={initial.pickup_enabled} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field
          name="max_radius_km"
          label="Raio máximo (km)"
          type="number"
          step="0.5"
          defaultValue={initial.max_radius_km}
          required
        />
        <Field
          name="default_prep_minutes"
          label="Tempo de preparo (min)"
          type="number"
          step="5"
          defaultValue={initial.default_prep_minutes}
          required
        />
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-brava-muted">
          Template WhatsApp pro entregador
        </span>
        <textarea
          name="notify_template_whatsapp"
          rows={3}
          defaultValue={initial.notify_template_whatsapp ?? `🛵 Nova entrega BRAVA+!\nOrigem: {pickup}\nDestino: {dropoff}\nCódigo: {code}\nValor: {fee}`}
          className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm font-mono"
        />
        <span className="mt-1 block text-xs text-brava-muted">
          Use {`{pickup}`}, {`{dropoff}`}, {`{code}`}, {`{fee}`} pra substituir.
        </span>
      </label>

      {state?.error && <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">Configurações salvas!</p>}

      <SubmitButton>Salvar configurações</SubmitButton>
    </form>
  );
}

export function ZoneForm({ zone }: { zone?: { id: string; max_km: number; fee_cents: number; free_above_cents: number | null } }) {
  const [state, action] = useActionState(upsertZoneAction, undefined);
  return (
    <form action={action} className="grid grid-cols-12 items-end gap-2" key={state?.ok ? "reset" : "form"}>
      <input type="hidden" name="id" value={zone?.id ?? ""} />
      <div className="col-span-3">
        <span className="mb-1 block text-[10px] font-semibold uppercase text-brava-muted">até X km</span>
        <input
          name="max_km"
          type="number"
          step="0.5"
          defaultValue={zone?.max_km ?? ""}
          className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
          required
        />
      </div>
      <div className="col-span-3">
        <span className="mb-1 block text-[10px] font-semibold uppercase text-brava-muted">taxa (R$)</span>
        <input
          name="fee"
          type="number"
          step="0.5"
          defaultValue={zone ? (zone.fee_cents / 100).toFixed(2) : ""}
          className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
          required
        />
      </div>
      <div className="col-span-4">
        <span className="mb-1 block text-[10px] font-semibold uppercase text-brava-muted">grátis acima de (R$) opcional</span>
        <input
          name="free_above"
          type="number"
          step="0.5"
          defaultValue={zone?.free_above_cents ? (zone.free_above_cents / 100).toFixed(2) : ""}
          className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
        />
      </div>
      <div className="col-span-2">
        <SmallSubmit>{zone ? "Salvar" : "+ Adicionar"}</SmallSubmit>
      </div>
      {state?.error && <p className="col-span-12 text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-brava-border bg-brava-paper px-4 py-3 text-sm font-bold text-brava-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4" />
      {label}
    </label>
  );
}

function Field({ name, label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-brava-muted">{label}</span>
      <input
        name={name}
        className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-blue"
        {...rest}
      />
    </label>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brava-blue px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.01] disabled:opacity-60"
    >
      {pending ? "Salvando..." : children}
    </button>
  );
}

function SmallSubmit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brava-blue px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
    >
      {pending ? "..." : children}
    </button>
  );
}
