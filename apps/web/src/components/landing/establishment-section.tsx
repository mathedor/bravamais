"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const PERKS = [
  { t: "Vitrine no clube", d: "Sua loja aparece pra quem está buscando lugar pra usar vantagens. Cliente já chega pronto pra consumir." },
  { t: "Cupons sob demanda", d: "Crie códigos pra atrair quem nunca veio ou pra premiar quem já é assíduo. Você define a regra." },
  { t: "Fidelidade fácil", d: "X visitas = brinde Y. A gente conta, lê o QR e te avisa quando o cliente bateu a meta." },
  { t: "Vale-presente e cashback", d: "Ferramentas de retenção e datas comemorativas sem precisar contratar agência." },
  { t: "Catálogo + checkout", d: "Receba pedidos com PIX ou cartão dentro do BRAVA+. Sem investir em e-commerce próprio." },
  { t: "Chat direto", d: "Tire dúvida, faça reserva, venda. Sem intermediário, sem perder o cliente pro WhatsApp do concorrente." },
  { t: "Validação por QR", d: "Câmera do celular lê a carteirinha do cliente em segundos. Marca a visita na hora." },
  { t: "Painel com dados reais", d: "Quem é seu melhor cliente, qual cupom converte mais, melhor dia da semana. Tudo no painel." },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export function EstablishmentSection() {
  const reduce = useReducedMotion();

  return (
    <section id="estabelecimento" className="relative overflow-hidden bg-gradient-to-br from-brava-black via-brava-ink to-brava-black py-32 text-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 opacity-15"
        aria-hidden
      >
        <svg viewBox="0 0 400 400" className="h-[700px] w-[700px]">
          <g transform="translate(200,200)">
            <path
              d="M -55 -160 L 55 -160 Q 70 -160 70 -145 L 70 -85 Q 70 -70 85 -70 L 145 -70 Q 160 -70 160 -55 L 160 55 Q 160 70 145 70 L 85 70 Q 70 70 70 85 L 70 145 Q 70 160 55 160 L -55 160 Q -70 160 -70 145 L -70 85 Q -70 70 -85 70 L -145 70 Q -160 70 -160 55 L -160 -55 Q -160 -70 -145 -70 L -85 -70 Q -70 -70 -70 -85 L -70 -145 Q -70 -160 -55 -160 Z"
              fill="#FBBF24"
            />
          </g>
        </svg>
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div
          initial={reduce ? false : { y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: easeOut }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brava-yellow/40 bg-brava-yellow/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brava-yellow">
            Estabelecimentos
          </span>
          <h2 className="mt-6 max-w-4xl text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
            Encha sua loja com clientes <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">que já querem voltar</span>.
          </h2>
          <p className="mt-8 max-w-2xl text-lg text-white/70 md:text-xl">
            Assinantes BRAVA+ procuram lugares pra usar suas vantagens. Coloque sua loja no clube e seja descoberto por quem está pronto pra consumir — e pra voltar.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p, i) => (
            <motion.article
              key={p.t}
              initial={reduce ? false : { y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: easeOut }}
              whileHover={{ scale: 1.02, zIndex: 1 }}
              className="group cursor-default bg-brava-black p-7 transition-colors hover:bg-brava-ink"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brava-yellow text-brava-blue transition-transform group-hover:rotate-12">
                <span className="text-2xl font-black">+</span>
              </div>
              <h3 className="text-lg font-bold text-white">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{p.d}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={reduce ? false : { y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
          className="mt-20 grid items-center gap-10 rounded-3xl border border-white/10 bg-gradient-to-br from-brava-yellow/20 via-brava-yellow/5 to-transparent p-10 md:p-16 lg:grid-cols-[1.5fr_1fr]"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">Cresça com a gente</p>
            <h3 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              Atraia novos clientes e fidelize os que já amam você.
            </h3>
            <p className="mt-6 max-w-xl text-white/75">
              Cadastro rápido, sem mensalidade pra começar. Você cria sua vitrine, configura cupons e fidelidade — a gente traz o cliente.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cadastro-estabelecimento"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-brava-yellow px-8 py-4 text-base font-bold text-brava-black shadow-2xl shadow-brava-yellow/30 transition-transform hover:scale-105"
              >
                <span className="relative z-10">Cadastrar minha loja</span>
                <svg className="relative z-10 transition-transform group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/seja-parceiro"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur hover:bg-white/10"
              >
                Como funciona
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl border border-white/10 bg-brava-black/60 p-5 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-brava-yellow">resultado parceiro</p>
              <p className="mt-2 text-4xl font-black text-white">+34%</p>
              <p className="text-sm text-white/60">aumento em recorrência mensal</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="rounded-2xl border border-white/10 bg-brava-black/60 p-5 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-brava-yellow">cliente bate fidelidade</p>
              <p className="mt-2 text-4xl font-black text-white">5x</p>
              <p className="text-sm text-white/60">mais rápido que sem programa próprio</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="rounded-2xl border border-white/10 bg-brava-black/60 p-5 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-brava-yellow">tempo até estar no ar</p>
              <p className="mt-2 text-4xl font-black text-white">24h</p>
              <p className="text-sm text-white/60">do cadastro até receber clientes</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
