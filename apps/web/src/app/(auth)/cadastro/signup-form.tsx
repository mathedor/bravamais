"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction } from "@/app/auth/actions";

export function SignUpForm({ referralCode }: { referralCode?: string }) {
  const [state, action] = useActionState(signUpAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <Field name="full_name" type="text" label="Nome completo" placeholder="Seu nome" autoComplete="name" required />
      <Field name="email" type="email" label="Email" placeholder="voce@email.com" autoComplete="email" required />
      <Field name="birthdate" type="date" label="Data de nascimento (opcional, ganhe presente no seu aniversário)" autoComplete="bday" />
      <Field
        name="password"
        type="password"
        label="Senha"
        placeholder="mínimo 8 caracteres"
        autoComplete="new-password"
        required
        minLength={8}
      />
      {referralCode && <input type="hidden" name="referral_code" value={referralCode} />}

      <label className="flex items-start gap-2 text-xs text-white/70">
        <input type="checkbox" name="terms_accepted" required defaultChecked className="mt-1 h-4 w-4 accent-brava-yellow" />
        <span>
          Concordo com os{" "}
          <a href="/termos" target="_blank" className="text-brava-yellow hover:underline">termos de uso</a>
          {" "}e{" "}
          <a href="/privacidade" target="_blank" className="text-brava-yellow hover:underline">política de privacidade</a>.
        </span>
      </label>

      {state?.error && (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <SubmitButton>Criar minha conta</SubmitButton>

      <p className="text-center text-xs leading-relaxed text-white/50">
        Ao continuar, você concorda com nossos termos de uso e política de privacidade.
      </p>
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
  minLength,
}: {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
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
        minLength={minLength}
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
      {pending ? "Criando..." : children}
    </button>
  );
}
