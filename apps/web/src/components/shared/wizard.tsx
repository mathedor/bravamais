"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  content: ReactNode;
}

interface Props {
  steps: WizardStep[];
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  submitLabelPending?: string;
  variant?: "dark" | "light";
  encType?: "multipart/form-data" | "application/x-www-form-urlencoded";
  errorMessage?: string | null;
  hiddenFields?: { name: string; value: string }[];
  footnote?: ReactNode;
}

/**
 * Multi-step form wrapper. Todos os steps ficam no DOM (display:none nos
 * inativos via framer-motion variants) — preserva o state dos inputs nativos.
 * Validação client-side por step usa reportValidity() apenas no step atual.
 * Server Action recebe FormData completo no submit final.
 */
export function Wizard({
  steps,
  action,
  submitLabel,
  submitLabelPending = "Enviando…",
  variant = "dark",
  encType,
  errorMessage,
  hiddenFields,
  footnote,
}: Props) {
  const [current, setCurrent] = useState(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isDark = variant === "dark";

  const total = steps.length;
  const isLast = current === total - 1;
  const isFirst = current === 0;

  function validateStep(index: number): boolean {
    const el = stepRefs.current[index];
    if (!el) return true;
    const fields = el.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    );
    for (const f of fields) {
      if (!f.checkValidity()) {
        f.reportValidity();
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateStep(current)) return;
    setCurrent((c) => Math.min(c + 1, total - 1));
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function back() {
    setCurrent((c) => Math.max(c - 1, 0));
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function jumpTo(index: number) {
    if (index === current) return;
    if (index < current) {
      setCurrent(index);
      return;
    }
    // pra avançar via stepper, valida todos os steps até o destino
    for (let i = current; i < index; i++) {
      if (!validateStep(i)) {
        setCurrent(i);
        return;
      }
    }
    setCurrent(index);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (!validateStep(current)) {
      e.preventDefault();
    }
  }

  const stepperColors = isDark
    ? {
        bgRail: "bg-white/10",
        bgRailDone: "bg-brava-yellow",
        dotActive: "bg-brava-yellow text-brava-black ring-4 ring-brava-yellow/30",
        dotDone: "bg-brava-yellow text-brava-black",
        dotIdle: "bg-white/10 text-white/50 ring-1 ring-white/15",
        labelActive: "text-white font-bold",
        descActive: "text-white/70",
      }
    : {
        bgRail: "bg-zinc-200",
        bgRailDone: "bg-brava-blue",
        dotActive: "bg-brava-blue text-white ring-4 ring-brava-blue/20",
        dotDone: "bg-brava-blue text-white",
        dotIdle: "bg-white text-zinc-400 ring-1 ring-zinc-200",
        labelActive: "text-zinc-900 font-bold",
        descActive: "text-zinc-600",
      };

  return (
    <form
      action={action}
      onSubmit={onSubmit}
      encType={encType}
      className="space-y-6"
      noValidate
    >
      {hiddenFields?.map((h) => (
        <input key={h.name} type="hidden" name={h.name} value={h.value} />
      ))}

      {/* STEPPER */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => {
            const isCurrent = i === current;
            const isDone = i < current;
            return (
              <div key={s.id} className="flex flex-1 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => jumpTo(i)}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black transition ${
                    isCurrent ? stepperColors.dotActive : isDone ? stepperColors.dotDone : stepperColors.dotIdle
                  }`}
                  aria-label={`Etapa ${i + 1}: ${s.title}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isDone ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>
                {i < total - 1 && (
                  <div className={`h-1 flex-1 rounded-full ${isDone ? stepperColors.bgRailDone : stepperColors.bgRail}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-brava-yellow" : "text-brava-blue"}`}>
              Etapa {current + 1} de {total}
            </p>
            <h2 className={`mt-1 text-2xl font-black tracking-tight ${stepperColors.labelActive}`}>
              {steps[current].icon ? <span className="mr-2">{steps[current].icon}</span> : null}
              {steps[current].title}
            </h2>
          </div>
          {steps[current].description && (
            <p className={`max-w-md text-sm ${stepperColors.descActive}`}>{steps[current].description}</p>
          )}
        </div>
      </div>

      {/* STEPS — todos no DOM; inativos têm display:none via variants */}
      <div className="relative">
        {steps.map((s, i) => {
          const state = i === current ? "active" : i < current ? "behind" : "ahead";
          return (
            <motion.div
              key={s.id}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              initial={false}
              animate={state}
              variants={{
                active: { opacity: 1, x: 0, transitionEnd: { display: "block" } },
                behind: { opacity: 0, x: -24, transitionEnd: { display: "none" } },
                ahead: { opacity: 0, x: 24, transitionEnd: { display: "none" } },
              }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={state === "active" ? undefined : { display: "none" }}
              className="space-y-4"
            >
              {s.content}
            </motion.div>
          );
        })}
      </div>

      {errorMessage && (
        <p className={`rounded-xl px-4 py-3 text-sm ${
          isDark
            ? "border border-red-400/40 bg-red-500/10 text-red-200"
            : "border border-red-300 bg-red-50 text-red-700"
        }`}>
          {errorMessage}
        </p>
      )}

      {/* AÇÕES */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        {!isFirst ? (
          <button
            type="button"
            onClick={back}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${
              isDark
                ? "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar
          </button>
        ) : (
          <span />
        )}

        {isLast ? (
          <SubmitButton variant={variant} label={submitLabel} labelPending={submitLabelPending} />
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brava-yellow px-6 py-3 text-sm font-black text-brava-black shadow-xl shadow-brava-yellow/30 transition hover:scale-[1.02]"
          >
            Continuar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {footnote && (
        <div className={`text-center text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>{footnote}</div>
      )}
    </form>
  );
}

function SubmitButton({
  variant,
  label,
  labelPending,
}: {
  variant: "dark" | "light";
  label: string;
  labelPending: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-black shadow-xl transition hover:scale-[1.02] disabled:opacity-60 ${
        variant === "dark"
          ? "bg-brava-yellow text-brava-black shadow-brava-yellow/30"
          : "bg-brava-blue text-white shadow-brava-blue/30"
      }`}
    >
      {pending ? labelPending : label}
      {!pending && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
