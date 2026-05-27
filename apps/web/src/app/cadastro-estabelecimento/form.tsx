"use client";

import { useActionState } from "react";
import { signupEstablishmentAction } from "./actions";
import { MaskedInput } from "@/components/shared/masked-input";
import { AddressFields } from "@/components/shared/address-fields";
import { Wizard, type WizardStep } from "@/components/shared/wizard";

interface Props {
  categorias: { id: string; slug: string; name: string }[];
  affCode?: string;
}

export function EstablishmentSignUpForm({ categorias, affCode }: Props) {
  const [state, action, isPending] = useActionState(signupEstablishmentAction, undefined);

  const steps: WizardStep[] = [
    {
      id: "responsavel",
      title: "Quem é o responsável?",
      description: "Dados de login do administrador da loja.",
      icon: "👋",
      content: (
        <div className="space-y-4">
          <Field name="full_name" label="Seu nome completo" required autoFocus />
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="email" label="Email" type="email" autoComplete="email" required />
            <Field
              name="password"
              label="Senha"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
        </div>
      ),
    },
    {
      id: "loja",
      title: "Sobre a sua loja",
      description: "Como ela aparece no clube.",
      icon: "🏪",
      content: (
        <div className="space-y-4">
          <Field name="estab_name" label="Nome da loja" required placeholder="Ex: Café Mineiro" />
          <Field name="tagline" label="Slogan ou frase curta" placeholder="Ex: Cafeteria artesanal" />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/80">Descrição</span>
            <textarea
              name="description"
              rows={4}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brava-yellow focus:bg-white/10"
              placeholder="Conte rapidamente o que sua loja oferece…"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/80">
              Categoria principal <span className="text-brava-yellow">*</span>
            </span>
            <select
              name="category_id"
              required
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-brava-yellow focus:bg-white/10"
            >
              <option value="" className="bg-brava-black">— Selecione —</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id} className="bg-brava-black">
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      ),
    },
    {
      id: "contato",
      title: "Como entrar em contato?",
      description: "Telefone e WhatsApp aparecem na ficha do estabelecimento.",
      icon: "📞",
      content: (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/80">Telefone</span>
            <MaskedInput
              mask="phone"
              name="phone"
              placeholder="(11) 0000-0000"
              inputMode="tel"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brava-yellow focus:bg-white/10"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/80">WhatsApp</span>
            <MaskedInput
              mask="phone"
              name="whatsapp"
              placeholder="(11) 9 0000-0000"
              inputMode="tel"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brava-yellow focus:bg-white/10"
            />
          </label>
        </div>
      ),
    },
    {
      id: "endereco",
      title: "Onde fica?",
      description: "Endereço completo. O CEP autocompleta cidade, bairro e estado.",
      icon: "📍",
      content: <AddressFields requireCity variant="dark" />,
    },
  ];

  return (
    <Wizard
      steps={steps}
      action={action}
      submitLabel="Cadastrar minha loja"
      submitLabelPending="Cadastrando…"
      variant="dark"
      isPending={isPending}
      errorMessage={state?.error}
      hiddenFields={affCode ? [{ name: "aff_code", value: affCode }] : undefined}
      footnote="Ao criar, sua loja entra em fase de revisão. Nossa equipe valida em até 24h úteis e libera no clube."
    />
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
  minLength,
  maxLength,
  autoComplete,
  autoFocus,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/80">
        {label} {required && <span className="text-brava-yellow">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brava-yellow focus:bg-white/10"
      />
    </label>
  );
}
