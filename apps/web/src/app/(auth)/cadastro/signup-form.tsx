"use client";

import { useActionState } from "react";
import { signUpAction } from "@/app/auth/actions";
import { Wizard, type WizardStep } from "@/components/shared/wizard";
import { AddressFields } from "@/components/shared/address-fields";

export function SignUpForm({ referralCode }: { referralCode?: string }) {
  const [state, action, isPending] = useActionState(signUpAction, undefined);

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
      id: "endereco",
      title: "Onde você mora?",
      description: "A gente usa pra mostrar parceiros próximos. Digita o CEP que o resto autocompleta.",
      icon: "📍",
      content: (
        <div className="space-y-4">
          <AddressFields requireCity variant="dark" />
          <div className="rounded-2xl border border-brava-blue/30 bg-brava-blue/10 p-4 text-sm text-white/80">
            <p className="font-bold text-brava-yellow">Por que pedimos endereço?</p>
            <p className="mt-1 text-xs">
              Pra te mostrar estabelecimentos mais perto, calcular taxa de entrega e te avisar quando passar perto de algum parceiro com promo ativa.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "extras",
      title: "Detalhes finais",
      description: "Aniversário pra ganhar cupom presente + aceite dos termos.",
      icon: "🎁",
      content: (
        <div className="space-y-4">
          <Field name="birthdate" type="date" label="Data de nascimento (opcional)" autoComplete="bday" />
          <div className="rounded-2xl border border-brava-yellow/30 bg-brava-yellow/10 p-4 text-sm text-white/80">
            <p className="font-bold text-brava-yellow">🎂 Bônus de aniversário</p>
            <p className="mt-1 text-xs">
              Todo aniversariante BRAVA+ ganha cupom premium automático + presente de coins no dia.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-white/80">
            <p className="font-bold text-emerald-300">🎁 7 dias grátis do plano Básico</p>
            <p className="mt-1 text-xs">
              Você entra direto com acesso a cupons, fidelidade, carteirinha QR e BRAVA Coins. Sem cobrança.
            </p>
          </div>
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
        </div>
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
      isPending={isPending}
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
