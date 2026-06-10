"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTagRechargePix,
  createTagRechargeCard,
  subscribeMonthlyAction,
  cancelMonthlyAction,
} from "./actions";
import { CheckoutPanel } from "@/components/payments/checkout-panel";

interface Pack {
  id: string;
  name: string;
  amount_cents: number;
  bonus_cents: number;
}

interface Settings {
  monthly_plan_cents: number;
  monthly_plan_credit_cents: number;
}

interface Props {
  packs: Pack[];
  settings: Settings | null;
  monthlyActive: boolean;
}

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function RechargeButtons({ packs, settings, monthlyActive }: Props) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Pack | null>(null);
  const router = useRouter();

  function doSubscribe() {
    startTransition(async () => {
      const res = await subscribeMonthlyAction();
      if (res.ok) router.refresh();
      else alert("Erro: " + (res.error ?? "—"));
    });
  }

  function doCancel() {
    if (!confirm("Cancelar a assinatura mensal? O saldo atual continua disponível.")) return;
    startTransition(async () => {
      await cancelMonthlyAction();
      router.refresh();
    });
  }

  return (
    <>
      {settings && (
        <section className="mb-8 rounded-3xl border-2 border-brava-yellow bg-gradient-to-br from-brava-yellow/15 via-amber-50 to-white p-6 dark:from-amber-950/40 dark:via-zinc-900 dark:to-amber-950/30">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-brava-black/70">
                Plano BRAVA Tag mensal
              </p>
              <h2 className="mt-1 text-2xl font-black text-brava-ink">
                Paga {centsToBRL(settings.monthly_plan_cents)} · recebe {centsToBRL(settings.monthly_plan_credit_cents)}/mês
              </h2>
              <p className="mt-1 text-sm text-brava-muted">
                Saldo recarrega automaticamente todo mês. Cancele quando quiser.
              </p>
            </div>
          </div>
          <div className="mt-5">
            {monthlyActive ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  ✓ Assinatura ativa
                </span>
                <button
                  onClick={doCancel}
                  disabled={pending}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  Cancelar mensalidade
                </button>
              </div>
            ) : (
              <button
                onClick={doSubscribe}
                disabled={pending}
                className="rounded-full bg-brava-black px-6 py-3 text-sm font-bold text-brava-yellow disabled:opacity-50"
              >
                {pending ? "Ativando..." : "Ativar mensalidade"}
              </button>
            )}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">
          Recarga avulsa
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {packs.map((p) => {
            const total = p.amount_cents + p.bonus_cents;
            const bonusPct = p.amount_cents > 0 ? Math.round((p.bonus_cents / p.amount_cents) * 100) : 0;
            return (
              <li key={p.id}>
                <div className="rounded-3xl border-2 border-brava-border bg-brava-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">{p.name}</p>
                      <p className="mt-1 text-2xl font-black text-brava-ink">
                        Paga {centsToBRL(p.amount_cents)}
                      </p>
                      <p className="text-sm text-brava-muted">
                        Recebe <strong className="text-emerald-700 dark:text-emerald-300">{centsToBRL(total)}</strong>
                        {bonusPct > 0 && <span> · +{bonusPct}% de bônus</span>}
                      </p>
                    </div>
                    <span className="rounded-full bg-brava-yellow px-3 py-1 text-xs font-black text-brava-black">
                      +{centsToBRL(p.bonus_cents)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setSelected(p)}
                      className="w-full rounded-full bg-brava-yellow px-4 py-2 text-sm font-bold text-brava-black"
                    >
                      Recarregar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] text-brava-muted">
          Pague por PIX (na hora) ou cartão (Apple Pay / Google Pay). O bônus é creditado junto.
        </p>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-brava-card p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-brava-ink">Recarregar — {selected.name}</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-brava-muted hover:text-brava-ink"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <CheckoutPanel
              amountCents={selected.amount_cents}
              successUrl="/app/tag"
              createPixAction={() => createTagRechargePix(selected.id)}
              createCardAction={() => createTagRechargeCard(selected.id)}
            />
          </div>
        </div>
      )}
    </>
  );
}
