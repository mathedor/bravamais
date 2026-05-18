import Link from "next/link";
import { PrintButton } from "@/components/apresentacao/print-button";

export const metadata = {
  title: "Playbook de venda — Estabelecimento · BRAVA+ Comercial",
  description: "Script completo pra comerciais BRAVA+ usarem na rua: abertura, discovery, pitch, objeções e fechamento. Tudo pronto pra decorar e adaptar.",
};

export default function ScriptEstabelecimentoPage() {
  return (
    <>
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { background: #fff !important; color: #0a0a0a !important; }
        }
      `}</style>

      {/* ============ HERO PLAYBOOK ============ */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #FBBF24 0, #FBBF24 1px, transparent 1px, transparent 60px)",
          }}
        />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-brava-yellow/15 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-brava-yellow/50 bg-brava-yellow/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-brava-yellow">
              CONFIDENCIAL · USO INTERNO
            </span>
            <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">
              Playbook v1
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            Como vender BRAVA+ pra{" "}
            <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">
              estabelecimentos
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75 md:text-xl">
            Script de campo testado em batalha. <strong className="font-bold text-white">Abertura, discovery, pitch, 8 objeções com resposta pronta e fechamento.</strong> Adapta pro seu jeito de falar — mas sai com ele decorado.
          </p>

          <div className="no-print mt-8 flex flex-wrap gap-3">
            <a
              href="#abertura"
              className="inline-flex h-12 items-center rounded-xl bg-brava-yellow px-6 text-sm font-black text-brava-black transition hover:scale-[1.02]"
            >
              Começar o playbook ↓
            </a>
            <PrintButton />
            <Link
              href="/apresentacao/script-usuario"
              className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-bold text-white backdrop-blur hover:bg-white/10"
            >
              Ver playbook usuário →
            </Link>
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-3 gap-3 md:gap-5">
            {[
              { v: "3 min", l: "duração ideal" },
              { v: "70%", l: "fecham na 1ª visita c/ esse script" },
              { v: "8", l: "objeções cobertas" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
                <div className="text-2xl font-black tracking-tight md:text-4xl">{s.v}</div>
                <div className="mt-1 text-xs text-white/60 md:text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TARGET ============ */}
      <section className="bg-zinc-900 py-12 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-6 md:p-8">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-brava-yellow">🎯 ALVO IDEAL</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Target emoji="🍔" titulo="Restaurantes & bares" desc="2-30 funcionários · ticket médio R$ 35-120 · alta repetição" />
              <Target emoji="✂️" titulo="Beleza & estética" desc="Salões, barbearias, manicures · clientela fixa, fidelização forte" />
              <Target emoji="☕" titulo="Cafés & padarias" desc="Pico de manhã · clientes de bairro · fidelidade óbvia" />
            </div>
            <p className="mt-4 text-sm text-white/60">
              <strong className="text-white">Evite</strong>: lojas grandes com TI próprio, marcas franqueadas (decisão centralizada), negócios em fechamento (sem caixa pra novidade).
            </p>
          </div>
        </div>
      </section>

      {/* ============ 1. ABERTURA ============ */}
      <section id="abertura" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="01" titulo="Abertura — quebrar o gelo" tempo="20 segundos" />

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <ScriptCard tipo="say" titulo="O que você fala">
              "Oi, [nome do dono se souber]. Tudo bem? Eu sou [seu nome], do BRAVA+. Posso roubar 3 minutos seu pra te mostrar uma coisa que pode trazer cliente novo pra sua loja, com custo zero pra começar?"
            </ScriptCard>
            <ScriptCard tipo="dont" titulo="O que NÃO fala">
              <ul className="space-y-2">
                <li>❌ "Quero te oferecer um clube de cupons" — soa como Méliuz, fecha porta</li>
                <li>❌ "Tem 5 minutos?" — peça menos pra dar mais</li>
                <li>❌ Mostrar tela ANTES de qualificar — perde controle</li>
              </ul>
            </ScriptCard>
          </div>

          <Tip>
            Se ele perguntar <em>"quanto custa?"</em> antes de você falar, responda: <strong>"Pra começar é grátis. Mas deixa eu te mostrar primeiro o que você ganha — em 2 minutos."</strong> Mantém você no controle da conversa.
          </Tip>
        </div>
      </section>

      {/* ============ 2. DISCOVERY ============ */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="02" titulo="Discovery — entender a dor" tempo="40 segundos" />

          <p className="mt-6 text-zinc-600">
            <strong className="text-zinc-900">Regra de ouro:</strong> não venda nada antes de saber a dor.
            Pergunte 3 coisas. Anote ou memorize as respostas — vão virar munição pro pitch.
          </p>

          <div className="mt-8 space-y-4">
            <DiscoveryQ
              n="1"
              q="Como você atrai cliente novo hoje?"
              listen="Vai dizer 'boca a boca', 'Instagram', 'panfleto'. Quase nenhum tem método sistemático."
              hook="Conecta no pitch com: 'O BRAVA+ leva sua loja pra rede de assinantes que já paga pra usar.'"
            />
            <DiscoveryQ
              n="2"
              q="E pra fazer o cliente voltar uma 2ª, 3ª vez?"
              listen="Vai dizer 'qualidade', 'atendimento', 'fideliza sozinho'. Quase nenhum tem programa de fidelidade ativo."
              hook="Conecta no pitch com: 'A gente automatiza isso. X visitas = prêmio. Sem você lembrar.'"
            />
            <DiscoveryQ
              n="3"
              q="Quanto da sua receita do mês passado veio de cliente recorrente vs novo?"
              listen="90% não sabem responder. Já é uma DOR exposta — 'você não tem essa info hoje, né?'"
              hook="Conecta no pitch com: 'O BRAVA+ te dá esse dado, separado, em tempo real.'"
            />
          </div>

          <Tip>
            Se o dono for resistente a responder, diga: <em>"Pode falar à vontade — não tô gravando, não é pesquisa. É pra eu te mostrar a parte do BRAVA+ que faz sentido pro SEU caso, sem te empurrar coisa que você não precisa."</em>
          </Tip>
        </div>
      </section>

      {/* ============ 3. PITCH ============ */}
      <section className="print-break bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="03" titulo="Pitch — os 4 pilares" tempo="60 segundos" dark />

          <p className="mt-6 max-w-3xl text-white/75">
            Conecte cada pilar com a dor que ele acabou de te contar. Não decora robotizado — adapta.
          </p>

          <div className="mt-10 space-y-5">
            <PitchCard
              icon="🎁"
              titulo="1. Atrai cliente novo (sem custo de marketing)"
              say="Tem 5 mil assinantes BRAVA+ que pagam mensalidade pra usar cupom em lojas como a sua. Você entra no app, aparece pra eles. Quando viram cliente, você não paga aquisição."
              proof="Lojistas similares ao seu trazem 40-60 clientes novos por mês via BRAVA+."
            />
            <PitchCard
              icon="⭐"
              titulo="2. Clube de fidelidade automático"
              say="Você define: X visitas = brinde. Cliente apresenta a carteirinha (QR), sistema soma sozinho. Quando completa, ele vem buscar o prêmio. Sem cartão de papel."
              proof="Lojas que ativam fidelidade têm 3x mais frequência por cliente."
            />
            <PitchCard
              icon="📊"
              titulo="3. Você sabe quem é seu cliente"
              say="Pela primeira vez você tem dados: top 50 clientes, ticket médio, quem está sumindo, comparativo vs lojas similares da sua região (anônimo)."
              proof="É o que mantém Starbucks e iFood acima de todo mundo. Agora você tem também."
            />
            <PitchCard
              icon="⚡"
              titulo="4. Promo Blast pra hora vazia"
              say="Loja vazia no domingo à tarde? Você toca um botão, dispara cupom flash pros clientes que já vieram, perto agora. Em 20 minutos enche."
              proof="Conversão média de blast: 18-25%."
              highlight
            />
          </div>

          <Tip dark>
            Ao terminar os 4, faça pausa e pergunte: <em>"Faz sentido pra você? Tem alguma parte que ficou nebulosa?"</em>
            <br />Se ele responder rápido, vai pra fechamento. Se hesitar, vá pra objeções.
          </Tip>
        </div>
      </section>

      {/* ============ 4. OBJEÇÕES ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader numero="04" titulo="Objeções — respostas prontas" tempo="conforme aparecer" />

          <p className="mt-6 text-zinc-600">
            8 objeções mais comuns. Resposta em vermelho = vinha da rua. Resposta em verde = você fala isso.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <ObjCard
              obj="Já tenho cliente fiel, não preciso disso"
              resp="Tem clientes fiéis que SUMIRAM nos últimos 90 dias? O BRAVA+ identifica isso pra você e dispara push pra eles voltarem. Sem fidelidade ativa, você perde 30% por ano sem perceber."
            />
            <ObjCard
              obj="Já tô em outro app de cupom, não quero mais"
              resp="Pode tá em quantos quiser — não pedimos exclusividade. BRAVA+ não é 'só cupom', é fidelização + dados + comunicação. Cupom é UMA das 9 ferramentas. Topa ver as outras?"
            />
            <ObjCard
              obj="Vocês vão ‘roubar' meu cliente"
              resp="Pelo contrário — quem está no BRAVA+ é cliente que JÁ paga mensalidade pra encontrar lojas como a sua. Sem nós, esse cliente está num concorrente. Com a gente, vem pra você."
            />
            <ObjCard
              obj="É muito trabalho configurar"
              resp="Cadastro do perfil + foto + 1 cupom de boas-vindas = 15 minutos. Eu te ajudo aqui mesmo, agora. A partir daí, é só ler QR no caixa quando cliente apresentar."
            />
            <ObjCard
              obj="Quanto custa?"
              resp="Pra começar: ZERO. Plano Free libera tudo essencial. Quando você quiser features avançadas (BI, blast ilimitado), Pro é R$ 49/mês — paga sozinho com 1 cupom."
            />
            <ObjCard
              obj="E se não funcionar?"
              resp="Sem fidelidade contratual. Cancela quando quiser, no painel, em 1 clique. Sem multa, sem letrinha miúda. Hoje você arrisca 15 minutos de cadastro — máximo."
            />
            <ObjCard
              obj="Vou pensar e te aviso"
              resp="Entendo. Só pra te ajudar a decidir: configurar leva 15 min agora, mas quando você sai daqui, vai esquecer. Posso fazer o cadastro contigo agora, e se você não gostar até amanhã, eu mesmo cancelo. Topa?"
              tone="closing"
            />
            <ObjCard
              obj="Tô sem tempo agora, volta amanhã"
              resp="Tranquilo, valor seu tempo. Mas te deixo um link pra você ver o painel funcionando no horário que quiser, sem pressão: [link]. Amanhã passo pra alinhar — qual horário fica bom: 10h ou 15h?"
              tone="closing"
            />
          </div>

          <Tip>
            <strong>Regra de ouro das objeções:</strong> sempre concorde primeiro ("entendo"), depois contraste com fato. <em>"Entendo a preocupação. Faz sentido. Só que..."</em> — assim ele se sente ouvido antes de você contra-argumentar.
          </Tip>
        </div>
      </section>

      {/* ============ 5. FECHAMENTO ============ */}
      <section className="bg-gradient-to-br from-amber-50 via-yellow-50 to-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="05" titulo="Fechamento — converter na hora" tempo="30 segundos" />

          <p className="mt-6 text-zinc-600">
            Use UMA dessas 3 técnicas. Escolha pela energia do lojista.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <CloseCard
              tipo="Alternativa fechada"
              quandoUsar="Cliente engajado, falando ativamente"
              frase="Você prefere começar com Free (sem custo) ou já entrar direto no Pro (R$ 49) pra liberar BI desde o dia 1?"
              porque="Tira o 'não' da mesa. As duas opções avançam."
            />
            <CloseCard
              tipo="Pressuposição"
              quandoUsar="Cliente meio quieto mas curioso"
              frase="Vou abrir aqui o cadastro pra a gente fazer juntos, então. Você prefere CNPJ digitado ou eu já busco automaticamente?"
              porque="Trata o sim como já dado. Funciona se o discovery foi forte."
              highlight
            />
            <CloseCard
              tipo="Próximo passo concreto"
              quandoUsar="Cliente hesitante, quer pensar"
              frase="Sem problema. Vou te mandar agora um link pra você ver o painel funcionando. E amanhã eu volto às 11h pra fazermos o cadastro juntos. Combinado?"
              porque="Mantém porta aberta sem perder o lead. Marque a hora!"
            />
          </div>

          <Tip>
            <strong>Se ele topou:</strong> faça o cadastro AGORA, no celular dele ou no seu. Use o atalho{" "}
            <code className="rounded bg-zinc-200 px-2 py-0.5 font-mono">/comercial/cadastros/estabelecimento</code>{" "}
            do seu painel — a conta sai vinculada a você automaticamente. Comissão garantida.
          </Tip>
        </div>
      </section>

      {/* ============ 6. FOLLOW-UP ============ */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="06" titulo="Follow-up — porque 80% das vendas estão no 5º contato" tempo="ao longo da semana" />

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <FollowCard
              quando="Mesmo dia, 2h depois"
              canal="WhatsApp"
              msg="Oi [nome], foi ótimo te conhecer hoje. Como prometido, segue o link com mais detalhes do BRAVA+: [link]. Se topar começar, eu volto amanhã pra fazermos o cadastro juntos em 15 min. 🙂"
            />
            <FollowCard
              quando="3 dias depois (se não respondeu)"
              canal="WhatsApp"
              msg="Oi [nome]. Sem pressão, só passando rápido. Tô passando perto da sua região amanhã às [hora]. Posso dar uma passada de 10 min pra te mostrar o painel rodando ao vivo?"
            />
            <FollowCard
              quando="7 dias depois (se ainda não)"
              canal="WhatsApp + casa-de-show"
              msg="Oi [nome]. Última. Cadastrei essa semana 4 lojistas na sua região com perfil parecido com o seu. Eles tão experimentando 15 dias. Se topar entrar agora, te coloco no mesmo grupo deles pra você ver os resultados deles antes de decidir. Topa?"
            />
            <FollowCard
              quando="Cliente respondeu 'volta semana que vem'"
              canal="Agenda no CRM"
              msg="No seu /comercial/crm, mova o card pra 'Negociação' e configure 'próxima ação' com a data exata. Sistema te lembra na agenda."
              cta
            />
          </div>

          <Tip>
            <strong>Regra:</strong> nunca termine um contato sem definir o PRÓXIMO. Mesmo que seja "te ligo na sexta" — anote no CRM com data e hora. Sem isso, vira mais um lead que se perde no WhatsApp.
          </Tip>
        </div>
      </section>

      {/* ============ MATERIAIS DE APOIO ============ */}
      <section className="print-break bg-zinc-950 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader numero="07" titulo="Materiais que você usa na conversa" tempo="sempre à mão" dark />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ResourceCard
              icon="🎬"
              titulo="Vídeo de 1 min"
              desc="Mostra o BRAVA+ funcionando. Use ANTES do pitch se a loja é grande/desconfia."
              link="/apresentacao/lojista"
              linkLabel="Abrir landing lojista"
            />
            <ResourceCard
              icon="📱"
              titulo="Painel rodando"
              desc="Abra na frente dele: /loja (logado como demo). Ele vê a coisa funcionar."
              link="/loja"
              linkLabel="Abrir /loja demo"
            />
            <ResourceCard
              icon="📊"
              titulo="Cálculo de ROI"
              desc="Mostra que com 1 cupom 20% off ele recupera os R$ 49/mês do Pro."
              link="/apresentacao/lojista#calculadora"
              linkLabel="Ver calculadora"
            />
            <ResourceCard
              icon="🔗"
              titulo="Seu link de cadastro"
              desc="Manda pelo WhatsApp depois da reunião. Cliente cadastra sozinho, conta sai no seu nome."
              link="/comercial/links"
              linkLabel="Gerar link"
            />
          </div>
        </div>
      </section>

      {/* ============ RESUMO PRÁTICO ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border-4 border-brava-yellow bg-gradient-to-br from-amber-50 to-yellow-50 p-8 md:p-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-700">CHEAT SHEET</div>
            <h2 className="mt-3 text-3xl font-black text-zinc-900 md:text-5xl">3 minutos de venda perfeita</h2>
            <ol className="mt-8 space-y-4 text-zinc-800">
              {[
                ["00:00 - 00:20", "Abertura: peça 3 min, não 5"],
                ["00:20 - 01:00", "Discovery: 3 perguntas, anote dores"],
                ["01:00 - 02:00", "Pitch: 4 pilares conectados às dores"],
                ["02:00 - 02:30", "Objeções: concorda + contraste com fato"],
                ["02:30 - 03:00", "Fechamento: alternativa fechada OU pressuposição"],
                ["depois", "Follow-up: WhatsApp 2h + visita 3d + última 7d"],
              ].map(([t, txt], i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="grid h-10 w-32 shrink-0 place-items-center rounded-lg bg-brava-yellow font-mono font-bold text-brava-black">
                    {t}
                  </span>
                  <span className="font-medium">{txt}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-black md:text-5xl">Decora.</h2>
          <p className="mt-3 text-xl text-white/80">Sai pra rua. Bate em 10 lojas hoje.</p>
          <p className="mt-2 text-base text-white/60">A 8ª já vai fechar. Promessa.</p>
          <div className="no-print mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/comercial"
              className="inline-flex h-12 items-center rounded-xl bg-brava-yellow px-6 text-sm font-black text-brava-black"
            >
              Voltar pro painel →
            </Link>
            <Link
              href="/apresentacao/script-usuario"
              className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-bold text-white backdrop-blur"
            >
              Próximo: playbook de usuário →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* =============== COMPONENTES =============== */

function SectionHeader({ numero, titulo, tempo, dark }: { numero: string; titulo: string; tempo: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-5">
      <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl font-mono text-3xl font-black ${dark ? "bg-brava-yellow text-brava-black" : "bg-brava-black text-brava-yellow"}`}>
        {numero}
      </div>
      <div>
        <h2 className={`text-3xl font-black md:text-5xl ${dark ? "text-white" : "text-zinc-900"}`}>{titulo}</h2>
        <div className={`mt-1 font-mono text-xs uppercase tracking-widest ${dark ? "text-white/50" : "text-zinc-500"}`}>⏱ {tempo}</div>
      </div>
    </div>
  );
}

