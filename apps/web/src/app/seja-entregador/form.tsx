"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { applyDelivererAction } from "./actions";

export function ApplyForm() {
  const [state, action] = useActionState(applyDelivererAction, undefined);

  return (
    <form action={action} encType="multipart/form-data" className="space-y-4">
      <Section title="📋 Dados pessoais">
        <div className="grid grid-cols-2 gap-3">
          <Field name="full_name" label="Nome completo" required />
          <Field name="birth_date" type="date" label="Data nascimento" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="cpf" label="CPF" required placeholder="000.000.000-00" />
          <Field name="rg" label="RG" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="phone" label="Telefone" required placeholder="(11) 99999-9999" />
          <Field name="whatsapp" label="WhatsApp" placeholder="(11) 99999-9999" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="city" label="Cidade" />
          <Field name="state" label="UF" maxLength={2} />
        </div>
      </Section>

      <Section title="🛵 Veículo">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-white/60">Tipo</span>
            <select name="vehicle" defaultValue="moto" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <option value="moto">Moto</option>
              <option value="carro">Carro</option>
              <option value="bike">Bicicleta</option>
              <option value="a_pe">A pé</option>
              <option value="van">Van</option>
            </select>
          </label>
          <Field name="vehicle_model" label="Modelo" placeholder="Honda 160" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="vehicle_color" label="Cor" placeholder="Vermelha" />
          <Field name="plate" label="Placa" placeholder="ABC-1234" />
        </div>
        <Field name="cnh_number" label="Número da CNH" placeholder="00000000000" />
      </Section>

      <Section title="📸 Documentos (fotos legíveis)">
        <FileField name="photo" label="Foto sua de rosto" />
        <FileField name="cnh_image" label="Foto da CNH (frente)" />
        <FileField name="rg_image" label="Foto do RG (frente)" />
        <FileField name="cpf_image" label="Foto do CPF / comprovante" />
      </Section>

      <Section title="🔐 Login pro app">
        <div className="grid grid-cols-2 gap-3">
          <Field name="email" type="email" label="Email" required />
          <Field name="password" type="password" label="Senha (mín. 8)" required />
        </div>
      </Section>

      {state?.error && (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{state.error}</p>
      )}

      <Submit />

      <p className="text-xs text-white/40">
        Ao se cadastrar você autoriza a BRAVA+ a verificar seus documentos. Após aprovação, sua ficha fica disponível pros
        estabelecimentos da rede que poderão entrar em contato pra contratá-lo. A relação contratual é exclusivamente
        entre você e o estabelecimento — a BRAVA+ é apenas a ponte de conexão.
      </p>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wide text-brava-yellow">{title}</legend>
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

function Field({ name, label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-white/60">{label}</span>
      <input
        name={name}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brava-yellow"
        {...rest}
      />
    </label>
  );
}

function FileField({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-white/60">{label}</span>
      <input
        type="file"
        accept="image/*,application/pdf"
        name={name}
        className="block w-full text-sm text-white/80 file:mr-3 file:rounded-full file:border-0 file:bg-brava-yellow file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-brava-black"
      />
    </label>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brava-yellow px-6 py-4 text-base font-black text-brava-black shadow-xl shadow-brava-yellow/20 transition hover:scale-[1.01] disabled:opacity-60"
    >
      {pending ? "Enviando cadastro..." : "Enviar candidatura"}
    </button>
  );
}
