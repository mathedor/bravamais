"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  adminUpdateUserBasicAction,
  adminResetUserPasswordAction,
  adminChangeUserRoleAction,
  adminToggleUserActiveAction,
} from "./actions";

interface Props {
  user: {
    id: string;
    full_name: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    role: string;
    is_active: boolean;
  };
}

export function UserAdminActions({ user }: Props) {
  return (
    <div className="space-y-6">
      <BasicForm user={user} />
      <PasswordForm userId={user.id} />
      <RoleForm userId={user.id} currentRole={user.role} />
      <DangerZone userId={user.id} isActive={user.is_active} />
    </div>
  );
}

function BasicForm({ user }: Props) {
  const [state, action] = useActionState(adminUpdateUserBasicAction, undefined);
  return (
    <fieldset className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-brava-blue">Dados cadastrais</legend>
      <form action={action} className="space-y-3">
        <input type="hidden" name="user_id" value={user.id} />
        <Field name="full_name" label="Nome completo" defaultValue={user.full_name ?? ""} />
        <Field name="phone" label="Telefone" defaultValue={user.phone ?? ""} />
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <Field name="city" label="Cidade" defaultValue={user.city ?? ""} />
          <Field name="state" label="UF" defaultValue={user.state ?? ""} maxLength={2} />
        </div>
        <Feedback state={state} />
        <SubmitBtn>Salvar</SubmitBtn>
      </form>
    </fieldset>
  );
}

function PasswordForm({ userId }: { userId: string }) {
  const [state, action] = useActionState(adminResetUserPasswordAction, undefined);
  return (
    <fieldset className="rounded-3xl border border-brava-yellow/40 bg-brava-yellow/5 p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-brava-blue">Redefinir senha</legend>
      <form action={action} className="space-y-3">
        <input type="hidden" name="user_id" value={userId} />
        <Field name="new_password" label="Nova senha (mín 8 caracteres)" type="password" minLength={8} />
        <p className="text-xs text-brava-muted">Use só em casos de emergência. Avise o usuário por canal seguro.</p>
        <Feedback state={state} />
        <SubmitBtn>Trocar senha</SubmitBtn>
      </form>
    </fieldset>
  );
}

function RoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [state, action] = useActionState(adminChangeUserRoleAction, undefined);
  return (
    <fieldset className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-brava-blue">Permissão</legend>
      <form action={action} className="space-y-3">
        <input type="hidden" name="user_id" value={userId} />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Role</span>
          <select name="role" defaultValue={currentRole} className={input}>
            <option value="subscriber">Assinante</option>
            <option value="establishment">Estabelecimento</option>
            <option value="commercial">Comercial</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <Feedback state={state} />
        <SubmitBtn>Atualizar role</SubmitBtn>
      </form>
    </fieldset>
  );
}

function DangerZone({ userId, isActive }: { userId: string; isActive: boolean }) {
  return (
    <fieldset className="rounded-3xl border border-red-200 bg-red-50/40 p-5">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-red-700">Status da conta</legend>
      <p className="text-sm text-brava-muted">
        Conta atual: <strong className={isActive ? "text-green-700" : "text-red-700"}>{isActive ? "ATIVA" : "SUSPENSA"}</strong>
      </p>
      <form action={adminToggleUserActiveAction} className="mt-3">
        <input type="hidden" name="user_id" value={userId} />
        <input type="hidden" name="is_active" value={String(isActive)} />
        <button
          type="submit"
          className={`rounded-full px-5 py-2.5 text-xs font-bold ${isActive ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
        >
          {isActive ? "Suspender conta" : "Reativar conta"}
        </button>
      </form>
    </fieldset>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  minLength,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brava-ink">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        minLength={minLength}
        maxLength={maxLength}
        className={input}
      />
    </label>
  );
}

const input =
  "w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow";

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
