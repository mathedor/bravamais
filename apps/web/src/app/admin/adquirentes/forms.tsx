"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveAcquirerAction,
  toggleAcquirerAction,
  saveFeeAction,
  deleteFeeAction,
} from "./actions";

export interface AcquirerData {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  observacao: string | null;
  custo_transferencia_centavos: number;
}

export interface FeeData {
  id: string;
  acquirer_id: string;
  forma: string;
  rotulo: string | null;
  taxa_percentual: number;
  taxa_fixa_centavos: number;
  parcelado: boolean;
  taxa_parcela_percentual: number;
  max_parcelas: number;
  prazo_liberacao_dias: number;
}

export function AcquirerForm({ acquirer, onDone }: { acquirer?: AcquirerData; onDone?: () => void }) {
  const [state, action] = useActionState(saveAcquirerAction, undefined);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-brava-border bg-brava-paper p-4">
      {acquirer && <input type="hidden" name="acquirer_id" value={acquirer.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="nome" label="Nome" required defaultValue={acquirer?.nome} />
        <Field name="slug" label="Slug (ex.: syncpay)" required defaultValue={acquirer?.slug} />
        <Field
          name="custo_transferencia"
          label="Custo de transferência (R$)"
          defaultValue={acquirer ? (acquirer.custo_transferencia_centavos / 100).toFixed(2) : "0"}
        />
        <Field name="observacao" label="Observação" defaultValue={acquirer?.observacao ?? ""} />
      </div>
      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}
      <div className="flex gap-2">
        <Submit label={acquirer ? "Salvar" : "Criar adquirente"} />
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-full px-4 py-2 text-sm text-brava-muted">
            Fechar
          </button>
        )}
      </div>
    </form>
  );
}

export function NewAcquirerButton() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-brava-blue px-4 py-2 text-sm font-bold text-white"
      >
        + Novo adquirente
      </button>
    );
  }
  return <AcquirerForm onDone={() => setOpen(false)} />;
}

export function EditAcquirerButton({ acquirer }: { acquirer: AcquirerData }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-xs font-bold text-brava-ink"
      >
        ✏️ Editar
      </button>
    );
  }
  return (
    <div className="w-full">
      <AcquirerForm acquirer={acquirer} onDone={() => setOpen(false)} />
    </div>
  );
}

export function ToggleAcquirerForm({ id, ativo }: { id: string; ativo: boolean }) {
  const [, action] = useActionState(toggleAcquirerAction, undefined);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="acquirer_id" value={id} />
      <ToggleSubmit ativo={ativo} />
    </form>
  );
}

function ToggleSubmit({ ativo }: { ativo: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-60 ${
        ativo ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
      }`}
    >
      {pending ? "…" : ativo ? "Desativar" : "Ativar"}
    </button>
  );
}

export function FeeForm({
  acquirerId,
  fee,
  onDone,
}: {
  acquirerId: string;
  fee?: FeeData;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveFeeAction, undefined);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-brava-border bg-brava-paper p-4">
      <input type="hidden" name="acquirer_id" value={acquirerId} />
      {fee && <input type="hidden" name="fee_id" value={fee.id} />}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Forma</span>
          <select
            name="forma"
            defaultValue={fee?.forma ?? "pix"}
            className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none"
          >
            <option value="pix">PIX</option>
            <option value="credito">Crédito</option>
            <option value="debito">Débito</option>
          </select>
        </label>
        <Field name="rotulo" label="Rótulo" defaultValue={fee?.rotulo ?? ""} placeholder="ex.: Crédito à vista" />
        <Field
          name="taxa_percentual"
          label="Taxa (%)"
          defaultValue={fee ? String(fee.taxa_percentual) : "0"}
        />
        <Field
          name="taxa_fixa"
          label="Taxa fixa (R$)"
          defaultValue={fee ? (fee.taxa_fixa_centavos / 100).toFixed(2) : "0"}
        />
        <Field
          name="prazo_liberacao_dias"
          label="Liberação (dias)"
          defaultValue={fee ? String(fee.prazo_liberacao_dias) : "0"}
        />
        <Field
          name="max_parcelas"
          label="Máx. parcelas"
          defaultValue={fee ? String(fee.max_parcelas) : "1"}
        />
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" name="parcelado" defaultChecked={fee?.parcelado} /> Parcelado
        </label>
        <Field
          name="taxa_parcela_percentual"
          label="Taxa por parcela (%/mês)"
          defaultValue={fee ? String(fee.taxa_parcela_percentual) : "0"}
        />
      </div>
      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}
      <div className="flex gap-2">
        <Submit label={fee ? "Salvar taxa" : "Adicionar taxa"} />
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-full px-4 py-2 text-sm text-brava-muted">
            Fechar
          </button>
        )}
      </div>
    </form>
  );
}

export function NewFeeButton({ acquirerId }: { acquirerId: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-xs font-bold text-brava-ink"
      >
        + Taxa
      </button>
    );
  }
  return <FeeForm acquirerId={acquirerId} onDone={() => setOpen(false)} />;
}

export function EditFeeButton({ fee }: { fee: FeeData }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-brava-blue hover:underline">
        editar
      </button>
    );
  }
  return (
    <div className="w-full">
      <FeeForm acquirerId={fee.acquirer_id} fee={fee} onDone={() => setOpen(false)} />
    </div>
  );
}

export function DeleteFeeButton({ feeId }: { feeId: string }) {
  const [, action] = useActionState(deleteFeeAction, undefined);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="fee_id" value={feeId} />
      <button type="submit" className="text-xs text-red-600 hover:underline">
        excluir
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brava-ink">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
      />
    </label>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brava-blue px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
    >
      {pending ? "Salvando…" : label}
    </button>
  );
}
