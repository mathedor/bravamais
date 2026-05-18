import type { ReactNode } from "react";
import type { TourRole } from "@/app/api/onboarding-tour/actions";

export type PageHelpEntry = {
  /** Path principal que essa entrada cobre. Usado pra auto-resolver via prefixo. */
  path: string;
  titulo: string;
  resumo: string;
  oQueFaz?: string[];
  comoUsar?: string[];
  /** Campos do formulário (quando essa tela é form de preenchimento). */
  campos?: { nome: string; desc: string; obrigatorio?: boolean }[];
  /** Fórmulas financeiras (mostradas em fonte mono dentro de um box). */
  calculos?: string[];
  /** Quando a tela é um relatório/KPI: explica POR QUE ele existe. */
  objetivoRelatorio?: string;
  dicas?: string[];
  visual?: ReactNode;
  /** Se passado, mostra botão "abrir tour completo" no rodapé. */
  tourRole?: TourRole;
};

/* ============================================================
   Mini-visuais reutilizáveis
   ============================================================ */
function FluxoVisita() {
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-wider text-brava-muted">
        cada visita = +1 no clube
      </div>
      <div className="flex flex-wrap items-center gap-1 text-[9px]">
        <span className="rounded bg-brava-card px-1.5 py-1 border border-brava-border">QR scan</span>
        <span>→</span>
        <span className="rounded bg-brava-yellow/30 px-1.5 py-1 border border-brava-yellow">+1 visita</span>
        <span>→</span>
        <span className="rounded bg-brava-card px-1.5 py-1 border border-brava-border">progresso fidelidade</span>
        <span>→</span>
        <span className="rounded bg-green-100 px-1.5 py-1 border border-green-300 font-bold">prêmio</span>
      </div>
    </div>
  );
}

function FluxoEntrega() {
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-wider text-brava-muted">
        fluxo da entrega
      </div>
      <div className="flex flex-wrap items-center gap-1 text-[9px]">
        <span className="rounded bg-brava-card px-1.5 py-1 border border-brava-border">pedido</span>
        <span>→</span>
        <span className="rounded bg-brava-yellow/30 px-1.5 py-1 border border-brava-yellow">aceita</span>
        <span>→</span>
        <span className="rounded bg-brava-blue/10 px-1.5 py-1 border border-brava-blue/40">retirou</span>
        <span>→</span>
        <span className="rounded bg-brava-blue/10 px-1.5 py-1 border border-brava-blue/40">a caminho</span>
        <span>→</span>
        <span className="rounded bg-green-100 px-1.5 py-1 border border-green-300 font-bold">código 4 dígitos</span>
      </div>
    </div>
  );
}

/* ============================================================
   Lista mestre — typesafety pelas chaves
   ============================================================ */
const KEYS = [
  // ==== USUÁRIO (app) ====
  "app-home", "app-buscar", "app-mapa", "app-estabelecimento",
  "app-cupons", "app-carteirinha", "app-fidelidade", "app-carteira",
  "app-presentes", "app-premios", "app-pedidos", "app-pedido-detalhe",
  "app-chat", "app-chat-detalhe", "app-notificacoes",
  "app-perfil", "app-perfil-dados", "app-perfil-enderecos",
  "app-favoritos", "app-indique", "app-extornos",
  "app-suporte", "app-suporte-detalhe",
  "app-proximos", "app-desafios", "app-roleta",
  "app-lista", "app-pacote", "app-menu",
  "assinar", "assinar-tier", "checkout",
  // ==== LOJISTA (loja) ====
  "loja-home", "loja-perfil", "loja-catalogo",
  "loja-cupons", "loja-cupons-detalhe", "loja-fidelidade", "loja-promocoes",
  "loja-qr", "loja-pedidos", "loja-clientes",
  "loja-vale-presente", "loja-recompensas", "loja-roleta",
  "loja-blast", "loja-hoje",
  "loja-entregas", "loja-entrega", "loja-entregadores", "loja-entregadores-disp",
  "loja-chat", "loja-chat-detalhe",
  "loja-receita", "loja-contabil", "loja-saques", "loja-extornos",
  "loja-plano", "loja-onboarding", "loja-mais",
  // ==== ENTREGADOR ====
  "entregador-home", "entregador-pendente", "entregador-detalhe", "entregador-rota",
  // ==== USUÁRIO — ferramentas novas ====
  "app-wallet", "app-grupos", "app-vou-ai", "app-recomendados",
  "app-badges", "app-notas", "app-presente-pessoal", "app-lista-espera", "app-amigos",
  // ==== LOJISTA — ferramentas novas ====
  "loja-mesa-qr", "loja-kitchen", "loja-comparativo", "loja-parcerias",
  "loja-ab-test", "loja-calendario", "loja-chat-bot", "loja-cross-sell",
  "loja-vou-ai", "loja-lista-espera", "loja-cfo-backup", "loja-treinamento",
  // ==== ADMIN — ferramentas ====
  "admin-ferramentas", "admin-ferr-wallet", "admin-ferr-badges",
  "admin-ferr-sazonalidade", "admin-ferr-treinamentos",
  "admin-relatorios-ferramentas",
  // ==== COMERCIAL ====
  "comercial-home", "comercial-agenda", "comercial-prospects", "comercial-crm",
  "comercial-crm-novo", "comercial-cadastros", "comercial-cadastros-estab",
  "comercial-cadastros-user", "comercial-links", "comercial-comissoes",
  "comercial-relatorios", "comercial-perfil",
  // ==== ADMIN ====
  "admin-home", "admin-bi", "admin-usuarios", "admin-usuarios-detalhe", "admin-usuarios-novo",
  "admin-estabelecimentos", "admin-estabelecimento-detalhe", "admin-estabelecimento-novo", "admin-estabelecimento-operacao",
  "admin-entregadores", "admin-entregas",
  "admin-assinaturas", "admin-planos", "admin-cupons", "admin-categorias",
  "admin-saques", "admin-extornos", "admin-suporte", "admin-denuncias", "admin-fraude",
  "admin-churn", "admin-afiliados", "admin-b2b",
  "admin-pacotes", "admin-pacote-detalhe", "admin-listas", "admin-lista-detalhe",
  "admin-slots", "admin-desafios", "admin-menu",
  "admin-comerciais", "admin-comerciais-novo", "admin-comerciais-detalhe",
] as const;

export type PageHelpKey = (typeof KEYS)[number];