function Target({ emoji, titulo, desc }: { emoji: string; titulo: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-base font-bold">{titulo}</div>
      <div className="mt-1 text-xs text-white/60">{desc}</div>
    </div>
  );
}

function ScriptCard({ tipo, titulo, children }: { tipo: "say" | "dont"; titulo: string; children: React.ReactNode }) {
  const isSay = tipo === "say";
  return (
    <div className={`rounded-2xl border-2 p-6 ${isSay ? "border-emerald-300 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
      <div className={`mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider ${isSay ? "text-emerald-700" : "text-red-700"}`}>
        {isSay ? "✅" : "❌"} {titulo}
      </div>
      <div className={`text-base ${isSay ? "italic text-zinc-800" : "text-zinc-700"}`}>
        {typeof children === "string" ? `"${children}"` : children}
      </div>
    </div>
  );
}

function DiscoveryQ({ n, q, listen, hook }: { n: string; q: string; listen: string; hook: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brava-blue font-black text-white">{n}</div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-brava-blue">PERGUNTA</div>
          <div className="mt-1 text-lg font-black text-zinc-900">"{q}"</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-zinc-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">🎧 ESCUTA</div>
              <div className="mt-1 text-sm text-zinc-700">{listen}</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">🪝 HOOK</div>
              <div className="mt-1 text-sm text-zinc-800">{hook}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PitchCard({ icon, titulo, say, proof, highlight }: { icon: string; titulo: string; say: string; proof: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? "border-brava-yellow/60 bg-gradient-to-r from-brava-yellow/15 to-transparent" : "border-white/10 bg-white/5"}`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <div className="text-xl font-black">{titulo}</div>
          <p className="mt-2 italic text-white/85">"{say}"</p>
          <div className="mt-3 rounded-lg border border-brava-yellow/30 bg-brava-yellow/10 px-3 py-2 text-sm">
            <strong className="text-brava-yellow">PROVA:</strong> <span className="text-white/80">{proof}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjCard({ obj, resp, tone }: { obj: string; resp: string; tone?: "closing" }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3 text-white">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">CLIENTE FALA</div>
        <div className="mt-1 text-base font-bold">"{obj}"</div>
      </div>
      <div className={`p-5 ${tone === "closing" ? "bg-brava-yellow/10" : "bg-white"}`}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">VOCÊ RESPONDE</div>
        <div className="mt-1 italic text-zinc-800">"{resp}"</div>
      </div>
    </div>
  );
}

function CloseCard({ tipo, quandoUsar, frase, porque, highlight }: { tipo: string; quandoUsar: string; frase: string; porque: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 p-5 ${highlight ? "border-brava-blue bg-white shadow-xl scale-[1.03]" : "border-amber-200 bg-white"}`}>
      {highlight && <div className="mb-2 inline-block rounded-full bg-brava-blue px-2 py-0.5 text-[9px] font-black uppercase text-white">★ favorita</div>}
      <div className="text-xs font-bold uppercase tracking-wider text-brava-blue">{tipo}</div>
      <div className="mt-1 text-[10px] uppercase text-zinc-500">{quandoUsar}</div>
      <div className="mt-3 italic text-zinc-800">"{frase}"</div>
      <div className="mt-3 text-[11px] text-zinc-500">
        <strong>Por que funciona:</strong> {porque}
      </div>
    </div>
  );
}

function FollowCard({ quando, canal, msg, cta }: { quando: string; canal: string; msg: string; cta?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-wider text-brava-blue">{quando}</span>
        <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono uppercase text-zinc-600">{canal}</span>
      </div>
      <div className={`mt-3 rounded-lg p-3 text-sm ${cta ? "bg-brava-yellow/10 text-zinc-800" : "bg-zinc-50 italic text-zinc-700"}`}>
        {msg}
      </div>
    </div>
  );
}

function ResourceCard({ icon, titulo, desc, link, linkLabel }: { icon: string; titulo: string; desc: string; link: string; linkLabel: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-3xl">{icon}</div>
      <div className="mt-2 text-base font-bold">{titulo}</div>
      <div className="mt-1 text-xs text-white/60">{desc}</div>
      <Link href={link} className="mt-3 inline-block text-xs font-bold text-brava-yellow hover:underline">
        {linkLabel} ↗
      </Link>
    </div>
  );
}

function Tip({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`mt-8 rounded-2xl border-l-4 p-4 ${dark ? "border-brava-yellow bg-white/5 text-white/80" : "border-brava-yellow bg-amber-50 text-zinc-800"}`}>
      <div className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${dark ? "text-brava-yellow" : "text-amber-700"}`}>💡 DICA DE OURO</div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
