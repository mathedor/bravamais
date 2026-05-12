"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  adminUpdateEstablishmentBasicAction,
  adminResetOwnerPasswordAction,
  adminToggleEstablishmentActiveAction,
  adminToggleEstablishmentVerifiedAction,
} from "./actions";

interface EstablishmentBasic {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_active: boolean;
  is_verified: boolean;
}

interface Props {
  establishment: EstablishmentBasic;
  ownerId: string;
  ownerEmail: string | null;
}

export function EstablishmentAdminActions({ establishment, ownerId }: Props) {
  return (
    <div className="space-y-6">
      <BasicForm est={establishment} />
      <OwnerPasswordForm ownerId={ownerId} estabId={establishment.id} />
      <DangerZone est={establishment} />
    </div>
  );
}

function BasicForm({ est }: { est: EstablishmentBasic }) {
  const [state, action] = useActionState(adminUpdateEstablishmentBasicAction, undefined);
  return (
    <fieldset className="rounded-3xl border border-brava-border bg-white p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-brava-blue">Dados cadastrais (admin)</legend>
      <p className="-mt-1 mb-3 text-xs text-brava-muted">
        Mexa só no que é cadastro/identificação. Catálogo, cupons, stories, fidelidade — quem opera é o lojista no /loja.
      </p>
      <form action={action} className="space-y-3">
        <input type="hidden" name="estab_id" value={est.id} />
        <Field name="name" label="Nome" defaultValue={est.name} required />
        <Field name="slug" label="Slug (URL)" defaultValue={est.slug} required />
        <Field name="tagline" label="Slogan" defaultValue={est.tagline ?? ""} />
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <Field name="city" label="Cidade" defaultValue={est.city ?? ""} />
          <Field name="state" label="UF" defaultValue={est.state ?? ""} maxLength={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="phone" label="Telefone" defaultValue={est.phone ?? ""} />
          <Field name="whatsapp" label="WhatsApp" defaultValue={est.whatsapp ?? ""} />
        </div>
        <Feedback state={state} />
        <SubmitBtn>Salvar cadastrais</SubmitBtn>
      </form>
    </fieldset>
  );
}

function OwnerPasswordForm({ ownerId, estabId }: { ownerId: string; estabId: string }) {
  const [state, action] = useActionState(adminResetOwnerPasswordAction, undefined);
  return (
    <fieldset className="rounded-3xl border border-brava-yellow/40 bg-brava-yellow/5 p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-brava-blue">Senha do dono</legend>
      <form action={action} className="space-y-3">
        <input type="hidden" name="owner_id" value={ownerId} />
        <input type="hidden" name="estab_id" value={estabId} />
        <Field name="new_password" label="Nova senha (mín 8 caracteres)" type="password" minLength={8} />
        <p className="text-xs text-brava-muted">Avise o dono em canal seguro depois de aplicar.</p>
        <Feedback state={state} />
        <SubmitBtn>Trocar senha</SubmitBtn>
      </form>
    </fieldset>
  );
}

function DangerZone({ est }: { est: EstablishmentBasic }) {
  return (
    <fieldset className="rounded-3xl border border-red-200 bg-red-50/40 p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-red-700">Status</legend>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span>
            Loja: <strong className={est.is_active ? "text-green-700" : "text-red-700"}>{est.is_active ? "ATIVA" : "SUSPENSA"}</strong>
          </span>
          <form action={adminToggleEstablishmentActiveAction}>
            <input type="hidden" name="estab_id" value={est.id} />
            <input type="hidden" name="is_active" value={String(est.is_active)} />
            <input type="hidden" name="slug" value={est.slug} />
            <button type="submit" className={`rounded-full px-4 py-1.5 text-xs font-bold ${est.is_active ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
              {est.is_active ? "Suspender" : "Reativar"}
            </button>
          </form>
        </div>
        <div className="flex items-center justify-between">
          <span>
            Selo verificado:{" "}
            <strong className={est.is_verified ? "text-brava-blue" : "text-brava-muted"}>{est.is_verified ? "SIM" : "NÃO"}</strong>
          </span>
          <form action={adminToggleEstablishmentVerifiedAction}>
            <input type="hidden" name="estab_id" value={est.id} />
            <input type="hidden" name="is_verified" value={String(est.is_verified)} />
            <input type="hidden" name="slug" value={est.slug} />
            <button type="submit" className="rounded-full bg-brava-blue px-4 py-1.5 text-xs font-bold text-white">
              {est.is_verified ? "Remover selo" : "Verificar"}
            </button>
          </form>
        </div>
      </div>
    </fieldset>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
  maxLength,
  minLength,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brava-ink">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        className="w-full rounded-xl border border-brava-border bg-white px-4 py-2.5 outline-none focus:border-brava-yellow"
      />
    </label>
  );
}

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brava-black px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"
    >
      {pending ? "Salvando…" : children}
    </button>
  );
}

function Feedback({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>;
  if (state.ok) return <p className="rounded-xl bg-green-50 px-3 py-2 text-xs text-green-700">{state.ok}</p>;
  return null;
}
