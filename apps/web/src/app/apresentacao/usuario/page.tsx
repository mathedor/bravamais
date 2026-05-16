import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/apresentacao/print-button";
import { EconomyCalculator } from "@/components/apresentacao/economy-calculator";

export const metadata = {
  title: "BRAVA+ · O clube de vantagens que paga a conta",
  description:
    "Pague pouco, economize muito. Mais de 50 parceiros, cupons direto no app, fidelidade, cashback em BRAVA Coins e delivery integrado. Faça a conta: o Básico paga sozinho.",
};

export const dynamic = "force-dynamic";

export default async function ApresentacaoUsuarioPage() {
  const supabase = await createClient();
  const [{ count: estabsCount }, { count: cuponsCount }, { count: categoriasCount }] = await Promise.all([
    supabase.from("establishments").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("coupons").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("categories").select("*", { count: "exact", head: true }).eq("is_active", true),
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
      <section className="relative overflow-hidden bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #FBBF24 1px, transparent 1px), radial-gradient(circle at 80% 70%, #2563EB 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-brava-yellow/20 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">
            BRAVA<span className="text-white">+</span> · pra você que sai de casa
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            Pague pouco.{" "}
            <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
              Economize muito
            </span>
            .
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            O clube de vantagens BRAVA+ junta os melhores parceiros da sua cidade com{" "}
            <strong className="font-bold text-white">cupons, fidelidade, vale-presente, cashback em coins</strong>{" "}
            e delivery integrado num app só. Em um mês você economiza mais que paga.
          </p>

          <div className="no-print mt-10 flex flex-wrap gap-3">
            <Link
              href="/cadastro"
              className="inline-flex h-12 items-center rounded-xl bg-brava-yellow px-6 text-sm font-black text-brava-black transition hover:scale-[1.02]"
            >
              Começar 7 dias grátis →
            </Link>
            <PrintButton />
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {[
              { v: `${estabsCount ?? 50}+`, l: "parceiros ativos" },
              { v: `${cuponsCount ?? 30}+`, l: "cupons rolando" },
              { v: `${categoriasCount ?? 15}`, l: "categorias" },
              { v: "R$ 19,90", l: "plano Básico" },
            ].map((s) => (
              <div key={s.l}>
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
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
              o problema
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              Todo dia você gasta. <span className="text-rose-500">Sem desconto algum.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-600">
              Café, almoço, jantar, delivery, academia, corte de cabelo, pet shop, presente pro amigo.
              Cada conta paga o preço cheio. Por mês são <strong>centenas de reais</strong> indo embora
              sem ninguém lembrar de você.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { emoji: "💸", title: "Sem cupom, sem fidelidade", desc: "Quem tá só passando paga igualzinho a quem volta toda semana." },
              { emoji: "📲", title: "Cupom só no Insta?", desc: "Tem que ficar caçando, salvando print, mostrando no balcão. Ninguém aguenta." },
              { emoji: "🤝", title: "Sem ecossistema", desc: "Cada loja com seu programa diferente, cartão fidelidade no bolso, nada se conversa." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-3xl">{p.emoji}</div>
                <p className="mt-3 font-bold text-zinc-900">{p.title}</p>
                <p className="mt-1 text-sm text-zinc-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SOLUÇÃO ============ */}
      <section className="bg-gradient-to-br from-zinc-50 via-amber-50/60 to-yellow-100/30 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
              a solução
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              BRAVA<span className="text-brava-yellow-deep">+</span> junta{" "}
              <span className="bg-gradient-to-r from-brava-blue to-brava-blue-bright bg-clip-text text-transparent">
                tudo em um app só
              </span>
              .
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-700">
              Uma assinatura. Dezenas de parceiros. Você abre o app, vê o que tá perto, escolhe a promoção certa,
              mostra a carteirinha digital. Pronto.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: "🎟️", title: "Cupom de desconto", desc: "Lista cheia de códigos rolando agora. Uma toque, código aparece, mostra no balcão." },
              { emoji: "⭐", title: "Clube de fidelidade", desc: "A cada N visitas você ganha um benefício automático. Sem cartão, sem carimbo, sem fricção." },
              { emoji: "🎁", title: "Vale-presente", desc: "Compre crédito direto da loja com desconto. Use você ou presenteie alguém via link." },
              { emoji: "💳", title: "Carteirinha QR", desc: "Loja escaneia, sua visita é registrada, fidelidade acumula sozinha." },
              { emoji: "🪙", title: "BRAVA Coins", desc: "1% de cashback em toda compra, + bônus por check-in e cupom resgatado. Vira desconto." },
              { emoji: "🛵", title: "Delivery integrado", desc: "Pediu na loja parceira, entregador BRAVA+ leva pra você. Acompanha em tempo real, código de confirmação na porta." },
              { emoji: "📍", title: "Mapa ao vivo", desc: "Tudo que tá perto, no mapa. Promo ativa? O pino fica destacado." },
              { emoji: "🔔", title: "Geo push", desc: "Passou a menos de 500m de um parceiro com promo ativa? Recebe notificação na hora." },
              { emoji: "🎂", title: "Bônus aniversário", desc: "No seu dia, cupom premium automático + presente de coins na conta. Por nossa conta." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-brava-border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="text-3xl">{p.emoji}</div>
                <p className="mt-3 font-bold text-zinc-900">{p.title}</p>
                <p className="mt-1 text-sm text-zinc-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CALCULADORA ============ */}
      <section className="print-break bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
              faça a conta
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              A mensalidade se paga em{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                1 cupom
              </span>
              .
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-600">
              Não é promessa de marketing. Mexe os controles abaixo com seus hábitos reais e olha o resultado.
            </p>
          </div>

          <div className="mt-12">
            <EconomyCalculator />
          </div>

          {/* Exemplo concreto */}
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              {
                title: "Corte de cabelo R$ 60",
                detail: "Com 15% off nos parceiros: R$ 51",
                save: "R$ 9 num corte",
                color: "from-amber-200 to-yellow-100",
              },
              {
                title: "Almoço R$ 50",
                detail: "Com 12% off, 8x no mês: R$ 48 economizados",
                save: "Pagou +2 vezes a mensalidade",
                color: "from-emerald-200 to-emerald-100",
              },
              {
                title: "Academia R$ 130",
                detail: "Com 20% off: R$ 104. Economiza R$ 26 todo mês",
                save: "+1 mensalidade BRAVA+ Básico",
                color: "from-blue-200 to-cyan-100",
              },
            ].map((e) => (
              <div key={e.title} className={`rounded-2xl bg-gradient-to-br ${e.color} p-5`}>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-700">{e.title}</p>
                <p className="mt-2 text-sm text-zinc-800">{e.detail}</p>
                <p className="mt-3 text-lg font-black text-zinc-900">💚 {e.save}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
              como funciona
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              4 passos. Zero burocracia.
            </h2>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: 1, title: "Assine", desc: "Plano a partir de R$ 19,90/mês. PIX ou cartão. 7 dias grátis pra testar." },
              { n: 2, title: "Escolha o parceiro", desc: "Mapa ao vivo, busca por categoria, filtro por proximidade. Você vê tudo que tem perto." },
              { n: 3, title: "Mostre a carteirinha", desc: "Chega na loja, abre a carteirinha digital, balcão lê o QR. Sua visita conta na fidelidade." },
              { n: 4, title: "Economize", desc: "Cupom aplicado, fidelidade acumulando, coins caindo, próxima compra sai mais barata ainda." },
            ].map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-brava-border bg-white p-5">
                <div className="absolute -top-4 left-5 grid h-10 w-10 place-items-center rounded-2xl bg-brava-yellow font-black text-brava-black shadow-lg">
                  {s.n}
                </div>
                <p className="mt-4 font-bold text-zinc-900">{s.title}</p>
                <p className="mt-1 text-sm text-zinc-600">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ ECOSSISTEMA ============ */}
      <section className="print-break bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">
              ecossistema completo
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Não é um app de cupom.{" "}
              <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
                É uma rede inteira
              </span>{" "}
              te servindo.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                emoji: "🏪",
                title: "Lojista",
                desc: "Cadastra catálogo, configura clube de fidelidade, escaneia QR no balcão, dispara cupom flash quando tá vazio.",
              },
              {
                emoji: "🛵",
                title: "Entregador",
                desc: "App PWA dedicado, rota otimizada por GPS, código 4 dígitos pra confirmar entrega. Pode ser da loja ou freelancer aprovado pelo BRAVA+.",
              },
              {
                emoji: "🎯",
                title: "Você (assinante)",
                desc: "Carteirinha QR, cupons salvos, vale-presente, coins acumulando, mapa, geo-push, chat com a loja, histórico.",
              },
              {
                emoji: "🤝",
                title: "Comunidade",
                desc: "Indique amigo: ambos ganham 50 coins. Convide a galera, todo mundo economiza junto.",
              },
            ].map((p) => (
              <div key={p.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-4xl">{p.emoji}</div>
                <p className="mt-4 text-lg font-bold">{p.title}</p>
                <p className="mt-2 text-sm text-white/70">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-brava-yellow/30 bg-brava-yellow/5 p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brava-yellow">Stories interativos</p>
                <p className="mt-2 text-2xl font-black leading-tight text-white">
                  Vê o que tá rolando na loja agora mesmo
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Cada parceiro posta stories (igual Instagram) com promoção do dia, enquete, e botão &quot;resgatar agora&quot;
                  pra cupom direto no story.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-3xl">
                <div className="rounded-2xl bg-white/10 p-3">📸</div>
                <div className="rounded-2xl bg-white/10 p-3">🎰</div>
                <div className="rounded-2xl bg-white/10 p-3">💬</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PLANOS ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
              planos
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              Escolha do seu jeito.
            </h2>
            <p className="mt-5 text-lg text-zinc-600">
              Comece pelo Básico (7 dias grátis, depois R$ 19,90/mês). Vai pra Premium quando quiser chat com lojista e
              vale-presente mensal de brinde. VIP é pros que querem tudo.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[
              {
                tier: "Básico",
                price: "R$ 19,90",
                periodo: "/mês",
                desc: "Todo o essencial pra economizar.",
                features: [
                  "Acesso a todos os parceiros",
                  "Cupons ilimitados",
                  "Carteirinha QR + fidelidade",
                  "BRAVA Coins (1% cashback)",
                  "Mapa + geo-push",
                ],
                cta: "Começar Básico",
                color: "bg-white border-brava-border text-zinc-900",
                ctaColor: "bg-brava-black text-white",
              },
              {
                tier: "Premium",
                price: "R$ 39,90",
                periodo: "/mês",
                desc: "Pra quem usa o clube todo dia.",
                features: [
                  "Tudo do Básico",
                  "Chat direto com lojistas",
                  "Vale-presente mensal de R$ 30",
                  "Descontos exclusivos +20%",
                  "Suporte prioritário",
                ],
                cta: "Quero Premium",
                color: "bg-gradient-to-br from-brava-blue to-indigo-700 border-brava-blue text-white relative ring-4 ring-brava-yellow/40",
                ctaColor: "bg-brava-yellow text-brava-black",
                badge: "Mais escolhido",
              },
              {
                tier: "VIP",
                price: "R$ 79,90",
                periodo: "/mês",
                desc: "Pra quem quer tudo da rede.",
                features: [
                  "Tudo do Premium",
                  "Eventos exclusivos BRAVA+",
                  "Early access a novos parceiros",
                  "Cashback dobrado (2% em coins)",
                  "Concierge pessoal",
                ],
                cta: "Quero VIP",
                color: "bg-zinc-900 border-zinc-800 text-white",
                ctaColor: "bg-brava-yellow text-brava-black",
              },
            ].map((p) => (
              <div key={p.tier} className={`relative rounded-3xl border p-6 shadow-md sm:p-8 ${p.color}`}>
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brava-yellow px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-brava-black">
                    {p.badge}
                  </span>
                )}
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">{p.tier}</p>
                <p className="mt-3 text-4xl font-black tracking-tight">
                  {p.price}
                  <span className="text-base font-medium opacity-70">{p.periodo}</span>
                </p>
                <p className="mt-2 text-sm opacity-80">{p.desc}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-brava-yellow">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={`no-print mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-black transition hover:scale-[1.02] ${p.ctaColor}`}
                >
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NÚMEROS ============ */}
      <section className="bg-brava-yellow py-16 text-brava-black md:py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
            no fim do ano
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Um assinante BRAVA+ típico economiza{" "}
            <span className="bg-gradient-to-r from-brava-blue to-brava-blue-bright bg-clip-text text-transparent">
              R$ 2.400+
            </span>{" "}
            no ano.
          </h2>
          <p className="mt-6 text-lg text-zinc-700">
            Em 12 mensalidades pagas, ele economiza o equivalente a{" "}
            <strong>10 meses de assinatura de volta</strong>. Sem contar fidelidade premiada,
            cashback e vale-presente.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-brava-black/95 p-6 text-white">
              <p className="text-4xl font-black">R$ 238,80</p>
              <p className="mt-1 text-xs text-white/70">12 meses do plano Básico</p>
            </div>
            <div className="rounded-2xl bg-brava-blue p-6 text-white">
              <p className="text-4xl font-black">R$ 2.400+</p>
              <p className="mt-1 text-xs text-white/85">economia anual média</p>
            </div>
            <div className="rounded-2xl bg-emerald-500 p-6 text-white">
              <p className="text-4xl font-black">10x</p>
              <p className="mt-1 text-xs text-white/85">o que pagou de mensalidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Pronto pra{" "}
            <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
              economizar
            </span>
            ?
          </h2>
          <p className="mt-5 text-lg text-white/80">
            7 dias grátis, sem cartão de crédito, sem letrinha miúda. Cadastra em 1 minuto e já entra no clube.
          </p>
          <div className="no-print mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/cadastro"
              className="inline-flex h-14 items-center rounded-xl bg-brava-yellow px-8 text-base font-black text-brava-black transition hover:scale-[1.02]"
            >
              Quero entrar no clube agora →
            </Link>
            <Link
              href="/"
              className="inline-flex h-14 items-center rounded-xl border border-white/25 bg-white/5 px-8 text-base font-bold text-white backdrop-blur hover:bg-white/10"
            >
              Conhecer mais
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/50">
            BRAVA+ · Clube de vantagens · Cancela quando quiser
          </p>
        </div>
      </section>
    </>
  );
}
