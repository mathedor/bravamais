import Link from "next/link";
import { requireEstablishment } from "@/lib/establishment-guard";
import { computeAndSaveOnboarding, ONBOARDING_STEPS, progressPercent } from "@/lib/lojista-onboarding";

export const metadata = { title: "Onboarding — Loja" };

export default async function OnboardingPage() {
  const { establishment } = await requireEstablishment();
  const state = await computeAndSaveOnboarding(establishment.id);
  const pct = progressPercent(state);
  const allDone = pct === 100;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Bem-vindo ao BRAVA+</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Vamos deixar sua loja redondinha</h1>
        <p className="mt-1 text-sm text-brava-muted">5 passos rápidos pra começar a faturar pelo clube.</p>
      </header>

      {/* Progress hero */}
      <section className={`rounded-3xl p-6 shadow-xl ${allDone ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white" : "bg-gradient-to-br from-brava-black via-brava-blue to-brava-blue-bright text-white"}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-yellow">{allDone ? "Loja configurada!" : "Progresso"}</p>
            <p className="mt-1 text-5xl font-black tracking-tight">{pct}%</p>
            <p className="mt-1 text-xs text-white/65">
              {allDone
                ? "Tudo pronto. Agora é vender ⚡"
                : `${ONBOARDING_STEPS.filter((s) => state[s.key]).length} de ${ONBOARDING_STEPS.length} passos completos`}
            </p>
          </div>
          <div className="text-5xl">{allDone ? "🎉" : "🚀"}</div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brava-yellow to-amber-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </section>

      {/* Steps */}
      <section className="mt-6 space-y-2">
        {ONBOARDING_STEPS.map((step, i) => {
          const done = state[step.key];
          return (
            <Link
              key={step.key}
              href={step.href}
              className={`group flex items-center gap-3 rounded-2xl border-2 p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
                done
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-brava-border bg-brava-card hover:border-brava-yellow"
              }`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${done ? "bg-emerald-500 text-white" : "bg-brava-paper"}`}>
                {done ? "✓" : step.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-bold ${done ? "text-emerald-900 line-through" : "text-brava-ink"}`}>
                  <span className="mr-1 text-brava-muted">{i + 1}.</span>
                  {step.label}
                </p>
                <p className="text-xs text-brava-muted">{step.description}</p>
              </div>
              <span className="text-brava-blue group-hover:translate-x-1 transition">→</span>
            </Link>
          );
        })}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/loja/onboarding/wizard?step=1" className="rounded-2xl bg-brava-black p-4 text-center text-sm font-black text-brava-yellow hover:scale-[1.02]">
          🚀 Abrir wizard guiado
        </Link>
        <Link href="/loja/plano" className="rounded-2xl bg-brava-yellow p-4 text-center text-sm font-black text-brava-black hover:scale-[1.02]">
          💎 Ver planos
        </Link>
        <a href="mailto:suporte@bravamais.app" className="rounded-2xl border border-brava-border bg-brava-card p-4 text-center text-sm font-bold text-brava-ink hover:bg-brava-paper">
          💬 Falar com suporte
        </a>
      </section>

      <div className="h-8" />
    </div>
  );
}
