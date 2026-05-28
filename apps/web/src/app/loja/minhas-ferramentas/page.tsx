import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import {
  listFeatureCatalog,
  listEstabFeatureGrants,
  getEstabSubscriptionSummary,
  centsToBRL,
  type FeatureCatalogRow,
  type FeatureCategory,
} from "@/lib/feature-gate";
import { activateFeatureAction, requestFeatureRemovalAction } from "./actions";

export const metadata = { title: "Minhas Ferramentas" };

const CATEGORY_LABELS: Record<FeatureCategory, { label: string; emoji: string; tone: string }> = {
  base: { label: "Base do plano", emoji: "🧱", tone: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" },
  vendas: { label: "Vendas", emoji: "💰", tone: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200" },
  engajamento: { label: "Engajamento", emoji: "🎯", tone: "bg-pink-50 text-pink-800 dark:bg-pink-950/40 dark:text-pink-200" },
  bi: { label: "BI & CRM", emoji: "📊", tone: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200" },
  operacao: { label: "Operação", emoji: "⚙️", tone: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" },
  crescimento: { label: "Crescimento", emoji: "🚀", tone: "bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200" },
};

const CATEGORY_ORDER: FeatureCategory[] = ["base", "vendas", "engajamento", "bi", "operacao", "crescimento"];

interface PendingRequest {
  id: string;
  feature_slug: string;
  reason: string | null;
  status: string;
  created_at: string;
}

export default async function MinhasFerramentasPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const [catalog, grants, summary, { data: pendingReqs }] = await Promise.all([
    listFeatureCatalog(),
    listEstabFeatureGrants(establishment.id),
    getEstabSubscriptionSummary(establishment.id),
    supabase
      .from("establishment_feature_requests")
      .select("id, feature_slug, reason, status, created_at")
      .eq("establishment_id", establishment.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const byCategory = new Map<FeatureCategory, FeatureCatalogRow[]>();
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
  for (const f of catalog) byCategory.get(f.category)?.push(f);

  const pendingBySlug = new Set((pendingReqs as PendingRequest[] | null ?? []).map((r) => r.feature_slug));

  const freezeUntil = summary.migration_freeze_until ? new Date(summary.migration_freeze_until) : null;
  const isFrozen = !!freezeUntil && freezeUntil.getTime() > Date.now();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brava-muted">Minhas ferramentas</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Monte o plano da tua loja</h1>
        <p className="mt-2 max-w-2xl text-brava-muted">
          Você paga só pelo que usa. Ative qualquer ferramenta em 1 clique — pra desligar uma já contratada, abre um pedido pro nosso time
          aprovar (evita oscilação na cobrança).
        </p>
      </header>

      {/* Resumo da mensalidade */}
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">Base do plano</p>
          <p className="mt-2 text-3xl font-black text-brava-ink">{centsToBRL(summary.base_cents)}<span className="text-sm font-bold text-brava-muted">/mês</span></p>
          <p className="mt-1 text-xs text-brava-muted">Tudo da seção "Base" incluído</p>
        </div>
        <div className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">Ferramentas extras</p>
          <p className="mt-2 text-3xl font-black text-brava-ink">{centsToBRL(summary.features_total_cents)}<span className="text-sm font-bold text-brava-muted">/mês</span></p>
          <p className="mt-1 text-xs text-brava-muted">{summary.active_grants} ferramentas ativas</p>
        </div>
        <div className="rounded-3xl border-2 border-brava-yellow bg-gradient-to-br from-brava-yellow/15 to-amber-200/10 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-black">Total mensal</p>
          <p className="mt-2 text-3xl font-black text-brava-black">{centsToBRL(summary.total_cents)}</p>
          <p className="mt-1 text-xs text-brava-black/70">Próxima fatura</p>
        </div>
      </section>

      {isFrozen && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
            🔒 Plano congelado até {freezeUntil!.toLocaleDateString("pt-BR")}
          </p>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
            Migramos teu antigo plano <strong>{summary.legacy_tier?.toUpperCase()}</strong> pra esse pacote de ferramentas. O preço atual fica congelado por 60 dias.
            Após essa data tu pode remontar livremente (adicionar/remover ferramentas).
          </p>
        </div>
      )}

      {/* Pedidos pendentes */}
      {(pendingReqs as PendingRequest[] | null)?.length ? (
        <section className="mb-8 rounded-2xl border border-brava-border bg-brava-card p-5">
          <h2 className="text-sm font-bold text-brava-ink">Pedidos de remoção em análise</h2>
          <ul className="mt-3 space-y-2">
            {(pendingReqs as PendingRequest[]).map((r) => {
              const feat = catalog.find((f) => f.slug === r.feature_slug);
              return (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-brava-ink">{feat?.name ?? r.feature_slug}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    aguardando admin
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Catalogo por categoria */}
      {CATEGORY_ORDER.map((cat) => {
        const list = byCategory.get(cat) ?? [];
        if (list.length === 0) return null;
        const meta = CATEGORY_LABELS[cat];
        return (
          <section key={cat} className="mb-10">
            <header className="mb-3 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${meta.tone}`}>
                {meta.emoji} {meta.label}
              </span>
              <span className="text-xs text-brava-muted">{list.length} ferramentas</span>
            </header>

            <div className="grid gap-3 md:grid-cols-2">
              {list.map((f) => {
                const isActive = grants.has(f.slug);
                const isPending = pendingBySlug.has(f.slug);
                const missingDeps = f.depends_on.filter((d) => !grants.has(d));

                return (
                  <article
                    key={f.slug}
                    className={`flex flex-col gap-3 rounded-3xl border p-5 transition ${
                      isActive
                        ? "border-emerald-400/70 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "border-brava-border bg-brava-card hover:border-brava-yellow"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-brava-ink">{f.name}</h3>
                        <p className="mt-1 text-sm text-brava-muted">{f.short_desc}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {f.monthly_cents > 0 ? (
                          <>
                            <p className="text-xl font-black text-brava-blue">{centsToBRL(f.monthly_cents)}</p>
                            <p className="text-[10px] uppercase tracking-wider text-brava-muted">/mês</p>
                          </>
                        ) : f.is_base ? (
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">incluso</p>
                        ) : (
                          <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">grátis</p>
                        )}
                      </div>
                    </div>

                    {f.sales_pitch && !isActive && (
                      <p className="rounded-xl bg-brava-yellow/10 p-3 text-xs italic text-brava-ink/80">
                        “{f.sales_pitch}”
                      </p>
                    )}

                    {f.pricing_note && (
                      <p className="text-[11px] font-bold text-brava-blue">{f.pricing_note}</p>
                    )}

                    {missingDeps.length > 0 && !isActive && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        ⚠ Precisa primeiro: {missingDeps.join(", ")}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-brava-border/50 pt-3">
                      {isActive ? (
                        <>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                            ✓ Ativa
                          </span>
                          {!f.is_base && !isPending && (
                            <form action={requestFeatureRemovalAction}>
                              <input type="hidden" name="slug" value={f.slug} />
                              <button className="text-xs text-red-600 hover:underline" type="submit">
                                Solicitar remoção
                              </button>
                            </form>
                          )}
                          {isPending && (
                            <span className="text-xs text-amber-600">remoção em análise</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-brava-muted">Não contratada</span>
                          {missingDeps.length === 0 && (
                            <form action={activateFeatureAction}>
                              <input type="hidden" name="slug" value={f.slug} />
                              <button
                                className="rounded-full bg-brava-blue px-4 py-1.5 text-sm font-bold text-white hover:bg-brava-blue/90"
                                type="submit"
                              >
                                Ativar agora
                              </button>
                            </form>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <footer className="mt-10 rounded-2xl border border-brava-border bg-brava-card/60 p-5 text-sm text-brava-muted">
        <p>
          <strong className="text-brava-ink">Como funciona:</strong> ativação é instantânea e cobra pro-rata no mês corrente.
          Remoção precisa passar pelo time BRAVA+ (evita liga/desliga abusivo) — aprovada, libera no próximo ciclo (não estorna o mês em curso).
        </p>
      </footer>
    </div>
  );
}
