/* ============================================================================
   BRAVA+ · Custos & Desenvolvimento — FONTE ÚNICA DOS NÚMEROS
   Mexeu aqui, a tela inteira muda. Nada de número solto no componente.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   ⚠️ SETUP INICIAL DO PROJETO — VALOR A CONFIRMAR
   A proposta comercial do BRAVA+ não foi localizada (não há documento na pasta
   de propostas da Diretório Web). Enquanto SETUP_CENTS for 0, a tela exibe o
   aviso "valor a confirmar com a Diretório Web" e soma R$ 0 no total investido.

   👉 QUANDO A DIRETÓRIO WEB INFORMAR O VALOR, TROQUE SÓ ESTA LINHA (em centavos).
      Exemplo: R$ 168.344,00  →  SETUP_CENTS = 16_834_400
---------------------------------------------------------------------------- */
export const SETUP_CENTS = 0;

/** Documento de origem do setup (aparece na tela). Preencher junto com o valor. */
export const SETUP_ORIGEM = "proposta não localizada";

/** Câmbio de referência usado para converter as contas em dólar. */
export const CAMBIO = 5.45;

/** Entrega da primeira versão — início da contagem de custos e do pós-entrega. */
export const ENTREGA_V1 = "2026-05-12";
/** Primeiro mês com conta fixa (mês da entrega da v1). */
export const PRIMEIRO_MES = "2026-05";

/* ============================================================================
   CONTAS FIXAS MENSAIS
   `estimado: true` marca o que ainda é aproximação (chip "estimado" na tela).
   Serviço que o BRAVA+ não usa simplesmente não entra na lista.
   ========================================================================== */
export interface ContaFixa {
  slug: string;
  label: string;
  cents: number;
  obs: string;
  usd?: number;
  estimado?: boolean;
}

export const CONTAS_FIXAS: ContaFixa[] = [
  { slug: "vercel", label: "Vercel (hospedagem e crons)", cents: 10_900, usd: 20, obs: "USD 20", estimado: true },
  { slug: "supabase", label: "Supabase (banco, login e arquivos)", cents: 13_625, usd: 25, obs: "USD 25", estimado: true },
  { slug: "backup", label: "Backup", cents: 44_000, obs: "valor informado" },
  { slug: "resend", label: "Resend (envio de e-mail)", cents: 10_900, usd: 20, obs: "USD 20", estimado: true },
  { slug: "firewall", label: "Firewall", cents: 12_535, usd: 23, obs: "USD 23 · valor informado" },
  { slug: "proxies", label: "Proxies", cents: 10_355, usd: 19, obs: "USD 19 · valor informado" },
  { slug: "vps-agentes", label: "VPS de agentes", cents: 59_000, obs: "valor informado" },
];

/** WhatsApp API não entra: o BRAVA+ usa só links wa.me (gratuitos), sem API oficial. */

export const TOTAL_MENSAL_CENTS = CONTAS_FIXAS.reduce((s, c) => s + c.cents, 0);

/* ============================================================================
   TIERS DE TOKEN (base Opus USD 5/25 por milhão, câmbio 5,45)
   ========================================================================== */
export type Tier = "P" | "M" | "G" | "X";

export const TIERS: Record<Tier, { tokens: number; cents: number; nome: string }> = {
  P: { tokens: 1_600_000, cents: 6_540, nome: "Pequeno" },
  M: { tokens: 4_400_000, cents: 16_350, nome: "Médio" },
  G: { tokens: 8_800_000, cents: 32_700, nome: "Grande" },
  X: { tokens: 16_500_000, cents: 59_950, nome: "Extra" },
};

/* ============================================================================
   DESENVOLVIMENTO PÓS-ENTREGA
   [dia/mês, título, descrição em linguagem de dono, tier]
   ========================================================================== */
export type DevEntrada = [string, string, string, Tier];

export interface DevMes {
  /** Chave do grupo, no padrão dos outros sistemas. */
  key: string;
  /** AAAA-MM */
  mes: string;
  itens: DevEntrada[];
}

