"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createProductAction } from "./actions";

export function ProductForm() {
  const [state, action] = useActionState(createProductAction, undefined);
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
      <input name="name" required placeholder="Nome do produto" className={input} />
      <input name="price" required type="text" inputMode="decimal" placeholder="Preço (R$)" className={input} />
      <input name="description" placeholder="Descrição curta" className={`${input} sm:col-span-2`} />
      <input name="photo_url" placeholder="URL da foto (opcional)" className={`${input} sm:col-span-2`} />
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
      {pending ? "Adicionando…" : "Adicionar produto"}
    </button>
  );
}
