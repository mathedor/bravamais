"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminCreateUserAction } from "../actions";

export function CreateUserForm() {
  const [state, action] = useActionState(adminCreateUserAction, undefined);

  return (
    <form action={action} className="space-y-4 rounded-3xl border border-brava-border bg-white p-6">
      <Field name="full_name" label="Nome completo" required />
      <Field name="email" label="Email" type="email" required />
      <Field name="password" label="Senha (mín 8)" type="password" minLength={8} required />
      <Field name="phone" label="Telefone" />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Role</span>
        <select name="role" defaultValue="subscriber" className={input}>
          <option value="subscriber">Assinante</option>
          <option value="establishment">Estabelecimento</option>
          <option value="commercial">Comercial</option>
          <option value="admin">Admin</option>
        </select>
      </label>
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
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}{required && <span className="text-red-600"> *</span>}</span>
      <input name={name} type={type} required={required} minLength={minLength} className={input} />
    </label>
  );
}

const input = "w-full rounded-xl border border-brava-border bg-white px-4 py-2.5 outline-none focus:border-brava-yellow";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full rounded-full bg-brava-yellow px-5 py-3 text-sm font-bold text-brava-black disabled:opacity-60">
      {pending ? "Criando..." : "Criar usuário"}
    </button>
  );
}
