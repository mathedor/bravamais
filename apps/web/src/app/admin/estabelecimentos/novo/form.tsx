"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminCreateEstablishmentAction } from "../actions";

export function CreateEstablishmentForm({ categorias }: { categorias: { id: string; name: string }[] }) {
  const [state, action] = useActionState(adminCreateEstablishmentAction, undefined);

  return (
    <form action={action} className="space-y-5 rounded-3xl border border-brava-border bg-white p-6">
      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-brava-blue">Dados da loja</legend>
        <Field name="name" label="Nome da loja" required />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Categoria principal</span>
          <select name="category_id" className={input}>
            <option value="">— Selecione —</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <Field name="city" label="Cidade" required />
          <Field name="state" label="UF" required maxLength={2} />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-brava-blue">Conta do dono</legend>
        <Field name="owner_name" label="Nome do dono" required />
        <Field name="owner_email" label="Email do dono" type="email" required />
        <Field name="owner_password" label="Senha provisória (mín 8)" type="password" minLength={8} required />
      </fieldset>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <Submit />
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  minLength,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}{required && <span className="text-red-600"> *</span>}</span>
      <input name={name} type={type} required={required} minLength={minLength} maxLength={maxLength} className={input} />
    </label>
  );
}

const input = "w-full rounded-xl border border-brava-border bg-white px-4 py-2.5 outline-none focus:border-brava-yellow";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full rounded-full bg-brava-yellow px-5 py-3 text-sm font-bold text-brava-black disabled:opacity-60">
      {pending ? "Criando..." : "Criar estabelecimento"}
    </button>
  );
}