export const DEV_MESES: DevMes[] = [
  {
    key: "CX_DEV_08",
    mes: "2026-08",
    itens: [
      ["04/08", "Relatório de Custos & Desenvolvimento", "Esta tela: o que o projeto custou, o que custa por mês e tudo que foi feito desde a entrega, mês a mês.", "M"],
      ["03/08", "Ana atende os chamados de suporte", "A assistente lista os chamados abertos um a um e dá baixa sem ninguém precisar entrar no painel.", "P"],
    ],
  },
  {
    key: "CX_DEV_07",
    mes: "2026-07",
    itens: [
      ["28/07", "Financeiro completo: repasse do dinheiro dos lojistas", "Adquirentes, prazos de liberação (PIX em 2 dias, cartão em 30), saque do lojista com trava de dívidas, repasses, retiradas do caixa e o Financeiro Geral com a conta corrente da operação.", "X"],
      ["28/07", "Assinatura da Diretório Web no rodapé", "Crédito de quem desenvolveu, com link, em todas as páginas públicas.", "P"],
      ["27/07", "Pulso do sistema e trava de manutenção", "Painel de sinais vitais da plataforma (cadastros por nível, vendas reais, quem está online agora) e um botão que coloca o site em manutenção sem derrubar nada.", "M"],
      ["22/07", "Ana passa a ler o BRAVA+", "Conexão segura para a assistente responder sobre o sistema sem alguém abrir o painel.", "M"],
      ["14/07", "Ícone oficial da marca", "Símbolo do BRAVA+ na aba do navegador e na apresentação.", "P"],
      ["07/07", "Apresentação ajustada para o celular", "O deck de slides passou a funcionar bem na tela em pé, do jeito que se mostra numa reunião.", "P"],
      ["03/07", "Apresentação em slides do BRAVA+", "Deck de tela cheia com um slide por módulo, em duas versões: completa (com números) e pública (para parceiros).", "M"],
      ["03/07", "Sprint de ativação: fazer o cliente novo virar cliente ativo", "Cobrança automática das empresas, régua de e-mails do período de teste, funil de ativação medido por usuário, convite de notificação na hora certa, páginas de cidade/categoria para aparecer no Google e teste automático das telas críticas.", "X"],
      ["03/07", "Limpar/repovoar a base e BRAVA+ Empresas", "Botão para apagar os dados fictícios (e recriá-los quando quiser testar) e o pacote corporativo completo: convites por e-mail, controle de vagas e ativação do funcionário.", "G"],
    ],
  },
  {
    key: "CX_DEV_06",
    mes: "2026-06",
    itens: [
      ["11/06", "Cinco ferramentas novas no admin", "Painel financeiro, moderação de avaliações, relatório de resgates, relatório das carteiras e monitor de engajamento.", "G"],
      ["11/06", "Monitor dos disparos promocionais", "Acompanhamento do que cada lojista está disparando para a base de clientes.", "P"],
      ["11/06", "Pente-fino nos quatro painéis", "As 138 telas de cliente, lojista, comercial e admin abertas uma a uma: textos desatualizados corrigidos e botões que não faziam nada foram ligados.", "M"],
      ["10/06", "Cobrança automática todo mês", "A mensalidade renova sozinha no cartão; no PIX o sistema gera a cobrança nova e avisa. Três tentativas antes de suspender, cancelamento com um clique.", "G"],
      ["10/06", "Todas as cobranças no gateway real", "Assinatura, categorias, plano do lojista, carteira, vale-presente e recarga passaram a cobrar de verdade. Mais as páginas obrigatórias (LGPD, reembolso, entrega, uso).", "G"],
      ["10/06", "Pagamento de verdade: PIX, cartão, Apple Pay e Google Pay", "Fim da simulação: PIX pela SyncPay e cartão pela Stripe, com confirmação automática e comprovação de recebimento.", "X"],
    ],
  },
  {
    key: "CX_DEV_05",
    mes: "2026-05",
    itens: [
      ["30/05", "Fechamento: e-mails reais, PIX e app no celular", "Envio de e-mail em produção, cobrança PIX ligada, landing das empresas e as cinco telas do aplicativo com login e carteirinha funcionando.", "M"],
      ["28/05", "Growth: campanhas, antifraude, churn e valor do cliente", "Campanhas segmentadas por categoria/cidade/plano, radar de fraude com histórico, resgate automático de quem sumiu e o quanto cada cliente vale ao longo do tempo.", "G"],
      ["28/05", "BRAVA Tag: a carteira única da rede", "Saldo do cliente que vale em qualquer loja parceira, com plano mensal, pacotes de recarga, comissão da BRAVA+ e renovação automática.", "G"],
      ["28/05", "Relatórios de vendas, categorias e economia", "Quanto vendeu, em qual categoria, com qual benefício — e, do lado do cliente, quanto ele já economizou e se a assinatura vale a pena.", "M"],
      ["28/05", "Assinatura por categoria + teste grátis", "O cliente monta o próprio plano escolhendo as categorias que usa; 7 dias liberados para experimentar tudo (30 dias para a loja).", "G"],
      ["28/05", "Aplicativo instalável para cada perfil", "Cinco apps distintos no celular — cliente, lojista, admin, comercial e entregador — cada um com nome, ícone e cor próprios.", "M"],
      ["28/05", "Balcão: o QR do cliente vira venda em segundos", "O lojista bipa a carteirinha, vê todos os benefícios daquele cliente, escolhe um, digita o valor e pronto: venda registrada e desconto aplicado.", "G"],
      ["28/05", "Plano modular: o lojista monta o próprio pacote", "Saem os três planos fixos, entra um catálogo de 34 ferramentas com preço próprio. O lojista liga o que quer e paga a soma.", "G"],
      ["27/05", "Tabelas viram cards no celular", "As 18 tabelas dos painéis passaram a se reorganizar como cartões na tela pequena, sem rolagem lateral.", "M"],
      ["27/05", "Correções no cadastro em etapas e na capa do site", "Campos que sumiam entre as etapas, e-mail já cadastrado e legibilidade do texto sobre o \"+\" gigante da home.", "P"],
      ["25/05", "Menu legível no modo escuro", "Links que sumiam no tema escuro em todos os quatro painéis.", "P"],
      ["22/05", "Benefício Renovável: toda loja com promoção no ar", "Cada loja é obrigada a ter uma promoção ativa, que se renova sozinha a cada X dias e não acumula — o cliente sempre tem algo para usar antes de perder. Com arte pronta para story.", "G"],
      ["19/05", "Memorial da plataforma e contas de demonstração", "Documento em PDF com tudo que o sistema faz, por perfil, e um login pronto de cada tipo para mostrar ao cliente.", "M"],
      ["18/05", "24 ferramentas novas para cliente e lojista", "Carteira, modo grupo, \"vou aí\", conquistas, presente para amigo, fila de espera — e, do lado da loja, pedido na mesa por QR, tela da cozinha, comparativo com a região, teste A/B de cupom, parcerias entre lojas e backup para a contadora.", "X"],
      ["18/05", "Time comercial de campo", "Nível novo para os representantes: CRM em quadro, mapa de prospecção, links de indicação com rastreio e comissão configurável por representante.", "X"],
      ["18/05", "Tour guiado e ajuda em cada tela", "Passo a passo na primeira visita de cada perfil e um botão de ajuda em todas as telas explicando o que fazer ali.", "G"],
      ["16/05", "Apresentações e vídeo de divulgação", "Páginas de apresentação do cliente e do lojista com simulação ao vivo, mais o vídeo animado de 35 segundos.", "G"],
      ["15/05", "Visual unificado dos três painéis", "Mesma identidade e mesmo tema claro/escuro em cliente, loja e admin.", "M"],
      ["15/05", "Cadastro em 4 etapas e teste com contagem regressiva", "Formulários longos viraram etapas curtas e o período de teste passou a mostrar quanto tempo falta.", "M"],
      ["15/05", "Mapa ao vivo na busca e filtro por categorias", "Busca com mapa em tempo real e seleção de várias categorias de uma vez.", "M"],
      ["14/05", "Delivery completo com entregador no mapa", "Entrega ou retirada no checkout, taxa por distância, equipe de entregadores da loja, vitrine de freelancers, acompanhamento ao vivo estilo iFood, código de 4 dígitos e rota otimizada.", "X"],
      ["14/05", "Menu lateral nos painéis e alertas no dashboard", "Navegação lateral no desktop e avisos de entregador pendente/entrega sem responsável.", "P"],
      ["13/05", "Stories, cupom compartilhado e indicação", "Stories da loja com adesivo de resgate, compartilhamento de cupom, programa de indicação e pacotes sazonais.", "G"],
      ["13/05", "Boas-vindas, desafios e listas editoriais", "Primeira experiência do cliente, desafios com prêmio, lista de desejos, curadoria editorial, canal de suporte e e-mails automáticos.", "G"],
    ],
  },
];

