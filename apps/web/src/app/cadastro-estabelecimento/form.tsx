"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupEstablishmentAction } from "./actions";
import { MaskedInput } from "@/components/shared/masked-input";
import { AddressFields } from "@/components/shared/address-fields";

interface Props {
  categorias: { id: string; slug: string; name: string }[];
}

export function EstablishmentSignUpForm({ categorias }: Props) {
  const [state, action] = useActionState(signupEstablishmentAction, undefined);

  return (
    <form action={action} className="grid gap-6">
      <Group title="Seus dados">
        <Field name="full_name" label="Seu nome completo" required />
        <Field name="email" label="Email" type="email" required />
        <Field name="password" label="Senha" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" />
      </Group>

      <Group title="Seu estabelecimento">
        <Field name="estab_name" label="Nome da loja" required />
        <Field name="tagline" label="Slogan ou frase curta" placeholder="Ex: 'Cafeteria artesanal'" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/80">Descrição</span>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brava-yellow focus:bg-white/10"
            placeholder="Conte rapidamente o que sua loja oferece..."
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/80">Categoria principal</span>
          <select
            name="category_id"
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
      </Group>

      <Group title="Endereço">
        <AddressFields requireCity variant="dark" />
      </Group>

      <Group title="Contato">
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
      </Group>

      {state?.error && (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-center text-xs text-white/50">
        Ao criar, sua loja entra em fase de revisão. Nossa equipe valida em até 24h úteis e libera no clube.
      </p>
    </form>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-brava-yellow">{title}</legend>
      {children}
    </fieldset>
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
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
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
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brava-yellow focus:bg-white/10"
      />
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brava-yellow px-6 py-4 text-base font-bold text-brava-black shadow-xl shadow-brava-yellow/30 transition-transform hover:scale-[1.01] disabled:opacity-60"
    >
      {pending ? "Cadastrando..." : "Cadastrar minha loja"}
    </button>
  );
}
