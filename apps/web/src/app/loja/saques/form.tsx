"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestWithdrawalAction,
  saveBankAccountAction,
  deleteBankAccountAction,
} from "./actions";
import { formatBRL } from "@/lib/format";

export interface BankAccountOption {
  id: string;
  apelido: string | null;
  pix_chave: string | null;
  banco: string | null;
  titular: string | null;
}

export interface LinhaOption {
  forma: "PIX" | "CARTAO";
  restante_cents: number;
  taxa_transferencia_cents: number;
}

export function WithdrawalForm({
  linhas,
  contas,
  disponivel,
}: {
  linhas: LinhaOption[];
  contas: BankAccountOption[];
  disponivel: number;
}) {
  const [state, action] = useActionState(requestWithdrawalAction, undefined);
  const [forma, setForma] = useState<"PIX" | "CARTAO">(
    linhas.find((l) => l.restante_cents > 0)?.forma ?? "PIX",
  );
  const linha = linhas.find((l) => l.forma === forma);
  const maxLinha = Math.min(linha?.restante_cents ?? 0, disponivel);
  const canRequest = disponivel >= 10000 && contas.length > 0;

  return (
    <form action={action} className="space-y-3">
      <p className="rounded-2xl bg-brava-paper px-4 py-3 text-sm">
        Disponível pra saque: <strong className="text-brava-blue">{formatBRL(disponivel)}</strong>
        <span className="ml-2 text-xs text-brava-muted">· mínimo R$ 100,00</span>
      </p>

      <div>
        <span className="mb-1 block text-sm font-medium text-brava-ink">Origem do dinheiro</span>
        <div className="flex gap-2">
          {linhas.map((l) => (
            <button
              key={l.forma}
              type="button"
              onClick={() => setForma(l.forma)}
              className={`flex-1 rounded-2xl border px-3 py-2 text-left text-sm transition ${
                forma === l.forma
                  ? "border-brava-blue bg-brava-blue/10"
                  : "border-brava-border bg-brava-card"
              }`}
            >
              <span className="block font-bold">{l.forma === "PIX" ? "💠 PIX" : "💳 Cartão"}</span>
              <span className="text-xs text-brava-muted">
                liberado: {formatBRL(l.restante_cents)}
              </span>
            </button>
          ))}
        </div>
        <input type="hidden" name="forma" value={forma} />
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Conta pra receber</span>
        <select
          name="bank_account_id"
          required
          disabled={!canRequest}
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow disabled:opacity-60"
        >
          {contas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.apelido || c.banco || "Conta"} — {c.pix_chave ?? c.titular ?? ""}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Valor a sacar (R$)</span>
        <input
          name="amount"
          required
          inputMode="decimal"
          placeholder={`Máximo ${(maxLinha / 100).toFixed(2)}`}
          disabled={!canRequest}
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow disabled:bg-brava-paper disabled:opacity-60"
        />
      </label>

      {(linha?.taxa_transferencia_cents ?? 0) > 0 && (
        <p className="text-xs text-brava-muted">
          Taxa de transferência: {formatBRL(linha!.taxa_transferencia_cents)} — descontada do valor
          transferido.
        </p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Observações (opcional)</span>
        <textarea
          name="notes"
          rows={2}
          disabled={!canRequest}
          className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow disabled:opacity-60"
        />
      </label>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}

      <Submit disabled={!canRequest} />
      {contas.length === 0 && (
        <p className="text-xs text-brava-muted">Cadastre uma conta bancária abaixo pra poder sacar.</p>
      )}
      {contas.length > 0 && disponivel < 10000 && (
        <p className="text-xs text-brava-muted">
          Você precisa ter pelo menos R$ 100,00 disponíveis pra solicitar um saque.
        </p>
      )}
    </form>
  );
}

export function BankAccountForm() {
  const [state, action] = useActionState(saveBankAccountAction, undefined);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-sm font-bold text-brava-ink"
      >
        + Cadastrar conta
      </button>
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-brava-border bg-brava-paper p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="apelido" label="Apelido (ex.: Conta principal)" />
        <Field name="pix_chave" label="Chave PIX" placeholder="CPF, email, telefone ou aleatória" />
        <Field name="titular" label="Titular" required />
        <Field name="doc_titular" label="CPF/CNPJ do titular" />
        <Field name="banco" label="Banco" />
        <Field name="agencia" label="Agência" />
        <Field name="conta" label="Conta" />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Tipo</span>
          <select
            name="tipo_conta"
            className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none"
          >
            <option value="corrente">Corrente</option>
            <option value="poupanca">Poupança</option>
          </select>
        </label>
      </div>
      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{state.ok}</p>}
      <div className="flex gap-2">
        <SubmitSmall label="Salvar conta" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-2 text-sm text-brava-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function DeleteAccountButton({ accountId }: { accountId: string }) {
  const [state, action] = useActionState(deleteBankAccountAction, undefined);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="account_id" value={accountId} />
      <button type="submit" className="text-xs text-red-600 hover:underline">
        remover
      </button>
      {state?.error && <span className="ml-2 text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brava-ink">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow"
      />
    </label>
  );
}

function Submit({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black disabled:opacity-60"
    >
      {pending ? "Solicitando…" : "💰 Solicitar saque"}
    </button>
  );
}

function SubmitSmall({ label }: { label: string }) {
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
