import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/apresentacao/print-button";
import { RevenueCalculator } from "@/components/apresentacao/revenue-calculator";
import { PromoShowcase } from "@/components/apresentacao/promo-showcase";
import { DeliveryTrackerMock } from "@/components/apresentacao/delivery-tracker-mock";

export const metadata = {
  title: "BRAVA+ pra lojistas · Mais clientes, mais retenção, mais delivery",
  description:
    "Plataforma completa pro seu estabelecimento: 9 tipos de promoção, delivery rastreável com entregadores BRAVA+, CRM mini, blast pra hora vazia, BI de receita incremental. Faça a conta da receita extra real.",
};

export const dynamic = "force-dynamic";

export default async function ApresentacaoLojistaPage() {
  const supabase = await createClient();
  const [{ count: estabsCount }, { count: assinantesCount }, { count: deliverersCount }] = await Promise.all([
    supabase.from("establishments").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "subscriber"),
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
          className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-brava-yellow/20 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">
            BRAVA<span className="text-white">+</span> · pra estabelecimentos
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            Sua loja no centro.{" "}
            <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
              Vendendo mais
            </span>
            , todo dia.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            Não é &quot;mais um app de cupom&quot;. É uma plataforma completa de aquisição, retenção e delivery:
            <strong className="font-bold text-white"> 9 tipos de promoção, BI dedicado, blast pra hora vazia,
            entregadores prontos pra contratar</strong>, e clientes que voltam por causa do clube de fidelidade
            automático.
          </p>

          <div className="no-print mt-10 flex flex-wrap gap-3">
            <Link
              href="/cadastro-estabelecimento"
              className="inline-flex h-12 items-center rounded-xl bg-brava-yellow px-6 text-sm font-black text-brava-black transition hover:scale-[1.02]"
            >
              Cadastrar minha loja grátis →
            </Link>
            <PrintButton />
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {[
              { v: `${estabsCount ?? 50}+`,    l: "parceiros já dentro" },
              { v: `${assinantesCount ?? 100}+`, l: "assinantes ativos" },
              { v: `${deliverersCount ?? 10}+`,  l: "entregadores prontos" },
              { v: "0%",                          l: "comissão sobre venda" },
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
              o problema do seu balcão hoje
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              Cliente entra, compra, vai embora.{" "}
              <span className="text-rose-500">Ninguém volta. Ninguém indica.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-600">
              Você atende. Dá um bom desconto às vezes. Nunca lembra quem veio. Quem é cliente fiel?
              Quem nunca mais voltou? Quem topou um cupom? <strong>Não tem dado nenhum no balcão.</strong>
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { emoji: "😶‍🌫️", title: "Sem histórico", desc: "Quem visitou ontem? Não sei. Quem comprou mais? Não sei. Decisão no chute." },
              { emoji: "💤",   title: "Hora vazia", desc: "3 da tarde, sem ninguém. Você assiste o relógio. Não tem como avisar a base que tem promo agora." },
              { emoji: "🛵",   title: "Delivery caro / ruim", desc: "iFood cobra 27%. Você não controla a entrega. Não sabe quando o cliente recebeu nem se gostou." },
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

      {/* ============ TODAS AS ARMAS — Showcase interativo ============ */}
      <section className="print-break bg-gradient-to-br from-zinc-50 via-amber-50/40 to-yellow-100/20 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
              suas ferramentas
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              <span className="bg-gradient-to-r from-brava-yellow-deep to-amber-500 bg-clip-text text-transparent">
                9 ferramentas
              </span>{" "}
              pra trazer cliente, fidelizar e vender mais.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-600">
              Clica em cada uma e vê como funciona. Tudo configurável em segundos no painel da loja.
            </p>
          </div>

          <div className="mt-14">
            <PromoShowcase />
          </div>
        </div>
      </section>

      {/* ============ DELIVERY RASTREÁVEL — DESTAQUE ============ */}
      <section className="print-break bg-brava-black py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">
              delivery próprio · sem comissão sobre venda
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Vendeu? A entrega{" "}
              <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
                é sua, rastreável
              </span>
              .
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/80">
              Cliente acompanha em tempo real onde tá o pedido, tempo previsto, código de 4 dígitos pra
              confirmar entrega. <strong className="text-white">Você não paga comissão pra ninguém</strong> —
              só a taxa de entrega que cobra do cliente (com a margem que quiser).
            </p>
          </div>

          <div className="mt-14">
            <DeliveryTrackerMock />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { emoji: "🧭", title: "Rota otimizada", desc: "Múltiplas entregas viram um percurso só, otimizado por Google Directions." },
              { emoji: "🔔", title: "Push em cada etapa", desc: "Cliente vê 'saiu pra entrega' antes mesmo de você avisar. Reduz call de status em 80%." },
              { emoji: "🛡️", title: "Código 4 dígitos", desc: "Entregador só confirma entrega se cliente fala o código. Acabou disputa de 'não chegou'." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-3xl">{p.emoji}</div>
                <p className="mt-3 font-bold text-white">{p.title}</p>
                <p className="mt-1 text-sm text-white/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTRATAR ENTREGADOR — DESTAQUE ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
                contrate sem dor de cabeça
              </p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
                Sem entregador?{" "}
                <span className="bg-gradient-to-r from-brava-yellow-deep to-brava-yellow bg-clip-text text-transparent">
                  Contrata um na plataforma
                </span>
                .
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-zinc-600">
                A BRAVA+ tem uma vitrine de entregadores freelancers <strong>já validados</strong> (CNH, RG,
                CPF, foto, veículo). Cada um com avaliação dos lojistas que já usaram. Clica em &quot;contratar&quot;
                e os dados dele vão pro seu painel — a relação contratual é direta entre vocês, a gente só
                faz a ponte.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Cadastros aprovados pela equipe BRAVA+ (não é qualquer um)",
                  "Avaliação por estrelas após cada entrega",
                  "Filtro por veículo (moto/carro/bike/a pé)",
                  "Pague direto pro entregador, BRAVA+ não retém nada",
                  "Histórico de entregas de cada um visível pra você",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 text-brava-yellow">✓</span>
                    <span className="text-zinc-700">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock vitrine */}
            <div className="space-y-3 rounded-3xl border border-brava-border bg-zinc-50 p-5 shadow-xl">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Vitrine · 3 freelancers disponíveis perto de você
              </p>
              {[
                { nome: "Carlos M.", veiculo: "🛵 Honda 160", rating: 4.9, entregas: 142, badge: "Top rated" },
                { nome: "Mariana T.", veiculo: "🚗 Fiat Uno", rating: 4.7, entregas: 87, badge: "Verificada" },
                { nome: "João P.", veiculo: "🚲 Bike elétrica", rating: 4.8, entregas: 64, badge: "Eco" },
              ].map((e) => (
                <div key={e.nome} className="rounded-2xl border border-brava-border bg-white p-4 transition hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brava-yellow/20 text-2xl">
                      🛵
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-900">{e.nome}</p>
                      <p className="text-xs text-zinc-500">{e.veiculo}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {e.badge}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-600">⭐ {e.rating}</span>
                    <span className="text-zinc-500">{e.entregas} entregas</span>
                    <button className="rounded-full bg-brava-black px-3 py-1 font-bold text-white">
                      Contratar →
                    </button>
                  </div>
                </div>
              ))}
              <p className="px-2 pt-2 text-[10px] text-zinc-500">
                💡 A BRAVA+ só faz a ponte. Responsabilidade contratual é exclusivamente entre você e o entregador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CALCULADORA DE RECEITA ============ */}
      <section className="print-break bg-gradient-to-br from-zinc-50 via-blue-50/30 to-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
              faça a conta da sua loja
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              Quanto você{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                fatura a mais
              </span>{" "}
              entrando no BRAVA+?
            </h2>
            <p className="mt-5 text-lg text-zinc-600">
              Mexe os sliders com a realidade da sua loja. Os números atualizam ao vivo.
            </p>
          </div>

          <div className="mt-12">
            <RevenueCalculator />
          </div>
        </div>
      </section>

      {/* ============ BI + CRM ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
              dados que viram decisão
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              Painel{" "}
              <span className="bg-gradient-to-r from-brava-blue to-blue-500 bg-clip-text text-transparent">
                completo
              </span>
              . Sem planilha.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: "📊", title: "Receita incremental", desc: "Saca quanto BRAVA+ adicionou esse mês vs. clientes orgânicos. Sem inflar." },
              { emoji: "👥", title: "Top 50 clientes", desc: "Quem mais visita, quem gasta mais, quem sumiu. Mande cupom personalizado." },
              { emoji: "🎯", title: "Benchmark de categoria", desc: "Você tá no top 20% da sua categoria? Tá acima da média de visitas?" },
              { emoji: "⚠️", title: "Alerta de churn", desc: "Cliente recorrente não voltou em 30d? Notif pra você + cupom retenção automático." },
              { emoji: "📅", title: "Stories vence-rápido", desc: "Veja quais stories tiveram mais engajamento, conversão de cupom, opinião." },
              { emoji: "🏆", title: "Embaixadores marcados", desc: "Defina seus VIPs (top 10). Eles recebem mimo mensal e viram boca-a-boca." },
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

      {/* ============ ONBOARDING ============ */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
              como começar
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 md:text-5xl">
              5 passos. Sai vendendo no mesmo dia.
            </h2>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[
              { n: 1, title: "Cadastra", desc: "Wizard em 4 etapas. Leva 3 min." },
              { n: 2, title: "Catálogo", desc: "Upload de produtos com foto e preço." },
              { n: 3, title: "Promoções", desc: "Ativa as ferramentas que fazem sentido pra você." },
              { n: 4, title: "Equipe", desc: "Cadastra entregadores próprios ou contrata da vitrine." },
              { n: 5, title: "Pronto", desc: "Sua loja aparece na busca + mapa pros assinantes." },
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

      {/* ============ PROPOSTA COMERCIAL ============ */}
      <section className="bg-brava-yellow py-16 text-brava-black md:py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brava-blue">
            ano-piloto · oferta de lançamento
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Plataforma{" "}
            <span className="bg-gradient-to-r from-brava-blue to-brava-blue-bright bg-clip-text text-transparent">
              100% grátis
            </span>{" "}
            pro lojista.
          </h2>
          <p className="mt-6 text-lg text-zinc-800">
            Sem comissão sobre venda. Sem mensalidade. A BRAVA+ ganha com a assinatura do consumidor.
            Você ganha clientes novos, retenção e delivery próprio sem custo fixo.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-brava-black/95 p-6 text-white">
              <p className="text-3xl font-black">0%</p>
              <p className="mt-1 text-xs text-white/70">comissão sobre venda</p>
            </div>
            <div className="rounded-2xl bg-brava-blue p-6 text-white">
              <p className="text-3xl font-black">R$ 0</p>
              <p className="mt-1 text-xs text-white/85">mensalidade no ano-piloto</p>
            </div>
            <div className="rounded-2xl bg-emerald-500 p-6 text-white">
              <p className="text-3xl font-black">+38%</p>
              <p className="mt-1 text-xs text-white/85">receita extra média (estimativa)</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FERRAMENTAS NOVAS LOJISTA ============ */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-blue-700">★ ferramentas novas 2026</p>
            <h2 className="text-3xl font-black text-zinc-900 md:text-5xl">Recursos pra sair na frente</h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-600">Operação mais eficiente, decisões com dados, clientes encantados.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { e: "🪑", t: "Mesa QR (sem garçom)", d: "Cliente escaneia QR, pede e paga pelo app. Cozinha recebe na TV." },
              { e: "🍳", t: "Display de cozinha", d: "Tablet/TV fixo mostra pedidos em tempo real, cores por status." },
              { e: "📊", t: "Comparativo regional anônimo", d: "Sua loja vs média da categoria/cidade. Sugestões automáticas." },
              { e: "🤝", t: "Parcerias com vizinhos", d: "Combos cruzados com lojas próximas. Ticket sobe pros dois." },
              { e: "🧪", t: "A/B test de cupons", d: "Sem ser analista: 2 variantes, sistema mostra qual venceu." },
              { e: "🛒", t: "Cross-sell pós-venda", d: "Recibo digital já vem com cupom de outro produto." },
              { e: "📅", t: "Calendário de promo", d: "Veja todas campanhas em 1 tela. Sazonalidades sugeridas." },
              { e: "🤖", t: "Auto-resposta no chat", d: "Bot responde dúvidas frequentes. Atendente foca no complexo." },
              { e: "🚪", t: "Vou aí — cortesia auto", d: "Cliente avisa que vem. Configure cortesia automática (café cortesia)." },
              { e: "⏳", t: "Fila virtual", d: "Cliente entra pelo app, recebe push na vez. Sem gritar nome." },
              { e: "📧", t: "Backup CFO automático", d: "Email semanal pra contadora com KPIs + CSV." },
              { e: "🎓", t: "Treinamento in-app", d: "Vídeos curtos pra você e funcionários aprenderem rápido." },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border-2 border-blue-200/60 bg-white p-5 shadow-sm">
                <div className="text-3xl">{f.e}</div>
                <div className="mt-2 text-lg font-black">{f.t}</div>
                <div className="mt-1 text-sm text-zinc-600">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Pronto pra ter{" "}
            <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
              cliente novo
            </span>{" "}
            todo dia?
          </h2>
          <p className="mt-5 text-lg text-white/80">
            Cadastra em 3 minutos. Aprovação em até 24h. Comissão zero. Plataforma completa pra
            promoção, fidelização e delivery — tudo num lugar só.
          </p>
          <div className="no-print mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/cadastro-estabelecimento"
              className="inline-flex h-14 items-center rounded-xl bg-brava-yellow px-8 text-base font-black text-brava-black transition hover:scale-[1.02]"
            >
              Cadastrar minha loja agora →
            </Link>
            <Link
              href="/seja-parceiro"
              className="inline-flex h-14 items-center rounded-xl border border-white/25 bg-white/5 px-8 text-base font-bold text-white backdrop-blur hover:bg-white/10"
            >
              Falar com a equipe
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/50">
            BRAVA+ · Sem fidelidade contratual · Cancela quando quiser
          </p>
        </div>
      </section>
    </>
  );
}
