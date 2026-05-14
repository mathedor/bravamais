"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createDelivererAction } from "./actions";

export function DelivererForm() {
  const [state, action] = useActionState(createDelivererAction, undefined);
  return (
    <form action={action} className="space-y-3" key={state?.ok ? "reset" : "form"}>
      <div className="grid grid-cols-2 gap-3">
        <Field name="full_name" label="Nome completo" required />
        <Field name="email" type="email" label="Email (vira login)" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field name="phone" label="Telefone" placeholder="(11) 99999-9999" required />
        <Field name="whatsapp" label="WhatsApp" placeholder="(11) 99999-9999" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field name="cpf" label="CPF" placeholder="000.000.000-00" />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-brava-muted">Veículo</span>
          <select
            name="vehicle"
            className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm"
            defaultValue="moto"
          >
            <option value="moto">Moto</option>
            <option value="carro">Carro</option>
            <option value="bike">Bicicleta</option>
            <option value="a_pe">A pé</option>
            <option value="van">Van</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field name="vehicle_model" label="Modelo" placeholder="Honda 160" />
        <Field name="vehicle_color" label="Cor" placeholder="Vermelha" />
        <Field name="plate" label="Placa" placeholder="ABC-1234" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field name="city" label="Cidade" />
        <Field name="state" label="UF" maxLength={2} />
      </div>

      {state?.error && <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && (
        <p className="rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          ✅ Entregador criado! Uma senha aleatória foi gerada — envie ao entregador pra ele acessar o app.
        </p>
      )}

      <SubmitButton>Cadastrar entregador</SubmitButton>
    </form>
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
