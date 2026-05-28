"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserCategoriesAction } from "./actions";

export interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  monthly_cents: number;
  pitch: string | null;
}

interface Props {
  categories: CategoryOption[];
  initiallySelected: string[];
  inTrial: boolean;
  trialEndsAt: string | null;
}

function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const TIER_COLOR: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
  mid: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
};

function tierFor(cents: number): "high" | "mid" | "low" {
  if (cents >= 700) return "high";
  if (cents >= 350) return "mid";
  return "low";
}

export function CategoriesPicker({ categories, initiallySelected, inTrial, trialEndsAt }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initiallySelected));
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => {
    let sum = 0;
    for (const c of categories) if (selected.has(c.id)) sum += c.monthly_cents;
    return sum;
  }, [categories, selected]);

  function toggle(id: string) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(categories.map((c) => c.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function save() {
    setError(null);
    setSaved(false);
    const fd = new FormData();
    for (const id of selected) fd.append("category_ids", id);
    startTransition(async () => {
      const res = await setUserCategoriesAction(fd);
      if (!res.ok) {
        setError(res.error ?? "Falha ao salvar.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      {inTrial && (
        <div className="rounded-2xl border border-brava-yellow/60 bg-gradient-to-r from-brava-yellow/15 via-amber-100/40 to-brava-yellow/10 p-4 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/30">
          <p className="text-sm font-black text-brava-ink">
            🎁 Você está no trial top — acesso a TODAS as categorias por mais {daysLeft} dia{daysLeft === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-xs text-brava-ink/70">
            Aproveite pra testar todos os parceiros. Quando o trial acabar, sua assinatura é só das categorias que você marcar aqui.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-brava-muted">
          {selected.size} de {categories.length} categorias · {centsToBRL(total)}/mês
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-full border border-brava-border px-3 py-1 text-xs font-bold text-brava-ink hover:bg-brava-paper"
          >
            Marcar tudo
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-brava-border px-3 py-1 text-xs font-bold text-brava-muted hover:bg-brava-paper"
          >
            Limpar
          </button>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {categories.map((c) => {
          const isSel = selected.has(c.id);
          const tier = tierFor(c.monthly_cents);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => toggle(c.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${
                  isSel
                    ? "border-brava-yellow bg-brava-yellow/10"
                    : "border-brava-border bg-brava-card hover:border-brava-yellow/40"
                }`}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-brava-ink">
                  {isSel && <span className="text-base text-brava-ink">✓</span>}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-brava-ink">{c.name}</p>
                  {c.pitch && <p className="mt-0.5 text-xs text-brava-muted">{c.pitch}</p>}
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${TIER_COLOR[tier]}`}>
                    {tier === "high" ? "alto benefício" : tier === "mid" ? "médio" : "leve"}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-black text-brava-blue">{centsToBRL(c.monthly_cents)}</p>
                  <p className="text-[10px] uppercase tracking-wider text-brava-muted">/mês</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-4 z-10 rounded-3xl border-2 border-brava-yellow bg-gradient-to-br from-amber-50 via-white to-amber-50 p-5 shadow-xl dark:from-amber-950/40 dark:via-zinc-900 dark:to-amber-950/30">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">Sua mensalidade</p>
            <p className="text-3xl font-black text-brava-ink">
              {centsToBRL(total)}
              <span className="text-sm font-bold text-brava-muted">/mês</span>
            </p>
            <p className="mt-1 text-xs text-brava-muted">
              {selected.size === 0
                ? "Selecione ao menos 1 categoria pra ativar"
                : `${selected.size} categorias ativas`}
            </p>
          </div>
          <button
            onClick={save}
            disabled={pending || selected.size === 0}
            className="rounded-full bg-brava-black px-6 py-3 text-sm font-bold text-brava-yellow disabled:opacity-50"
          >
            {pending ? "Salvando..." : saved ? "✓ Salvo!" : "Confirmar"}
          </button>
        </div>
        {error && <p className="mt-2 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
