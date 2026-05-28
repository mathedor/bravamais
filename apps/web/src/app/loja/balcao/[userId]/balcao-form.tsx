"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPosSaleAction, sendFollowUpCouponAction, type PosSaleResult } from "./actions";

export interface Benefit {
  kind: "coupon" | "gift_card" | "loyalty_reward" | "renewable";
  ref_id: string;
  label: string;
  code?: string;
  discount_percent?: number | null;
  discount_cents?: number | null;
  remaining_cents?: number | null;
  benefit_subkind?: string | null;
  benefit_value?: number | null;
  min_order_cents?: number | null;
}

interface Props {
  userId: string;
  userName: string;
  benefits: Benefit[];
}

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function estimateDiscount(b: Benefit | null, grossCents: number): number {
  if (!b) return 0;
  if (b.kind === "coupon") {
    if (b.discount_percent) return Math.round((grossCents * b.discount_percent) / 100);
    if (b.discount_cents) return Math.min(b.discount_cents, grossCents);
    return 0;
  }
  if (b.kind === "gift_card") {
    return Math.min(b.remaining_cents ?? 0, grossCents);
  }
  if (b.kind === "loyalty_reward") {
    return grossCents; // cortesia 100%
  }
  if (b.kind === "renewable") {
    if (b.benefit_subkind === "percent") return Math.round((grossCents * (b.benefit_value ?? 0)) / 100);
    return Math.min(b.benefit_value ?? 0, grossCents);
  }
  return 0;
}

