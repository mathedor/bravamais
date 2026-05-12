"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  adminCreateCouponAction,
  adminCreateProductAction,
  adminUpsertLoyaltyAction,
} from "./actions";

const input = "w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow";

export function NewCouponForm({ estabId, slug }: { estabId: string; slug: string }) {
  const [state, action] = useActionState(adminCreateCouponAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={async (fd) => { await action(fd); ref.current?.reset(); }} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="estab_id" value={estabId} />
      <input type="hidden" name="slug" value={slug} />
      <input name="code" required placeholder="Código (ex: BRAVA10)" className={input} />
      <input name="description" placeholder="Descrição" className={input} />
      <input name="discount_percent" type="number" min="1" max="100" placeholder="% desconto" className={input} />
      <input name="discount_value" placeholder="ou R$ fixo" className={input} />
      {state?.error && <p className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>}
      {state?.ok && <p className="sm:col-span-2 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-700">{state.ok}</p>}
      <Submit className="sm:col-span-2" label="Criar cupom" />
    </form>
  );
}

export function NewProductForm({ estabId, slug }: { estabId: string; slug: string }) {
  const [state, action] = useActionState(adminCreateProductAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={async (fd) => { await action(fd); ref.current?.reset(); }} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="estab_id" value={estabId} />
      <input type="hidden" name="slug" value={slug} />
      <input name="name" required placeholder="Nome do produto" className={input} />
      <input name="price" required placeholder="Preço (R$)" className={input} />
      <input name="description" placeholder="Descrição" className={`${input} sm:col-span-2`} />
      {state?.error && <p className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>}
      <Submit className="sm:col-span-2" label="Adicionar produto" />
    </form>
  );
}

interface ClubData {
  name: string | null;
  benefit_description: string | null;
  visits_required: number | null;
}

export function LoyaltyForm({
  estabId,
  slug,
  club,
}: {
  estabId: string;
  slug: string;
  club: ClubData | null;
}) {
  const [state, action] = useActionState(adminUpsertLoyaltyAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="estab_id" value={estabId} />
      <input type="hidden" name="slug" value={slug} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Nome do clube</span>
        <input name="name" defaultValue={club?.name ?? ""} required className={input} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Visitas necessárias</span>
        <input name="visits_required" type="number" min="1" required defaultValue={club?.visits_required ?? 5} className={input} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Benefício</span>
        <input name="benefit_description" defaultValue={club?.benefit_description ?? ""} required className={input} />
      </label>
      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-xs text-green-700">{state.ok}</p>}
      <Submit label={club ? "Atualizar" : "Criar clube"} />
    </form>
  );
}

function Submit({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <div className={className}>
      <button type="submit" disabled={pending} className="w-full rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black disabled:opacity-60">
        {pending ? "Salvando…" : label}
      </button>
    </div>
  );
}
