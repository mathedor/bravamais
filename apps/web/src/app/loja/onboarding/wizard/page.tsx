import Link from "next/link";
import { redirect } from "next/navigation";
import { requireEstablishment } from "@/lib/establishment-guard";
import { computeAndSaveOnboarding, ONBOARDING_STEPS } from "@/lib/lojista-onboarding";

export const metadata = { title: "Wizard de onboarding" };

interface PageProps {
  searchParams: Promise<{ step?: string }>;
}

const STEP_CONTENT: Record<string, { icon: string; title: string; intro: string; bullets: string[]; cta: string }> = {
  profile_complete: {
    icon: "🏪",
    title: "Configure sua identidade",
    intro: "Cliente decide se entra ou passa direto em 1 segundo. Capricha na primeira impressão.",
    bullets: [
      "Logo quadrado (mínimo 400×400)",
      "Foto de capa horizontal — algo atrativo da loja",
      "Descrição de 2-3 frases que mostre o diferencial",
    ],
    cta: "Editar perfil",
  },
  first_coupon: {
    icon: "🎟️",
    title: "Crie seu primeiro cupom",
    intro: "Cupom é a isca pra primeira visita. Pode ser pequeno (10% off ou R$ 5) — o que importa é abrir a porta.",
    bullets: [
      "Coloca validade de 30 dias pra criar urgência",
      "Sem restrições no começo — facilita o teste",
      "1 cupom só já libera as ferramentas de cupom",
    ],
    cta: "Criar primeiro cupom",
  },
  loyalty_setup: {
    icon: "⭐",
    title: "Configure o clube de fidelidade",
    intro: "Hábito gera receita. Defina X visitas = recompensa, e o sistema cuida do resto.",
    bullets: [
      "Sugestão pra começar: 5 visitas = R$ 20 de desconto",
      "Cliente vê o progresso na carteirinha",
      "Você só validar quando ele atingir a meta",
    ],
    cta: "Configurar fidelidade",
  },
  first_story: {
    icon: "📸",
    title: "Poste seu primeiro story",
    intro: "Stories aparecem em destaque pra quem é assinante. É a chamada do dia.",
    bullets: [
      "Foto do prato do dia / promoção da semana / clima da loja",
      "Pode incluir cupom direto no story",
      "Dura 24h, igual Instagram",
    ],
    cta: "Postar 1º story",
  },
  first_visit_scanned: {
    icon: "📷",
    title: "Faça o primeiro check-in pelo QR",
    intro: "Cliente abre a carteirinha BRAVA+, você bipa o QR, e o sistema registra visita + fidelidade.",
    bullets: [
      "Use o /loja/qr-scanner direto do celular",
      "Após o bip, você cai no Balcão pra aplicar benefício",
      "Pra teste, peça pra um cliente assinante BRAVA+ vir",
    ],
    cta: "Abrir scanner",
  },
};

export default async function OnboardingWizardPage({ searchParams }: PageProps) {
  const { establishment } = await requireEstablishment();
  const state = await computeAndSaveOnboarding(establishment.id);

  const sp = await searchParams;
  const stepNum = Math.max(1, Math.min(ONBOARDING_STEPS.length, Number(sp.step ?? "1") || 1));
  const stepIdx = stepNum - 1;
  const step = ONBOARDING_STEPS[stepIdx];
  const content = STEP_CONTENT[step.key];
  const done = state[step.key];

  const totalSteps = ONBOARDING_STEPS.length;
  const completedCount = ONBOARDING_STEPS.filter((s) => state[s.key]).length;
  const pct = Math.round((completedCount / totalSteps) * 100);

  const allDone = completedCount === totalSteps;
  if (allDone) {
    redirect("/loja?onboarded=1");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <Link href="/loja/onboarding" className="text-xs text-brava-blue hover:underline">
          ← Ver todos os passos
        </Link>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">
            Passo {stepNum} de {totalSteps}
          </p>
          <p className="text-xs text-brava-muted">{pct}% completo</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brava-paper">
          <div className="h-full bg-gradient-to-r from-brava-yellow to-amber-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <section className="rounded-3xl border-2 border-brava-yellow bg-brava-card p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${done ? "bg-emerald-500 text-white" : "bg-brava-yellow text-brava-black"}`}>
            {done ? "✓" : content.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black text-brava-ink">{content.title}</h1>
            <p className="mt-2 text-sm text-brava-muted">{content.intro}</p>
          </div>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-brava-ink">
          {content.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-brava-blue">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={step.href}
            className="rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black hover:scale-[1.02]"
          >
            {content.cta} →
          </Link>
          {done && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              ✓ Passo concluído
            </span>
          )}
        </div>
      </section>

      <section className="mt-6 flex items-center justify-between gap-3">
        {stepNum > 1 ? (
          <Link
            href={`/loja/onboarding/wizard?step=${stepNum - 1}`}
            className="rounded-full border border-brava-border bg-brava-card px-5 py-2.5 text-sm font-bold text-brava-ink"
          >
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        {stepNum < totalSteps && (
          <Link
            href={`/loja/onboarding/wizard?step=${stepNum + 1}`}
            className="rounded-full bg-brava-black px-5 py-2.5 text-sm font-bold text-brava-yellow"
          >
            {done ? "Próximo →" : "Pular esse →"}
          </Link>
        )}
        {stepNum === totalSteps && done && (
          <Link
            href="/loja"
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Finalizar onboarding →
          </Link>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-brava-border bg-brava-card p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">Mapa dos 5 passos</p>
        <ol className="mt-3 space-y-1">
          {ONBOARDING_STEPS.map((s, i) => {
            const sDone = state[s.key];
            const current = i === stepIdx;
            return (
              <li key={s.key}>
                <Link
                  href={`/loja/onboarding/wizard?step=${i + 1}`}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition ${
                    current ? "bg-brava-yellow/20 font-bold text-brava-ink" : "text-brava-muted hover:bg-brava-paper"
                  }`}
                >
                  <span>{sDone ? "✓" : `${i + 1}.`}</span>
                  <span className={sDone ? "line-through opacity-60" : ""}>{s.label}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
