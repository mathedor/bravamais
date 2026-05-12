"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInAction } from "@/app/auth/actions";

export function SignInForm() {
  const [state, action] = useActionState(signInAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field name="email" type="email" label="Email" placeholder="voce@email.com" autoComplete="email" required />
      <Field name="password" type="password" label="Senha" placeholder="••••••••" autoComplete="current-password" required />

      {state?.error && (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <SubmitButton>Entrar</SubmitButton>
    </form>
  );
}

function Field({
  name,
  type,
  label,
  placeholder,
  autoComplete,
  required,
}: {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/80">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brava-yellow focus:bg-white/10"
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
      className="w-full rounded-full bg-brava-yellow px-6 py-3.5 text-base font-bold text-brava-black shadow-xl shadow-brava-yellow/20 transition-transform hover:scale-[1.01] disabled:opacity-60"
    >
      {pending ? "Aguarde..." : children}
    </button>
  );
}
