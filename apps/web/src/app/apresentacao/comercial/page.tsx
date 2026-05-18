import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/apresentacao/print-button";

export const metadata = {
  title: "BRAVA+ pra comerciais · Comissão recorrente + CRM + mapa de prospects",
  description:
    "Vire representante BRAVA+ na rua. Cadastra lojistas e assinantes com seu código, ganha comissão recorrente (% ou R$ fixo), território exclusivo, CRM Kanban + mapa Google Places pronto pra prospectar.",
};

export const dynamic = "force-dynamic";

export default async function ApresentacaoComercialPage() {
  const supabase = await createClient();
  const [{ count: estabsCount }, { count: assinantesCount }, { count: comerciaisCount }] = await Promise.all([
    supabase.from("establishments").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "subscriber"),
    supabase.from("commercial_affiliates").select("*", { count: "exact", head: true }).eq("is_active", true),
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
      <section className="relative overflow-hidden bg-gradient-to-br from-brava-black via-zinc-900 to-indigo-900 text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #FBBF24 1px, transparent 1px), radial-gradient(circle at 80% 70%, #6366f1 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">
            BRAVA<span className="text-white">+</span> · pra comerciais de campo
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            Sua{" "}
            <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
              comissão recorrente
            </span>{" "}
            começa hoje.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            Não é representação de produto que vende uma vez e acabou.
            <strong className="font-bold text-white"> Cada lojista e assinante que você traz paga comissão pra você
            recorrentemente por meses</strong> — enquanto eles estiverem ativos. Plataforma toda pronta: CRM, mapa de
            prospects, links de cadastro.
          </p>

          <div className="no-print mt-10 flex flex-wrap gap-3">
            <Link
              href="mailto:comercial@bravamais.app?subject=Quero%20ser%20comercial%20BRAVA%2B"
              className="inline-flex h-12 items-center rounded-xl bg-brava-yellow px-6 text-sm font-black text-brava-black transition hover:scale-[1.02]"
            >
              Quero ser comercial BRAVA+ →
            </Link>
            <PrintButton />
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {[
              { v: `${comerciaisCount ?? 5}+`, l: "comerciais ativos" },
              { v: `${estabsCount ?? 50}+`, l: "lojas no clube" },
              { v: `${assinantesCount ?? 100}+`, l: "assinantes ativos" },
              { v: "Até 30%", l: "comissão recorrente" },
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
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">a real do comercial de rua</p>
            <h2 className="text-3xl font-black text-zinc-900 md:text-5xl">
              Você sente isso na pele?
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { e: "💸", t: "Comissão one-shot acabando", d: "Vende, ganha uma vez, e tem que vender de novo no mês seguinte. Renda não compõe." },
              { e: "📝", t: "Excel + WhatsApp como CRM", d: "Lead se perde, follow-up esquece, nunca sabe quem está em qual etapa. Vendas vazam." },
              { e: "🔍", t: "Sem ferramenta de prospecção", d: "Você sai na rua na sorte. Não sabe quais lojas existem antes de bater na porta." },
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
      <section className="print-break bg-gradient-to-br from-brava-black via-zinc-900 to-indigo-900 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">como BRAVA+ resolve</p>
            <h2 className="text-3xl font-black md:text-5xl">3 alavancas pra você crescer</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Comissão recorrente", d: "Você não vende e vai embora. Continua ganhando por meses (configurável) — enquanto o cliente que você trouxe estiver ativo." },
              { n: "02", t: "Plataforma pronta", d: "Não precisa lidar com sistema da loja, integração, contrato. Cadastra pelo painel BRAVA+, conta sai vinculada a você." },
              { n: "03", t: "Mapa Google Places", d: "Digita endereço, vê todas as lojas reais no raio que você escolher. Pinos = oportunidades. Clica e adiciona ao CRM." },
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
      <section className="bg-gradient-to-br from-indigo-50 via-blue-50 to-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-indigo-700">faz a conta</p>
            <h2 className="text-3xl font-black text-zinc-900 md:text-5xl">Quanto você ganha de verdade?</h2>
            <p className="mt-3 text-zinc-600">3 cenários reais. Comissão recorrente, então o pulo é depois do mês 3.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <PriceCard
              titulo="Comercial iniciante"
              detalhe="Mês 1 · 3 estabs + 10 subs"
              calculo={[
                { label: "3 estabs × R$ 150 (one-time)", value: "R$ 450" },
                { label: "10 subs Premium × 20% × R$ 39,90", value: "R$ 80" },
                { label: "Bônus indique-comercial", value: "—" },
              ]}
              total="R$ 530"
              periodo="mês 1"
              tone="indigo"
            />
            <PriceCard
              titulo="Comercial 6 meses"
              detalhe="Carteira: 20 estabs + 60 subs ativos"
              calculo={[
                { label: "20% sobre receita 20 estabs (~R$ 8k/mês total)", value: "R$ 1.600" },
                { label: "60 subs Premium × 20% × R$ 39,90", value: "R$ 478" },
                { label: "Bônus novos do mês", value: "+R$ 400" },
              ]}
              total="R$ 2.478"
              periodo="recorrente/mês"
              tone="blue"
              highlight
            />
            <PriceCard
              titulo="Comercial 12 meses"
              detalhe="Carteira: 50 estabs + 200 subs ativos"
              calculo={[
                { label: "20% × R$ 25k receita estabs", value: "R$ 5.000" },
                { label: "200 subs × 20% × R$ 39,90", value: "R$ 1.596" },
                { label: "Bônus + novos do mês", value: "+R$ 800" },
              ]}
              total="R$ 7.396"
              periodo="recorrente/mês"
              tone="emerald"
            />
          </div>

          <div className="mt-8 rounded-3xl border-2 border-indigo-400/40 bg-white p-6 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">A grande sacada</div>
            <div className="mt-2 text-3xl font-black text-zinc-900 md:text-4xl">
              Sua carteira <span className="text-indigo-600">compõe</span>.
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              Cada mês você adiciona novos clientes EM CIMA da carteira existente. Em 12 meses, comerciais dedicados
              atingem R$ 7-10k/mês recorrentes. Em 24 meses, R$ 15k+. <b>Comissão one-time não faz isso por você.</b>
            </p>
          </div>
        </div>
      </section>

      {/* ============ FERRAMENTAS QUE VOCÊ RECEBE ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">seu kit completo</p>
            <h2 className="text-3xl font-black text-zinc-900 md:text-5xl">Tudo que você precisa pra vender</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { e: "🗺️", t: "Mapa de prospects (Google Places)", d: "Digite endereço/categoria/raio → veja todas as lojas reais como pinos. Adicione ao CRM em 1 toque." },
              { e: "📋", t: "CRM Kanban", d: "7 colunas (Novo → Contato → Visita → Proposta → Negociação → Fechado/Perdido). Arrasta o card pra mudar status." },
              { e: "📅", t: "Agenda automática", d: "Cada prospect tem 'próxima ação'. Sistema agrupa: atrasadas / hoje / próximos 7 dias / futuro." },
              { e: "🔗", t: "Links de convite", d: "Permanentes (?ref=COM-XXX) ou com tracking (label + expiração). Cliques + signups contados automaticamente." },
              { e: "🏪", t: "Cadastro assistido", d: "Cliente na sua frente? Cadastra direto pelo painel. Conta sai com seu vínculo automaticamente." },
              { e: "💰", t: "Painel de comissão", d: "Histórico de payouts, projeção do mês em tempo real, lista de cada estab/sub vinculado." },
              { e: "📊", t: "Relatórios + sugestões", d: "Funil de conversão, evolução 6 meses, sugestões automáticas ('você tem X prospects parados em Novo')." },
              { e: "📱", t: "WhatsApp 1-click", d: "Mande link de convite no WhatsApp do prospect com texto pronto. Sem digitação." },
              { e: "🎓", t: "Treinamento in-app", d: "Vídeos curtos ensinando cada feature. Aprenda no seu ritmo." },
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

      {/* ============ FLUXO ============ */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">do prospect ao PIX</p>
            <h2 className="text-3xl font-black text-zinc-900 md:text-5xl">Como é seu dia BRAVA+</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-5">
            {[
              { n: "1", t: "Abre o mapa", d: "Bairro novo. Filtra restaurantes 1.5 km. 30 pinos." },
              { n: "2", t: "Adiciona ao CRM", d: "Top 10 candidatos viram cards 'Novo'." },
              { n: "3", t: "Visita & propõe", d: "Bate na porta, mostra o app, marca próxima ação." },
              { n: "4", t: "Cadastra (no app ou link)", d: "Cliente fecha? Conta no seu nome em 2 min." },
              { n: "5", t: "PIX cai mensalmente", d: "Admin processa payout, PIX na chave que você cadastrou." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600 font-black text-white">{s.n}</div>
                <div className="mt-3 text-base font-black text-zinc-900">{s.t}</div>
                <div className="mt-1 text-xs text-zinc-600">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MODELO DE COMISSÃO ============ */}
      <section className="bg-brava-black py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-brava-yellow">flexível por comercial</p>
            <h2 className="text-3xl font-black md:text-5xl">Como você ganha</h2>
            <p className="mt-3 text-white/70">Cada comercial tem tabela própria (configurada pelo admin no cadastro).</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-brava-yellow/40 bg-white/5 p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-brava-yellow">Por estabelecimento</div>
              <div className="mt-3 text-2xl font-black">Opção A: % recorrente</div>
              <div className="mt-1 text-sm text-white/70">Ex: 20% sobre toda receita do estab por 12 meses.</div>
              <div className="mt-5 text-2xl font-black">Opção B: R$ fixo</div>
              <div className="mt-1 text-sm text-white/70">Ex: R$ 150 por estab cadastrado e ativado.</div>
            </div>
            <div className="rounded-2xl border-2 border-brava-yellow/40 bg-white/5 p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-brava-yellow">Por assinante (varia por tier)</div>
              <div className="mt-3 text-2xl font-black">Opção A: % da mensalidade</div>
              <div className="mt-1 text-sm text-white/70">
                30% Básico · 20% Premium · 15% VIP — por 6 meses recorrente.
              </div>
              <div className="mt-5 text-2xl font-black">Opção B: R$ fixo</div>
              <div className="mt-1 text-sm text-white/70">
                Valor fixo por tier no 1º pagamento.
              </div>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-white/60">
            O admin BRAVA+ define a tabela no seu cadastro. Pode misturar (% pra estab + fixo pra sub, etc).
          </p>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="bg-gradient-to-br from-brava-black via-zinc-900 to-indigo-900 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Bora{" "}
            <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
              construir carteira
            </span>
            ?
          </h2>
          <p className="mt-5 text-lg text-white/80">
            Mande mensagem e o time BRAVA+ entra em contato pra alinhar território, tabela de comissão e seu acesso ao painel.
          </p>
          <div className="no-print mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="mailto:comercial@bravamais.app?subject=Quero%20ser%20comercial%20BRAVA%2B"
              className="inline-flex h-14 items-center rounded-xl bg-brava-yellow px-8 text-base font-black text-brava-black transition hover:scale-[1.02]"
            >
              Quero ser comercial →
            </Link>
            <Link
              href="https://wa.me/?text=Quero%20ser%20comercial%20BRAVA%2B"
              target="_blank"
              className="inline-flex h-14 items-center rounded-xl border border-white/25 bg-white/5 px-8 text-base font-bold text-white backdrop-blur hover:bg-white/10"
            >
              Falar no WhatsApp
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/50">
            BRAVA+ Comerciais · Carteira sua · PIX mensal
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
  tone: "indigo" | "blue" | "emerald";
  highlight?: boolean;
}) {
  const toneCls = tone === "blue"
    ? "border-blue-400/60 bg-gradient-to-br from-blue-50 to-indigo-50"
    : tone === "emerald"
    ? "border-emerald-400/60 bg-gradient-to-br from-emerald-50 to-green-50"
    : "border-indigo-300/60 bg-gradient-to-br from-indigo-50 to-purple-50";
  return (
    <div className={`relative rounded-2xl border-2 ${toneCls} p-5 ${highlight ? "scale-[1.03] shadow-xl" : "shadow-sm"}`}>
      {highlight && (
        <span className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase text-white">★ realista</span>
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