/* ============================================================================
   APIs & SERVIÇOS — informativo, não soma no custo
   ========================================================================== */
export interface ApiServico {
  nome: string;
  taxa: string;
  obs: string;
}

export const APIS_SERVICOS: ApiServico[] = [
  { nome: "Stripe (cartão, Apple Pay, Google Pay)", taxa: "3,99% + R$ 0,39", obs: "por transação aprovada · dinheiro liberado em 30 dias" },
  { nome: "SyncPay (PIX)", taxa: "taxa por transação", obs: "conforme contrato · dinheiro liberado em 2 dias" },
  { nome: "Google Maps (endereço e rota da entrega)", taxa: "por uso", obs: "cota gratuita mensal; acima dela, cobrado por mil consultas" },
  { nome: "Resend (e-mail)", taxa: "por envio", obs: "100 e-mails/dia no gratuito; o sistema segura o excedente numa fila" },
  { nome: "Supabase (banco, login, arquivos)", taxa: "plano mensal", obs: "já contabilizado nas contas fixas" },
  { nome: "Vercel (hospedagem, crons)", taxa: "plano mensal", obs: "já contabilizado nas contas fixas" },
  { nome: "Notificação push (VAPID)", taxa: "sem custo", obs: "envio próprio, sem intermediário" },
  { nome: "PostHog (medição do funil)", taxa: "sem custo hoje", obs: "gratuito até 1 milhão de eventos por mês" },
];

