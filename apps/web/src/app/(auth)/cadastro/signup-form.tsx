"use client";

import { useActionState } from "react";
import { signUpAction } from "@/app/auth/actions";
import { Wizard, type WizardStep } from "@/components/shared/wizard";

export function SignUpForm({ referralCode }: { referralCode?: string }) {
  const [state, action] = useActionState(signUpAction, undefined);

  const steps: WizardStep[] = [
    {
      id: "identidade",
      title: "Como você se chama?",
      description: "Esse é o nome que vai aparecer no seu perfil BRAVA+.",
      icon: "👋",
      content: (
        <Field
          name="full_name"
          type="text"
          label="Nome completo"
          placeholder="Seu nome"
          autoComplete="name"
          required
          autoFocus
        />
      ),
    },
    {
      id: "acesso",
      title: "Dados de acesso",
      description: "Pra entrar no app e receber notificações.",
      icon: "🔐",
      content: (
        <div className="space-y-4">
          <Field name="email" type="email" label="Email" placeholder="voce@email.com" autoComplete="email" required />
          <Field
            name="password"
            type="password"
            label="Senha"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
      ),
    },
    {
      id: "aniversario",
      title: "Quando é seu aniversário?",
      description: "Opcional — mas você ganha cupom premium presente no seu dia 🎂",
      icon: "🎁",
      content: (
        <div className="space-y-4">
          <Field name="birthdate" type="date" label="Data de nascimento" autoComplete="bday" />
          <div className="rounded-2xl border border-brava-yellow/30 bg-brava-yellow/10 p-4 text-sm text-white/80">
            <p className="font-bold text-brava-yellow">Bônus de aniversário</p>
            <p className="mt-1 text-xs">
              Todo aniversariante BRAVA+ ganha um cupom premium automático no dia + presente de coins.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "termos",
      title: "Quase lá!",
      description: "Aceite os termos e entre no clube.",
      icon: "✨",
      content: (
        <label className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80 cursor-pointer">
          <input type="checkbox" name="terms_accepted" required defaultChecked className="mt-1 h-5 w-5 shrink-0 accent-brava-yellow" />
          <span>
            Concordo com os{" "}
            <a href="/termos" target="_blank" className="text-brava-yellow hover:underline">termos de uso</a>
            {" "}e a{" "}
            <a href="/privacidade" target="_blank" className="text-brava-yellow hover:underline">política de privacidade</a>
            {" "}da BRAVA+.
          </span>
        </label>
      ),
    },
  ];

  return (
    <Wizard
      steps={steps}
      action={action}
      submitLabel="Criar minha conta"
      submitLabelPending="Criando…"
      variant="dark"
      errorMessage={state?.error}
      hiddenFields={referralCode ? [{ name: "referral_code", value: referralCode }] : undefined}
      footnote="Você pode trocar essas informações depois nas configurações do perfil."
    />
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
  autoFocus,
}: {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  autoFocus?: boolean;
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
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brava-yellow focus:bg-white/10"
      />
    </label>
  );
}
