import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/apresentacao/print-button";

export const metadata = {
  title: "BRAVA+ pra entregadores · Seu horário, sua renda, PIX direto",
  description:
    "Vire entregador freelance BRAVA+. Sem mensalidade, sem patrão, sem app intermediário. Aceita só o que vale a pena, recebe direto no PIX, escolhe quando trabalhar.",
};

export const dynamic = "force-dynamic";

export default async function ApresentacaoEntregadorPage() {
  const supabase = await createClient();
  const [{ count: estabsCount }, { count: deliverersCount }] = await Promise.all([
    supabase.from("establishments").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("deliverers").select("*", { count: "exact", head: true }).eq("status", "approved"),
  ]);

  return (
    <>
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { background: #fff !important; color: #0a0a0a !important; }
        }
      `}</style>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brava-black via-zinc-900 to-orange-900 text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #FBBF24 1px, transparent 1px), radial-gradient(circle at 80% 70%, #fb923c 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-orange-500/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">
            BRAVA<span className="text-white">+</span> · pra entregadores
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            Sua moto,{" "}
            <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
              seu horário
            </span>
            , seu ganho.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            Sem mensalidade, sem chefe, sem ficar refém de algoritmo opaco.
            <strong className="font-bold text-white"> Você escolhe quais entregas aceitar</strong>, vê o ganho
            antes de aceitar, e recebe direto no PIX — diário ou semanal.
          </p>

          <div className="no-print mt-10 flex flex-wrap gap-3">
            <Link
              href="/seja-entregador"
              className="inline-flex h-12 items-center rounded-xl bg-brava-yellow px-6 text-sm font-black text-brava-black transition hover:scale-[1.02]"
            >
              Quero ser entregador BRAVA+ →
            </Link>
            <PrintButton />
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {[
              { v: `${deliverersCount ?? 30}+`, l: "entregadores ativos" },
              { v: `${estabsCount ?? 50}+`, l: "lojas com delivery" },
              { v: "1 dia", l: "PIX direto na conta" },
              { v: "R$ 0", l: "mensalidade BRAVA+" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
                <div className="text-3xl font-black tracking-tight md:text-4xl">{s.v}</div>
                <div className="mt-1 text-xs text-white/60 md:text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROBLEMA ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">o que cansa</p>
            <h2 className="text-3xl font-black text-zinc-900 md:text-5xl">
              Você já passou por isso?
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { e: "🤐", t: "Algoritmo opaco", d: "Você nunca sabe por que aceitaram ou rejeitaram sua entrega. Cai a nota e ninguém te explica." },
              { e: "💸", t: "Mensalidade que come o lucro", d: "Plataforma cobra plano semanal/mensal e ainda fica com 25-30% do frete. Conta não fecha." },
              { e: "⏳", t: "Pagamento que demora", d: "Trabalhou hoje, dinheiro só na semana que vem. E ainda tem taxa pra antecipar." },
            ].map((p, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6">
                <div className="text-4xl">{p.e}</div>
                <div className="mt-3 text-lg font-black text-zinc-900">{p.t}</div>
                <div className="mt-2 text-sm text-zinc-600">{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PILARES ============ */}
      <section className="print-break bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">como funciona BRAVA+</p>
            <h2 className="text-3xl font-black md:text-5xl">3 coisas que mudam tudo</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Você decide", d: "Toggle online/offline no app. Você escolhe horário, raio, tipo de entrega. Sem meta forçada, sem desligamento por recusa." },
              { n: "02", t: "Ganho transparente", d: "Antes de aceitar, vê: distância, ganho, restaurante, destino. Sem mistério. Aceitou, dinheiro tá garantido." },
              { n: "03", t: "PIX no seu CPF", d: "Diário ou semanal — você escolhe. Sem taxa de antecipação. Sem cofre virtual amarrado." },
            ].map((p) => (
              <div key={p.n} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="font-mono text-3xl font-black text-brava-yellow">{p.n}</div>
                <div className="mt-3 text-xl font-black">{p.t}</div>
                <div className="mt-2 text-sm text-white/70">{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CALCULADORA DE GANHO ============ */}
      <section className="bg-gradient-to-br from-amber-50 via-yellow-50 to-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-amber-700">faz a conta</p>
            <h2 className="text-3xl font-black text-zinc-900 md:text-5xl">Quanto dá pra ganhar de verdade?</h2>
            <p className="mt-3 text-zinc-600">Sem firula. Conta direta com taxa real BRAVA+.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <PriceCard
              titulo="Período diurno"
              detalhe="8h–14h · 4 entregas/h · 5km média"
              calculo={[
                { label: "Taxa base × 32 entregas", value: "R$ 192" },
                { label: "Distância (5 km × R$ 1,50 × 32)", value: "R$ 240" },
                { label: "Bônus de pico (almoço)", value: "+R$ 80" },
              ]}
              total="R$ 512"
              periodo="por dia"
              tone="amber"
            />
            <PriceCard
              titulo="Período noturno"
              detalhe="18h–24h · 5 entregas/h · 4km média"
              calculo={[
                { label: "Taxa base × 30 entregas", value: "R$ 180" },
                { label: "Distância (4 km × R$ 1,50 × 30)", value: "R$ 180" },
                { label: "Bônus de pico (jantar + chuva)", value: "+R$ 120" },
              ]}
              total="R$ 480"
              periodo="por dia"
              tone="orange"
              highlight
            />
            <PriceCard
              titulo="Fim de semana cheio"
              detalhe="Sábado/Domingo · 8h trabalho"
              calculo={[
                { label: "Taxa base × 40 entregas", value: "R$ 240" },
                { label: "Distância (5 km × R$ 1,50 × 40)", value: "R$ 300" },
                { label: "Bônus pico dobrado", value: "+R$ 160" },
              ]}
              total="R$ 700"
              periodo="por dia"
              tone="emerald"
            />
          </div>

          <div className="mt-8 rounded-3xl border-2 border-brava-yellow/40 bg-white p-6 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Projeção mensal honesta</div>
            <div className="mt-2 text-5xl font-black text-zinc-900">R$ 7.000 a R$ 12.000</div>
            <p className="mt-2 text-sm text-zinc-600">
              Trabalhando 5-6 dias/semana, 6-8h/dia, em região com demanda. <b>Sem mensalidade</b> abatendo, <b>sem comissão de 30%</b> em cima.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FERRAMENTAS QUE O APP TEM ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">o app pro entregador</p>
            <h2 className="text-3xl font-black text-zinc-900 md:text-5xl">Tudo que você precisa, nada do que atrapalha</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { e: "🟢", t: "Toggle online/offline", d: "Verde = recebendo oferta. Você desliga quando quiser, sem penalização." },
              { e: "📍", t: "Aceita ou rejeita por oferta", d: "Vê distância, ganho, restaurante antes de decidir. Sem surpresa." },
              { e: "🗺️", t: "Otimizador de rota", d: "Pegou 2+ entregas? Sistema sugere a ordem mais rápida, considerando trânsito." },
              { e: "🔒", t: "Código 4 dígitos", d: "Cliente fala o código quando recebe — fecha pedido e libera pagamento sem app intermediário." },
              { e: "💬", t: "Chat direto com a loja", d: "Dúvida sobre o pedido? Fala com o lojista pelo app, sem trocar de plataforma." },
              { e: "⭐", t: "Avaliação dos dois lados", d: "Cliente e loja te avaliam. Você também avalia eles. Quem dá problema, é tratado." },
              { e: "🎁", t: "Bônus de pico", d: "Horário/região com demanda alta = ganho 2x. Você vê em tempo real onde tá pico." },
              { e: "🆘", t: "Suporte humano 24/7", d: "Acidente, problema com cliente, qualquer emergência: time BRAVA+ atende." },
              { e: "📊", t: "Histórico transparente", d: "Veja todas suas entregas, ganhos, avaliações. Tudo exportável." },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border-2 border-zinc-200 bg-white p-5">
                <div className="text-3xl">{f.e}</div>
                <div className="mt-2 text-lg font-black text-zinc-900">{f.t}</div>
                <div className="mt-1 text-sm text-zinc-600">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMO COMEÇAR ============ */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">passo a passo</p>
            <h2 className="text-3xl font-black text-zinc-900 md:text-5xl">Em 24h você tá rodando</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              { n: "1", t: "Cadastro online", d: "5 minutos. Foto da CNH, MEI, moto e foto sua." },
              { n: "2", t: "Aprovação rápida", d: "Time BRAVA+ valida em até 24h úteis. Sem reunião presencial." },
              { n: "3", t: "Ficou online", d: "Toggle verde no app. Começa a receber ofertas perto de você." },
              { n: "4", t: "Primeira entrega", d: "Bônus iniciante: +R$ 50 nas 5 primeiras entregas." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-brava-yellow font-black text-brava-black">{s.n}</div>
                <div className="mt-3 text-lg font-black text-zinc-900">{s.t}</div>
                <div className="mt-1 text-sm text-zinc-600">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARATIVO ============ */}
      <section className="bg-brava-black py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">vs concorrência</p>
            <h2 className="text-3xl font-black md:text-5xl">Por que BRAVA+?</h2>
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/10 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">O que importa</th>
                  <th className="px-4 py-3 text-center">Apps tradicionais</th>
                  <th className="px-4 py-3 text-center text-brava-yellow">BRAVA+</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Mensalidade", "R$ 30-80/sem", "R$ 0"],
                  ["Comissão sobre o frete", "25-30%", "0% (taxa só pra loja)"],
                  ["Tempo até receber", "7 dias", "Diário ou semanal"],
                  ["Antecipação", "Com taxa", "Grátis"],
                  ["Vê ganho antes de aceitar", "Parcial", "Sempre"],
                  ["Suporte humano 24/7", "Quase nunca", "Sim"],
                  ["Bloqueio por recusa", "Frequente", "Nunca"],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="px-4 py-3 font-bold">{row[0]}</td>
                    <td className="px-4 py-3 text-center text-white/70">{row[1]}</td>
                    <td className="px-4 py-3 text-center font-bold text-brava-yellow">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Pronto pra{" "}
            <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
              ganhar mais
            </span>
            ?
          </h2>
          <p className="mt-5 text-lg text-white/80">
            Cadastro em 5 minutos. Aprovação em 24h. Primeira entrega libera bônus de R$ 50.
          </p>
          <div className="no-print mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/seja-entregador"
              className="inline-flex h-14 items-center rounded-xl bg-brava-yellow px-8 text-base font-black text-brava-black transition hover:scale-[1.02]"
            >
              Quero me cadastrar agora →
            </Link>
            <Link
              href="/apresentacao/usuario"
              className="inline-flex h-14 items-center rounded-xl border border-white/25 bg-white/5 px-8 text-base font-bold text-white backdrop-blur hover:bg-white/10"
            >
              Sou cliente, quero usar
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/50">
            BRAVA+ Entregadores · Sem mensalidade · Sem letrinha miúda
          </p>
        </div>
      </section>
    </>
  );
}

function PriceCard({
  titulo, detalhe, calculo, total, periodo, tone, highlight,
}: {
  titulo: string;
  detalhe: string;
  calculo: { label: string; value: string }[];
  total: string;
  periodo: string;
  tone: "amber" | "orange" | "emerald";
  highlight?: boolean;
}) {
  const toneCls = tone === "orange"
    ? "border-orange-400/60 bg-gradient-to-br from-orange-50 to-amber-50"
    : tone === "emerald"
    ? "border-emerald-400/60 bg-gradient-to-br from-emerald-50 to-green-50"
    : "border-amber-300/60 bg-gradient-to-br from-amber-50 to-yellow-50";
  return (
    <div className={`relative rounded-2xl border-2 ${toneCls} p-5 ${highlight ? "scale-[1.03] shadow-xl" : "shadow-sm"}`}>
      {highlight && (
        <span className="absolute -top-3 right-4 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase text-white">★ comum</span>
      )}
      <div className="text-sm font-black text-zinc-900">{titulo}</div>
      <div className="text-xs text-zinc-600">{detalhe}</div>
      <ul className="mt-3 space-y-1 border-t border-zinc-200/60 pt-3 text-xs">
        {calculo.map((c, i) => (
          <li key={i} className="flex justify-between">
            <span className="text-zinc-600">{c.label}</span>
            <span className="font-mono font-bold text-zinc-900">{c.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t-2 border-zinc-900 pt-3">
        <div className="text-3xl font-black text-zinc-900">{total}</div>
        <div className="text-xs text-zinc-600">{periodo}</div>
      </div>
    </div>
  );
}