export function BalcaoForm({ userId, userName, benefits }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Benefit | null>(null);
  const [grossReais, setGrossReais] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<PosSaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grossCents = Math.round((Number(grossReais.replace(",", ".")) || 0) * 100);
  const discountCents = estimateDiscount(selected, grossCents);
  const netCents = Math.max(0, grossCents - discountCents);

  function reset() {
    setSelected(null);
    setGrossReais("");
    setResult(null);
    setError(null);
  }

  async function submit() {
    setError(null);
    if (grossCents <= 0) {
      setError("Informa o valor da venda.");
      return;
    }
    const fd = new FormData();
    fd.set("user_id", userId);
    fd.set("gross_reais", String(grossReais.replace(",", ".")));
    fd.set("benefit_kind", selected?.kind ?? "none");
    if (selected?.ref_id) fd.set("benefit_ref_id", selected.ref_id);

    startTransition(async () => {
      const res = await recordPosSaleAction(fd);
      if (!res.ok) {
        setError(res.error ?? "Falha ao registrar venda.");
        return;
      }
      setResult(res);
    });
  }

  async function sendFollowUp() {
    const fd = new FormData();
    fd.set("user_id", userId);
    fd.set("user_name", userName);
    startTransition(async () => {
      await sendFollowUpCouponAction(fd);
      router.push("/loja/qr-scanner");
    });
  }

  if (result) {
    return (
      <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-white p-8 text-center dark:from-emerald-950/40 dark:to-zinc-900">
        <p className="text-5xl">✅</p>
        <h2 className="mt-3 text-2xl font-black text-brava-ink">Venda registrada!</h2>
        <p className="mt-1 text-brava-muted">
          {userName} pagou <strong className="text-brava-ink">{centsToBRL(result.net_cents ?? 0)}</strong>
          {(result.discount_cents ?? 0) > 0 && (
            <> · economizou <strong className="text-emerald-700 dark:text-emerald-300">{centsToBRL(result.discount_cents ?? 0)}</strong></>
          )}
        </p>
        {result.benefit_label && (
          <p className="mt-2 text-xs text-brava-muted">Benefício aplicado: {result.benefit_label}</p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={sendFollowUp}
            disabled={pending}
            className="rounded-full bg-brava-yellow px-5 py-3 font-bold text-brava-black hover:bg-brava-yellow-deep disabled:opacity-60"
          >
            🎁 Mandar cupom de retorno (10% off)
          </button>
          <button
            onClick={() => router.push("/loja/qr-scanner")}
            className="rounded-full border border-brava-border bg-brava-card px-5 py-3 font-bold text-brava-ink"
          >
            Próximo cliente →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">
          Benefícios disponíveis ({benefits.length})
        </h2>
        {benefits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">
            Esse cliente não tem nenhum benefício ativo aqui. Pode registrar a venda sem desconto.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            <li>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${
                  !selected ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-brava-card hover:border-brava-yellow/50"
                }`}
              >
                <span className="text-2xl">💵</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-brava-ink">Sem benefício</p>
                  <p className="text-xs text-brava-muted">Registrar só a venda</p>
                </div>
              </button>
            </li>
            {benefits.map((b) => {
              const isSel = selected?.ref_id === b.ref_id;
              return (
                <li key={b.ref_id}>
                  <button
                    type="button"
                    onClick={() => setSelected(b)}
                    className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${
                      isSel ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-brava-card hover:border-brava-yellow/50"
                    }`}
                  >
                    <span className="text-2xl">{kindEmoji(b.kind)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-brava-ink">{b.label}</p>
                      <p className="mt-0.5 text-xs text-brava-muted">{describeBenefit(b)}</p>
                      {b.code && (
                        <p className="mt-1 font-mono text-[11px] font-bold text-brava-blue">{b.code}</p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border-2 border-brava-yellow bg-gradient-to-br from-amber-50 via-white to-amber-50 p-6 dark:from-amber-950/40 dark:via-zinc-900 dark:to-amber-950/30">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-brava-muted">Valor da venda</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-black text-brava-muted">R$</span>
            <input
              inputMode="decimal"
              value={grossReais}
              onChange={(e) => setGrossReais(e.target.value.replace(/[^\d.,]/g, ""))}
              placeholder="0,00"
              className="w-full border-0 bg-transparent text-4xl font-black text-brava-ink outline-none placeholder:text-brava-muted/40"
            />
          </div>
        </label>

        {grossCents > 0 && (
          <div className="mt-5 grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brava-muted">Subtotal</span>
              <span className="font-bold text-brava-ink">{centsToBRL(grossCents)}</span>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between">
                <span className="text-brava-muted">Desconto BRAVA+</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">− {centsToBRL(discountCents)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-brava-border pt-2 text-lg">
              <span className="font-bold text-brava-ink">Total a cobrar</span>
              <span className="font-black text-brava-blue">{centsToBRL(netCents)}</span>
            </div>
          </div>
        )}

        {error && <p className="mt-3 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="flex-1 rounded-full border border-brava-border bg-brava-card px-4 py-3 text-sm font-bold text-brava-ink"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || grossCents <= 0}
            className="flex-[2] rounded-full bg-brava-black px-4 py-3 text-sm font-bold text-brava-yellow disabled:opacity-50"
          >
            {pending ? "Registrando..." : `Confirmar venda${netCents > 0 ? ` · ${centsToBRL(netCents)}` : ""}`}
          </button>
        </div>
      </section>
    </div>
  );
}

function kindEmoji(kind: Benefit["kind"]): string {
  switch (kind) {
    case "coupon": return "🎟️";
    case "gift_card": return "🎁";
    case "loyalty_reward": return "🏆";
    case "renewable": return "♻️";
    default: return "✨";
  }
}

function describeBenefit(b: Benefit): string {
  if (b.kind === "coupon") {
    if (b.discount_percent) return `${b.discount_percent}% de desconto`;
    if (b.discount_cents) return `${centsToBRL(b.discount_cents)} de desconto`;
    return "Cupom";
  }
  if (b.kind === "gift_card") return `Saldo disponível: ${centsToBRL(b.remaining_cents ?? 0)}`;
  if (b.kind === "loyalty_reward") return "Cortesia (100% off)";
  if (b.kind === "renewable") {
    if (b.benefit_subkind === "percent") return `${b.benefit_value}% off`;
    return `${centsToBRL(b.benefit_value ?? 0)} de desconto`;
  }
  return "";
}
