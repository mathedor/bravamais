"use client";

import { useActionState } from "react";
import { applyDelivererAction } from "./actions";
import { Wizard, type WizardStep } from "@/components/shared/wizard";

export function ApplyForm() {
  const [state, action, isPending] = useActionState(applyDelivererAction, undefined);

  const steps: WizardStep[] = [
    {
      id: "pessoais",
      title: "Seus dados",
      description: "Pra cadastrar você na rede BRAVA+.",
      icon: "📋",
      content: (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="full_name" label="Nome completo" required autoComplete="name" autoFocus />
            <Field name="birth_date" type="date" label="Data nascimento" autoComplete="bday" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="cpf" label="CPF" required placeholder="000.000.000-00" />
            <Field name="rg" label="RG" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="phone" label="Telefone" required placeholder="(11) 99999-9999" autoComplete="tel" />
            <Field name="whatsapp" label="WhatsApp" placeholder="(11) 99999-9999" />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <Field name="city" label="Cidade" />
            <Field name="state" label="UF" maxLength={2} placeholder="SP" />
          </div>
        </div>
      ),
    },
    {
      id: "veiculo",
      title: "Sobre seu veículo",
      description: "O que você usa pra entregar.",
      icon: "🛵",
      content: (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-white/60">Tipo</span>
              <select
                name="vehicle"
                defaultValue="moto"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brava-yellow"
              >
                <option value="moto" className="bg-brava-black">Moto</option>
                <option value="carro" className="bg-brava-black">Carro</option>
                <option value="bike" className="bg-brava-black">Bicicleta</option>
                <option value="a_pe" className="bg-brava-black">A pé</option>
                <option value="van" className="bg-brava-black">Van</option>
              </select>
            </label>
            <Field name="vehicle_model" label="Modelo" placeholder="Honda 160" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="vehicle_color" label="Cor" placeholder="Vermelha" />
            <Field name="plate" label="Placa" placeholder="ABC-1234" />
          </div>
          <Field name="cnh_number" label="Número da CNH" placeholder="00000000000" />
        </div>
      ),
    },
    {
      id: "documentos",
      title: "Documentos",
      description: "Fotos legíveis pra validação. CNH/RG/CPF + sua foto.",
      icon: "📸",
      content: (
        <div className="space-y-3">
          <FileField name="photo" label="Foto sua de rosto" />
          <FileField name="cnh_image" label="Foto da CNH (frente)" />
          <FileField name="rg_image" label="Foto do RG (frente)" />
          <FileField name="cpf_image" label="Foto do CPF / comprovante" />
          <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
            🔒 Suas fotos ficam em bucket privado. Só admin BRAVA+ acessa via URLs assinadas que expiram em 5 minutos.
          </p>
        </div>
      ),
    },
    {
      id: "acesso",
      title: "Login do app",
      description: "Suas credenciais pro app do entregador.",
      icon: "🔐",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="email" type="email" label="Email" required autoComplete="email" />
          <Field name="password" type="password" label="Senha (mín. 8)" required minLength={8} autoComplete="new-password" />
        </div>
      ),
    },
  ];

  return (
    <Wizard
      steps={steps}
      action={action}
      submitLabel="Enviar candidatura"
      submitLabelPending="Enviando cadastro…"
      variant="dark"
      encType="multipart/form-data"
      isPending={isPending}
      errorMessage={state?.error}
      footnote="Ao se cadastrar você autoriza a BRAVA+ a verificar seus documentos. Após aprovação, sua ficha fica disponível pros estabelecimentos da rede que poderão entrar em contato pra contratá-lo. A relação contratual é exclusivamente entre você e o estabelecimento — a BRAVA+ é apenas a ponte de conexão."
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
      <span className="mb-1 block text-xs font-semibold uppercase text-white/60">
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
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-brava-yellow"
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