export const PAGE_HELPS: Record<PageHelpKey, PageHelpEntry> = {
  /* ==================================================================
     USUÁRIO (assinante) — /app/*
     ================================================================== */
  "app-home": {
    path: "/app",
    titulo: "Início — sua tela principal",
    resumo:
      "Pense nessa tela como o painel do carro: tudo importante está aqui, em destaque. No topo aparece quanto dinheiro você já economizou no mês, embaixo vêm os estabelecimentos parceiros mais próximos de você e os cupons em destaque do dia. É por aqui que você vai começar a maioria das interações com o BRAVA+.",
    oQueFaz: [
      "Mostra sua ECONOMIA do mês — é a soma de tudo que você ganhou de desconto com cupons + cashback. Se está em R$ 0 é porque você ainda não usou — começa a usar e o número sobe.",
      "Mensagem de boas-vindas com seu nome e a hora do dia (bom dia / boa tarde / boa noite) — só pra deixar a casa acolhedora.",
      "Stories dos parceiros no topo (igual Instagram) — clique pra ver promoção que está rolando AGORA.",
      "Chips de categorias (Restaurantes, Cafés, Beleza, etc) — toque numa pra filtrar tudo daquele tipo.",
      "Lista 'perto de você' — só funciona se você liberar a localização. Mostra parceiros ordenados do mais perto pro mais longe, em km (linha reta).",
      "Cupons em destaque — formato de ticket recortado, fácil de identificar. Toque pra resgatar e guardar na sua carteira.",
    ],
    comoUsar: [
      "Tocou numa categoria → cai na busca já filtrada por aquele tipo.",
      "Tocou num estabelecimento → abre a página completa dele (chamamos de '360').",
      "Quer mostrar sua carteirinha BRAVA+ pro lojista? Toque no botão AMARELO REDONDO no centro da barra inferior — abre na hora.",
    ],
    dicas: [
      "Permita acesso à sua localização no celular. Sem isso o app não tem como te mostrar o que está perto — você só vai ver a lista completa, sem ordenação.",
      "Se você está no plano Básico e quer cupons mais agressivos (50% off, marcas exclusivas), considere subir pra Premium ou VIP — esses cupons só aparecem pra quem está no tier certo.",
      "A economia do mês zera todo dia 1º — então no começo de cada mês começa do zero. Não é bug.",
    ],
    tourRole: "usuario",
  },
  "app-buscar": {
    path: "/app/buscar",
    titulo: "Buscar — encontre o que quiser",
    resumo:
      "É o Google do BRAVA+. Você digita o que está procurando (nome de loja, prato, tipo de serviço) ou aplica filtros (categoria + tipo de promoção) e vê o que combina. Útil quando você sabe o que quer, mas não lembra o nome certo, ou quando quer comparar opções de uma categoria.",
    oQueFaz: [
      "Campo de busca textual — procura no nome E na descrição curta (tagline) de cada parceiro. Ex: digite 'pizza' e aparece toda loja que tem essa palavra em qualquer lugar.",
      "Chips de categoria no topo — filtro rápido tipo 'só restaurantes' ou 'só beleza'. Pode combinar com a busca textual.",
      "Filtro por tipo de promoção — escolha se quer ver SÓ quem tem cupom, SÓ quem tem fidelidade, etc. Bom pra caçar economia específica.",
      "Toggle 'mais perto / A→Z' — alterna entre ordenar por distância (se GPS ligado) ou por nome alfabético.",
      "Cada card mostra a distância em km — calculada em linha reta entre você e o estabelecimento. (Não é a distância de carro/caminhada — é o famoso 'voo de pássaro'.)",
    ],
    comoUsar: [
      "Digite no campo de busca OU toque numa chip de categoria — pode usar os dois ao mesmo tempo.",
      "Use o toggle 'mais perto' pra ver primeiro o que está no raio caminhável (1-2 km).",
      "Tocou num resultado → abre o 360 (página completa) do estabelecimento.",
    ],
    dicas: [
      "Combine 2 filtros pra resultado mais útil: 'Restaurantes' + 'Tem cupom' = lugares pra economizar no almoço.",
      "Se você está sem GPS, o toggle 'mais perto' não funciona e volta automático pra A→Z.",
      "Resultado vazio? Tente palavras mais genéricas (em vez de 'temaki', use 'japonês').",
    ],
    tourRole: "usuario",
  },
  "app-mapa": {
    path: "/app/mapa",
    titulo: "Mapa — descubra visualmente",
    resumo:
      "Em vez de lista, você vê todos os parceiros como pinos AMARELOS espalhados no mapa do seu bairro/cidade. Bom pra descobrir lugar bom no caminho da sua casa pro trabalho, ou pra planejar um rolê.",
    oQueFaz: [
      "Mapa aberto e gratuito (usa OpenStreetMap, igual o Waze de versões antigas).",
      "Pinos AMARELOS = parceiros BRAVA+ ativos. Cada pino é uma loja.",
      "Pino AZUL = você (sua localização atual). Só aparece se GPS está ligado.",
      "Toque num pino amarelo → abre um balão com nome da loja + botão pra abrir o 360 completo.",
    ],
    dicas: [
      "Use pra planejar passeio: 'vou pro parque, o que tem de bom no caminho?'",
      "Antes de abrir o mapa, dá pra filtrar por categoria na tela de Busca. Aí o mapa já vem filtrado.",
      "Se você está num bairro novo, o mapa é a melhor forma de explorar o que tem por ali.",
    ],
    tourRole: "usuario",
  },
  "app-estabelecimento": {
    path: "/app/estabelecimento",
    titulo: "Página do estabelecimento (360)",
    resumo:
      "Aqui é a 'vitrine completa' de um parceiro. Tudo que ele tem pra te oferecer está nessa página: fotos, descrição, produtos com preço, cupons disponíveis pra você, clube de fidelidade, chat com o lojista, avaliações. É a tela mais importante depois da Início — você vai abrir muitas dessas.",
    oQueFaz: [
      "Topo (hero) com logo + até 3 fotos da loja em carrossel.",
      "Endereço completo com mapinha + botão pra abrir no Google Maps/Waze pra rota até lá.",
      "Telefone e botão WhatsApp pra ligar/mandar mensagem direto.",
      "Catálogo de produtos com foto + preço — toque em 'comprar' e cai no checkout (PIX ou cartão).",
      "Lista de cupons disponíveis pra você (só aparecem os que combinam com seu tier de plano).",
      "Clube de fidelidade dessa loja: barra de progresso 'X de Y visitas' + qual prêmio você ganha ao completar.",
      "Botão chat pra mandar mensagem direto pro lojista, em tempo real.",
      "Coraçãozinho de favoritar — vai pra sua lista de favoritos.",
      "Reviews de outros assinantes + nota média (estrelas).",
    ],
    comoUsar: [
      "Quer comprar algo do catálogo? Toque no produto → escolhe forma de pagamento (PIX é instantâneo, cartão também) → confirma. Cashback de 1% volta como BRAVA Coins pra você.",
      "Quer pegar um cupom? Toque no cupom → ele vai pra sua carteira → você apresenta o QR dele no caixa quando for usar.",
      "Dúvida sobre algo da loja? Toque 'Chamar no chat' — abre conversa em tempo real, o lojista responde rapidinho.",
    ],
    dicas: [
      "Sempre dá uma olhada nas FOTOS da loja antes de visitar — evita decepção.",
      "Cupom + visita = combo: você usa o cupom no caixa, mostra a carteirinha, ganha +1 no clube de fidelidade e +5 BRAVA Coins.",
      "Reviews têm peso — antes de pedir algo novo, dá uma lida no que outros falaram.",
    ],
    tourRole: "usuario",
  },
  "app-cupons": {
    path: "/app/cupons",
    titulo: "Meus cupons",
    resumo:
      "É a sua 'pasta de cupons'. Todo cupom que você resgatou (clicou pra pegar) fica aqui guardado. Os ATIVOS aparecem primeiro (são os que você pode usar agora); os USADOS e VENCIDOS ficam embaixo no histórico. Pense numa carteira de papel cheia de cuponzinhos, só que digital.",
    oQueFaz: [
      "Lista todos seus cupons, em ordem: ativos primeiro, depois usados, depois expirados.",
      "Cada cupom mostra: nome da loja, valor do desconto (10%, R$ 20, etc), até quando vale e um botão pra ver o QR Code.",
      "Toque no cupom → abre um modal grande com o QR ampliado pro lojista escanear no caixa.",
    ],
    comoUsar: [
      "Hora de usar? Quando estiver pagando no caixa da loja, abra esse cupom, mostra o QR pro lojista. Ele escaneia → desconto aplicado.",
      "Cupom expirado some da home pra não confundir, mas continua aqui no histórico (pra você lembrar dos que perdeu).",
    ],
    dicas: [
      "Cupom tem validade — se está perto de vencer, vai aparecer um aviso. Use ou perde.",
      "Alguns cupons têm pedido mínimo (ex: 'só vale acima de R$ 30'). Está escrito no detalhe — confira antes de gastar tempo.",
      "Não acumulam: por pedido, normalmente só pode usar 1 cupom.",
    ],
    tourRole: "usuario",
  },
  "app-carteirinha": {
    path: "/app/carteirinha",
    titulo: "Carteirinha BRAVA+ (QR)",
    resumo:
      "É o seu 'crachá BRAVA+'. Cada parceiro tem um leitor de QR (a câmera deles ou um tablet no caixa). Você abre a carteirinha, mostra o QR, eles escaneiam → registra sua visita naquela loja, automaticamente. É como furar um cartão fidelidade de papel, só que infinitamente mais fácil.",
    oQueFaz: [
      "QR Code único e pessoal seu — ninguém mais tem esse código.",
      "Esse QR ROTACIONA a cada 60 segundos por segurança (pra ninguém tirar print e usar pelo seu nome).",
      "Mostra qual plano você assina (Básico, Premium ou VIP) numa tag colorida.",
      "Estatísticas pessoais: quantas visitas você já fez no total, em quantos clubes você está progredindo, quantos prêmios já tem disponíveis pra resgatar.",
    ],
    comoUsar: [
      "Abra a carteirinha (o botão AMARELO redondo no centro da barra de baixo do app).",
      "Estenda o celular pro lojista no caixa.",
      "Ele escaneia o QR com a câmera dele.",
      "Pronto: +1 visita no clube de fidelidade daquela loja + 5 BRAVA Coins de presente.",
    ],
    calculos: [
      "Cada scan da sua carteirinha = +1 visita no clube DAQUELE estabelecimento (só conta uma vez por dia, pra ninguém tentar fraudar).",
      "+5 BRAVA Coins de cashback automático a cada scan.",
      "Quando você bater a meta de visitas configurada pelo lojista (ex: 10 visitas), o prêmio dele fica DISPONÍVEL pra você resgatar.",
    ],
    dicas: [
      "Mesmo sem internet a carteirinha funciona (fica salva no app). Mas o QR rotaciona — se ficar offline mais de 1 minuto, abra o app de novo pra atualizar.",
      "Não compartilhe screenshot do QR — ele é seu. Se alguém usar a sua carteirinha, as visitas vão pra essa pessoa.",
      "Lojistas Premium têm 'Promo Trigger' — quando você mostra a carteirinha lá, ainda pode rolar cupom-bomba aleatório.",
    ],
    tourRole: "usuario",
  },
  "app-fidelidade": {
    path: "/app/fidelidade",
    titulo: "Clubes de fidelidade",
    resumo:
      "Cada parceiro tem o próprio 'cartão fidelidade'. Aqui você vê em quais clubes você está progredindo, quantas visitas faltam pro próximo prêmio em cada um e quais prêmios JÁ ESTÃO DISPONÍVEIS pra você resgatar. É o substituto digital daqueles cartõezinhos de 'compre 10 e leve o 11º grátis' que sempre se perdem na carteira.",
    visual: <FluxoVisita />,
    oQueFaz: [
      "Lista só os clubes em que você JÁ TEM PROGRESSO (pelo menos 1 visita registrada). Se acabou de assinar, vai estar vazio.",
      "Cada clube mostra: nome da loja, barra de progresso colorida (ex: 7 de 10 visitas), qual é o prêmio quando completar.",
      "No topo, uma seção amarela 'recompensas disponíveis' — são clubes que você JÁ COMPLETOU e ainda não resgatou o prêmio. Vá lá receber!",
    ],
    dicas: [
      "Quanto mais constante você for nas visitas a uma loja, mais cedo bate o prêmio.",
      "Cada lojista define a meta dele. Tem loja que pede 5 visitas (rápido), outras pedem 20 (longo). Veja antes de se comprometer.",
      "Prêmio liberado vira um CÓDIGO ALFANUMÉRICO curto (tipo 'BRV4K2'). Você apresenta esse código na loja pra receber.",
    ],
    tourRole: "usuario",
  },
  "app-carteira": {
    path: "/app/carteira",
    titulo: "Carteira BRAVA+",
    resumo:
      "Sua 'conta no banco BRAVA+'. Tudo que tem valor monetário pra você está num lugar só: cupons resgatados, vale-presentes que ganhou, saldo de BRAVA Coins (a moeda interna do app, vale cashback no checkout), prêmios de fidelidade prontos pra usar. Histórico de tudo que entrou/saiu. Pense como o app do seu banco — mas pra recompensas BRAVA+.",
    oQueFaz: [
      "Saldo de BRAVA Coins em destaque — essa é a moeda virtual que você acumula usando o app e gasta no checkout pra abater preço.",
      "Aba 'Cupons ativos' — atalho pra ver e usar.",
      "Aba 'Vale-presentes recebidos' — créditos que alguém deu pra você ou que veio de campanha.",
      "Aba 'Recompensas disponíveis' — prêmios dos clubes de fidelidade que você já completou.",
      "Histórico cronológico de toda movimentação (ganhou tantos coins, gastou tanto, etc).",
    ],
    calculos: [
      "Você ganha +5 coins por check-in (toda vez que apresenta carteirinha e tem scan).",
      "+10 coins por cupom resgatado.",
      "+1% do valor de cada pedido feito pelo app (ex: pediu R$ 50 → ganha 50 coins extras de cashback).",
      "1 BRAVA Coin = R$ 0,01 (cem coins valem 1 real).",
      "Pra USAR os coins, precisa ter pelo menos 100 acumulados (R$ 1 mínimo de abatimento).",
      "Se você é VIP, ganha DOBRO de coins em todas as ações.",
    ],
    dicas: [
      "Coins não expiram — pode acumular tranquilo e usar num pedido grande pra economizar mais.",
      "No checkout, sempre te perguntam quantos coins quer aplicar. Você decide.",
    ],
    tourRole: "usuario",
  },
  "app-presentes": {
    path: "/app/presentes",
    titulo: "Vale-presentes",
    resumo:
      "Tipo aquele vale-Submarino: você (ou alguém) compra um vale com valor X, dá pra outra pessoa, ela usa onde quiser dentro do BRAVA+. Esta tela mostra os vales que VOCÊ RECEBEU (pode usar) e os que VOCÊ ENVIOU pra outras pessoas (acompanhamento).",
    oQueFaz: [
      "Aba 'Recebidos' — cada vale tem código pra você apresentar no checkout e abater o valor do pedido.",
      "Aba 'Enviados' — histórico dos presentes que você comprou pra terceiros (com status: usado ou não).",
      "Botão 'enviar presente novo' — abre fluxo pra você comprar e enviar um vale pra alguém (email ou WhatsApp do destinatário).",
    ],
    dicas: [
      "Vale-presente normalmente expira em 90 dias — use antes que vá embora.",
      "Vale ganho em campanha promocional pode ter restrição (só vale em certas lojas) — leia o regulamento no detalhe.",
    ],
    tourRole: "usuario",
  },
  "app-premios": {
    path: "/app/premios",
    titulo: "Meus prêmios",
    resumo:
      "Quando você completa um clube de fidelidade de algum parceiro (ex: bateu 10 visitas naquela cafeteria), o prêmio dele entra aqui pra você resgatar. Cada prêmio vira um código curto (tipo voucher) que você mostra na loja pra receber o que foi prometido.",
    oQueFaz: [
      "Lista todos os prêmios disponíveis pra resgatar (que você ainda não usou).",
      "Cada prêmio mostra: nome do parceiro + descrição (ex: 'um café expresso grátis' ou 'sobremesa cortesia').",
      "Toque pra ver o CÓDIGO de resgate — sequência curta tipo 'BRV4K2' que você fala/mostra no caixa.",
    ],
    dicas: [
      "Resgatado, sumiu — o prêmio é de uso único e some daqui depois de validado pelo lojista.",
      "Tem prêmio com validade (30 ou 60 dias). Confira no detalhe antes de pretender deixar pra depois.",
    ],
    tourRole: "usuario",
  },
  "app-pedidos": {
    path: "/app/pedidos",
    titulo: "Meus pedidos",
    resumo:
      "Histórico de TUDO que você comprou pelo BRAVA+: produto pra retirar, pedido com entrega, qualquer coisa do catálogo dos parceiros. Mostra o status atual de cada um (aguardando confirmação, em preparo, pronto, a caminho, entregue, cancelado).",
    oQueFaz: [
      "Lista cronológica (pedido mais recente em cima).",
      "Status em cores: amarelo = em preparo, azul = a caminho, verde = entregue, vermelho = cancelado.",
      "Pra pedidos de delivery, mostra que tem mapa em tempo real (clique pra ver).",
    ],
    tourRole: "usuario",
  },
  "app-pedido-detalhe": {
    path: "/app/pedidos/",
    titulo: "Detalhe do pedido",
    resumo:
      "Tudo sobre um pedido específico: o que você comprou, valores item por item, desconto que aplicou, forma de pagamento, status atual. Se for entrega, mostra também o mapa em tempo real com a posição do entregador e o código de 4 dígitos que você vai falar pra ele na hora da entrega.",
    oQueFaz: [
      "Itens comprados com quantidade + preço unitário + total.",
      "Cupom aplicado (com valor de desconto destacado).",
      "Frete e taxas (se for delivery).",
      "Forma de pagamento (PIX ou cartão via Efí Bank).",
      "Mapa Mapbox com a posição do entregador em tempo real (atualiza automaticamente).",
      "CÓDIGO DE 4 DÍGITOS bem destacado — é o que você fala pro entregador no momento que ele te entrega o pedido. Sem esse código, ele não consegue fechar a entrega.",
      "Botão 'abrir chat com a loja' caso queira tirar dúvida.",
    ],
    calculos: [
      "Total final = subtotal − valor do cupom + frete − BRAVA coins usados",
      "Cashback que você recebe = 1% do total final (vai pra sua carteira como coins).",
      "Se você é Premium ou VIP, pode ter cashback DOBRADO.",
    ],
    tourRole: "usuario",
  },
  "app-chat": {
    path: "/app/chat",
    titulo: "Chat — suas conversas",
    resumo:
      "Lista de TODOS os lojistas com quem você já trocou mensagem. Tipo o WhatsApp, mas dentro do BRAVA+. Cada conversa fica aqui — última mensagem, horário, quantas não lidas.",
    oQueFaz: [
      "Lista conversas (mais recente primeiro).",
      "Cada item: nome da loja, prévia da última mensagem, horário, badge vermelho com número de não-lidas.",
      "Tocou na conversa → abre o chat completo.",
    ],
    tourRole: "usuario",
  },
  "app-chat-detalhe": {
    path: "/app/chat/",
    titulo: "Conversa com o lojista",
    resumo:
      "Chat em tempo real entre você e o lojista. Mensagem que ele envia aparece sem refresh, exatamente como WhatsApp. Você pode mandar texto, foto, perguntar sobre pedido, esclarecer dúvida, etc.",
    oQueFaz: [
      "Mensagens em tempo real (Supabase Realtime — chega na hora).",
      "Indicador 'lojista está digitando' quando ele está te respondendo.",
      "Upload de foto direto da câmera ou galeria.",
      "Marca 'visualizada' / 'não lida' (tipo dois tiques azuis).",
    ],
    tourRole: "usuario",
  },
  "app-notificacoes": {
    path: "/app/notificacoes",
    titulo: "Notificações",
    resumo:
      "Tudo que o sistema tentou te avisar: cupons novos, mudança de status de pedido, mensagem do lojista, lembrete de fidelidade ('faltam 2 visitas pro prêmio'), push de proximidade ('você está perto de uma promoção'). Funciona como uma caixa de entrada — o que você não lê fica aqui guardado.",
    oQueFaz: [
      "Lista cronológica de todas as notificações (mais recentes em cima).",
      "Cada notif tem tipo (cupom / pedido / chat / sistema) e um pequeno ícone.",
      "Tocou na notif → vai direto pra tela referente (abre o cupom, o pedido, a conversa).",
    ],
    dicas: [
      "Ative as notificações PUSH no celular pra receber em tempo real, mesmo com app fechado.",
      "Push de proximidade exige autorizar localização EM SEGUNDO PLANO (não só quando o app está aberto).",
      "Se você não quer ser notificado de noite, dá pra silenciar — basta desativar push no celular nesse horário.",
    ],
    tourRole: "usuario",
  },
  "app-perfil": {
    path: "/app/perfil",
    titulo: "Meu perfil",
    resumo:
      "Sua 'central de controle' pessoal: avatar, nome, plano que você assina, estatísticas do seu uso (quantas visitas, quanto economizou). Daqui você acessa: editar dados, gerenciar endereços, programa de indicação, abrir ticket de suporte, sair da conta.",
    oQueFaz: [
      "Avatar com suas iniciais (ou foto se você subir).",
      "Tier do seu plano destacado (Básico / Premium / VIP).",
      "Cards com KPIs: total de visitas, clubes ativos, quanto economizou no total desde que assinou.",
      "Atalhos rápidos: editar dados, endereços, indique e ganhe, suporte, sair.",
    ],
    tourRole: "usuario",
  },
  "app-perfil-dados": {
    path: "/app/perfil/dados",
    titulo: "Meus dados pessoais",
    resumo:
      "Aqui você edita as informações da sua conta. Mantenha sempre atualizado — algumas dessas info têm impacto direto no que você ganha (data de aniversário, por exemplo, libera cupom premium automático no dia do seu B-day).",
    campos: [
      { nome: "Nome completo", desc: "como aparece em cupons e tickets que você apresenta no lojista", obrigatorio: true },
      { nome: "Email", desc: "é o seu login + onde chegam confirmações importantes", obrigatorio: true },
      { nome: "Telefone", desc: "com DDD — usado pra SMS de segurança e contato em caso de problema no pedido" },
      { nome: "Data de nascimento", desc: "libera AUTOMATICAMENTE um cupom premium e notificação no seu aniversário (todo ano)" },
      { nome: "Avatar (foto)", desc: "opcional — aparece nas conversas de chat e listas (sem foto fica suas iniciais)" },
    ],
    dicas: [
      "Não esqueça do aniversário — sem ele, sem cupom de B-day.",
      "Telefone errado = você pode perder SMS de confirmação importante.",
    ],
    tourRole: "usuario",
  },
  "app-perfil-enderecos": {
    path: "/app/perfil/enderecos",
    titulo: "Meus endereços",
    resumo:
      "Cadastre endereços frequentes (casa, trabalho, casa dos pais) pra usar no delivery sem precisar digitar tudo de novo a cada pedido. Um deles você marca como PRINCIPAL — ele vira o padrão no checkout, você só muda quando precisar.",
    comoUsar: [
      "Toque '+ Adicionar endereço'.",
      "Digite o CEP — o sistema preenche rua, bairro, cidade, UF automaticamente (via integração ViaCEP).",
      "Complete: número da casa/apto + complemento (bloco, sala, ponto de referência).",
      "Marque como PRINCIPAL se quiser que vire o endereço padrão de entrega.",
    ],
    dicas: [
      "Não tem CEP na cabeça? Procure no Google rapidinho ou use 'CEP do bairro' como referência.",
      "Complemento é importante pra entregador achar (ex: 'Bloco B, apto 302, interfone 0302').",
    ],
    tourRole: "usuario",
  },
  "app-favoritos": {
    path: "/app/favoritos",
    titulo: "Favoritos",
    resumo:
      "Suas lojas favoritas (as que você marcou com o coraçãozinho no 360). Atalho pra abrir rápido sem ficar procurando. Útil pros 5-10 lugares que você frequenta toda semana.",
    tourRole: "usuario",
  },
  "app-indique": {
    path: "/app/indique",
    titulo: "Indique e ganhe",
    resumo:
      "Programa de indicação: você convida amigo, ele assina, AMBOS ganham. Você recebe 1 mês grátis no SEU plano OU 50 BRAVA Coins; ele escolhe a mesma coisa. É o famoso 'win-win': ele ganha desconto pra começar, você ganha por trazer mais gente.",
    oQueFaz: [
      "Seu link único de indicação — copie/compartilhe nas redes (WhatsApp, Instagram).",
      "Botão 'compartilhar' que abre o sheet nativo do celular (mais rápido que copiar).",
      "Histórico de indicados: quem se cadastrou, quem realmente assinou, quanto você já ganhou.",
    ],
    calculos: [
      "Recompensa = 1 mês grátis no plano atual OU 50 coins (cada um escolhe).",
      "Você só recebe DEPOIS que o convidado pagar a 1ª mensalidade dele — proteção contra fraude (alguém criar conta só pra ganhar e cancelar).",
      "Sem limite de indicações — quanto mais, melhor.",
    ],
    dicas: [
      "Indique gente que ESTÁ NA SUA CIDADE — eles usam mais, ficam mais, te dão mais ganho ao longo do tempo.",
      "Compartilhe junto com uma frase pessoal explicando o que VOCÊ ganha de prático ('uso BRAVA+ no almoço e economizo R$ 200/mês').",
    ],
    tourRole: "usuario",
  },
  "app-extornos": {
    path: "/app/extornos",
    titulo: "Estornos / reembolsos",
    resumo:
      "Aconteceu algum problema com um pedido (chegou errado, não chegou, qualidade ruim)? Aqui você abre solicitação de estorno. Time BRAVA+ analisa em até 7 dias úteis e devolve o dinheiro se for procedente. Status atualizado em tempo real.",
    oQueFaz: [
      "Lista solicitações abertas com status (pendente / aprovado / recusado).",
      "Motivo + descrição que você preencheu.",
      "Anexo opcional (foto do produto errado, comprovante).",
    ],
    tourRole: "usuario",
  },
  "app-suporte": {
    path: "/app/suporte",
    titulo: "Suporte BRAVA+",
    resumo:
      "Canal direto com nosso time pra dúvidas, problemas, sugestões. Abra ticket, descreva o problema, aguarde resposta (normalmente em horas em horário comercial). Conversa fica salva pra acompanhar.",
    tourRole: "usuario",
  },
  "app-suporte-detalhe": {
    path: "/app/suporte/",
    titulo: "Ticket de suporte",
    resumo: "Conversa em andamento com o time BRAVA+ sobre o problema que você abriu. Pode trocar mensagens, anexar foto/print.",
    tourRole: "usuario",
  },
  "app-proximos": {
    path: "/app/proximos",
    titulo: "Perto de você (lista detalhada)",
    resumo:
      "Versão expandida da seção 'perto' da home — aqui você vê uma lista DETALHADA de parceiros próximos, com mais info de cada um, raio configurável. Útil pra explorar tudo num raio específico (ex: 2 km da sua casa).",
    calculos: [
      "Distância = cálculo de haversine entre sua latitude/longitude e a do parceiro, resultado em km.",
      "É distância em linha reta (não considera ruas/trânsito) — então 1 km do mapa pode ser 1.5 km caminhando.",
    ],
    tourRole: "usuario",
  },
  "app-desafios": {
    path: "/app/desafios",
    titulo: "Desafios — missões pra ganhar coins",
    resumo:
      "Tipo missões diárias/mensais de jogo. O sistema te propõe tarefas (visitar 3 parceiros novos, resgatar 5 cupons no mês, fazer 2 pedidos de delivery). Você completa, ganha BRAVA Coins extras. Forma divertida de ganhar mais cashback.",
    oQueFaz: [
      "Lista desafios ATIVOS com barra de progresso (ex: '2 de 5 cupons resgatados').",
      "Recompensa em coins quando completa o desafio.",
      "Alguns desafios resetam todo mês (você pode fazer de novo); outros são únicos.",
    ],
    tourRole: "usuario",
  },
  "app-roleta": {
    path: "/app/roleta/",
    titulo: "Roleta da sorte",
    resumo:
      "Cada vez que você faz check-in (apresenta a carteirinha) num parceiro que tem roleta ativa, você ganha um giro grátis. Pode rolar cupom-bomba (50% off), brinde físico, BRAVA Coins extras, ou nada. É loteria divertida — vale tentar.",
    calculos: [
      "Probabilidades configuradas pelo lojista (a soma sempre dá 100%).",
      "Cupons raros (50% off) têm probabilidade pequena (1-5%); recompensas comuns (coins, 'nada') têm probabilidade alta.",
      "Você só ganha 1 giro por check-in — sem giros repetidos no mesmo dia, na mesma loja.",
    ],
    tourRole: "usuario",
  },
  "app-lista": {
    path: "/app/listas/",
    titulo: "Lista curada",
    resumo:
      "Coleção temática montada pelo time BRAVA+: 'Top 10 hambúrguers de SP', 'Cafés pet-friendly', 'Doceria pra namorada', etc. Tipo aquelas listas do Time Out, só que com parceiros reais que você pode visitar e ganhar BRAVA+ junto.",
    tourRole: "usuario",
  },
  "app-pacote": {
    path: "/app/pacote/",
    titulo: "Pacote BRAVA+",
    resumo:
      "Combo promocional: você paga uma vez e ganha N produtos/serviços de N parceiros juntos, com desconto agregado. Ex: 'Pacote Aniversariante = jantar + sobremesa + cupom de spa, tudo por R$ 99 (de R$ 200)'. Combo curado, normalmente sazonal.",
    tourRole: "usuario",
  },
  "app-menu": {
    path: "/app/menu",
    titulo: "Menu completo",
    resumo:
      "Atalho mobile pra acessar todas as áreas do app de uma vez. Útil quando você não acha algo na barra inferior — a maioria das telas tem link aqui.",
    tourRole: "usuario",
  },
  "assinar": {
    path: "/assinar",
    titulo: "Escolher plano BRAVA+",
    resumo:
      "Você precisa estar assinando pra USAR os benefícios. São 3 níveis (tiers) — quanto mais caro, melhores os cupons, mais coins, mais privilégios. Pense como Netflix: o mais barato funciona, o mais caro libera tudo. Você escolhe o que faz sentido pro seu uso.",
    calculos: [
      "BÁSICO — R$ 19,90/mês: acesso aos cupons comuns, fidelidade nas lojas, cashback 1x.",
      "PREMIUM — R$ 39,90/mês: cupons comuns + premium (mais agressivos), 1 vale-presente/mês de presente, cashback 1x.",
      "VIP — R$ 79,90/mês: TODOS os cupons (inclui exclusivos VIP), roleta diária extra, cashback 2x (dobrado), benefícios surpresa.",
      "Pode cancelar a qualquer momento, sem multa, sem fidelidade contratual.",
    ],
    dicas: [
      "Se você sai pra comer fora 3-4x por mês, o Premium já paga sozinho com os cupons.",
      "Se você é heavy user (sai toda semana, vai em vários lugares), VIP compensa fácil.",
    ],
    tourRole: "usuario",
  },
  "assinar-tier": {
    path: "/assinar/",
    titulo: "Checkout da assinatura",
    resumo:
      "Aqui você paga pra começar/trocar de plano. Duas opções: PIX (instantâneo, libera na hora) ou Cartão de crédito (vira recorrência mensal automática via Efí Bank — todo mês cobra sozinho, sem você fazer nada).",
    oQueFaz: [
      "Aba PIX: gera QR code + código copia-e-cola. Você paga no seu banco, e em poucos segundos sua assinatura está ATIVA.",
      "Aba Cartão: você cadastra dados do cartão UMA VEZ. Efí Bank guarda com segurança (tokenizado, sem o BRAVA+ ter acesso ao número). Todo mês na mesma data, cobra sozinho. Pra cancelar, basta cancelar a assinatura no app.",
    ],
    dicas: [
      "PIX libera na hora (você vê assinatura ATIVA em segundos). Cartão pode levar até 2 minutos pra processar.",
      "Pra cancelar, vai em /app/perfil → 'Gerenciar assinatura' → 'Cancelar'. Sem multa, sem dor de cabeça.",
    ],
    tourRole: "usuario",
  },
  "checkout": {
    path: "/checkout/",
    titulo: "Checkout — finalizar compra",
    resumo:
      "Tela onde você confirma e paga um pedido do catálogo de algum parceiro. Aqui você escolhe forma de pagamento, aplica cupom, decide quantos BRAVA Coins quer abater. Tudo num lugar só, simples.",
    calculos: [
      "Total final = preço − cupom aplicado − coins usados + frete (se for delivery)",
      "Cashback creditado depois = 1% do total final (vira coins na sua carteira).",
      "VIP recebe 2% de cashback.",
    ],
    tourRole: "usuario",
  },

  /* ==================================================================
     USUÁRIO — Ferramentas novas
     ================================================================== */
  "app-wallet": {
    path: "/app/wallet",
    titulo: "BRAVA Wallet — recarga com bônus",
    resumo: "Deposite uma vez, ganhe BÔNUS imediato e use como dinheiro nos parceiros. Exemplo: deposita R$ 500 → saldo de R$ 600. Pague PIX/cartão dos pedidos abatendo desse saldo. Vale como dinheiro nos parceiros.",
    oQueFaz: [
      "Mostra saldo atual + totais (depositado, gasto) em destaque.",
      "Packs configuráveis (R$ 100 + 10% bônus, R$ 500 + 20% bônus, etc) prontos pra recarregar.",
      "Histórico de cada movimentação (depósito, bônus, gasto).",
    ],
    calculos: [
      "Saldo final = depósito + bônus (ex: deposita R$ 300, ganha R$ 50 bônus = saldo R$ 350).",
      "% bônus varia por pack (10% no R$100, até 25% no R$1000) — admin configura.",
      "Quando você gasta num pedido, abate primeiro do bônus depois do principal.",
    ],
    dicas: [
      "Quanto maior o pack, melhor o % bônus. Se vai usar muito BRAVA+, vale a recarga grande.",
      "Saldo não expira. Pode acumular.",
      "Pagamento de recarga via PIX é instantâneo.",
    ],
    tourRole: "usuario",
  },
  "app-grupos": {
    path: "/app/grupos",
    titulo: "Rolês em grupo",
    resumo: "Combine um rolê com amigos no app. Crie o evento, convide pessoas, todos veem os cupons disponíveis e dividem a conta. Vocês ganham bônus por ir juntos.",
    oQueFaz: [
      "Crie um rolê: título, local (parceiro), data/hora, máximo de pessoas.",
      "Convide amigos (eles entram com 1 toque).",
      "Cupons aplicáveis no rolê ficam compartilhados (1 usa, todos ganham).",
      "Quando todos chegam no parceiro, cada um ganha bônus de coins (incentivo de presença).",
    ],
    dicas: [
      "Rolê com 4+ pessoas geralmente desbloqueia cupom-bomba (verifique no parceiro).",
      "Cancele com antecedência se mudou de planos — libera a vaga pra outros.",
    ],
    tourRole: "usuario",
  },
  "app-vou-ai": {
    path: "/app/vou-ai",
    titulo: "Vou aí agora — intent broadcast",
    resumo: "Antes de chegar num parceiro, avisa pelo app. Loja se prepara (mesa, fila), e às vezes te recebe com uma cortesia surpresa configurada pelo lojista.",
    oQueFaz: [
      "Selecione o parceiro + ETA (10-90 min).",
      "Sistema avisa o lojista em tempo real.",
      "Se loja tem regra de cortesia ativa pro seu tier/ETA, você vê a mensagem aqui (ex: 'café cortesia te esperando').",
      "Histórico dos seus avisos.",
    ],
    dicas: [
      "Em horário cheio (jantar sábado), avisar 30min antes te garante mesa.",
      "Cortesias variam por loja e tier — VIP normalmente ganha mais.",
    ],
    tourRole: "usuario",
  },
  "app-recomendados": {
    path: "/app/recomendados",
    titulo: "Recomendado pra você",
    resumo: "Lista personalizada baseada nas SUAS visitas + horário atual + clima (em breve). Tipo Spotify Discover, mas pra lugares pra ir.",
    oQueFaz: [
      "Engine olha categorias que você mais frequenta nos últimos 90 dias.",
      "Combina com horário (almoço = restaurante; noite = bar; manhã = café).",
      "Mostra estabs daquelas categorias perto de você.",
    ],
    dicas: [
      "Quanto mais visitas você faz, melhor a recomendação fica.",
      "Se algum recomendado não te interessa, just ignore — o engine aprende.",
    ],
    tourRole: "usuario",
  },
  "app-badges": {
    path: "/app/badges",
    titulo: "Badges de explorador",
    resumo: "Gamificação. Visite categorias diferentes, bairros, parceiros novos — desbloqueia badges + ganha BRAVA Coins extras como prêmio. Tipo missões de RPG.",
    oQueFaz: [
      "Lista todos badges disponíveis com seu progresso.",
      "Badges em destaque amarelo = já conquistou.",
      "Cada um vale X coins quando você bate a meta.",
      "Compartilháveis (em breve).",
    ],
    dicas: [
      "Explorar categorias novas (não só uma) acelera badges 'eclético'.",
      "Viaje pra outra cidade? Faça check-in lá — vale badge 'viajante'.",
    ],
    tourRole: "usuario",
  },
  "app-notas": {
    path: "/app/notas",
    titulo: "Notas privadas",
    resumo: "Seu diário pessoal por parceiro. 'Pedir o X de novo', 'evitar mesa 3 (perto da entrada)', 'aniversariou aqui em 2025'. Privado — só você vê. Útil pra não esquecer recomendações pra você mesmo.",
    oQueFaz: [
      "Lista notas que você escreveu, agrupadas por estabelecimento.",
      "Editar inline (digite + salva).",
      "Acesso direto via página de cada parceiro (atalho '+ Adicionar nota').",
    ],
    tourRole: "usuario",
  },
  "app-presente-pessoal": {
    path: "/app/presente-pessoal",
    titulo: "Cupom-presente pessoal",
    resumo: "Crie um cupom DA SUA loja favorita pra presentear amigo. Forma de dizer 'você precisa conhecer esse lugar' + um desconto pra ele começar bem. Loja te paga uma comissão (em breve).",
    oQueFaz: [
      "Form pra enviar: loja + email/nome do amigo + % ou R$ off + mensagem pessoal.",
      "Amigo recebe email/notificação com código.",
      "Você acompanha status (pendente, aceito, usado).",
    ],
    dicas: [
      "Combine com indique-e-ganhe: se a pessoa nunca foi BRAVA+, ainda recebe o convite.",
      "Personalize a mensagem — taxa de uso sobe muito quando tem afetividade.",
    ],
    tourRole: "usuario",
  },
  "app-lista-espera": {
    path: "/app/lista-espera",
    titulo: "Filas virtuais",
    resumo: "Restaurante cheio? Em vez de esperar em pé na porta, entre na fila virtual pelo app. Receba push quando chegar sua vez. Aproveite o tempo livre.",
    oQueFaz: [
      "Lista filas em que você está agora (com status: aguardando, chamado, sentado).",
      "Quando lojista chama, status fica em destaque verde + push.",
      "Histórico de filas anteriores.",
    ],
    dicas: [
      "Se sair do raio do parceiro, sistema te tira da fila automaticamente (anti-fura-fila).",
    ],
    tourRole: "usuario",
  },
  "app-amigos": {
    path: "/app/amigos",
    titulo: "Amigos & stories",
    resumo: "Veja em tempo real onde seus amigos BRAVA+ estão. Descubra lugares novos via prova social — se Maria foi e gostou, vale a pena conhecer.",
    oQueFaz: [
      "Lista visitas recentes dos seus amigos (últimas 20).",
      "Clique no estabelecimento pra abrir o 360.",
      "Convide novos amigos via 'Indique e ganhe'.",
    ],
    tourRole: "usuario",
  },

  /* ==================================================================
     LOJISTA — Ferramentas novas
     ================================================================== */
  "loja-mesa-qr": {
    path: "/loja/mesa-qr",
    titulo: "Mesa QR — pedido sem garçom",
    resumo: "Cliente escaneia QR na mesa → vê catálogo → pede e paga pelo BRAVA+ → cozinha recebe na TV (/loja/kitchen). Reduz custo operacional (menos garçom), aumenta ticket (menos vergonha), gera dados riquíssimos.",
    oQueFaz: [
      "Crie mesas (label + capacidade) — cada uma recebe QR único.",
      "Baixe o QR (PNG) pra colar/imprimir na mesa.",
      "Conta scans automaticamente — ver quais mesas geram mais pedido.",
      "Pause mesa quando reservada/inativa.",
    ],
    campos: [
      { nome: "Label", desc: "ex: 'Mesa 1', 'Balcão A', 'Camarote VIP'", obrigatorio: true },
      { nome: "Capacidade", desc: "número de lugares (informativo)", obrigatorio: false },
    ],
    dicas: [
      "Cole QR físico na mesa e duplique (2 lados) pra facilitar.",
      "Plastifique pra durar.",
      "Use o link /m/<token> em redes sociais também (cliente pede delivery via QR de promo).",
    ],
    tourRole: "lojista",
  },
  "loja-kitchen": {
    path: "/loja/kitchen",
    titulo: "Display cozinha (TV)",
    resumo: "Painel otimizado pra TV/tablet fixo na cozinha. Mostra todos os pedidos em andamento (pago, em preparo, pronto), cores por status. Igual iFood Tablet — mas direto no BRAVA+.",
    oQueFaz: [
      "Cards de pedido com status colorido (amarelo/azul/verde).",
      "Mostra mesa de origem (token) ou se é delivery/retirada.",
      "Lista itens com quantidade.",
      "Atualiza ao recarregar a página (mantenha aberta em tablet).",
    ],
    dicas: [
      "Use tablet com tela bloqueada pra não fechar a página.",
      "Imprima recibo automático integrando com sua impressora térmica (em breve).",
    ],
    tourRole: "lojista",
  },
  "loja-comparativo": {
    path: "/loja/comparativo",
    titulo: "Comparativo regional (benchmark anônimo)",
    resumo: "Como sua loja está vs MÉDIA das outras lojas da mesma categoria + cidade. Dados sempre AGREGADOS (não dizemos quem é quem) mas você sabe onde está em performance.",
    oQueFaz: [
      "Receita 30d sua vs média da categoria/cidade.",
      "Pedidos 30d idem.",
      "Indicador colorido (verde acima da média, vermelho abaixo).",
      "Sugestões automáticas baseadas no gap.",
    ],
    objetivoRelatorio:
      "Saber se sua estratégia funciona OU se você está perdendo terreno pra concorrência. Se está 30% abaixo, há margem clara de melhoria.",
    calculos: [
      "Média = soma da receita / qtd estabs ativos da mesma categoria/cidade",
      "Sua %vs média = (sua_receita - média) / média × 100",
    ],
    tourRole: "lojista",
  },
  "loja-parcerias": {
    path: "/loja/parcerias",
    titulo: "Parcerias com vizinhos",
    resumo: "Crie combos cruzados com outras lojas BRAVA+ da sua região. 'Pizzaria + Sorveteria do mesmo prédio = combo R$ 50, ticket sobe 30% pra ambos'. BRAVA+ media e os 2 ganham.",
    oQueFaz: [
      "Sugestões automáticas baseadas em vizinhança (em breve).",
      "Proponha parceria pra qualquer lojista da sua cidade.",
      "Configure combo: nome, preço, split (% pra cada um).",
      "Outro lojista aceita/recusa.",
    ],
    dicas: [
      "Comece com 50/50 — mais fácil de fechar.",
      "Combos complementares vendem mais (café+padaria, pizza+sobremesa).",
      "Faça oferta sazonal (Dia dos Namorados, Festa Junina).",
    ],
    tourRole: "lojista",
  },
  "loja-ab-test": {
    path: "/loja/ab-test",
    titulo: "A/B test de cupons",
    resumo: "Quer saber qual oferta converte mais? Dispara 2 versões pra metades da base. Em 48h você sabe qual venceu, sem ser analista. Decisão data-driven sem doutorado.",
    oQueFaz: [
      "Configure hipótese + variante A + variante B + tamanho audiência.",
      "Sistema divide aleatoriamente.",
      "Tracking automático: quantos usaram cada variante + receita gerada.",
      "Você decide vencedor (ou marca empate).",
    ],
    campos: [
      { nome: "Hipótese", desc: "ex: '% off converte mais que R$ fixo?'", obrigatorio: true },
      { nome: "Variante A (label + tipo + valor)", desc: "ex: 'A: 20% off / percent / 20'", obrigatorio: true },
      { nome: "Variante B", desc: "idem, diferente da A pra comparar", obrigatorio: true },
      { nome: "Audiência", desc: "qtas pessoas no total. Sistema divide em 50/50.", obrigatorio: true },
    ],
    dicas: [
      "Teste UMA variável de cada vez (% vs R$, OU validade curta vs longa — não as duas juntas).",
      "Audiência pequena = resultado pouco confiável. Mínimo 100 pessoas pra A/B real.",
    ],
    tourRole: "lojista",
  },
  "loja-calendario": {
    path: "/loja/calendario",
    titulo: "Calendário de promoções",
    resumo: "Visualize TODAS as campanhas que você tem agendadas (cupons, blasts, roletas, sazonais). Evita choque de promoção. Pre-fills sazonais (Festa Junina, Black Friday) aparecem como sugestão.",
    oQueFaz: [
      "Lista eventos próximos.",
      "Sugestões automáticas pro mês atual + próximo (vindas dos seasonal_templates).",
      "Agende novos com 1 form.",
    ],
    dicas: [
      "Não rode 2 promo muito agressivas (50% off) no mesmo dia. Cliente fica confuso.",
      "Sazonalidade rende mais — começa cupom 7-14 dias antes do evento.",
    ],
    tourRole: "lojista",
  },
  "loja-chat-bot": {
    path: "/loja/chat-bot",
    titulo: "Auto-resposta de chat",
    resumo: "Cliente perguntou 'tem delivery?' ou 'até que horas abre?' BRAVA+ responde sozinho com a frase que VOCÊ configurou. Atendente humano só intervém em casos complexos.",
    oQueFaz: [
      "Crie pares: palavra-chave (trigger) → resposta automática.",
      "Quando cliente digita a palavra no chat, bot responde.",
      "Contador de quantas vezes cada regra disparou.",
    ],
    dicas: [
      "Comece com 5 regras básicas: horário, delivery, raio, formas de pagamento, política de troca.",
      "Use múltiplas palavras-chave separadas por vírgula no trigger.",
      "Use linguagem casual — soa mais humano.",
    ],
    tourRole: "lojista",
  },
  "loja-cross-sell": {
    path: "/loja/cross-sell",
    titulo: "Cross-sell pós-venda (recibo com cupom)",
    resumo: "Cliente comprou X. Recibo digital dele já vem com cupom de Y ('comeu prato? leva sobremesa 20% off, só hoje'). Ticket sobe sem pressão de garçom.",
    oQueFaz: [
      "Configure trigger (qual produto dispara) + oferta (cupom pra outro).",
      "Validade curta cria urgência.",
      "Tracking: quantos viram, quantos resgataram.",
    ],
    dicas: [
      "Funciona melhor pra complementar (prato → sobremesa, café → pão).",
      "Validade 24h ideal (cria urgência sem ser opressivo).",
      "Desconto 20-30% converte; abaixo de 10% é fraco.",
    ],
    tourRole: "lojista",
  },
  "loja-vou-ai": {
    path: "/loja/vou-ai",
    titulo: "Vou aí — recebimento",
    resumo: "Veja em tempo real clientes que avisaram que vêm aí. Configure regras de cortesia automática (ex: VIP que avisa 30min antes ganha bebida cortesia).",
    oQueFaz: [
      "Lista intents abertos (a caminho) com ETA.",
      "Configure regras de cortesia: ETA mínimo + tier + mensagem.",
      "Cliente já vê a cortesia quando avisa.",
    ],
    dicas: [
      "Cortesia precisa ter custo BAIXO (R$ 3-5 por cliente) — gera WOW sem comprometer margem.",
      "Café/bebida/sobremesa cortesia funcionam bem.",
      "Restrinja a VIP no início, depois afrouxa se gostar do efeito.",
    ],
    tourRole: "lojista",
  },
  "loja-lista-espera": {
    path: "/loja/lista-espera",
    titulo: "Fila virtual",
    resumo: "Painel pra gerenciar fila de espera. Cliente entra pelo app/QR. Quando chegar a vez, você toca 'Chamar' → ele recebe push. Sem mais gritar nome no salão.",
    oQueFaz: [
      "2 colunas: chamados (esperando chegar) + aguardando.",
      "Botão 'Chamar' dispara push pro cliente.",
      "Botão 'Sentou' fecha a entrada quando ele chega.",
    ],
    dicas: [
      "Quando chamar, deixe 5-10 min até considerar 'desistiu'. Cliente pode estar voltando.",
      "Use em horário de pico (jantar sábado, almoço dia 1º).",
    ],
    tourRole: "lojista",
  },
  "loja-cfo-backup": {
    path: "/loja/cfo-backup",
    titulo: "Backup CFO (email automático)",
    resumo: "Configure email + frequência. BRAVA+ envia automaticamente toda semana/mês um resumo financeiro + CSV pra sua contadora. Sem precisar lembrar de exportar manualmente.",
    campos: [
      { nome: "Email destino", desc: "da contadora ou financeiro interno", obrigatorio: true },
      { nome: "Frequência", desc: "semanal (segunda-feira) ou mensal (dia 1)" },
    ],
    dicas: [
      "Semanal é melhor pra controle de fluxo de caixa.",
      "Mensal é melhor pra fechamento fiscal.",
    ],
    tourRole: "lojista",
  },
  "loja-treinamento": {
    path: "/loja/treinamento",
    titulo: "Treinamento in-app",
    resumo: "Vídeos curtos (60-90s cada) explicando como usar cada feature do BRAVA+. Útil pra você e pra novos funcionários que entrarem na sua loja.",
    oQueFaz: [
      "Grid de vídeos do público 'lojista'.",
      "Marca os já assistidos.",
      "Filtros por tópico.",
    ],
    dicas: [
      "Dia 1 do funcionário novo: peça pra assistir os 5 primeiros vídeos antes de começar.",
    ],
    tourRole: "lojista",
  },

  /* ==================================================================
     ADMIN — Ferramentas
     ================================================================== */
  "admin-ferramentas": {
    path: "/admin/ferramentas",
    titulo: "Hub de ferramentas",
    resumo: "Acesso a todos os CRUDs/monitors das ferramentas novas do BRAVA+. Tudo que requer configuração centralizada (badges, packs Wallet, templates sazonais, treinamentos) e tudo que vale observar (rolês ativos, mesas QR, parcerias).",
    tourRole: "admin",
  },
  "admin-ferr-wallet": {
    path: "/admin/ferramentas/wallet",
    titulo: "Packs Wallet",
    resumo: "Configura quanto cliente deposita e quanto ganha de bônus. Pode ter 3-5 packs (R$ 100, 300, 500, 1000). Quanto mais alto, melhor o % bônus pra incentivar tickets maiores.",
    campos: [
      { nome: "Label", desc: "como aparece pro cliente no /app/wallet", obrigatorio: true },
      { nome: "Depósito (R$)", desc: "valor que o cliente paga", obrigatorio: true },
      { nome: "Bônus (R$)", desc: "valor que você dá de presente — vira saldo extra", obrigatorio: true },
      { nome: "Ordem", desc: "menor = aparece primeiro" },
      { nome: "Ativa", desc: "toggle pra pausar sem deletar" },
    ],
    objetivoRelatorio: "Definir quais 'pacotes de recarga' incentivar — pra capturar caixa e fidelizar.",
    tourRole: "admin",
  },
  "admin-ferr-badges": {
    path: "/admin/ferramentas/badges",
    titulo: "Badges (conquistas)",
    resumo: "Gamificação do app do usuário. Cada badge define uma regra (X visitas, Y categorias, Z cidades) + recompensa em BRAVA Coins. Quanto mais badges você criar, mais missões pra engajar.",
    tourRole: "admin",
  },
  "admin-ferr-sazonalidade": {
    path: "/admin/ferramentas/sazonalidade",
    titulo: "Templates sazonais",
    resumo: "Pre-fills (modelo) pro lojista usar quando chega a época (Festa Junina, Black Friday, Natal). Aparecem como sugestão no /loja/calendario do lojista.",
    tourRole: "admin",
  },
  "admin-ferr-treinamentos": {
    path: "/admin/ferramentas/treinamentos",
    titulo: "Vídeos de treinamento",
    resumo: "Vídeos curtos por público (usuario, lojista, entregador, comercial, admin). Cada um aparece na tela /treinamento do role.",
    tourRole: "admin",
  },
  "admin-relatorios-ferramentas": {
    path: "/admin/relatorios/ferramentas",
    titulo: "Relatório ferramentas",
    resumo: "KPIs consolidados de cada feature nova: caixa Wallet, rolês ativos, mesas QR ativas, A/B tests concluídos com vencedor, parcerias ativas, etc.",
    objetivoRelatorio: "Validar adoção e impacto das features. Wallet abriu caixa? Mesa QR está sendo usada? A/B tests dão insights replicáveis pra outros lojistas?",
    tourRole: "admin",
  },

  /* ==================================================================
     LOJISTA — /loja/*
     ================================================================== */
  "loja-home": {
    path: "/loja",
    titulo: "Painel da loja — visão geral",
    resumo:
      "É a SUA dashboard como dono/gestor de loja. Resume o que está acontecendo agora: quantos pedidos chegaram, quanto faturou no mês, quantos clientes novos pegaram cupom seu, últimas visitas no clube de fidelidade. Pensa como o caixa de uma loja física, só que digital e em tempo real.",
    oQueFaz: [
      "4 KPIs em destaque: total de pedidos do mês, receita acumulada, clientes novos, visitas registradas no clube de fidelidade.",
      "Tabela com os ÚLTIMOS 10 pedidos — quem comprou, valor, status (aguardando / preparando / entregue).",
      "Lista das ÚLTIMAS 10 visitas no clube — quem apresentou a carteirinha, em que horário.",
      "Cards com atalhos rápidos pras 3 ações mais usadas: abrir scanner QR, criar cupom novo, disparar promo blast.",
    ],
    tourRole: "lojista",
  },
  "loja-perfil": {
    path: "/loja/perfil",
    titulo: "Perfil da loja — sua vitrine",
    resumo:
      "Tudo que o assinante vê na página da sua loja (o tal '360') é configurado AQUI. Logo, fotos, descrição, horário de funcionamento, endereço. Pense como o cartão de visita digital — capriche, porque é a 1ª impressão.",
    campos: [
      { nome: "Nome da loja", desc: "exatamente como aparece pro cliente — pense em SEO também (palavras-chave que ele busca)", obrigatorio: true },
      { nome: "Tagline (frase de impacto)", desc: "máximo 80 caracteres. Ex: 'O melhor café da Vila Madá'. Aparece logo embaixo do nome." },
      { nome: "Descrição completa", desc: "texto longo. Conte sua história: quem é, o que faz, por que escolher você." },
      { nome: "Logo", desc: "PNG quadrado, ideal 512×512. Aparece em listas, na carteirinha, em tudo. Use o melhor que tiver.", obrigatorio: true },
      { nome: "Fotos da loja (até 3)", desc: "aparecem no hero do 360. Iluminação boa, ângulos variados, qualidade alta. Foto ruim afasta cliente." },
      { nome: "Categoria principal", desc: "afeta os filtros do app. Escolha a CERTA — se você é cafeteria, marque 'cafés', não 'restaurantes'.", obrigatorio: true },
      { nome: "Telefone / WhatsApp", desc: "o cliente pode ligar ou mandar zap direto do app. Use número que alguém atende." },
      { nome: "Endereço completo", desc: "usado pra mostrar você no MAPA e pra busca por proximidade. Erro aqui = você fica invisível pra quem está perto.", obrigatorio: true },
      { nome: "Horários de funcionamento", desc: "exibido no 360. Cliente confia mais em quem deixa claro quando está aberto." },
    ],
    tourRole: "lojista",
  },
  "loja-catalogo": {
    path: "/loja/catalogo",
    titulo: "Catálogo de produtos",
    resumo:
      "Aqui você cadastra o que VENDE pelo app — comida, produto, serviço. Cada item aparece no 360 da sua loja com foto e preço. Cliente toca em 'comprar' → checkout PIX/cartão → dinheiro cai na sua conta BRAVA+. Você saca quando quiser. Sem precisar de plataforma de e-commerce separada.",
    oQueFaz: [
      "Form pra criar produto + lista abaixo com os já criados.",
      "Cada produto pode estar ATIVO (visível no app) ou PAUSADO (oculto, mas não excluído).",
      "Estoque opcional: se você marcar quantidade, sistema decrementa por venda. Quando chega a zero, oculta automático.",
      "Edição inline — clica no produto, ajusta, salva.",
    ],
    campos: [
      { nome: "Nome do produto/serviço", desc: "o que aparece em destaque no card", obrigatorio: true },
      { nome: "Preço (R$)", desc: "valor cheio em reais. Ex: 35.90", obrigatorio: true },
      { nome: "Descrição", desc: "ajuda o cliente decidir se compra. Ingredientes, tamanho, peso, observações" },
      { nome: "Foto", desc: "1 imagem PNG ou JPG até 5MB. Foto BOA aumenta venda — use foto profissional se puder" },
      { nome: "Estoque", desc: "opcional. Se preencher, sistema controla — se não, considera infinito" },
      { nome: "Categoria interna", desc: "agrupa no catálogo da sua loja (Entradas, Pratos, Sobremesas, etc)" },
    ],
    calculos: [
      "O que VOCÊ recebe = preço − taxa Efí (1% PIX ou 3.5% cartão) − comissão BRAVA+ (varia)",
      "Ex: produto R$ 100 pago via PIX → recebe ~R$ 95 (taxa + comissão).",
    ],
    tourRole: "lojista",
  },
  "loja-cupons": {
    path: "/loja/cupons",
    titulo: "Cupons promocionais",
    resumo:
      "Você cria cupons (% ou R$ off) pra atrair clientes. Cada cupom é direcionado a um TIER (Básico, Premium ou VIP) e tem regras: validade, estoque total, pedido mínimo. Cliente resgata no app, apresenta no caixa (QR), você dá o desconto. Forma mais eficiente de movimentar dia parado.",
    oQueFaz: [
      "Lista cupons ATIVOS + histórico de quem expirou ou esgotou.",
      "Form pra criar cupom novo direto na lista.",
      "Pode configurar % de desconto OU valor fixo em R$.",
      "Validade configurável (dia/mês/ano até quando aceita resgate).",
      "Tier mínimo: ex. 'só Premium e VIP podem ver/resgatar esse cupom' — fideliza quem paga mais.",
    ],
    campos: [
      { nome: "Título do cupom", desc: "ex: '20% off no almoço'. Curto e claro.", obrigatorio: true },
      { nome: "Tipo de desconto", desc: "% (porcentagem) OU R$ (valor fixo abatido do total)", obrigatorio: true },
      { nome: "Valor", desc: "se tipo = %, 10 significa 10% off. Se tipo = R$, 10 significa R$ 10 de abatimento.", obrigatorio: true },
      { nome: "Pedido mínimo (R$)", desc: "opcional, mas RECOMENDADO. Sem isso, cliente pode usar cupom em compra pequena e queimar sua margem." },
      { nome: "Tier mínimo", desc: "Básico = todo mundo vê. Premium = só assinantes médios pra cima. VIP = só os top." },
      { nome: "Quantidade total disponível", desc: "estoque do cupom. Pode ser 10, 50, 100 ou ilimitado." },
      { nome: "Validade (data limite)", desc: "depois dessa data, cupom expira automaticamente.", obrigatorio: true },
    ],
    dicas: [
      "Cupom pra VIP costuma render 3x mais — usuários VIP são engajados e gastam.",
      "Coloque pedido MÍNIMO. Sem isso, um cupom de R$ 10 numa venda de R$ 12 vira prejuízo pra você.",
      "Comece pequeno (10-15% off) e teste — se não converte, sobe pra 20-25%. Não comece com 50% sem necessidade.",
      "Validade curta (3-7 dias) cria URGÊNCIA — converte mais que cupom 'ilimitado de tempo'.",
    ],
    tourRole: "lojista",
  },
  "loja-cupons-detalhe": {
    path: "/loja/cupons/",
    titulo: "Detalhe do cupom",
    resumo:
      "Tudo sobre UM cupom: configuração atual, quantos clientes resgataram, quantos efetivamente usaram, quanto isso te custou em desconto. Aqui você edita, pausa ou desativa o cupom.",
    objetivoRelatorio:
      "Saber se vale a pena MANTER ou AJUSTAR esse cupom. Se está esgotando muito rápido, você pode aumentar a quantidade ou reduzir o desconto. Se ninguém resgata, é sinal de que o desconto está fraco ou o tier escolhido é alto demais.",
    tourRole: "lojista",
  },
  "loja-fidelidade": {
    path: "/loja/fidelidade",
    titulo: "Clube de fidelidade",
    resumo:
      "Você define a regra: 'X visitas = prêmio Y'. Cada vez que você lê a carteirinha BRAVA+ do cliente no scanner, sistema soma +1 pra ele. Quando bate a meta, libera o prêmio (que ele vem buscar). É o cartão fidelidade clássico, automatizado. Cliente NÃO esquece o cartãozinho de papel — porque é digital.",
    visual: <FluxoVisita />,
    campos: [
      { nome: "Nome do clube", desc: "ex: 'Café do Mês' ou 'Programa Fiel'. Aparece pro cliente.", obrigatorio: true },
      { nome: "Quantidade de visitas necessárias", desc: "número de scans pra completar. Comece com 5-10 (curto = motivador).", obrigatorio: true },
      { nome: "Qual é o benefício / prêmio", desc: "ex: 'café expresso grátis', 'sobremesa cortesia', '20% off no próximo pedido'", obrigatorio: true },
      { nome: "Valor estimado do prêmio (R$)", desc: "opcional — usado em BI pra calcular custo do programa por mês" },
    ],
    dicas: [
      "Comece com META BAIXA (5 visitas, no máximo 10). Cliente que vê meta de 30 visitas desiste antes de começar.",
      "Prêmio precisa ser ATRATIVO mas viável pro seu negócio. Café grátis numa cafeteria é ótimo. 'R$ 100 de desconto' é caro pra você.",
      "Conforme tiver mais clientes engajados, vai subindo a meta gradualmente.",
    ],
    tourRole: "lojista",
  },
  "loja-promocoes": {
    path: "/loja/promocoes",
    titulo: "Tipos de promoção aceitos",
    resumo:
      "Selecione quais formatos de benefício sua loja oferece: cupom, fidelidade, vale-presente, vale-compras. Isso afeta os FILTROS do app — quando o cliente filtra 'só lojas com cupom', sua loja só aparece se você marcou aqui que aceita.",
    tourRole: "lojista",
  },
  "loja-qr": {
    path: "/loja/qr-scanner",
    titulo: "Leitor de QR (scanner)",
    resumo:
      "A FERRAMENTA mais usada do dia-a-dia. Câmera do navegador lê a carteirinha BRAVA+ do cliente — registra visita instantaneamente, soma fidelidade, dá coins pro cliente. Use em tablet ou celular, no caixa. Sem instalar nada, sem app de scanner separado.",
    oQueFaz: [
      "Pede permissão pra acessar a câmera (precisa de HTTPS — funciona em qualquer navegador moderno).",
      "Lê o QR + valida que a assinatura do cliente está ATIVA (não permite scan de assinante cancelado).",
      "Registra a visita no banco + atualiza progresso no clube de fidelidade dele.",
      "Se câmera falhar, fallback: campo pra digitar código manual (cliente fala, você digita).",
    ],
    comoUsar: [
      "Cliente chega no caixa, abre a carteirinha BRAVA+.",
      "Você toca 'Iniciar scanner' nessa tela.",
      "Aponta a câmera pro QR — beep de confirmação automático.",
      "Pronto: visita registrada, fidelidade somada, cliente ganha 5 coins.",
    ],
    calculos: [
      "Pro CLIENTE: +1 visita no SEU clube de fidelidade + 5 BRAVA Coins.",
      "Pra VOCÊ: +1 visita no seu contador, ZERO custo. Só leitura.",
    ],
    dicas: [
      "Deixe um tablet/celular fixo no caixa SÓ pra essa tela. Funcionário aprende em 5 minutos.",
      "Treine: SEMPRE pergunte 'tem carteirinha BRAVA+?' antes de fechar a venda. Cliente esquece, você lembra.",
      "Sem internet? Não funciona. Garanta wifi estável no caixa.",
    ],
    tourRole: "lojista",
  },
  "loja-pedidos": {
    path: "/loja/pedidos",
    titulo: "Pedidos",
    resumo:
      "Lista de TUDO que clientes pediram pela sua loja (retirada ou delivery). Aqui você acompanha do recebimento à entrega: aceita, prepara, despacha. Tipo um painel de cozinha — mas digital.",
    oQueFaz: [
      "Lista organizada por status (aguardando, em preparo, pronto, entregue, cancelado).",
      "Filtros úteis: período (hoje, semana, mês), tipo (retirada ou delivery), busca por nome do cliente.",
      "Detalhe do pedido mostra: itens, valor total, cupom aplicado, código de 4 dígitos pra confirmar entrega.",
    ],
    tourRole: "lojista",
  },
  "loja-clientes": {
    path: "/loja/clientes",
    titulo: "Meus clientes (CRM mini)",
    resumo:
      "Ranking dos clientes que mais visitam sua loja. Base ESSENCIAL pra ação direcionada: blast pra quem some, cupom personalizado pra top spender, embaixadores VIP. Sem isso, você não sabe quem é cliente de verdade vs. quem é visitante esporádico.",
    oQueFaz: [
      "Top 50 clientes ordenados por número de visitas.",
      "Pra cada um: ticket médio, data do último check-in, dias inativo (quanto tempo sem voltar).",
      "Botão 'mandar cupom personalizado' direto da linha — abre form simples pra criar e enviar.",
      "Pode marcar cliente como EMBAIXADOR (status especial, ganha cupons VIP em campanhas).",
    ],
    objetivoRelatorio:
      "Identificar 2 grupos pra ação: (1) clientes valiosos que estão sumindo (>30 dias sem vir) — merecem cupom-bomba pra voltar; (2) clientes recorrentes (toda semana) — merecem virar embaixador, ganhar reconhecimento.",
    tourRole: "lojista",
  },
  "loja-vale-presente": {
    path: "/loja/vale-presente",
    titulo: "Vale-presentes da sua loja",
    resumo:
      "Você cria vales (R$ 50, R$ 100, R$ 200) que clientes podem comprar PRA PRESENTEAR alguém. Cliente paga pra você, BRAVA+ entrega o cupom digital pro destinatário. É receita imediata + traz cliente novo (o destinatário) pra sua loja.",
    campos: [
      { nome: "Valor (R$)", desc: "valor cheio do vale. Comum: 50, 100, 200.", obrigatorio: true },
      { nome: "Validade", desc: "quantos dias até expirar (padrão 90)" },
      { nome: "Mensagem opcional", desc: "espaço pra quem presenteia colocar um recado" },
    ],
    tourRole: "lojista",
  },
  "loja-recompensas": {
    path: "/loja/recompensas",
    titulo: "Recompensas resgatadas",
    resumo:
      "Histórico de prêmios de fidelidade que clientes COMPLETARAM e resgataram (vieram buscar). Útil pra confirmar entregas e estimar o CUSTO do seu programa de fidelidade por mês.",
    objetivoRelatorio:
      "Validar que está tudo certo (entregas confirmadas, sem cliente reclamando 'não recebi') E ter noção financeira: se o prêmio é café (custo R$ 5) e teve 20 resgates, custo do mês foi R$ 100. Acima do orçamento? Ajuste a meta de visitas.",
    tourRole: "lojista",
  },
  "loja-roleta": {
    path: "/loja/roleta",
    titulo: "Roleta da sorte",
    resumo:
      "Configure sua própria roleta: lista os prêmios e a probabilidade de cada um sair. Cada cliente que faz check-in na sua loja ganha 1 giro. Forma divertida de engajar e dar surpresa — vale tentar mesmo que o prêmio mais provável seja só 'nada'.",
    campos: [
      { nome: "Lista de prêmios", desc: "ex: 'cupom 30% off', 'brinde físico', 'café grátis', 'nada'", obrigatorio: true },
      { nome: "Peso (probabilidade)", desc: "porcentagem de cada um. SOMA tem que dar 100. Ex: 'nada' = 60%, 'cupom 10%' = 30%, 'cupom 30%' = 10%", obrigatorio: true },
      { nome: "Custo estimado por giro", desc: "média do que cada giro custa pra você (peso × valor). BRAVA+ usa pra BI." },
    ],
    calculos: [
      "Custo médio por giro = soma de (probabilidade de cada prêmio × valor desse prêmio)",
      "Ex: 60% 'nada' (R$ 0) + 30% '10% off' (R$ 3 custo médio) + 10% '30% off' (R$ 10) = R$ 1,90 por giro.",
      "Se a média ficou > 5% do seu ticket médio, considere reduzir prêmios raros.",
    ],
    tourRole: "lojista",
  },
  "loja-blast": {
    path: "/loja/blast",
    titulo: "Promo Blast (chama cliente AGORA)",
    resumo:
      "Sua loja está vazia agora? Dispara cupom flash pros clientes que JÁ VISITARAM nos últimos 90 dias. Vão receber push + email com cupom super agressivo (ex: 30% off válido só nas próximas 3 horas). Conversão alta — base que já te conhece reage rápido a desconto bom.",
    oQueFaz: [
      "Form rápido (1 minuto): % de desconto + validade (2 a 6 horas).",
      "Filtra clientes da SUA base que visitaram nos últimos 90 dias.",
      "Aplica filtro de raio (km) — só envia pra quem está perto AGORA, mais chance de vir.",
      "Dispara push (notificação no celular) + email automaticamente.",
      "Mostra em tempo real: quantos abriram, quantos resgataram, quantos efetivamente vieram.",
    ],
    campos: [
      { nome: "Desconto (%)", desc: "20-50% funciona. Abaixo de 15% gera pouca atração em blast.", obrigatorio: true },
      { nome: "Validade (horas)", desc: "curto = urgência. 2-3h converte mais que 24h." },
      { nome: "Raio (km)", desc: "limita pra quem está perto AGORA — 3-5 km é o padrão" },
    ],
    calculos: [
      "Audiência potencial = clientes que visitaram nos últimos 90 dias E estão no raio configurado",
      "Custo estimado por uso = % desconto × ticket médio da sua loja",
      "Ex: blast 30% off + ticket médio R$ 50 = R$ 15 de custo por uso. Se converter 20 pessoas, custou R$ 300, ROI depende do que cada um pediu.",
    ],
    tourRole: "lojista",
  },
  "loja-hoje": {
    path: "/loja/hoje",
    titulo: "Ao vivo (o que está rolando)",
    resumo:
      "O que está acontecendo na sua loja AGORA, em tempo real: quem fez check-in, pedidos chegando, chats abertos. Tipo o monitor de produção — útil pra dar pulso do dia sem precisar olhar várias telas.",
    tourRole: "lojista",
  },
  "loja-entregas": {
    path: "/loja/entregas",
    titulo: "Entregas em andamento",
    resumo:
      "Pedidos de DELIVERY (não retirada) em curso: aguardando entregador aceitar, retirado, a caminho, entregue. Tipo um monitor logístico — acompanha cada uma sem precisar ligar pro entregador.",
    visual: <FluxoEntrega />,
    tourRole: "lojista",
  },
  "loja-entrega": {
    path: "/loja/entrega",
    titulo: "Configuração de delivery",
    resumo:
      "Aqui você define se sua loja faz delivery, qual o raio de cobertura, taxa de entrega, tempo médio. Configurado uma vez, vale pra TODOS os pedidos. BRAVA+ usa motoboy freelancer da malha — você não tem frota fixa nem CLT.",
    campos: [
      { nome: "Habilitar delivery", desc: "switch geral. Desligado = você só faz retirada." },
      { nome: "Raio máximo (km)", desc: "área que você atende. 3-5 km é padrão; até 8 km pra produtos não-perecíveis.", obrigatorio: true },
      { nome: "Taxa base de entrega (R$)", desc: "valor mínimo cobrado do cliente. Pode ter free acima de X (ex: 'grátis acima de R$ 50')." },
      { nome: "Tempo médio (minutos)", desc: "exibido pro cliente no checkout. Seja realista — atraso constante gera review ruim." },
      { nome: "Pedido mínimo (R$)", desc: "opcional. Bom pra evitar pedido pequeno que não compensa o frete." },
    ],
    calculos: [
      "Frete sugerido = taxa base + (distância em km × R$ 1,50)",
      "Ex: taxa base R$ 6 + 3 km de distância = R$ 6 + R$ 4,50 = R$ 10,50",
      "Motoboy ganha o frete. Você não paga frota fixa — modelo Uber pra delivery.",
    ],
    tourRole: "lojista",
  },
  "loja-entregadores": {
    path: "/loja/entregadores",
    titulo: "Histórico de entregadores",
    resumo:
      "Lista os motoboys que JÁ pegaram pedidos da sua loja. Mostra avaliação média que eles deram pra você, tempo médio de entrega, número de entregas. Útil pra identificar entregadores rápidos (preferência futura) ou reportar quem deu problema.",
    objetivoRelatorio:
      "Identificar entregadores BONS pra pedir prioridade futura — quem entrega rápido e sem problema. E reportar caso de mau serviço pro admin BRAVA+ tomar ação.",
    tourRole: "lojista",
  },
  "loja-entregadores-disp": {
    path: "/loja/entregadores/disponiveis",
    titulo: "Entregadores disponíveis agora",
    resumo:
      "Visão tempo real: quais motoboys estão ONLINE perto da sua loja AGORA. Útil pra estimar quanto tempo um pedido vai esperar antes de ter alguém pra retirar. Se está vazio, talvez seja melhor segurar o pedido alguns minutos.",
    tourRole: "lojista",
  },
  "loja-chat": {
    path: "/loja/chat",
    titulo: "Chat com clientes",
    resumo:
      "Lista de conversas em aberto com assinantes que abriram chat pra falar com sua loja. Tipo WhatsApp profissional, mas dentro do BRAVA+. Cliente pergunta sobre prato, pedido, recomendação — você responde rápido.",
    tourRole: "lojista",
  },
  "loja-chat-detalhe": {
    path: "/loja/chat/",
    titulo: "Conversa com cliente",
    resumo: "Chat em tempo real com um cliente específico. Texto, foto, atalho de ações rápidas. Atendimento mais ágil que zap pessoal.",
    tourRole: "lojista",
  },
  "loja-receita": {
    path: "/loja/receita",
    titulo: "Receita incremental (BRAVA+ trouxe quanto?)",
    resumo:
      "Tela mais importante pra você JUSTIFICAR o investimento BRAVA+ pro sócio/contador. Mostra QUANTO da sua receita do mês veio do BRAVA+ — separado entre clientes NOVOS (que nunca tinham vindo) e RECORRENTES (que já te conheciam). Prova de ROI direto.",
    objetivoRelatorio:
      "Provar que 'sem BRAVA+ esses clientes novos não viriam'. É o argumento mais forte pra justificar a parceria continuar. Use no boardroom, na reunião de sócios, na revisão de orçamento de marketing.",
    calculos: [
      "Receita BRAVA+ total = soma de todos os pedidos do mês que usaram cupom BRAVA+ OU vieram via app.",
      "Receita de NOVOS = pedidos feitos por clientes cuja PRIMEIRA visita à sua loja foi há ≤ 90 dias.",
      "Receita RECORRENTE = total − novos.",
      "Quanto MAIS novos, mais valor BRAVA+ está trazendo de fato.",
    ],
    tourRole: "lojista",
  },
  "loja-contabil": {
    path: "/loja/contabil",
    titulo: "Contábil — exportação financeira",
    resumo:
      "Exporta seu movimento financeiro do BRAVA+ em formato pronto pra contadora: CSV (Excel) ou PDF formal. Tem cada operação detalhada — útil pro fechamento mensal e conciliação bancária.",
    objetivoRelatorio:
      "Sua contadora pega esse CSV todo mês, importa no sistema dela (ContaAzul, Tiny, Bling, o que for), faz conferência. Sem precisar ficar pedindo info no zap.",
    tourRole: "lojista",
  },
  "loja-saques": {
    path: "/loja/saques",
    titulo: "Saques (dinheiro pra sua conta)",
    resumo:
      "Aqui você TIRA o dinheiro acumulado no BRAVA+ pra sua conta bancária. Saldo aparece em destaque. Clica 'sacar', escolhe valor, sistema dispara PIX automático via Efí. Cai em até 1 dia útil. Sem taxa de saque.",
    oQueFaz: [
      "Saldo DISPONÍVEL em destaque no topo.",
      "Histórico de saques (pendente, processado, pago).",
      "Comprovante PIX disponível pra baixar de cada saque feito.",
      "Botão 'Sacar' abre modal pra você escolher o valor.",
    ],
    calculos: [
      "Saldo = soma de pedidos pagos − comissão BRAVA+ − saques anteriores",
      "Taxa de saque: R$ 0 (PIX gratuito até nova ordem).",
      "Não tem valor mínimo de saque — pode sacar R$ 5 se quiser.",
    ],
    tourRole: "lojista",
  },
  "loja-extornos": {
    path: "/loja/extornos",
    titulo: "Estornos solicitados",
    resumo:
      "Quando cliente pede reembolso de pedido (chegou errado, não chegou, etc), você vê aqui pra decidir: APROVAR (devolve o dinheiro pra ele), RECUSAR (com motivo) ou PEDIR MAIS INFO (foto, descrição melhor). Se você não responder em 48h, sistema escala pro admin BRAVA+.",
    tourRole: "lojista",
  },
  "loja-plano": {
    path: "/loja/plano",
    titulo: "Plano lojista BRAVA+",
    resumo:
      "Sua ASSINATURA como lojista (você também paga pra usar o BRAVA+, separado do plano do cliente). 3 níveis: Free (limitado), Pro (libera blast e BI avançado), Premium (libera destaque pago + push ilimitado).",
    calculos: [
      "FREE — R$ 0/mês: 1 cupom ativo, 0 blasts/mês. Bom pra testar.",
      "PRO — R$ 49/mês: cupons ilimitados, 4 blasts/mês, BI avançado (receita incremental, CRM).",
      "PREMIUM — R$ 149/mês: tudo do Pro + SLOT DE DESTAQUE (sua loja no topo da categoria) + push ilimitado.",
    ],
    tourRole: "lojista",
  },
  "loja-onboarding": {
    path: "/loja/onboarding",
    titulo: "Onboarding do lojista (wizard)",
    resumo:
      "Wizard de 5 passos pra começar com tudo já configurado e sair vendendo: (1) perfil, (2) catálogo, (3) cupom inicial de boas-vindas, (4) fidelidade básica, (5) publicar. Termine no primeiro dia.",
    tourRole: "lojista",
  },
  "loja-mais": {
    path: "/loja/mais",
    titulo: "Menu completo",
    resumo: "Atalho mobile pras áreas que não cabem na bottom nav. Quando você não acha algo, vem aqui.",
    tourRole: "lojista",
  },

  /* ==================================================================
     ENTREGADOR — /entregador/*
     ================================================================== */
  "entregador-home": {
    path: "/entregador",
    titulo: "Painel do entregador",
    resumo:
      "É a SUA central como motoboy freelancer da malha BRAVA+. Quando você está ONLINE, recebe ofertas de entrega perto de você. Aceita o que faz sentido (preço e distância OK), ganha por entrega, sem CLT, sem meta forçada, seu horário.",
    visual: <FluxoEntrega />,
    oQueFaz: [
      "Toggle ONLINE/OFFLINE no topo. Verde = recebendo oferta. Vermelho = você está descansando.",
      "KPIs do dia: pedidos feitos, ganhos acumulados, sua avaliação média (estrelas dos clientes/lojas).",
      "Lista de ofertas disponíveis perto de você (com pequeno mapa).",
      "Cada oferta mostra: loja origem, endereço destino, distância total, ganho previsto. Você aceita ou rejeita em 1 toque.",
      "Aceitou? Pega 1 entrega por vez (não pega 2 simultâneas a menos que sejam na mesma rota).",
    ],
    calculos: [
      "Ganho por entrega = TAXA BASE (R$ 6) + (distância em km × R$ 1,50)",
      "Ex: entrega de 4 km = R$ 6 + R$ 6 = R$ 12.",
      "Em horário/região de pico (almoço, jantar, chuva) tem BÔNUS de 2x (R$ 24 a entrega de 4 km).",
      "Pago direto pra sua conta via PIX, todo dia ou toda semana (você escolhe).",
    ],
    tourRole: "entregador",
  },
  "entregador-pendente": {
    path: "/entregador/pendente",
    titulo: "Cadastro em análise",
    resumo:
      "Se você ACABOU de se cadastrar, está nessa tela. O admin BRAVA+ tem até 24h úteis pra analisar seu CNH, comprovante de MEI, foto da moto, etc. Enquanto não aprovar, você não pode ficar online nem receber ofertas.",
    oQueFaz: [
      "Mostra o status atual: em análise, aprovado, recusado.",
      "Lista dos documentos que você ENVIOU — pra você conferir se está tudo certo.",
      "Se algum doc voltou pendente (foto borrada, vencido), tem botão pra REENVIAR.",
    ],
    tourRole: "entregador",
  },
  "entregador-detalhe": {
    path: "/entregador/",
    titulo: "Detalhe da entrega aceita",
    resumo:
      "Tudo sobre UMA entrega que você está fazendo: dados da loja (com WhatsApp), endereço do cliente, mapa com rota otimizada, código de 4 dígitos que o cliente vai te falar pra confirmar a entrega.",
    oQueFaz: [
      "Card da loja com endereço de RETIRADA + botão pra abrir WhatsApp dela direto.",
      "Card do cliente com endereço de DESTINO + complemento (interfone, ponto de referência).",
      "Mapa Mapbox com rota traçada (mais rápida considerando trânsito médio).",
      "Status: aceita → retirei → a caminho → entregue. Você atualiza tocando em botões à medida que avança.",
      "CÓDIGO 4 DÍGITOS bem destacado no final — cliente vai te dizer isso na hora que receber. Digite, pedido fecha, pagamento libera.",
    ],
    comoUsar: [
      "Chegou na loja pra retirar? Toque 'cheguei pra retirada' (avisa o lojista).",
      "Pegou o pedido? Toque 'retirei'.",
      "Saiu pra entregar? Toque 'a caminho'. Cliente passa a ver você se movendo no mapa em tempo real.",
      "Chegou no cliente? Peça o CÓDIGO DE 4 DÍGITOS. Digite. Sistema confirma entrega + libera seu pagamento.",
    ],
    dicas: [
      "Código errado = pedido NÃO fecha. Confirme com cliente, evite digitar adivinhação.",
      "Cliente sumiu / não atende? Abra o chat na própria tela do pedido — registra que você tentou.",
      "Em emergência (acidente, atropelamento, problema sério), suporte BRAVA+ no header.",
    ],
    tourRole: "entregador",
  },
  "entregador-rota": {
    path: "/entregador/rota",
    titulo: "Otimizador de rota",
    resumo:
      "Quando você tiver 2 ou mais entregas aceitas ao mesmo tempo (só rola se forem na mesma região, naturalmente), o sistema sugere a MELHOR ORDEM pra você ir — começando pela mais perto, terminando na mais longe da loja. Você pode aceitar a sugestão ou reordenar manual.",
    calculos: [
      "Algoritmo: 'vizinho mais próximo' a partir da sua posição atual + janela de tempo de entrega.",
      "Considera trânsito MÉDIO do horário (não tempo real ainda — versão futura).",
    ],
    tourRole: "entregador",
  },

  /* ==================================================================
     COMERCIAL — /comercial/*
     ================================================================== */
  "comercial-home": {
    path: "/comercial",
    titulo: "Dashboard do comercial",
    resumo:
      "É a sua 'central de operações' como representante. Tudo que importa pra você está aqui em 1 tela: comissão estimada do mês, pipeline (quantos prospects em cada etapa), próximas ações agendadas, últimos cadastros que fechou, sua tabela de comissão.",
    oQueFaz: [
      "4 KPIs do mês: estabs cadastrados, assinantes cadastrados, comissão estab estimada (R$), comissão sub estimada (R$).",
      "Pipeline visual com contagem de prospects em cada coluna do funil + taxa de conversão.",
      "Lista de próximas ações (com data e descrição) — vem direto dos prospects que você configurou no CRM.",
      "Últimos 5 estabs e últimos 5 assinantes que viraram cliente sob seu código.",
      "Resumo da sua tabela de comissão (configurada pelo admin) — atalho pra você lembrar como ganha.",
    ],
    dicas: [
      "Abra essa tela TODA MANHÃ. 30 segundos pra ver o pulso da sua operação.",
      "Comissão é ESTIMADA — ela só é processada e cai no PIX quando o admin fechar o payout do mês.",
    ],
    tourRole: "comercial",
  },
  "comercial-agenda": {
    path: "/comercial/agenda",
    titulo: "Agenda do dia",
    resumo:
      "Lista organizada de TUDO que você marcou pra fazer (vem das 'próximas ações' que você configurou em cada card do CRM). Dividida em: ⚠️ atrasadas, 📍 hoje, 📅 próximos 7 dias, 🗓️ futuro.",
    oQueFaz: [
      "Atrasadas em vermelho — priorize essas antes de qualquer coisa.",
      "Tarefas de hoje em amarelo — foco do dia.",
      "Cada item mostra: nome do prospect, descrição da ação, telefone (clica e liga), horário.",
      "Atalho pra abrir o prospect no CRM e atualizar.",
    ],
    dicas: [
      "Atrasada acumulada = sinal de prospect esquecido. Atualize a próxima ação (mesmo que seja 'descartar') pra limpar a lista.",
      "Se você nunca tem nada atrasado, talvez esteja agendando datas de mais. Aceleração leve às vezes ajuda.",
    ],
    tourRole: "comercial",
  },
  "comercial-prospects": {
    path: "/comercial/prospects",
    titulo: "Mapa de prospects (Google Places)",
    resumo:
      "Sua ferramenta de DESCOBERTA. Em vez de adivinhar onde tem oportunidade, você digita um endereço/bairro, escolhe categoria, define raio (500m-5km) e vê todos os estabelecimentos reais daquela área como pinos no mapa. Pinos amarelos = nunca contactados (oportunidade). Pinos azuis = já no seu CRM.",
    oQueFaz: [
      "Busca por endereço usando Google Geocoding (centraliza o mapa).",
      "Busca por categoria + raio usando Google Places Nearby (lista lojas reais).",
      "Click num pino amarelo abre popup com info da loja + botão 'Adicionar ao CRM'.",
      "Click num pino azul (já é seu) abre atalho pra ver o card no CRM.",
      "Cada add é instantâneo — vai pro CRM como 'Novo' e pode trabalhar daí.",
    ],
    comoUsar: [
      "Digite o bairro/endereço onde você vai trabalhar (ex: 'Vila Madalena, SP').",
      "Clique 'Buscar endereço' — mapa se centraliza ali.",
      "Escolha categoria (Restaurantes, Cafés, Beleza, etc) e raio (1.5 km é o padrão).",
      "Clique 'Buscar lojas' — pinos amarelos aparecem.",
      "Clique no pino que te interessar → 'Adicionar ao meu CRM'. Pronto.",
    ],
    dicas: [
      "Raio 1.5 km dá 50-200 resultados em centros urbanos — suficiente pra prospecção do dia.",
      "Use categorias específicas em vez de 'qualquer' — Google retorna resultados mais relevantes.",
      "Foco em pinos amarelos com nota Google alta (4.0+) — são lojas estabelecidas, mais propensas a aderir.",
    ],
    tourRole: "comercial",
  },
  "comercial-crm": {
    path: "/comercial/crm",
    titulo: "CRM (Kanban de prospects)",
    resumo:
      "Seu funil pessoal de prospecção em formato kanban (igual Trello). Cada prospect vira um card. Você ARRASTA o card entre 7 colunas: Novo → Contato → Visita → Proposta → Negociação → Fechado / Perdido. Disciplina diária aqui = comissão garantida.",
    oQueFaz: [
      "7 colunas representando o funil de venda.",
      "Arraste e solte cards entre colunas pra mudar status — sem clicar em form.",
      "Cada card mostra: nome, endereço, próxima ação agendada, indicador se é Lojista ou Assinante.",
      "Expand do card revela: contato (telefone clicável, email), notas, ticket estimado, atalhos.",
      "Atalhos: cadastrar lojista (quando bate 'Fechado'), gerar link, excluir.",
    ],
    comoUsar: [
      "Adicione prospects pelo Mapa (Google Places) OU manual (botão '+ Cadastro manual').",
      "Comece todos em NOVO. Conforme avança, arraste.",
      "Quando bater FECHADO, clique no botão 'Cadastrar lojista' / 'Cadastrar assinante' pra concluir.",
      "Use 'próxima ação' (data + descrição) — vira sua agenda automaticamente.",
    ],
    dicas: [
      "Prospect parado na mesma coluna > 7 dias = ou avança ou perde. Decida.",
      "Sempre adicione próxima ação ao mover card — vira lembrete na sua agenda.",
      "Tickets estimados ajudam a priorizar — qual prospect tem mais potencial?",
    ],
    tourRole: "comercial",
  },
  "comercial-crm-novo": {
    path: "/comercial/crm/novo",
    titulo: "Cadastro manual de prospect",
    resumo:
      "Pra leads que vieram off-line (rua, indicação, evento). Preenche dados básicos e adiciona ao CRM como 'Novo'. Útil quando você não tem como achar no Google Places (loja recente, indicação de amigo).",
    campos: [
      { nome: "Tipo", desc: "estabelecimento OU pessoa física (subscriber)", obrigatorio: true },
      { nome: "Nome", desc: "razão social da loja OU nome da pessoa", obrigatorio: true },
      { nome: "Nome do contato", desc: "responsável que você fala (gerente, dono, etc)" },
      { nome: "Telefone / WhatsApp", desc: "principal canal de contato — vira clicável no card" },
      { nome: "Email", desc: "opcional, útil pra mandar link de cadastro" },
      { nome: "CNPJ", desc: "se for estab — facilita cadastro depois" },
      { nome: "Endereço, Cidade, UF", desc: "ajuda a organizar por território" },
      { nome: "Categoria", desc: "ajuda em filtros e relatórios" },
      { nome: "Ticket estimado (R$)", desc: "quanto você acha que essa loja fatura/mês — orienta priorização" },
      { nome: "Próxima ação + descrição", desc: "data e o que vai fazer (ex: 'Ligar pra agendar visita'). Vira tarefa na agenda." },
    ],
    tourRole: "comercial",
  },
  "comercial-cadastros": {
    path: "/comercial/cadastros",
    titulo: "Cadastros assistidos",
    resumo:
      "Hub das 3 formas de transformar prospect em cliente: (1) cadastrar lojista direto, (2) cadastrar assinante direto, (3) gerar link pra ele mesmo se cadastrar. Use o que faz mais sentido pro momento.",
    oQueFaz: [
      "Atalho 1 — Cadastrar lojista: form rápido, cria conta + estab vinculado a você.",
      "Atalho 2 — Cadastrar assinante: form, cria conta com trial de 7 dias.",
      "Atalho 3 — Link de convite: gera URL única pra mandar pro prospect.",
    ],
    dicas: [
      "Visita presencial onde o cliente está olhando no celular? Cadastro DIRETO (atalho 1 ou 2). Mais rápido.",
      "Cliente vai pensar e te responder amanhã? LINK (atalho 3). Tracking automático te avisa quando ele aceitar.",
    ],
    tourRole: "comercial",
  },
  "comercial-cadastros-estab": {
    path: "/comercial/cadastros/estabelecimento",
    titulo: "Cadastrar lojista (no nome dele, sob você)",
    resumo:
      "Você preenche os dados básicos do dono + da loja. Sistema cria a conta auth, vincula o estab ao seu código (já gera affiliate_referral). Loja entra em status PENDENTE — admin precisa aprovar antes de aparecer pro público. Dono recebe a senha provisória por email.",
    campos: [
      { nome: "Nome completo do dono", desc: "como será exibido no painel da loja", obrigatorio: true },
      { nome: "Email (login)", desc: "vira o login dele no /entrar. Será enviado email de confirmação.", obrigatorio: true },
      { nome: "Telefone", desc: "WhatsApp do dono, fica no perfil dele" },
      { nome: "Senha provisória", desc: "se deixar vazio, sistema gera aleatória. Dono troca no 1º login." },
      { nome: "Nome da loja", desc: "exato como vai aparecer pro cliente", obrigatorio: true },
      { nome: "Categoria", desc: "principal — afeta filtros do app" },
      { nome: "Cidade e UF", desc: "obrigatórios pra busca por proximidade funcionar", obrigatorio: true },
    ],
    dicas: [
      "Anote a senha provisória pra entregar pro lojista (ele troca no primeiro acesso).",
      "Avise ele que a loja entra em status PENDENTE — admin aprova em até 24h.",
      "Cadastro vinculado a você = comissão automática conforme sua tabela.",
    ],
    tourRole: "comercial",
  },
  "comercial-cadastros-user": {
    path: "/comercial/cadastros/usuario",
    titulo: "Cadastrar assinante (no nome dele, sob você)",
    resumo:
      "Cria conta de assinante já com trial de 7 dias do tier escolhido (Básico, Premium ou VIP). Quando o trial expirar, sistema cobra automaticamente (PIX/cartão configurado no app pela pessoa). Vínculo com você é permanente — você ganha comissão sobre as mensalidades enquanto durar a regra que admin configurou.",
    campos: [
      { nome: "Nome completo", desc: "como aparece em cupons e tickets", obrigatorio: true },
      { nome: "Email (login)", desc: "login no app", obrigatorio: true },
      { nome: "Telefone", desc: "opcional, mas útil pra SMS de segurança" },
      { nome: "Senha provisória", desc: "se vazio, gera aleatório" },
      { nome: "Tier inicial", desc: "Básico (R$ 19,90), Premium (R$ 39,90) ou VIP (R$ 79,90)", obrigatorio: true },
    ],
    dicas: [
      "Tier alto = comissão maior pra você (se for %), mas também é venda mais difícil. Avalie qual fechar.",
      "Trial de 7 dias dá tempo pro cliente experimentar. Acompanhe — se ele não ativa pagamento, cancela na hora.",
    ],
    tourRole: "comercial",
  },
  "comercial-links": {
    path: "/comercial/links",
    titulo: "Links de convite",
    resumo:
      "Gere links únicos pra mandar pro prospect — quando ele cadastra, conta cai no seu nome AUTOMATICAMENTE. Há 2 tipos: links PERMANENTES (com seu código COM-XXXX, válidos pra sempre, ideais pra divulgação geral) e links COM TRACKING (com label, expiração, opcionalmente atrelados a um prospect específico — útil pra acompanhar campanha).",
    oQueFaz: [
      "Mostra 2 links permanentes (um pra lojista, um pra assinante) que você pode usar pra sempre.",
      "Form pra criar links com tracking: label, tipo (estab/sub), expiração (7-90 dias).",
      "Lista todos seus links com counters de cliques e signups.",
      "Botão 'Copiar URL' + 'WhatsApp' (abre conversa com texto pronto) em cada link.",
    ],
    comoUsar: [
      "Pra divulgação geral (postar em rede social, mandar pra muitos): use os PERMANENTES.",
      "Pra prospect específico ou campanha: crie link com TRACKING pra saber se converteu.",
      "Mande no WhatsApp pelo botão verde (já vem com texto explicativo).",
    ],
    dicas: [
      "Link permanente nunca expira — use pra signature de email, perfil de Insta, etc.",
      "Link com tracking permite saber QUAL canal está funcionando (label = 'Insta Set/26' vs 'Email base').",
      "Pode atrelar link a um prospect (vai pra ele preencher seus dados, conta cai no nome).",
    ],
    tourRole: "comercial",
  },
  "comercial-comissoes": {
    path: "/comercial/comissoes",
    titulo: "Minhas comissões",
    resumo:
      "Tela financeira completa. Histórico de tudo que você JÁ recebeu (payouts processados pelo admin) + projeção do que vai cair esse mês (estimado em tempo real). Lista detalhada de cada estab e cada sub que gera comissão pra você, com a data de fim do vínculo (depois disso para de comissionar).",
    oQueFaz: [
      "4 KPIs no topo: total já pago, comissão mês estab, comissão mês sub, total mês estimado.",
      "Tabela 'histórico de pagamentos' — payouts mensais que o admin processou.",
      "Tabela 'estabelecimentos vinculados' — cada loja sob seu código + receita acumulada + data fim comissão.",
      "Tabela 'assinantes vinculados' — cada pessoa, tier atual, fim comissão.",
    ],
    objetivoRelatorio:
      "Saber EXATAMENTE quanto você ganhou e quanto vai ganhar. Validar se admin processou o payout do mês. Pegar discrepância antes de virar problema (sub que sumiu, estab que está faturando mas comissão não aparece).",
    calculos: [
      "Comissão estab (% mês) = receita do estab no mês × sua % configurada",
      "Comissão sub (% mês) = mensalidade × sua % pro tier dele",
      "Comissão estab (fixo) = R$ que admin definiu × estabs cadastrados no mês",
      "Comissão sub (fixo) = R$ definido por tier × subs cadastrados no mês",
      "Pagamento: o admin processa pelo menos mensalmente; PIX cai na chave do seu Perfil",
    ],
    tourRole: "comercial",
  },
  "comercial-relatorios": {
    path: "/comercial/relatorios",
    titulo: "Relatórios e sugestões",
    resumo:
      "Sua performance ao longo do tempo + sugestões automáticas de o que fazer pra melhorar. Funil de conversão (qual a sua taxa de fechamento), gráfico mensal dos últimos 6 meses (você está crescendo ou estagnado?), alertas baseados no seu padrão atual.",
    oQueFaz: [
      "Bloco 'Sugestões pra esta semana' — heurísticas em tempo real. Ex: 'Você tem 12 prospects parados em Novo. Comece a contatar.'",
      "Funil de conversão: total no funil, em andamento, fechado, taxa %.",
      "Gráfico mensal: barras amarelas (estabs) e azuis (subs) dos últimos 6 meses.",
    ],
    objetivoRelatorio:
      "Saber se você está PROGREDINDO. Comparar mês atual com anteriores. Identificar se algum mês você caiu (e por quê). Sugestões te empurram pra ação concreta.",
    tourRole: "comercial",
  },
  "comercial-perfil": {
    path: "/comercial/perfil",
    titulo: "Meu perfil + PIX",
    resumo:
      "Seus dados como comercial + chave PIX (CRÍTICO — sem ela, o payout fica retido). Mostra também sua tabela de comissão completa (só pra você ver — quem altera é o admin).",
    oQueFaz: [
      "Identidade: nome, email, telefone, código COM-XXXX, território, status (ativo/inativo).",
      "Chave PIX em destaque (ou alerta se não configurou).",
      "Tabela de comissão em formato fácil de ler (% ou R$, por tipo, por tier).",
    ],
    dicas: [
      "PIX errado = você não recebe. Cheque pelo menos uma vez.",
      "Pra mudar nome/email/senha ou pra alterar comissão, fale com o admin (não é editável aqui).",
    ],
    tourRole: "comercial",
  },

  /* ==================================================================
     ADMIN — /admin/*
     ================================================================== */
  "admin-home": {
    path: "/admin",
    titulo: "Dashboard Admin — saúde do negócio",
    resumo:
      "Sua 'cabine de comando' pra ter saúde do BRAVA+ em 30 segundos. KPIs principais no topo (users, MRR, pedidos), gráficos abaixo. Abra todo dia de manhã — algo fora da curva? Vai direto pra área específica.",
    oQueFaz: [
      "4 KPIs no topo: total de users, estabelecimentos ATIVOS, MRR (faturamento mensal recorrente), pedidos do mês.",
      "4 charts: signups dos últimos 14 dias (curva de aquisição), distribuição de tier (Básico/Premium/VIP), estabelecimentos por categoria, top cupons mais usados.",
      "Acesso rápido pras áreas críticas (decisões pendentes, saques, denúncias).",
    ],
    objetivoRelatorio:
      "Saúde do negócio em 30 segundos. Use de manhã pra ver se o dia anterior teve algo fora do padrão. Curva de signups caiu? Algo no funil de aquisição quebrou. MRR estagnado? Tier upgrade não está acontecendo. Use como semáforo geral.",
    tourRole: "admin",
  },
  "admin-bi": {
    path: "/admin/bi",
    titulo: "BI avançado — análises profundas",
    resumo:
      "Análises que demandam mais tempo de leitura: cohort de retenção (quantos usuários ainda ativos N meses depois de assinar), LTV por tier (quanto cada cliente vale na vida toda), funil de assinatura (onde gente desiste), mapa de calor de check-ins. Use pra decidir estratégia, não pra operacional.",
    objetivoRelatorio:
      "Decisões estratégicas: onde concentrar marketing (cidade que tem mais LTV), qual cohort tem melhor retenção (replicar acquisition), onde abrir parceiros novos (regiões com demanda mas pouca oferta). Não é tela de fazer ação imediata.",
    calculos: [
      "LTV = ticket médio × frequência de visita × lifetime estimado (tempo médio que cliente fica ativo)",
      "Churn mensal = users que ficaram inativos por 30+ dias / total de assinantes ativos no início do mês",
      "CAC = gastos totais com marketing / novos assinantes pagos no mesmo período",
      "Indicador saudável: LTV > 3 × CAC (cliente vale 3x o que custou pra adquirir).",
    ],
    tourRole: "admin",
  },
  "admin-usuarios": {
    path: "/admin/usuarios",
    titulo: "Usuários (todos)",
    resumo:
      "Lista TODOS os usuários do sistema (assinantes, lojistas, entregadores, admins) com filtros poderosos. Aqui é onde suporte resolve problema pontual: achar um user pelo email, ver o que aconteceu, agir.",
    oQueFaz: [
      "Tabela paginada (50/página, navegação com setas).",
      "Filtros: role (subscriber, establishment, deliverer, admin), tier (se subscriber), status (ativo/cancelado/banido).",
      "Busca textual por nome OU email — encontra rápido.",
      "Click numa linha → abre o 360 completo do user (próxima tela).",
    ],
    tourRole: "admin",
  },
  "admin-usuarios-detalhe": {
    path: "/admin/usuarios/",
    titulo: "360 do usuário",
    resumo:
      "Tudo sobre UM usuário num lugar só: assinatura ativa, histórico de pedidos, visitas registradas, coins acumulados, pagamentos, dispositivos usados, logs de auditoria. Tela de SUPORTE intensivo.",
    oQueFaz: [
      "Bloco com identidade + tier + status.",
      "Cards com KPIs: total de visitas, pedidos, coins, indicações que ele fez.",
      "Timeline cronológica de atividade (toda ação importante registrada).",
      "Ações disponíveis: trocar tier manualmente, cancelar assinatura, fazer reembolso, banir/desbanir, IMPERSONAR (logar como ele pra debugar — cuidado!).",
    ],
    tourRole: "admin",
  },
  "admin-usuarios-novo": {
    path: "/admin/usuarios/novo",
    titulo: "Cadastrar usuário manualmente",
    resumo:
      "Pra criar conta de canal offline (lead que veio por telefone, evento, conta interna do time BRAVA+). Use SÓ quando não der pro user se cadastrar sozinho — autoatendimento é melhor.",
    campos: [
      { nome: "Email", desc: "vira o login da pessoa", obrigatorio: true },
      { nome: "Nome completo", desc: "como ela vai aparecer no sistema", obrigatorio: true },
      { nome: "Role (papel)", desc: "subscriber, establishment, deliverer ou admin", obrigatorio: true },
      { nome: "Tier inicial (se subscriber)", desc: "Básico, Premium ou VIP" },
      { nome: "Senha provisória", desc: "user troca no 1º login (sistema força)" },
    ],
    tourRole: "admin",
  },
  "admin-estabelecimentos": {
    path: "/admin/estabelecimentos",
    titulo: "Estabelecimentos (todos)",
    resumo:
      "Lista todos os parceiros — filtros por categoria, status, busca. Aqui você aprova cadastros novos (essencial: lead que cadastrou e está esperando pra começar), bloqueia quem deu problema, edita info, vê 360 de cada um.",
    oQueFaz: [
      "Tabela com nome, cidade, categoria, status (ativo / pendente / bloqueado), dono.",
      "Filtro 'pendentes' é o mais importante — cadastros novos esperando aprovação.",
      "Ações por linha: aprovar onboarding, bloquear, editar, ver 360 completo.",
    ],
    tourRole: "admin",
  },
  "admin-estabelecimento-detalhe": {
    path: "/admin/estabelecimentos/",
    titulo: "360 do estabelecimento",
    resumo:
      "Visão completa de UM parceiro: dados de cadastro, catálogo, cupons ativos, programa de fidelidade, histórico de pedidos, faturamento, equipe. Use pra dar suporte ou tomar decisão (manter, bloquear, escalar).",
    tourRole: "admin",
  },
  "admin-estabelecimento-novo": {
    path: "/admin/estabelecimentos/novo",
    titulo: "Cadastrar estabelecimento manualmente",
    resumo:
      "Cadastro manual de loja, útil quando lead veio offline (telefone, evento, indicação). Use cadastro do lojista (/cadastro-estabelecimento) sempre que possível — gera menos trabalho pro time.",
    campos: [
      { nome: "Razão social + CNPJ", desc: "auto-busca dados na Receita Federal (ReceitaWS)", obrigatorio: true },
      { nome: "Email do dono", desc: "cria conta + dispara email de convite com link de acesso", obrigatorio: true },
      { nome: "Categoria principal", desc: "afeta filtros do app — escolha CERTO", obrigatorio: true },
      { nome: "Endereço completo", desc: "auto-preenche via CEP (ViaCEP) + número/complemento manual", obrigatorio: true },
    ],
    tourRole: "admin",
  },
  "admin-estabelecimento-operacao": {
    path: "/admin/estabelecimentos/",
    titulo: "Operação do estabelecimento (SLA)",
    resumo:
      "KPIs operacionais de UM parceiro: tempo médio pra aceitar pedido, número de atrasos, número de cancelamentos, NPS de clientes (qual a nota média que clientes deram pra ele). Use pra identificar lojista com problema operacional ANTES dele churnar ou gerar enxurrada de reclamação.",
    objetivoRelatorio:
      "Identificar lojista QUE ESTÁ INDO PRA CHURN — muita reclamação, NPS caindo, cancelamentos subindo. Agir cedo (ligar, oferecer suporte, treinamento) é mais barato do que perder + adquirir um novo.",
    tourRole: "admin",
  },
  "admin-entregadores": {
    path: "/admin/entregadores",
    titulo: "Entregadores",
    resumo:
      "Gestão da MALHA de motoboys: aprovar cadastros novos (valida CNH, MEI, foto da moto), bloquear quem deu problema (avaliação baixa, fraude), ver avaliação média, histórico de entregas.",
    oQueFaz: [
      "Filtros: status (em análise / aprovado / bloqueado), online/offline agora.",
      "Botão 'APROVAR' libera entregas pra esse motoboy.",
      "Click no entregador abre 360 com documentos enviados + histórico de entregas + estrelas que recebeu.",
    ],
    tourRole: "admin",
  },
  "admin-entregas": {
    path: "/admin/entregas",
    titulo: "Entregas (monitor operacional)",
    resumo:
      "Monitor em tempo real de TODAS as entregas em andamento no sistema. Aqui você identifica entregas paradas (motoboy sumiu, problema na loja, cliente não atende) e intervém antes de virar reclamação.",
    objetivoRelatorio:
      "Manter o SLA operacional: meta é entrega completa em até 40 min em horário normal. Se vê uma entrega parada há 30 min, intervenha (chat com motoboy, escala outro, fala com a loja). NPS de delivery é o que mais afeta retenção.",
    tourRole: "admin",
  },
  "admin-assinaturas": {
    path: "/admin/assinaturas",
    titulo: "Assinaturas",
    resumo:
      "Todas as assinaturas (ativas, canceladas, em trial) com filtro por tier e status. Aqui você acompanha o pulso da base: quem está pagando, quem cancelou recentemente (e por quê), quem está em trial pra converter.",
    objetivoRelatorio:
      "Acompanhar MRR + churn em tempo real. Quem cancelou esse mês? Padrão (mesma cidade, mesmo dia da semana, mesma reclamação) = problema sistêmico, agir. Cancelamentos pulverizados = aceitável.",
    calculos: [
      "MRR (Monthly Recurring Revenue) = soma dos preços de TODAS as assinaturas ativas no mês",
      "Churn mensal = assinaturas canceladas no mês / total ativas no início do mês",
      "Indicador saudável: churn < 5%/mês.",
    ],
    tourRole: "admin",
  },
  "admin-planos": {
    path: "/admin/planos",
    titulo: "Configurar planos (tiers)",
    resumo:
      "Edita preço e benefícios dos 3 tiers (Básico, Premium, VIP). Mudança aqui afeta SÓ NOVAS assinaturas — quem já estava assinando antes mantém o preço congelado por tempo indeterminado (proteção contratual).",
    campos: [
      { nome: "Nome do tier", desc: "ex: Premium. Aparece em todo lugar do app.", obrigatorio: true },
      { nome: "Preço mensal (R$)", desc: "valor cobrado via Efí mensalmente", obrigatorio: true },
      { nome: "Lista de benefícios", desc: "bullets exibidos na tela /assinar pra cliente decidir" },
      { nome: "Multiplicador de cashback", desc: "padrão 1.0. VIP normalmente 2.0 (cashback dobrado)" },
    ],
    dicas: [
      "Mudar preço SÓ AFETA novas assinaturas. Não há mecanismo automático de migração — quem está no plano antigo mantém o preço antigo (boa prática contratual).",
      "Pra mover gente pra preço novo, precisa fazer migração manual + comunicação ativa.",
    ],
    tourRole: "admin",
  },
  "admin-cupons": {
    path: "/admin/cupons",
    titulo: "Cupons (visão sistêmica)",
    resumo:
      "Visão de TODOS os cupons criados por todos os lojistas, ordenados por uso. Identifica padrões: quais cupons performam melhor (modelo pra replicar/sugerir pra outros lojistas), quais estão sendo abusados (uso anômalo).",
    objetivoRelatorio:
      "Identificar cupons CAMPEÕES pra inspirar outros lojistas ('lojistas tipo seu costumam fazer 25% off + pedido mínimo R$ 40 com taxa de conversão de X'). E pegar abuso (uso anômalo, mesmo cupom usado 50x num dia) cedo.",
    tourRole: "admin",
  },
  "admin-categorias": {
    path: "/admin/categorias",
    titulo: "Categorias",
    resumo:
      "Gerencia as categorias usadas pelos estabelecimentos (Restaurantes, Cafés, Beleza, Pets, etc). Adicionar nova categoria = afeta filtros do app inteiro. Reordenar = muda ordem de exibição nas chips da home.",
    campos: [
      { nome: "Nome", desc: "ex: 'Restaurantes'. Aparece nas chips do app.", obrigatorio: true },
      { nome: "Slug (URL-friendly)", desc: "ex: 'restaurantes'. Não use acento nem espaço.", obrigatorio: true },
      { nome: "Ícone (emoji)", desc: "exibido nas chips. Use 1 emoji que represente bem (ex: 🍔 pra Restaurantes)" },
      { nome: "Ordem de exibição", desc: "número. Menor = aparece primeiro nas chips." },
      { nome: "Ativa", desc: "toggle. Permite ocultar uma categoria sem deletar." },
    ],
    tourRole: "admin",
  },
  "admin-saques": {
    path: "/admin/saques",
    titulo: "Saques (lojistas + entregadores)",
    resumo:
      "Lojistas e entregadores solicitam saque do saldo deles. Aqui você APROVA (sistema dispara PIX via Efí na hora) ou recusa. SLA crítico: meta é aprovar em até 24h. Atraso = ticket de reclamação aberto.",
    oQueFaz: [
      "Lista PENDENTES em destaque no topo (precisa ação).",
      "Histórico de saques aprovados com comprovante PIX (download).",
      "Botão 'Aprovar e pagar' executa transferência Efí direto, sem etapa extra.",
    ],
    objetivoRelatorio:
      "SLA financeiro: até 1 dia útil é a meta. Se você vê pendentes >24h, há gargalo de aprovação (alguém esqueceu) ou problema com Efí (verifique status da integração).",
    tourRole: "admin",
  },
  "admin-extornos": {
    path: "/admin/extornos",
    titulo: "Estornos (admin)",
    resumo:
      "Reembolsos que ESCALARAM pra você: lojista recusou e cliente reclamou, ou caso complexo que exige decisão centralizada. Você analisa e decide manter ou reverter.",
    tourRole: "admin",
  },
  "admin-suporte": {
    path: "/admin/suporte",
    titulo: "Suporte (tickets abertos)",
    resumo: "Fila de tickets abertos por users / lojistas / entregadores pro time de suporte. Respondam em ordem de prioridade.",
    tourRole: "admin",
  },
  "admin-denuncias": {
    path: "/admin/denuncias",
    titulo: "Denúncias",
    resumo:
      "Denúncias de comportamento abusivo, fraude, conteúdo impróprio (foto inadequada, descrição ofensiva). Modera e toma ação: avisar, suspender, banir.",
    tourRole: "admin",
  },
  "admin-fraude": {
    path: "/admin/fraude",
    titulo: "Antifraude (alertas automáticos)",
    resumo:
      "Sistema detecta padrões SUSPEITOS automaticamente: mesmo user logando de múltiplos IPs simultâneos, uso anômalo de cupom (50x num dia), indicações em loop (mesma pessoa indicando contas falsas). Cada alerta tem severidade — você decide se é falso positivo ou age.",
    oQueFaz: [
      "Lista alertas por severidade (alta primeiro).",
      "Cada alerta mostra: qual regra acionou + evidência (logs, padrão, dados).",
      "Ações: bloquear user, reverter cupom usado, marcar como ISENÇÃO (falso positivo — treina a regra a não pegar de novo).",
    ],
    objetivoRelatorio:
      "Proteger margem: cupom abusado = prejuízo DIRETO pro lojista (e dele depende sua receita). Detectar cedo evita escalada. Caso de fraude organizada (rede de contas falsas) detectado e bloqueado salva milhares de reais.",
    tourRole: "admin",
  },
  "admin-churn": {
    path: "/admin/churn",
    titulo: "Churn radar (proativa)",
    resumo:
      "Identifica usuários com risco ALTO de cancelar: zero check-in nos últimos 30 dias, perto do próximo ciclo de cobrança. Base pra ação de retenção: cupom-bomba + push direcionado. Mais barato manter cliente do que adquirir um novo.",
    objetivoRelatorio:
      "Reduzir churn: agir ANTES do cancelamento. User inativo é candidato natural ao 'cancel' no próximo ciclo. Custo do cupom-bomba (R$ 10-20) < custo de readquirir esse user (CAC normalmente R$ 30-50).",
    calculos: [
      "Risco = (dias sem atividade × 0.5) + (dias até próxima cobrança × 0.3) − engajamento nos últimos 30 dias",
      "Score 7 ou mais = URGÊNCIA (cupom-bomba + push imediato).",
    ],
    tourRole: "admin",
  },
  "admin-afiliados": {
    path: "/admin/afiliados",
    titulo: "Afiliados / programa de indicação",
    resumo:
      "Acompanhamento do programa indique-e-ganhe: quem indicou quem, quanto pagamos em recompensa, fraude potencial (mesma pessoa indicando 50 contas).",
    objetivoRelatorio:
      "Validar ROI: o programa de indicação custa menos por aquisição que marketing pago? Identificar 'super-promotores' (gente que traz 10+ amigos) — eles merecem reconhecimento ou parceria especial.",
    tourRole: "admin",
  },
  "admin-b2b": {
    path: "/admin/b2b",
    titulo: "BRAVA+ Empresas (B2B)",
    resumo:
      "Pacote corporativo: RH de empresa contrata BRAVA+ como benefício pros colaboradores. Em vez de vender 1-a-1, vende 100, 500, 1000 contas de uma vez. LTV brutal — 1 contrato vale dezenas de assinantes individuais.",
    oQueFaz: [
      "Lista empresas-cliente (com quantidade de colaboradores ativos).",
      "Faturamento por empresa.",
      "Botão pra cadastrar nova empresa-cliente.",
    ],
    objetivoRelatorio:
      "LTV alavancado — 1 empresa de 100 colaboradores vale 100 assinantes individuais SEM o CAC unitário (custo de aquisição rateia). Foco em B2B é alavanca de crescimento mais eficiente que B2C.",
    tourRole: "admin",
  },
  "admin-pacotes": {
    path: "/admin/pacotes",
    titulo: "Pacotes promocionais",
    resumo:
      "Combos curados pelo time BRAVA+ que aparecem no app como destaque: combinação de produtos/serviços de N parceiros com desconto agregado (ex: 'Pacote dia dos namorados = jantar + spa + flores por R$ 200').",
    tourRole: "admin",
  },
  "admin-pacote-detalhe": {
    path: "/admin/pacotes/",
    titulo: "Detalhe do pacote",
    resumo: "Edita itens incluídos no pacote, preço final, validade. Hora de revisar antes de publicar.",
    tourRole: "admin",
  },
  "admin-listas": {
    path: "/admin/listas",
    titulo: "Listas curadas",
    resumo:
      "Coleções temáticas exibidas no app pros assinantes: 'Top 10 hambúrguers SP', 'Pet-friendly em Pinheiros'. Você cura quais estabelecimentos entram. Aumenta descoberta de parceiros menores.",
    tourRole: "admin",
  },
  "admin-lista-detalhe": {
    path: "/admin/listas/",
    titulo: "Detalhe da lista",
    resumo: "Adiciona/remove estabelecimentos da lista, altera imagem de capa, ordem de exibição.",
    tourRole: "admin",
  },
  "admin-slots": {
    path: "/admin/slots",
    titulo: "Slots de destaque (monetização)",
    resumo:
      "Lojistas pagam mensalmente pra aparecer no TOPO da categoria/região. Receita pura, sem custo variável pra você. Aqui você gerencia disponibilidade (quantos slots por região) e preço.",
    campos: [
      { nome: "Categoria/região (escopo)", desc: "ex: 'Restaurantes em Pinheiros'. Define onde o slot vale.", obrigatorio: true },
      { nome: "Preço por semana (R$)", desc: "cobrança Efí recorrente. Padrão: 100-300/semana dependendo da região", obrigatorio: true },
      { nome: "Limite simultâneo", desc: "quantos lojistas podem ocupar o slot juntos (rodízio entre eles)" },
    ],
    objetivoRelatorio:
      "Receita NÃO-mensalidade: slot é receita pura com margem altíssima (~95%). Acompanhe ocupação por região — slot vazio = vendas perdidas, slot 100% ocupado = considere abrir mais slots ou subir preço.",
    tourRole: "admin",
  },
  "admin-desafios": {
    path: "/admin/desafios",
    titulo: "Desafios (engajamento)",
    resumo:
      "Cria desafios mensais que aparecem no app pro user fazer (ex: 'visite 3 parceiros novos esse mês' = 100 coins). Ferramenta direta de engajamento — user com desafio ativo usa mais o app, abre mais cupons, gera mais visitas.",
    campos: [
      { nome: "Título do desafio", desc: "curto + chamativo. Ex: 'Explorador do mês'", obrigatorio: true },
      { nome: "Meta numérica", desc: "quantas ações pra completar (ex: 3 visitas, 5 cupons)", obrigatorio: true },
      { nome: "Ação trackada", desc: "check-in / cupom resgatado / pedido feito / indicação", obrigatorio: true },
      { nome: "Recompensa (coins)", desc: "quantas BRAVA Coins ele ganha ao completar", obrigatorio: true },
      { nome: "Validade", desc: "data limite pra completar (normalmente fim do mês)" },
    ],
    tourRole: "admin",
  },
  "admin-menu": {
    path: "/admin/menu",
    titulo: "Menu admin completo",
    resumo: "Atalho mobile pras áreas administrativas que não cabem na bottom nav.",
    tourRole: "admin",
  },
  "admin-comerciais": {
    path: "/admin/comerciais",
    titulo: "Comerciais (representantes)",
    resumo:
      "Lista todos os representantes comerciais cadastrados — seu time de campo. Cada um tem um código único, tabela de comissão própria (configurada por você), território opcional. Filtros: ativo/inativo. Click no comercial abre detalhe completo.",
    oQueFaz: [
      "Tabela com nome, email, código COM-XXXX, território, tipo de comissão (% ou R$), quantos estabs e subs vinculados, status.",
      "Botão '+ Cadastrar comercial' pra criar um novo.",
      "Click no comercial abre 360 com edição + estatísticas + lista de vinculados.",
    ],
    objetivoRelatorio:
      "Visão geral do time comercial: quem está produzindo, quem está parado. Quem tem mais estabs ativos? Quem cadastrou no mês? Identifique top performers e quem precisa de coaching.",
    tourRole: "admin",
  },
  "admin-comerciais-novo": {
    path: "/admin/comerciais/novo",
    titulo: "Cadastrar comercial",
    resumo:
      "Cria a conta do representante (auth + role=commercial) + commercial_affiliates com a tabela de comissão que você definir. Gera código único automaticamente (COM-XXXXXX). Comercial recebe a senha provisória — troca no 1º login.",
    campos: [
      { nome: "Nome completo", desc: "como aparece no painel dele", obrigatorio: true },
      { nome: "Email (login)", desc: "vira o login. Atenção pra digitar certo.", obrigatorio: true },
      { nome: "Telefone", desc: "WhatsApp do comercial — opcional mas útil pra contato interno" },
      { nome: "Senha provisória", desc: "padrão Brava@2026! — anote, fale com ele, deixe ele trocar", obrigatorio: true },
      { nome: "Território", desc: "ex: 'Zona Sul SP'. Só pra organização interna — não restringe ações.", obrigatorio: false },
      { nome: "Chave PIX", desc: "pra payout mensal. Pode preencher depois — comercial não recebe sem isso." },
      { nome: "Tipo comissão estab", desc: "PERCENTUAL (% sobre receita do estab) ou FIXO (R$ no signup do estab)", obrigatorio: true },
      { nome: "Valor estab", desc: "se %, digite 20 (=20%). Se fixo, digite o R$ direto (ex: 150)." },
      { nome: "Duração estab (meses)", desc: "só se percentual. Padrão 12. Quanto tempo continua recebendo." },
      { nome: "Tipo comissão sub", desc: "PERCENTUAL (% mensalidade) ou FIXO (R$ no 1º pgto)", obrigatorio: true },
      { nome: "Valor por tier (Básico/Premium/VIP)", desc: "% ou R$, varia por tier. Tier alto normalmente vale menos % mas mais R$ absoluto." },
      { nome: "Duração sub (meses)", desc: "só se percentual. Padrão 6 meses." },
      { nome: "Notas internas", desc: "info que SÓ você vê. Histórico, contrato, observações." },
    ],
    dicas: [
      "Comissão MAIS BAIXA pra VIP é o padrão (10-15%) — mensalidade já é alta, comercial ganha bem em R$ absoluto.",
      "Comissão MAIS ALTA pra Básico (30-40%) — incentiva captação volume.",
      "Pra estab no início, prefira FIXO (R$ 100-300/cadastro) — fácil de explicar pro comercial e pagar.",
    ],
    tourRole: "admin",
  },
  "admin-comerciais-detalhe": {
    path: "/admin/comerciais/",
    titulo: "Detalhe do comercial",
    resumo:
      "360 do representante: KPIs do mês, edita dados/comissão, ativa/desativa, vê todos os estabs e subs que ele cadastrou. Use quando precisa ajustar comissão, dar suporte, validar performance individual.",
    oQueFaz: [
      "4 KPIs no topo (estabs ativos, subs ativos, comissão mês estab/sub).",
      "Form completo de edição (dados + comissão por estab + comissão por sub + notas).",
      "Botão Ativar/Desativar — desativado não pode logar nem ganhar mais comissão.",
      "Listas: estabelecimentos vinculados (com data) + assinantes vinculados (com data).",
    ],
    dicas: [
      "Desativar comercial NÃO QUEBRA os vínculos — estabs/subs já cadastrados continuam pagando comissão até o fim do período. Só impede novos cadastros.",
      "Ajustar comissão NÃO REWRITES o histórico — vínculos já criados mantém a regra antiga.",
    ],
    tourRole: "admin",
  },
};
