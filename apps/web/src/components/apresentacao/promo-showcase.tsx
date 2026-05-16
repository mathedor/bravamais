"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Promo {
  id: string;
  emoji: string;
  title: string;
  oneline: string;
  body: string;
  preview: React.ReactNode;
  color: string;
}

const PROMOS: Promo[] = [
  {
    id: "cupom",
    emoji: "🎟️",
    title: "Cupom de desconto",
    oneline: "% ou R$ off, código único",
    body: "Crie em segundos: desconto fixo ou %, valor mínimo, validade, limite de uso por cliente, tier exigido (Premium/VIP). Cliente vê no app e revela o código no balcão.",
    color: "from-amber-200 to-yellow-100",
    preview: (
      <div className="rounded-2xl border-2 border-dashed border-brava-yellow bg-brava-yellow/10 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-white px-2 py-1 font-mono text-[10px] font-bold text-zinc-500">CAFE10</span>
          <span className="text-3xl font-black text-brava-blue">-15%</span>
        </div>
        <p className="mt-3 text-sm font-bold text-zinc-900">Café Mineiro · Desconto na primeira visita</p>
        <p className="mt-1 text-xs text-zinc-600">Mínimo R$ 20 · até 31/12 · 1× por cliente</p>
      </div>
    ),
  },
  {
    id: "fidelidade",
    emoji: "⭐",
    title: "Clube de fidelidade",
    oneline: "X visitas = Y benefício",
    body: "Defina quantas visitas/compras valem o benefício e qual ele é (item grátis, % off, brinde). Sistema marca sozinho via QR. Cliente vê o progresso no app — quem tá quase lá volta antes.",
    color: "from-emerald-200 to-emerald-100",
    preview: (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brava-blue">Clube do café</p>
        <p className="mt-1 text-base font-black text-zinc-900">A cada 8 cafés = 1 grátis</p>
        <div className="mt-4 flex gap-1.5">
          {[1,2,3,4,5,6,7,8].map((n) => (
            <div
              key={n}
              className={`h-8 flex-1 rounded-md ${n <= 5 ? "bg-brava-yellow" : "bg-zinc-100"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-600">5/8 visitas · faltam 3 cafés</p>
      </div>
    ),
  },
  {
    id: "vale-presente",
    emoji: "🎁",
    title: "Vale-presente",
    oneline: "Cliente compra crédito antecipado",
    body: "Ele paga R$ 100 agora, ganha R$ 110 de crédito (com bônus). Ou compra pra presentear via WhatsApp. Receita antecipada + cliente que VAI voltar pra usar.",
    color: "from-pink-200 to-rose-100",
    preview: (
      <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="text-3xl">🎁</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">vale-presente</span>
        </div>
        <p className="mt-3 text-xl font-black">R$ 110 em crédito</p>
        <p className="text-xs text-white/80">de R$ 100 pago · bônus de 10%</p>
        <p className="mt-3 font-mono text-xs">GIFT-7K9X2M</p>
      </div>
    ),
  },
  {
    id: "coins",
    emoji: "🪙",
    title: "BRAVA Coins (cashback)",
    oneline: "1% volta como crédito",
    body: "Toda compra na sua loja gera coins pro cliente. Coins viram desconto. Cria circuito fechado: ele usa, ganha, volta pra usar de novo. Combustível silencioso de recorrência.",
    color: "from-yellow-200 to-amber-100",
    preview: (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-brava-yellow text-2xl">🪙</div>
          <div className="flex-1">
            <p className="text-sm font-bold text-zinc-900">+85 coins ganhos</p>
            <p className="text-xs text-zinc-600">de uma compra de R$ 85,00</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-white p-2 text-center text-xs text-zinc-600">
          Saldo: <span className="font-bold text-brava-blue">320 coins ≈ R$ 32,00</span>
        </div>
      </div>
    ),
  },
  {
    id: "stories",
    emoji: "📸",
    title: "Stories interativos",
    oneline: "Igual Instagram, com cupom no botão",
    body: "Publique stories direto na ficha da loja com enquete (cliente vota), sticker de cupom (resgata na hora) ou foto do prato do dia. Vence dia/24h. Aparece pra todos os assinantes da rede.",
    color: "from-purple-200 to-fuchsia-100",
    preview: (
      <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 p-5 text-white">
        <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">📸 Story</span>
        <p className="mt-6 text-xl font-black">🍝 Risoto do chef</p>
        <p className="mt-1 text-xs text-white/80">Hoje, R$ 49 → R$ 39 com BRAVA+</p>
        <button className="absolute bottom-4 right-4 left-4 rounded-full bg-white px-4 py-2 text-xs font-black text-brava-blue">
          🎟️ Resgatar -20% agora
        </button>
      </div>
    ),
  },
  {
    id: "roleta",
    emoji: "🎰",
    title: "Roleta da sorte",
    oneline: "Cliente gira no check-in",
    body: "Cada check-in dá 1 giro. Você define os prêmios (cupom, brinde, café grátis, item premium). Gamification que faz cliente vir só pra rodar. Conversão alta porque o prêmio é aleatório mas certeiro.",
    color: "from-orange-200 to-amber-100",
    preview: (
      <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-100 to-amber-50 p-5 text-center">
        <p className="text-3xl">🎰</p>
        <p className="mt-2 text-base font-black text-zinc-900">Você ganhou:</p>
        <p className="mt-1 text-2xl font-black text-brava-blue">Café duplo grátis!</p>
        <p className="mt-2 text-xs text-zinc-600">Mostre o código BR-X7K4 na próxima visita</p>
      </div>
    ),
  },
  {
    id: "blast",
    emoji: "⚡",
    title: "Cupom flash / Blast",
    oneline: "Tá vazio? Dispara desconto agora",
    body: "Botão único: 'Tô vazio, dispara cupom flash de 25% pelas próximas 2h pra clientes que já visitaram nos últimos 60 dias'. Notificação cai no celular de todos os elegíveis. Recupera a hora ociosa.",
    color: "from-red-200 to-pink-100",
    preview: (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-red-600">⚡ Cupom flash · ativo agora</p>
        <p className="mt-2 text-xl font-black text-zinc-900">-25% pelas próximas 2h</p>
        <p className="mt-1 text-xs text-zinc-600">Enviado pra 142 clientes que já visitaram nos últimos 60d</p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="rounded-full bg-white px-2 py-1 font-bold text-zinc-700">✉️ 142 enviadas</span>
          <span className="rounded-full bg-white px-2 py-1 font-bold text-emerald-600">👁️ 38 abertas</span>
          <span className="rounded-full bg-white px-2 py-1 font-bold text-brava-blue">🛒 12 chegaram</span>
        </div>
      </div>
    ),
  },
  {
    id: "embaixador",
    emoji: "👑",
    title: "Embaixadores VIP",
    oneline: "Marca seus 10 melhores",
    body: "Identifique os clientes que mais voltam e gastam. Marque como embaixador. Eles ganham benefícios exclusivos (cupom mensal, prioridade em vale-presente, evento fechado). Lealdade reforçada = boca a boca orgânico.",
    color: "from-violet-200 to-purple-100",
    preview: (
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">👑 Top 5 embaixadores</p>
        <ul className="mt-3 space-y-2">
          {[
            { nome: "Marina S.", visitas: 24, gasto: "R$ 1.840" },
            { nome: "Felipe R.", visitas: 19, gasto: "R$ 1.420" },
            { nome: "Ana C.", visitas: 17, gasto: "R$ 1.230" },
          ].map((c) => (
            <li key={c.nome} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
              <span className="font-bold text-zinc-900">{c.nome}</span>
              <span className="text-zinc-500">{c.visitas} visitas · {c.gasto}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "indique",
    emoji: "🤝",
    title: "Indique e ganhe",
    oneline: "Cliente convida amigos",
    body: "Cliente compartilha código pessoal. Quem usa ganha desconto na primeira compra, ele ganha coins. Sua base cresce sem custo de marketing, só recompensando quem já gosta de você.",
    color: "from-sky-200 to-cyan-100",
    preview: (
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700">🤝 Indique e ganhe</p>
        <p className="mt-2 text-lg font-black text-zinc-900">Marina indicou 3 amigos</p>
        <p className="mt-1 text-xs text-zinc-600">+150 coins na conta dela · 3 novos clientes ativos pra sua loja</p>
        <div className="mt-3 flex -space-x-2">
          {["🙋", "👨", "🙎"].map((e, i) => (
            <div key={i} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-zinc-100 text-sm">
              {e}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function PromoShowcase() {
  const [active, setActive] = useState(PROMOS[0].id);
  const current = PROMOS.find((p) => p.id === active) ?? PROMOS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      {/* Tabs verticais */}
      <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {PROMOS.map((p) => {
          const isActive = p.id === active;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-brava-blue bg-brava-blue/10 shadow-sm"
                  : "border-zinc-200 bg-white hover:border-brava-blue/40 hover:shadow-sm"
              }`}
            >
              <span className="text-2xl">{p.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold ${isActive ? "text-brava-blue" : "text-zinc-900"}`}>
                  {p.title}
                </p>
                <p className="hidden text-xs text-zinc-500 lg:block">{p.oneline}</p>
              </div>
              {isActive && (
                <motion.span
                  layoutId="promo-arrow"
                  className="text-brava-blue"
                >
                  →
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      <div className="space-y-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <div className={`rounded-3xl bg-gradient-to-br ${current.color} p-6`}>
              <span className="text-5xl">{current.emoji}</span>
              <h3 className="mt-4 text-2xl font-black tracking-tight text-zinc-900">{current.title}</h3>
              <p className="mt-2 text-sm text-zinc-700">{current.body}</p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                {current.oneline}
              </p>
            </div>
            <div className="self-center">{current.preview}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
