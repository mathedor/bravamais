import { getEstabSubscriptionSummary, centsToBRL } from "@/lib/feature-gate";

export async function MigrationBanner({ establishmentId }: { establishmentId: string }) {
  const summary = await getEstabSubscriptionSummary(establishmentId);
  if (!summary.migration_freeze_until || !summary.legacy_tier) return null;

  const until = new Date(summary.migration_freeze_until);
  if (until.getTime() < Date.now()) return null;

  const daysLeft = Math.max(0, Math.ceil((until.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4">
      <div className="rounded-2xl border border-brava-yellow/60 bg-gradient-to-r from-brava-yellow/15 via-amber-100/40 to-brava-yellow/10 p-4 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-brava-ink">
              🧩 Bem-vinda(o) ao novo plano modular — preço congelado por mais {daysLeft} dia(s)
            </p>
            <p className="mt-1 text-xs text-brava-ink/70">
              Migramos teu plano antigo <strong>{summary.legacy_tier.toUpperCase()}</strong> pra um pacote equivalente de ferramentas
              ({centsToBRL(summary.total_cents)}/mês). Após {until.toLocaleDateString("pt-BR")} tu pode remontar livremente: ativar/remover ferramentas.
            </p>
          </div>
          <a
            href="/loja/minhas-ferramentas"
            className="shrink-0 rounded-full bg-brava-black px-4 py-2 text-xs font-bold text-white hover:bg-brava-blue"
          >
            Ver minhas ferramentas →
          </a>
        </div>
      </div>
    </div>
  );
}