/* ============================================================================
   Helpers
   ========================================================================== */
export const MESES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function nomeMes(mes: string) {
  const [ano, m] = mes.split("-");
  return `${MESES_PT[Number(m) - 1]} de ${ano}`;
}

/** Lista AAAA-MM do primeiro mês até o mês de referência (mais recente primeiro). */
export function mesesAte(referencia: Date, inicio = PRIMEIRO_MES): string[] {
  const [ai, mi] = inicio.split("-").map(Number);
  const out: string[] = [];
  let ano = ai;
  let mes = mi;
  const alvoAno = referencia.getFullYear();
  const alvoMes = referencia.getMonth() + 1;
  while (ano < alvoAno || (ano === alvoAno && mes <= alvoMes)) {
    out.push(`${ano}-${String(mes).padStart(2, "0")}`);
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }
  return out.reverse();
}

export function brl(cents: number) {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function tokensFmt(tokens: number) {
  return `${(tokens / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`;
}

/** Totais consolidados do desenvolvimento. */
export const DEV_TOTAL_CENTS = DEV_MESES.reduce(
  (s, g) => s + g.itens.reduce((si, i) => si + TIERS[i[3]].cents, 0),
  0,
);
export const DEV_TOTAL_TOKENS = DEV_MESES.reduce(
  (s, g) => s + g.itens.reduce((si, i) => si + TIERS[i[3]].tokens, 0),
  0,
);
export const DEV_TOTAL_ITENS = DEV_MESES.reduce((s, g) => s + g.itens.length, 0);
