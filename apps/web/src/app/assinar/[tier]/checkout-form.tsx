"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { startPixAction, chargeCardAction, simulatePixPaid } from "./actions";

type Tier = "basico" | "premium" | "vip";
type Method = "pix" | "cartao";

export function CheckoutForm({ tier }: { tier: Tier }) {
  const [method, setMethod] = useState<Method>("pix");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-brava-border bg-brava-paper p-1">
        <MethodTab active={method === "pix"} onClick={() => setMethod("pix")} label="PIX" />
        <MethodTab active={method === "cartao"} onClick={() => setMethod("cartao")} label="Cartão" />
      </div>

      {method === "pix" ? <PixCheckout tier={tier} /> : <CardCheckout tier={tier} />}
    </div>
  );
}

function MethodTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? "bg-brava-black text-white" : "text-brava-ink hover:bg-white"}`}
    >
      {label}
    </button>
  );
}

function PixCheckout({ tier }: { tier: Tier }) {
  const [state, action] = useActionState(startPixAction, undefined);

  if (state?.ok && state.pix) {
    return (
      <div className="rounded-2xl border border-brava-yellow bg-brava-yellow/10 p-6">
        <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-4">
          <div className="text-center text-xs text-brava-muted">
            QR PIX (modo simulação)
            <br />
            <span className="mt-2 block font-mono text-[10px] text-brava-ink">{state.pix.chargeId}</span>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-brava-ink">Escaneie no app do seu banco</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-center text-xs text-brava-muted">copia e cola</summary>
          <textarea
            readOnly
            value={state.pix.copia}
            className="mt-2 w-full rounded-xl border border-brava-border bg-white px-3 py-2 font-mono text-xs"
            rows={3}
          />
        </details>
        <form
          action={async () => {
            await simulatePixPaid(state.pix!.chargeId, tier);
          }}
          className="mt-6"
        >
          <SimulateButton />
        </form>
        <p className="mt-3 text-center text-[11px] text-brava-muted">
          ⚠️ Botão de simulação ativo enquanto a integração Efí não está com credenciais reais.
        </p>
      </div>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="tier" value={tier} />
      {state?.error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <PixGenerateButton />
    </form>
  );
}

function PixGenerateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brava-yellow px-6 py-3.5 text-base font-bold text-brava-black disabled:opacity-60"
    >
      {pending ? "Gerando..." : "Gerar QR PIX"}
    </button>
  );
}

function SimulateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-green-600 px-6 py-3.5 text-sm font-bold text-white disabled:opacity-60"
    >
      {pending ? "Confirmando..." : "Simular pagamento PIX"}
    </button>
  );
}

function CardCheckout({ tier }: { tier: Tier }) {
  const [state, action] = useActionState(chargeCardAction, undefined);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="tier" value={tier} />

      <Field name="card_number" label="Número do cartão" placeholder="0000 0000 0000 0000" maxLength={19} />
      <div className="grid grid-cols-2 gap-3">
        <Field name="card_expiry" label="Validade" placeholder="MM/AA" maxLength={5} />
        <Field name="card_cvc" label="CVV" placeholder="123" maxLength={4} />
      </div>
      <Field name="card_name" label="Nome impresso no cartão" placeholder="JOAO DA SILVA" />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">Parcelas</span>
        <select name="installments" className={input}>
          <option value="1">1x</option>
          <option value="3">3x sem juros</option>
          <option value="6">6x sem juros</option>
          <option value="12">12x sem juros</option>
        </select>
      </label>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <CardSubmit />
      <p className="text-center text-[11px] text-brava-muted">
        ⚠️ Modo simulação: número terminando em <strong>1</strong> é recusado, outros são aprovados.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  maxLength,
}: {
  name: string;
  label: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brava-ink">{label}</span>
      <input name={name} placeholder={placeholder} maxLength={maxLength} className={input} />
    </label>
  );
}

const input = "w-full rounded-xl border border-brava-border bg-white px-4 py-2.5 outline-none focus:border-brava-yellow";

function CardSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brava-yellow px-6 py-3.5 text-base font-bold text-brava-black disabled:opacity-60"
    >
      {pending ? "Cobrando..." : "Pagar e ativar"}
    </button>
  );
}
