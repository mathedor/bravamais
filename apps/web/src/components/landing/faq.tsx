"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "Como funciona o BRAVA+?",
    a: "Você assina o clube (a partir de R$ 19,90/mês), e na hora libera cupons, vale-presentes, programa de fidelidade e cashback em coins nos parceiros credenciados. Mostra a carteirinha QR no balcão e o lojista valida.",
  },
  {
    q: "Posso testar antes de pagar?",
    a: "Sim. Os primeiros 7 dias são grátis em qualquer plano. Você pode cancelar antes do fim do trial sem cobrança.",
  },
  {
    q: "Quais formas de pagamento?",
    a: "PIX (via Efí Bank) ou cartão de crédito com renovação automática. Você consegue cancelar a qualquer momento no seu perfil — o benefício continua até o fim do período pago.",
  },
  {
    q: "Os cupons têm fidelidade?",
    a: "Não. Você usa o cupom direto no balcão. Cada parceiro define regras próprias (limite por usuário, valor mínimo, validade) que ficam visíveis no app.",
  },
  {
    q: "Sou lojista, como entro no clube?",
    a: "Crie sua conta em /seja-parceiro. O plano lojista Básico é grátis. PRO (R$ 99/mês) libera promo flash ilimitada, BI de receita, CRM e roleta da sorte.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Seguimos a LGPD. Você pode exportar todos seus dados ou solicitar exclusão da conta em /app/perfil/dados a qualquer momento.",
  },
];

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-brava-black py-20 text-white">
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">Perguntas frequentes</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Tire suas dúvidas</h2>

        <div className="mt-10 space-y-2">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <article key={i} className={`overflow-hidden rounded-3xl border transition ${isOpen ? "border-brava-yellow bg-white/5" : "border-white/10 bg-white/[0.02]"}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left"
                >
                  <p className="font-bold">{item.q}</p>
                  <span className={`text-2xl transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-white/70">{item.a}</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
