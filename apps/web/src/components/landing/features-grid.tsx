"use client";

import { motion, useReducedMotion } from "framer-motion";

const FEATURES = [
  {
    titulo: "Carteirinha QR digital",
    desc: "Mostre o QR no balcão e o lojista marca sua visita no mesmo segundo. Acumula no clube de fidelidade automaticamente.",
    pin: "01",
  },
  {
    titulo: "Cupons de desconto",
    desc: "Códigos exclusivos pra assinantes BRAVA+, aplicados no checkout direto. Sem precisar pechinchar.",
    pin: "02",
  },
  {
    titulo: "Vale-presente mensal",
    desc: "Premium e VIP ganham créditos todo mês pra usar em qualquer parceiro. É dinheiro caindo na sua carteira.",
    pin: "03",
  },
  {
    titulo: "Vale-compras acumulado",
    desc: "Saldo BRAVA+ que cresce com você. Use quando quiser, onde quiser, com os parceiros do clube.",
    pin: "04",
  },
  {
    titulo: "Clube de fidelidade",
    desc: "Cada lugar tem seu desafio: X visitas = recompensa real. A gente conta as visitas, você curte os prêmios.",
    pin: "05",
  },
  {
    titulo: "Cashback inteligente",
    desc: "Parte do que você gasta volta como saldo BRAVA+. Quanto mais você usa, mais economiza nas próximas.",
    pin: "06",
  },
  {
    titulo: "Mapa de parceiros perto",
    desc: "Geolocalização real: encontre estabelecimentos do clube a poucos passos de onde você está.",
    pin: "07",
  },
  {
    titulo: "Compra online direto",
    desc: "Pague no cartão ou PIX dentro do app. Cupom aplicado, sem ter que sair pro site da loja.",
    pin: "08",
  },
  {
    titulo: "Chat com os lojistas",
    desc: "Pergunta direto. Reserva mesa. Vê disponibilidade. Tudo pelo chat, sem telefonar.",
    pin: "09",
  },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export function FeaturesGrid() {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f, i) => (
        <motion.article
          key={f.pin}
          initial={reduce ? false : { y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: i * 0.05, ease: easeOut }}
          whileHover={{ scale: 1.02, zIndex: 1 }}
          className="group relative cursor-default overflow-hidden bg-brava-black p-8 transition-colors duration-500 hover:bg-brava-ink"
        >
          <span className="absolute right-6 top-6 text-sm font-bold text-brava-yellow/40">{f.pin}</span>
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brava-yellow text-brava-blue transition-transform group-hover:rotate-12 group-hover:scale-110">
            <span className="text-3xl font-black">+</span>
          </div>
          <h3 className="text-2xl font-black leading-tight text-white">{f.titulo}</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/65">{f.desc}</p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05 + 0.4, ease: easeOut }}
            className="mt-6 h-px origin-left bg-gradient-to-r from-brava-yellow via-brava-yellow/30 to-transparent"
          />
        </motion.article>
      ))}
    </div>
  );
}
