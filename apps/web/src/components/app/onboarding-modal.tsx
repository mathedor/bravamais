"use client";

import { useState, useTransition } from "react";
import { completeOnboardingAction } from "@/app/app/_actions/onboarding";

interface Category {
  slug: string;
  name: string;
  icon?: string | null;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  restaurantes: "🍽️",
  bares: "🍺",
  cafes: "☕",
  beleza: "✨",
  moda: "👕",
  saude: "💊",
  esportes: "🏋️",
  lazer: "🎉",
  petshop: "🐾",
  servicos: "🧰",
};

export function OnboardingModal({ categorias }: { categorias: Category[] }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function toggleCat(slug: string) {
    setSelected((s) => (s.includes(slug) ? s.filter((c) => c !== slug) : [...s, slug]));
  }

  function finish() {
    const fd = new FormData();
    fd.append("favorite_categories", selected.join(","));
    startTransition(async () => {
      await completeOnboardingAction(fd);
      // recarrega pra atualizar onboarded_at no server
      window.location.reload();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-brava-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-brava-card p-6 shadow-2xl">
        {/* Progress dots */}
        <div className="mb-5 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-brava-yellow" : "bg-brava-paper"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center">
            <p className="text-6xl">🎉</p>
            <h2 className="mt-4 text-2xl font-black text-brava-ink">Bem-vindo ao BRAVA+!</h2>
            <p className="mt-2 text-sm text-brava-muted">
              Cupons, fidelidade, vale-presentes e cashback nos seus lugares favoritos. Tudo num lugar só.
            </p>
            <div className="mt-6 grid gap-2 text-left">
              <Pill emoji="🪙" label="BRAVA Coins" desc="Ganha em cada check-in" />
              <Pill emoji="📍" label="Promo perto de você" desc="Notif quando passar perto de parceiro" />
              <Pill emoji="🎰" label="Roleta da sorte" desc="Grátis em cada loja, uma vez por dia" />
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-6 w-full rounded-full bg-brava-yellow px-5 py-3 text-sm font-black text-brava-black"
            >
              Próximo →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="text-center">
            <p className="text-6xl">📍🔔</p>
            <h2 className="mt-4 text-2xl font-black text-brava-ink">Ative o essencial</h2>
            <p className="mt-2 text-sm text-brava-muted">
              Localização pra parceiros próximos, notificações pra cupons quentes. Você pode mudar depois.
            </p>
            <div className="mt-4 grid gap-2 text-left">
              <PermBlock emoji="📍" label="Localização" desc="Mostra promoções perto" onClick={async () => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(() => {}, () => {});
              }} />
              <PermBlock emoji="🔔" label="Notificações" desc="Cupons + promo flash" onClick={async () => {
                if (!("Notification" in window)) return;
                await Notification.requestPermission();
              }} />
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setStep(0)} className="flex-1 rounded-full border border-brava-border bg-brava-paper px-4 py-2.5 text-xs font-medium">
                Voltar
              </button>
              <button onClick={() => setStep(2)} className="flex-1 rounded-full bg-brava-yellow px-4 py-2.5 text-xs font-black text-brava-black">
                Próximo →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-center">
              <p className="text-6xl">❤️</p>
              <h2 className="mt-4 text-2xl font-black text-brava-ink">O que você curte?</h2>
              <p className="mt-2 text-sm text-brava-muted">
                Selecione categorias pra personalizar suas recomendações. (opcional)
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {categorias.map((c) => {
                const active = selected.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggleCat(c.slug)}
                    className={`rounded-2xl border-2 p-3 text-left text-xs font-bold transition ${
                      active ? "border-brava-yellow bg-brava-yellow/15 text-brava-ink" : "border-brava-border bg-brava-paper text-brava-ink hover:border-brava-yellow/50"
                    }`}
                  >
                    <span className="text-xl">{CATEGORY_EMOJIS[c.slug] ?? "🏷️"}</span>
                    <p className="mt-1 leading-tight">{c.name}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 rounded-full border border-brava-border bg-brava-paper px-4 py-2.5 text-xs font-medium">
                Voltar
              </button>
              <button onClick={finish} disabled={pending} className="flex-1 rounded-full bg-brava-blue px-4 py-2.5 text-xs font-black text-white disabled:opacity-60">
                {pending ? "..." : "Bora! 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ emoji, label, desc }: { emoji: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-brava-paper p-3">
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="text-sm font-black text-brava-ink">{label}</p>
        <p className="text-[11px] text-brava-muted">{desc}</p>
      </div>
    </div>
  );
}

function PermBlock({ emoji, label, desc, onClick }: { emoji: string; label: string; desc: string; onClick: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await onClick();
        setDone(true);
      }}
      className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${done ? "border-emerald-300 bg-emerald-50" : "border-brava-border bg-brava-paper hover:border-brava-yellow"}`}
    >
      <span className="text-2xl">{done ? "✓" : emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-brava-ink">{label}</p>
        <p className="text-[11px] text-brava-muted">{desc}</p>
      </div>
    </button>
  );
}
