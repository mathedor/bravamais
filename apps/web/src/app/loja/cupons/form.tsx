"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createCouponAction } from "./actions";

export function CouponForm() {
  const [state, action] = useActionState(createCouponAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd);
        formRef.current?.reset();
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <input name="code" required placeholder="Código (ex: BRAVA10)" className={input} />
      <input name="description" placeholder="Descrição (opcional)" className={input} />
      <input name="discount_percent" type="number" min="1" max="100" placeholder="% desconto" className={input} />
      <input name="discount_value" placeholder="ou R$ fixo (ex: 10,00)" className={input} />
      <select name="tier_required" className={input}>
        <option value="">Qualquer assinante</option>
        <option value="basico">Só Básico+</option>
        <option value="premium">Só Premium+</option>
        <option value="vip">Só VIP</option>
      </select>
      <input name="valid_until" type="date" className={input} />
      {state?.error && <p className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <div className="sm:col-span-2">
        <Submit />
      </div>
    </form>
  );
}

const input =
  "rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black disabled:opacity-60"
    >
      {pending ? "Criando…" : "Criar cupom"}
    </button>
  );
}
