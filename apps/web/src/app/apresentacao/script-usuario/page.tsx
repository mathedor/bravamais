import Link from "next/link";
import { PrintButton } from "@/components/apresentacao/print-button";

export const metadata = {
  title: "Playbook de venda — Usuário · BRAVA+ Comercial",
  description: "Script pra comerciais BRAVA+ venderem assinatura pra pessoa física. Abordagem em frio, pelo WhatsApp e ao vivo. Objeções e fechamento prontos.",
};

export default function ScriptUsuarioPage() {
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
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(135deg, #2563EB 0, #2563EB 1px, transparent 1px, transparent 60px)",
          }}
        />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-brava-blue-bright/20 blur-3xl" aria-hidden />

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
              pessoa física
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75 md:text-xl">
            Aqui você vende uma assinatura mensal. <strong className="font-bold text-white">Lógica diferente do lojista: emoção primeiro, conta depois.</strong> 3 canais: WhatsApp em frio, abordagem na rua e link puro. Tudo aqui.
          </p>

          <div className="no-print mt-8 flex flex-wrap gap-3">
            <a
              href="#canais"
              className="inline-flex h-12 items-center rounded-xl bg-brava-yellow px-6 text-sm font-black text-brava-black transition hover:scale-[1.02]"
            >
              Começar o playbook ↓
            </a>
            <PrintButton />
            <Link
              href="/apresentacao/script-estabelecimento"
              className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-bold text-white backdrop-blur hover:bg-white/10"
            >
              Ver playbook lojista →
            </Link>
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-3 gap-3 md:gap-5">
            {[
              { v: "60s", l: "duração média de pitch" },
              { v: "30%", l: "conversão pelo WhatsApp c/ esse script" },
              { v: "6", l: "objeções cobertas" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
                <div className="text-2xl font-black tracking-tight md:text-4xl">{s.v}</div>
                <div className="mt-1 text-xs text-white/60 md:text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MENTALIDADE ============ */}
      <section className="bg-zinc-900 py-12 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent p-6 md:p-8">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-brava-yellow">🧠 MENTALIDADE</div>
            <h3 className="mt-3 text-2xl font-black md:text-3xl">Pessoa NÃO compra cupom.</h3>
            <p className="mt-2 text-white/75">
              Compra <strong className="text-white">economia previsível</strong> e <strong className="text-white">sensação de esperteza</strong>.
              Pessoa não fala "preciso de cupons" — fala "queria pagar menos quando saio". Aborde sempre pelo BENEFÍCIO emocional, nunca pela feature.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <PrincipleCard wrong="Cupom de 20%" right="Café que custaria R$ 12, sai R$ 9" />
              <PrincipleCard wrong="Carteirinha QR" right="O caféo da Maria já te conhece. Você nem precisa pedir." />
              <PrincipleCard wrong="Cashback de coins" right="Cada ida vira saldo pro próximo rolê" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ ALVO ============ */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">🎯 PESSOAS QUE FECHAM FÁCIL</div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Target
              emoji="🍻"
              titulo="Sai 2-3x por semana"
              desc="Bar, restaurante, café. Já gasta. Mostra que vai pagar menos."
            />
            <Target
              emoji="💵"
              titulo="Se considera 'antenado em economia'"
              desc="Tem Méliuz, cashback do banco, compara preço. Adora ferramenta nova."
            />
            <Target
              emoji="🎁"
              titulo="Gosta de ser 'cliente VIP'"
              desc="Reconhecido no salão, no café. BRAVA+ dá status de embaixador."
            />
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            <strong>Evite</strong>: pessoas que NUNCA saem de casa, idosos sem smartphone, perfil "tô apertado, não posso pagar mais nada".
          </p>
        </div>
      </section>

      {/* ============ CANAIS ============ */}
      <section id="canais" className="bg-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader numero="01" titulo="3 canais de venda" tempo="escolha pela situação" />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <ChannelCard
              icon="💬"
              titulo="WhatsApp em frio"
              quando="Você tem contato de alguém. Texto puro."
              cta="Quero ver o script →"
              href="#wpp"
            />
            <ChannelCard
              icon="🤝"
              titulo="Abordagem na rua"
              quando="Evento, feira, condomínio. Cara a cara."
              cta="Quero ver o pitch →"
              href="#rua"
              highlight
            />
            <ChannelCard
              icon="🔗"
              titulo="Link nu (post Insta, story)"
              quando="Volume sem você presente. Funil baixo, conversão direta."
              cta="Como impulsionar →"
              href="#link"
            />
          </div>
        </div>
      </section>

      {/* ============ CANAL 1: WHATSAPP ============ */}
      <section id="wpp" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="02" titulo="Canal WhatsApp em frio" tempo="3 mensagens, sem ser chato" />

          <p className="mt-6 text-zinc-600">
            Regra: <strong className="text-zinc-900">3 mensagens, total.</strong> Se não respondeu na 3ª, deixa em paz e volta em 30 dias.
            Cada mensagem tem 1 objetivo só.
          </p>

          <div className="mt-10 space-y-5">
            <WppMsg
              n="1"
              objetivo="Quebrar gelo + dar contexto curto"
              msg={`Oi [nome], aqui é o [seu nome]. Vi que você costuma ir em [tipo de lugar — "restaurantes na Pinheiros" ou "cafés em geral"]. Te incomodo 1 segundo?\n\nTô apresentando um clube de vantagens novo que tá funcionando bem com gente parecida com você — economia média de R$ 200/mês. Posso te mandar 1 print pra você ver se faz sentido?`}
              dica="Sempre peça PERMISSÃO antes de enviar conteúdo. Diferencial vs spam."
            />
            <WppMsg
              n="2 (depois de 'pode')"
              objetivo="Mostrar o produto em 1 imagem + 1 frase"
              msg={`Olha, é o BRAVA+. Você paga R$ 19,90/mês e ganha:\n\n✅ Cupons em ~50 lojas (cafés, restaurantes, salões)\n✅ Cashback em todo pedido (volta como crédito)\n✅ Clube de fidelidade automático ("compra 9, leva o 10º")\n\n7 dias grátis pra testar, sem cartão. Quer o link?\n[print do app + link]`}
              dica="Anexa 1 print mostrando cupons ATIVOS perto da região dele. Personalização brutal aumenta conversão 3x."
            />
            <WppMsg
              n="3 (se não fechou em 2-3 dias)"
              objetivo="Última tentativa + urgência leve"
              msg={`Oi [nome], última. Tô fechando 5 cadastros até sexta pra atingir minha meta da semana. Se topar entrar agora, te ponho na lista e ainda libero 1 mês grátis extra (de bônus meu, fora do trial).\n\nTopa entrar? Link: [link]`}
              dica="Urgência REAL (sua meta) + bônus EXTRA (1 mês grátis). Honestidade fecha mais que pressão."
            />
          </div>

          <Tip>
            <strong>Anti-spam:</strong> nunca mande pra contato que você não conhece OU não tem permissão. Tem o template pronto em <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs">/comercial/links</code> com seu link único — usuário cadastra, vínculo automático.
          </Tip>
        </div>
      </section>

      {/* ============ CANAL 2: ABORDAGEM RUA ============ */}
      <section id="rua" className="bg-gradient-to-br from-indigo-50 via-blue-50 to-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="03" titulo="Canal Abordagem na rua" tempo="60 segundos de pitch" />

          <p className="mt-6 text-zinc-600">
            Cara a cara em feira, condomínio, evento. Tempo é curto, atenção é mais curta ainda.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <ScriptCard tipo="say" titulo="Abertura (15s)">
              "Oi, tudo bem? Eu sou [seu nome], do BRAVA+. Você sabe quanto você gasta por mês saindo pra comer/beber/cuidar de você? Eu te mostro em 1 minuto como pagar 30-40% menos nisso, sem mudar nada do que você faz."
            </ScriptCard>
            <ScriptCard tipo="say" titulo="Pitch (30s)">
              "BRAVA+ é tipo Netflix de vantagens. R$ 19,90/mês. Você acessa cupons em 50+ parceiros da região, ganha cashback em todo pedido, e o clube de fidelidade roda sozinho — sem você guardar cartão. Quem usa 2x na semana já paga sozinho a mensalidade no 1º mês."
            </ScriptCard>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ScriptCard tipo="say" titulo="Demonstração relâmpago (10s)">
              "Olha aqui no meu celular — esses são os lugares que tão com cupom AGORA perto daqui. [scrolla rápido] Esse aqui é o que mais é usado: 25% off no [restaurante popular]. Use 1x e você pagou a mensalidade do mês."
            </ScriptCard>
            <ScriptCard tipo="say" titulo="Fechamento (5s)">
              "Topa testar 7 dias grátis? Sem cartão, sem compromisso. Cadastra agora — eu te ponho na lista de quem entra hoje e libero 1 cupom-bomba extra. Link aqui: [QR ou link]"
            </ScriptCard>
          </div>

          <Tip>
            Tenha SEMPRE seu link/QR no celular. Quando aceitar, abre AGORA o cadastro com ele do lado. Sai daqui, esquece.
          </Tip>
        </div>
      </section>

      {/* ============ CANAL 3: LINK NU ============ */}
      <section id="link" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="04" titulo="Canal Link em redes sociais" tempo="trabalha enquanto você dorme" />

          <p className="mt-6 text-zinc-600">
            Aqui não tem conversa. É post/story/bio. O texto tem que vender sozinho. <strong>4 templates prontos.</strong>
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <LinkTemplate
              titulo="Story Instagram (15s)"
              copy={`"Gente, descobri esse app e tá salvando minha conta de fim de mês 🙏\n\nBRAVA+ = clube de cupons + cashback + fidelidade em 50+ lugares aqui da região. Pago R$ 19,90 e tô economizando R$ 200/mês.\n\nLink no meu perfil 👆"`}
              hashtags="#brava+ #economia #vidasaoocoffee"
            />
            <LinkTemplate
              titulo="Post Instagram (carrossel)"
              copy={`Slide 1: "Como economizei R$ 600 mês passado sem mudar meu estilo de vida"\nSlide 2: "Comecei a usar o BRAVA+ — 1 app, todos os lugares que eu já ia"\nSlide 3: "Cupom + cashback + fidelidade num lugar só"\nSlide 4: "R$ 19,90/mês. 7 dias grátis pra testar"\nSlide 5: "Link no meu perfil 👆"`}
              hashtags="#brava+ #economiainteligente #saquefora"
            />
            <LinkTemplate
              titulo="WhatsApp grupo de amigos"
              copy={`"Gente, dica honesta de quem tá usando: BRAVA+ é tipo iFood Card só que pra cafés/bares/salões. R$ 19,90/mês mas o 1º mês é grátis. Tô economizando mais que pago, sério.\n\nQuem quiser testar comigo: [link]"`}
              hashtags="(sem hashtag — texto puro pesa mais)"
            />
            <LinkTemplate
              titulo="Bio do Instagram"
              copy={`"Economizo R$ 200/mês saindo igual antes 💰\n👇 te conto como"\n\n→ link in bio aponta pro seu link único`}
              hashtags="(emoji + curiosidade + link puxa cliques)"
            />
          </div>

          <Tip>
            Em todos os textos: SEMPRE com seu link único (gerado em /comercial/links). Conversão = comissão pra você. Conta gota.
          </Tip>
        </div>
      </section>

      {/* ============ OBJEÇÕES ============ */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader numero="05" titulo="Objeções — pessoa física é diferente" tempo="conforme aparecer" />

          <p className="mt-6 text-zinc-600">
            Pessoas usam objeções emocionais ("não tô a fim de mais um app") muito mais do que racionais. Ouça a emoção embaixo da fala.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <ObjCard
              obj="Já tenho Méliuz, Cuponeria, etc"
              resp="Pode ter todos juntos — não compete. Méliuz é cashback em GRANDES lojas (Amazon, Magalu). BRAVA+ é vantagens em LOCAIS perto de você (café, restaurante, salão). Sobreposição = zero."
            />
            <ObjCard
              obj="Pago e vou esquecer de usar"
              resp="Por isso tem o trial de 7 dias SEM CARTÃO. Você só paga depois de provar que vai usar. Se não usar nada na 1ª semana, nem cobra. Você decide."
            />
            <ObjCard
              obj="R$ 19,90 já é caro, tô apertado"
              resp="Entendo. Pensa assim: você sai 2-3x por semana, certo? Em 1 cupom 25% off num pedido de R$ 50, você economiza R$ 12,50. Se usar 2x no mês, já tá pagando a assinatura 25% lucro. Só faz sentido se você sai."
            />
            <ObjCard
              obj="Não confio em assinatura, sempre esqueço de cancelar"
              resp="Cancela em 1 clique no app, hora que quiser. Sem ligação, sem 'fica mais um mês de bônus' chato. Eu mesmo te mostro como cancelar logo no cadastro — se você não gostar, sai sem problema."
            />
            <ObjCard
              obj="Não conheço esses lugares parceiros"
              resp="Manda seu CEP que te mostro os parceiros perto. [Faz a busca AO VIVO] Olha aqui: [X cafés, Y restaurantes, Z salões] no raio de 2 km da sua casa. Aposto que pelo menos 5 desses você já conhece."
              tone="closing"
            />
            <ObjCard
              obj="Vou pensar e te volto"
              resp="Tranquilo. Só pra te ajudar a decidir: o trial é 7 dias grátis SEM cartão. Você não compromete nada. Se entrar hoje, no domingo você já decide. Topa testar?"
              tone="closing"
            />
          </div>
        </div>
      </section>

      {/* ============ FECHAMENTO ============ */}
      <section className="print-break bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="06" titulo="Fechamento — converter na hora" tempo="20 segundos" dark />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <CloseUserCard
              cor="amarelo"
              titulo="Engajou + sem cartão de crédito hoje"
              frase="O trial é grátis 7 dias sem cartão. Você só precisa criar conta. Posso fazer agora? São 90 segundos."
            />
            <CloseUserCard
              cor="azul"
              titulo="Engajou + tem cartão na mão"
              frase="Topa garantir? Cadastro com cartão te dá 1 mês a mais de trial (bônus de comissionado). 60 segundos."
            />
          </div>

          <Tip dark>
            <strong>NUNCA</strong> tente vender pressão de "última vaga" / "promoção acaba hoje". Pessoa física desconfia muito disso. Honestidade e ritmo vencem.
          </Tip>
        </div>
      </section>

      {/* ============ DEPOIS DA VENDA ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeader numero="07" titulo="Pós-venda — sua comissão depende disso" tempo="primeiros 7 dias" />

          <p className="mt-6 text-zinc-600">
            Trial de 7 dias é o momento crítico. Se a pessoa não usar nada, cancela e VOCÊ NÃO RECEBE comissão. Garanta ativação.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <PostSaleCard
              dia="Dia 1 (mesmo dia da venda)"
              acao="Manda WhatsApp:"
              msg={`"Oi [nome], parabéns por entrar no BRAVA+! Pra você testar logo, separei 3 cupons fáceis de usar essa semana:\n• [cupom 1 — café perto]\n• [cupom 2 — restaurante perto]\n• [cupom 3 — outra coisa relevante]\nAbre o app e confere 👇 [link]"`}
            />
            <PostSaleCard
              dia="Dia 3 (meio do trial)"
              acao="Confere uso. Se não usou:"
              msg={`"Oi [nome], tudo bem? Vi que você ainda não usou nenhum cupom — perde a graça do trial! 😄\nSegunda-feira você vai num lugar pra almoço? Tem cupom de 20% em [restaurante] ativo até amanhã. Pega aí!"`}
            />
            <PostSaleCard
              dia="Dia 6 (último dia trial)"
              acao="Lembrete suave:"
              msg={`"[nome], só pra avisar: trial acaba amanhã. Você já economizou R$ [valor] em X cupons. Continua valendo a pena! Qualquer dúvida me chama."`}
              cta
            />
          </div>

          <Tip>
            <strong>Acompanhe as ativações pelo seu painel:</strong> em <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs">/comercial/comissoes</code> você vê quem ainda está em trial. Atue antes do vencimento.
          </Tip>
        </div>
      </section>

      {/* ============ RESUMO ============ */}
      <section className="bg-gradient-to-br from-indigo-50 via-blue-50 to-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border-4 border-brava-blue bg-white p-8 md:p-12 shadow-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brava-blue">CHEAT SHEET — USUÁRIO</div>
            <h2 className="mt-3 text-3xl font-black text-zinc-900 md:text-5xl">Mentalidade em 1 frase</h2>
            <p className="mt-4 text-2xl font-bold text-brava-blue">
              "Você não vende assinatura. Vende a sensação de pagar menos sem mudar a vida."
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-zinc-50 p-4">
                <div className="text-3xl">💬</div>
                <div className="mt-2 text-base font-black">WhatsApp</div>
                <div className="mt-1 text-sm text-zinc-600">3 mensagens, peça permissão, 1 print personalizado.</div>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                <div className="text-3xl">🤝</div>
                <div className="mt-2 text-base font-black">Rua</div>
                <div className="mt-1 text-sm text-zinc-600">60s pitch + demonstração ao vivo + QR pronto.</div>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                <div className="text-3xl">🔗</div>
                <div className="mt-2 text-base font-black">Redes</div>
                <div className="mt-1 text-sm text-zinc-600">Texto pessoal + valor concreto + link nu na bio.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="bg-gradient-to-br from-brava-black via-zinc-900 to-brava-blue py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-black md:text-5xl">Manda o primeiro WhatsApp.</h2>
          <p className="mt-3 text-xl text-white/80">Hoje. Agora.</p>
          <p className="mt-2 text-base text-white/60">10 mensagens = 3 conversões = R$ 30+ comissão recorrente. Conta gota.</p>
          <div className="no-print mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/comercial/links"
              className="inline-flex h-12 items-center rounded-xl bg-brava-yellow px-6 text-sm font-black text-brava-black"
            >
              Pegar meu link agora →
            </Link>
            <Link
              href="/apresentacao/script-estabelecimento"
              className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-bold text-white backdrop-blur"
            >
              Voltar pro playbook lojista →
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
      <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl font-mono text-3xl font-black ${dark ? "bg-brava-yellow text-brava-black" : "bg-brava-blue text-white"}`}>
        {numero}
      </div>
      <div>
        <h2 className={`text-3xl font-black md:text-5xl ${dark ? "text-white" : "text-zinc-900"}`}>{titulo}</h2>
        <div className={`mt-1 font-mono text-xs uppercase tracking-widest ${dark ? "text-white/50" : "text-zinc-500"}`}>⏱ {tempo}</div>
      </div>
    </div>
  );
}

function PrincipleCard({ wrong, right }: { wrong: string; right: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs">
        <span className="text-red-300 line-through">❌ {wrong}</span>
      </div>
      <div className="mt-2 text-sm font-bold text-emerald-300">✓ {right}</div>
    </div>
  );
}

function Target({ emoji, titulo, desc }: { emoji: string; titulo: string; desc: string }) {
  return (
    <div className="rounded-xl border-2 border-zinc-200 bg-zinc-50/60 p-5">
      <div className="text-3xl">{emoji}</div>
      <div className="mt-2 text-base font-bold text-zinc-900">{titulo}</div>
      <div className="mt-1 text-sm text-zinc-600">{desc}</div>
    </div>
  );
}

function ChannelCard({ icon, titulo, quando, cta, href, highlight }: { icon: string; titulo: string; quando: string; cta: string; href: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border-2 p-6 transition hover:-translate-y-1 ${highlight ? "border-brava-blue bg-white shadow-xl" : "border-zinc-200 bg-white hover:border-brava-yellow"}`}
    >
      <div className="text-4xl">{icon}</div>
      <div className="mt-3 text-2xl font-black text-zinc-900">{titulo}</div>
      <div className="mt-2 text-sm text-zinc-600">{quando}</div>
      <div className="mt-4 text-sm font-bold text-brava-blue">{cta}</div>
    </Link>
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

function WppMsg({ n, objetivo, msg, dica }: { n: string; objetivo: string; msg: string; dica: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 bg-emerald-500 px-4 py-3 text-white">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-black">{n}</span>
        <div>
          <div className="text-[10px] uppercase tracking-widest opacity-80">MENSAGEM</div>
          <div className="text-sm font-bold">{objetivo}</div>
        </div>
      </div>
      <div className="p-5">
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-zinc-800 whitespace-pre-line">
          {msg}
        </div>
        <div className="mt-3 rounded-lg border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-xs text-zinc-700">
          <strong className="text-amber-700">💡 DICA:</strong> {dica}
        </div>
      </div>
    </div>
  );
}

function LinkTemplate({ titulo, copy, hashtags }: { titulo: string; copy: string; hashtags: string }) {
  return (
    <div className="rounded-2xl border-2 border-zinc-200 bg-white p-5">
      <div className="text-xs font-black uppercase tracking-wider text-brava-blue">{titulo}</div>
      <div className="mt-3 whitespace-pre-line rounded-lg bg-zinc-50 p-4 text-sm text-zinc-800">{copy}</div>
      <div className="mt-2 text-[10px] italic text-zinc-500">{hashtags}</div>
    </div>
  );
}

function ObjCard({ obj, resp, tone }: { obj: string; resp: string; tone?: "closing" }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3 text-white">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">PESSOA FALA</div>
        <div className="mt-1 text-base font-bold">"{obj}"</div>
      </div>
      <div className={`p-5 ${tone === "closing" ? "bg-brava-yellow/10" : "bg-white"}`}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">VOCÊ RESPONDE</div>
        <div className="mt-1 italic text-zinc-800">"{resp}"</div>
      </div>
    </div>
  );
}

function CloseUserCard({ cor, titulo, frase }: { cor: "amarelo" | "azul"; titulo: string; frase: string }) {
  return (
    <div className={`rounded-2xl border-2 p-6 ${cor === "amarelo" ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-yellow bg-brava-blue/30"}`}>
      <div className="text-xs font-bold uppercase tracking-wider text-brava-yellow">{titulo}</div>
      <div className="mt-3 text-lg italic text-white">"{frase}"</div>
    </div>
  );
}

function PostSaleCard({ dia, acao, msg, cta }: { dia: string; acao: string; msg: string; cta?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 p-5 ${cta ? "border-brava-yellow bg-amber-50" : "border-zinc-200 bg-white"}`}>
      <div className="text-xs font-bold uppercase tracking-wider text-brava-blue">{dia}</div>
      <div className="mt-1 text-sm font-bold text-zinc-900">{acao}</div>
      <div className="mt-3 whitespace-pre-line rounded-lg bg-zinc-50 p-3 text-xs italic text-zinc-700">{msg}</div>
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
