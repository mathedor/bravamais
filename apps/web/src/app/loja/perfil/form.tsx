"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Establishment } from "@/lib/supabase/types";
import { updateProfileAction } from "./actions";
import { MaskedInput } from "@/components/shared/masked-input";
import { AddressFields } from "@/components/shared/address-fields";
import { FileUpload } from "@/components/shared/file-upload";

export function ProfileForm({ establishment }: { establishment: Establishment }) {
  const [state, action] = useActionState(updateProfileAction, undefined);

  return (
    <form action={action} className="space-y-6">
      <Group title="Identidade">
        <Field name="name" label="Nome" defaultValue={establishment.name} required />
        <Field name="tagline" label="Slogan" defaultValue={establishment.tagline ?? ""} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brava-ink">Descrição</span>
          <textarea
            name="description"
            defaultValue={establishment.description ?? ""}
            rows={4}
            className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-3 outline-none focus:border-brava-yellow"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-brava-ink">Logo da loja</span>
            <FileUpload
              bucket="establishments"
              prefix={`${establishment.id}/logo`}
              name="logo_url"
              defaultUrl={establishment.logo_url ?? ""}
              label="Logo"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-brava-ink">Foto de capa</span>
            <FileUpload
              bucket="establishments"
              prefix={`${establishment.id}/cover`}
              name="cover_url"
              defaultUrl={establishment.cover_url ?? ""}
              label="Capa"
            />
          </div>
        </div>
      </Group>

      <Group title="Contato">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brava-ink">Telefone</span>
            <MaskedInput
              mask="phone"
              name="phone"
              defaultValue={establishment.phone ?? ""}
              placeholder="(11) 0000-0000"
              inputMode="tel"
              className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brava-ink">WhatsApp</span>
            <MaskedInput
              mask="phone"
              name="whatsapp"
              defaultValue={establishment.whatsapp ?? ""}
              placeholder="(11) 9 0000-0000"
              inputMode="tel"
              className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
            />
          </label>
          <Field name="instagram" label="Instagram" defaultValue={establishment.instagram ?? ""} placeholder="@usuario" />
          <Field name="website" label="Website" defaultValue={establishment.website ?? ""} placeholder="https://..." />
        </div>
      </Group>

      <Group title="Endereço">
        <AddressFields
          requireCity
          initial={{
            cep: establishment.cep,
            street: establishment.street,
            number: establishment.number,
            neighborhood: establishment.neighborhood,
            city: establishment.city,
            state: establishment.state,
          }}
        />
      </Group>

      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Perfil atualizado.</p>
      )}

      <SaveButton />
    </form>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-brava-border bg-brava-card p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-brava-blue">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  name,
  label,
  defaultValue,
  required,
  placeholder,
  maxLength,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brava-ink">
        {label} {required && <span className="text-brava-blue">*</span>}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
      />
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brava-black px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
    >
      {pending ? "Salvando…" : "Salvar alterações"}
    </button>
  );
}
