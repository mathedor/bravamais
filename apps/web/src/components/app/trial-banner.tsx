import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface SubscriptionSummary {
  in_trial: boolean;
  trial_ends_at: string | null;
  custom_categories_set: boolean;
  categories_total_cents: number;
  categories: Array<{ id: string }>;
}

export async function TrialBanner({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("user_subscription_summary", { p_user_id: userId });
  const sub = data as SubscriptionSummary | null;
  if (!sub) return null;

  const trialEnds = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null;
  const daysLeft = trialEnds
    ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (sub.in_trial) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brava-yellow/60 bg-gradient-to-r from-brava-yellow/15 via-amber-100/40 to-brava-yellow/10 p-3 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/30">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-brava-ink">
              🎁 Trial top: acesso a TODAS as categorias por mais {daysLeft} dia{daysLeft === 1 ? "" : "s"}
            </p>
            <p className="mt-0.5 text-xs text-brava-ink/70">
              Aproveite pra testar tudo. Escolha suas categorias antes do fim do trial pra continuar usando.
            </p>
          </div>
          <Link
            href="/assinar/categorias"
            className="shrink-0 rounded-full bg-brava-black px-4 py-2 text-xs font-bold text-brava-yellow"
          >
            Escolher categorias →
          </Link>
        </div>
      </div>
    );
  }

  // Trial expirado e não montou plano = bloqueia com banner mais forte
  if (!sub.custom_categories_set || sub.categories.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-red-400 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950/30">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-red-800 dark:text-red-200">
              ⚠ Seu trial top acabou — escolha suas categorias pra continuar
            </p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">
              Sem categorias selecionadas, você não usa benefícios. Monte seu plano em 1 minuto.
            </p>
          </div>
          <Link
            href="/assinar/categorias"
            className="shrink-0 rounded-full bg-red-700 px-4 py-2 text-xs font-bold text-white"
          >
            Montar agora →
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
