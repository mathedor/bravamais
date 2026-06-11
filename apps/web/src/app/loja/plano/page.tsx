import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";
import { UpgradeButton } from "./upgrade-button";

export const metadata = { title: "Plano — Loja" };

interface PlanCatalog {
  tier: "basico" | "pro" | "enterprise";
  name: string;
  monthly_cents: number;
  yearly_cents: number | null;
  features: { bullets: string[]; limits?: Record<string, number> };
  display_order: number;
}

export default async function PlanoLojistaPage() {
  const { establishment } = await requireEstablishment();
  const admin = createAdminClient();

  const [{ data: plans }, { data: sub }] = await Promise.all([
    admin
      .from("establishment_plans_catalog")
      .select("tier, name, monthly_cents, yearly_cents, features, display_order")
      .eq("is_active", true)
      .order("display_order"),
    admin
      .from("establishment_subscriptions")
      .select("tier, status, current_period_end")
      .eq("establishment_id", establishment.id)
      .maybeSingle(),
  ]);

  const catalog = (plans as PlanCatalog[] | null) ?? [];
  const currentTier = sub?.tier ?? "basico";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Plano</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Quanto mais perto, mais ferramenta</h1>
        <p className="mt-1 text-sm text-brava-muted">
          Plano atual: <strong>{catalog.find((c) => c.tier === currentTier)?.name ?? "Básico"}</strong>
          {sub?.current_period_end && ` · renova em ${new Date(sub.current_period_end).toLocaleDateString("pt-BR")}`}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {catalog.map((p) => {
          const isCurrent = p.tier === currentTier;
          const isPro = p.tier === "pro";
          return (
            <article
              key={p.tier}
              className={`relative overflow-hidden rounded-3xl p-6 transition ${
                isPro
                  ? "border-2 border-brava-yellow bg-gradient-to-br from-brava-yellow/15 to-amber-100/40 shadow-xl"
                  : "border border-brava-border bg-brava-card"
              }`}
            >
              {isPro && (
                <span className="absolute right-4 top-4 rounded-full bg-brava-yellow px-2 py-0.5 text-[10px] font-black text-brava-black">
                  POPULAR
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">{p.name}</p>
              <p className="mt-2 text-4xl font-black tracking-tight text-brava-ink">
                {p.monthly_cents === 0 ? "Grátis" : formatBRL(p.monthly_cents)}
                {p.monthly_cents > 0 && <span className="text-sm font-medium text-brava-muted">/mês</span>}
              </p>
              {p.yearly_cents && p.yearly_cents > 0 && (
                <p className="text-[11px] text-brava-muted">ou {formatBRL(p.yearly_cents)}/ano</p>
              )}

              <ul className="mt-4 space-y-2 text-sm text-brava-ink">
                {p.features.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brava-blue">✓</span> <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <span className="block w-full rounded-full border border-brava-border bg-brava-paper px-4 py-2.5 text-center text-xs font-bold text-brava-ink">
                    Seu plano atual
                  </span>
                ) : (
                  <UpgradeButton tier={p.tier} priceCents={p.monthly_cents} />
                )}
              </div>
            </article>
          );
        })}
      </section>

      <p className="mt-8 text-center text-xs text-brava-muted">
        Cobrança via PIX ou cartão, com renovação automática. Cancele a qualquer momento sem fidelidade.
      </p>
      <p className="mt-2 text-center text-xs">
        <Link href="/loja" className="text-brava-blue hover:underline">← Voltar pra home da loja</Link>
      </p>

      <div className="h-8" />
    </div>
  );
}
