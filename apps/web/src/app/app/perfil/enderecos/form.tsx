"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createAddressAction } from "./actions";

interface CepFields {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export function AddressForm() {
  const [state, action] = useActionState(createAddressAction, undefined);
  const [cepFields, setCepFields] = useState<CepFields>({ street: "", neighborhood: "", city: "", state: "" });
  const [cepLoading, setCepLoading] = useState(false);

  async function onCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const j = await res.json();
      if (!j.erro) {
        setCepFields({
          street: j.logradouro ?? "",
          neighborhood: j.bairro ?? "",
          city: j.localidade ?? "",
          state: j.uf ?? "",
        });
      }
    } catch {}
    setCepLoading(false);
  }

  return (
    <form action={action} className="space-y-3" key={state?.ok ? "reset" : "form"}>
      <div className="grid grid-cols-2 gap-3">
        <Field name="label" label="Rótulo" placeholder="Casa, Trabalho..." defaultValue="Casa" />
        <Field name="cep" label="CEP" placeholder="00000-000" required onBlur={onCepBlur} maxLength={9} />
      </div>
      {cepLoading && <p className="text-xs text-brava-muted">Buscando endereço...</p>}
      <div className="grid grid-cols-3 gap-3">
        <Field name="street" label="Rua" defaultValue={cepFields.street} required className="col-span-2" />
        <Field name="number" label="Número" />
      </div>
      <Field name="complement" label="Complemento" placeholder="Apto, bloco..." />
      <div className="grid grid-cols-3 gap-3">
        <Field name="neighborhood" label="Bairro" defaultValue={cepFields.neighborhood} />
        <Field name="city" label="Cidade" defaultValue={cepFields.city} required className="col-span-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field name="state" label="UF" defaultValue={cepFields.state} maxLength={2} required />
        <Field name="recipient_phone" label="WhatsApp do destinatário" placeholder="(11) 99999-9999" />
      </div>
      <Field name="reference" label="Ponto de referência" placeholder="Ex: portão azul, perto da padaria" />
      <label className="flex items-center gap-2 text-sm text-brava-ink">
        <input type="checkbox" name="is_default" defaultChecked /> Usar como endereço padrão
      </label>

      {state?.error && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          Endereço salvo!
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function Field({
  name,
  label,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brava-muted">{label}</span>
      <input
        name={name}
        className="w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none focus:border-brava-blue"
        {...rest}
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
      className="w-full rounded-full bg-brava-blue px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.01] disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Salvar endereço"}
    </button>
  );
}
