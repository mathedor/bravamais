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
  // ==== ADMIN ====
  "admin-home", "admin-bi", "admin-usuarios", "admin-usuarios-detalhe", "admin-usuarios-novo",
  "admin-estabelecimentos", "admin-estabelecimento-detalhe", "admin-estabelecimento-novo", "admin-estabelecimento-operacao",
  "admin-entregadores", "admin-entregas",
  "admin-assinaturas", "admin-planos", "admin-cupons", "admin-categorias",
  "admin-saques", "admin-extornos", "admin-suporte", "admin-denuncias", "admin-fraude",
  "admin-churn", "admin-afiliados", "admin-b2b",
  "admin-pacotes", "admin-pacote-detalhe", "admin-listas", "admin-lista-detalhe",
  "admin-slots", "admin-desafios", "admin-menu",
] as const;

export type PageHelpKey = (typeof KEYS)[number];

export const PAGE_HELPS: Record<PageHelpKey, PageHelpEntry> = {
  /* ==================================================================
     USUÁRIO (assinante) — /app/*
     ================================================================== */
  "app-home": {
    path: "/app",
    titulo: "Início (App do assinante)",
    resumo:
      "Sua tela inicial: economia do mês, cupons em destaque, estabelecimentos perto de você e atalho pra carteirinha QR.",
    oQueFaz: [
      "Mostra quanto você já economizou no mês e no total (cashback + cupons usados)",
      "Hero com saudação + 3 perks rápidos do plano que você assina",
      "Stories ativos dos estabelecimentos parceiros (igual Instagram)",
      "Chips de categorias pra filtrar rapidinho",
      "Lista 'perto de você' calculada via GPS (Haversine, em km)",
      "Cards de cupons em destaque com formato de ticket",
    ],
    comoUsar: [
      "Toque numa categoria pra ir direto pra busca filtrada",
      "Toque num estabelecimento pra abrir o 360 dele",
      "Use o botão amarelo central da bottom nav pra abrir a carteirinha QR a qualquer momento",
    ],
    dicas: [
      "Permita localização — sem GPS você não vê o que está perto",
      "Se está usando o plano Básico, considere upgrade pra desbloquear cupons VIP",
    ],
    tourRole: "usuario",
  },
  "app-buscar": {
    path: "/app/buscar",
    titulo: "Buscar estabelecimentos",
    resumo:
      "Procure por nome, categoria ou tipo de promoção. Resultados ordenados por proximidade ou A-Z.",
    oQueFaz: [
      "Busca textual em nome + tagline dos estabelecimentos",
      "Filtro por categoria (chips no topo)",
      "Filtro por tipo de promoção (cupom, fidelidade, vale-presente, vale-compras)",
      "Toggle 'mais perto / A-Z' (proximidade calculada via Haversine se GPS ativo)",
      "Distância em km exibida em cada card",
    ],
    comoUsar: [
      "Digite no campo de busca OU clique numa chip",
      "Use 'mais perto' pra ver o que está no raio caminhável",
      "Toque num card pra abrir o 360 do estabelecimento",
    ],
    dicas: [
      "Combine filtro de categoria + tipo de promoção pra achar exatamente o que quer",
      "Sem GPS, o toggle 'mais perto' não funciona — toggle volta pra A-Z",
    ],
    tourRole: "usuario",
  },
  "app-mapa": {
    path: "/app/mapa",
    titulo: "Mapa de parceiros",
    resumo:
      "Veja todos os estabelecimentos no mapa, com pinos coloridos por categoria. Toque num pino pra ver detalhes.",
    oQueFaz: [
      "Mapa Leaflet com OpenStreetMap (sem custo de API)",
      "Pinos amarelos = parceiros ativos",
      "Sua localização em pino azul (se GPS ativo)",
      "Toque no pino abre popup com nome + botão 'abrir 360'",
    ],
    dicas: [
      "Use pra planejar passeios — descubra o que tem no caminho",
      "Combine com a busca pra filtrar por categoria antes de olhar o mapa",
    ],
    tourRole: "usuario",
  },
  "app-estabelecimento": {
    path: "/app/estabelecimento",
    titulo: "360 do estabelecimento",
    resumo:
      "Página completa do parceiro: fotos, descrição, catálogo de produtos, cupons disponíveis e clube de fidelidade.",
    oQueFaz: [
      "Hero com logo + fotos (até 3)",
      "Endereço completo + telefone + WhatsApp (CTA)",
      "Catálogo de produtos com preço (clique 'comprar' → checkout)",
      "Cupons disponíveis pro seu tier (Básico/Premium/VIP)",
      "Clube de fidelidade: progresso (X de Y visitas) + recompensa",
      "Botão chat pra falar com a loja",
      "Botão favoritar (vai pra sua lista)",
      "Reviews + nota média",
    ],
    comoUsar: [
      "Toque num produto pra abrir checkout (PIX ou cartão via Efí)",
      "Toque num cupom pra resgatar (vai pra sua carteira)",
      "'Chamar no chat' abre conversa em tempo real com o lojista",
    ],
    tourRole: "usuario",
  },
  "app-cupons": {
    path: "/app/cupons",
    titulo: "Meus cupons",
    resumo:
      "Cupons que você resgatou — válidos, usados e expirados, em formato ticket recortado.",
    oQueFaz: [
      "Lista cupons por status (ativos primeiro)",
      "Cada cupom mostra: estabelecimento, desconto (% ou R$), validade, código QR pra apresentar na loja",
      "Toque no cupom pra abrir modal com QR ampliado",
    ],
    dicas: [
      "Apresente o QR pro lojista no caixa — ele lê com o scanner da loja",
      "Cupom expirado some da home — só aparece aqui no histórico",
    ],
    tourRole: "usuario",
  },
  "app-carteirinha": {
    path: "/app/carteirinha",
    titulo: "Carteirinha QR",
    resumo:
      "Sua identidade BRAVA+. Apresente esse QR em qualquer parceiro pra registrar visita e somar pontos no clube de fidelidade dele.",
    oQueFaz: [
      "QR único e exclusivo (rotaciona a cada 60s pra segurança)",
      "Tier do seu plano (Básico/Premium/VIP) destacado",
      "KPIs: total de visitas, clubes em andamento, prêmios disponíveis",
    ],
    comoUsar: [
      "Abra a carteirinha (botão amarelo central da bottom nav)",
      "Apresente o QR pro lojista no caixa",
      "Pronto — visita registrada, fidelidade atualizada",
    ],
    calculos: [
      "+1 visita por scan no estabelecimento",
      "+5 BRAVA Coins por check-in (cashback interno)",
      "Quando visitas = X (configurado pela loja) → prêmio liberado",
    ],
    tourRole: "usuario",
  },
  "app-fidelidade": {
    path: "/app/fidelidade",
    titulo: "Clubes de fidelidade",
    resumo:
      "Acompanhe seu progresso em cada clube de fidelidade dos parceiros — quantas visitas faltam pro próximo prêmio.",
    visual: <FluxoVisita />,
    oQueFaz: [
      "Lista clubes em que você tem progresso (≥1 visita)",
      "Barra de progresso (X de Y visitas)",
      "Prêmio que você ganha ao completar",
      "Seção 'recompensas disponíveis' destacada em amarelo",
    ],
    dicas: [
      "Quanto mais consistente nas visitas, mais cedo libera prêmio",
      "Cada parceiro define a meta (5, 10, 20 visitas — varia)",
    ],
    tourRole: "usuario",
  },
  "app-carteira": {
    path: "/app/carteira",
    titulo: "Carteira BRAVA+",
    resumo:
      "Tudo que tem valor monetário num lugar só: cupons + vale-presentes + BRAVA Coins (cashback) + recompensas resgatáveis.",
    oQueFaz: [
      "Saldo de BRAVA Coins (cashback interno)",
      "Cupons ativos",
      "Vale-presentes recebidos",
      "Recompensas disponíveis (de clubes completados)",
      "Histórico de movimentação",
    ],
    calculos: [
      "+5 coin por check-in (carteirinha lida)",
      "+10 coin por cupom resgatado",
      "+1% do valor do pedido como coin",
      "1 coin = R$ 0,01 no checkout (mínimo 100 coins pra usar)",
    ],
    tourRole: "usuario",
  },
  "app-presentes": {
    path: "/app/presentes",
    titulo: "Vale-presentes",
    resumo:
      "Vale-presentes que você recebeu ou enviou pra alguém. Crédito direto pra usar em qualquer parceiro.",
    oQueFaz: [
      "Recebidos: vale com código pra usar no checkout",
      "Enviados: histórico de presentes que você comprou pra outros",
      "Botão 'enviar presente novo'",
    ],
    tourRole: "usuario",
  },
  "app-premios": {
    path: "/app/premios",
    titulo: "Prêmios",
    resumo:
      "Prêmios que você ganhou nos clubes de fidelidade (X visitas completadas) — código único pra apresentar no parceiro.",
    oQueFaz: [
      "Lista de prêmios disponíveis (ainda não usados)",
      "Cada prêmio mostra parceiro + descrição (ex: 'um café grátis')",
      "Toque pra ver código de resgate (alfanumérico curto)",
    ],
    tourRole: "usuario",
  },
  "app-pedidos": {
    path: "/app/pedidos",
    titulo: "Meus pedidos",
    resumo:
      "Histórico de tudo que você comprou nos parceiros pelo BRAVA+ — status atual, valores, repetir pedido.",
    oQueFaz: [
      "Lista pedidos por data (mais recentes primeiro)",
      "Status: aguardando / preparo / pronto / entregue / cancelado",
      "Tracking em tempo real (se for delivery)",
    ],
    tourRole: "usuario",
  },
  "app-pedido-detalhe": {
    path: "/app/pedidos/",
    titulo: "Detalhe do pedido",
    resumo:
      "Todos os dados de um pedido: itens, valores, cupom aplicado, forma de pagamento e tracking do entregador (se delivery).",
    oQueFaz: [
      "Itens comprados + preço unitário + total",
      "Cupom aplicado (com valor de desconto)",
      "Frete e taxa (se delivery)",
      "Forma de pagamento (PIX ou cartão Efí)",
      "Mapa com posição do entregador em tempo real (se a caminho)",
      "Código 4 dígitos pra entregar ao entregador",
      "Botão 'abrir chat com a loja'",
    ],
    calculos: [
      "Total = subtotal − desconto cupom + frete − BRAVA coins usados",
      "Cashback creditado = 1% do total final",
    ],
    tourRole: "usuario",
  },
  "app-chat": {
    path: "/app/chat",
    titulo: "Chat",
    resumo: "Conversas com lojistas. Cada parceiro com quem você falou aparece aqui.",
    oQueFaz: [
      "Lista conversas (mais recentes primeiro)",
      "Mostra última mensagem + horário + badge de não-lidas",
      "Toque pra abrir a conversa completa",
    ],
    tourRole: "usuario",
  },
  "app-chat-detalhe": {
    path: "/app/chat/",
    titulo: "Conversa",
    resumo:
      "Chat em tempo real com o lojista (Supabase Realtime). Envie texto, foto ou pergunta sobre pedido.",
    oQueFaz: [
      "Mensagens em tempo real (sem refresh)",
      "Indicador 'lojista está digitando'",
      "Upload de foto",
      "Visualizada / não lida",
    ],
    tourRole: "usuario",
  },
  "app-notificacoes": {
    path: "/app/notificacoes",
    titulo: "Notificações",
    resumo:
      "Tudo que aconteceu na sua conta: cupons novos, pedidos, lembretes de fidelidade, push de proximidade.",
    oQueFaz: [
      "Lista cronológica (mais recentes primeiro)",
      "Tipo (cupom / pedido / chat / sistema)",
      "Toque pra abrir o destino (cupom, pedido, conversa)",
    ],
    dicas: [
      "Ative push (OneSignal) pra receber em tempo real, mesmo com app fechado",
      "Geo push só funciona se você autorizar localização em background",
    ],
    tourRole: "usuario",
  },
  "app-perfil": {
    path: "/app/perfil",
    titulo: "Meu perfil",
    resumo:
      "Visão geral da sua conta: nome, tier, KPIs, atalhos pra dados, endereços, indicações e sair.",
    oQueFaz: [
      "Avatar com initials + tier badge",
      "KPIs: visitas, clubes ativos, economia total",
      "Atalhos: dados, endereços, indique e ganhe, suporte, sair",
    ],
    tourRole: "usuario",
  },
  "app-perfil-dados": {
    path: "/app/perfil/dados",
    titulo: "Meus dados",
    resumo: "Edite informações pessoais e foto de perfil.",
    campos: [
      { nome: "Nome completo", desc: "como aparece em cupons e tickets", obrigatorio: true },
      { nome: "Email", desc: "login + receber notificações por email", obrigatorio: true },
      { nome: "Telefone", desc: "com DDD — usado pra SMS de segurança" },
      { nome: "Data de nascimento", desc: "libera cupom de aniversário automático" },
      { nome: "Avatar", desc: "foto opcional (mostrada no chat e nas listas)" },
    ],
    dicas: [
      "Aniversário cadastrado = cupom premium + push automático no dia",
    ],
    tourRole: "usuario",
  },
  "app-perfil-enderecos": {
    path: "/app/perfil/enderecos",
    titulo: "Meus endereços",
    resumo: "Endereços salvos pra entrega — casa, trabalho, etc.",
    comoUsar: [
      "Toque '+ Adicionar endereço'",
      "Digite o CEP (auto-preenche via ViaCEP)",
      "Complete número + complemento",
      "Marque como principal pra entrega padrão",
    ],
    tourRole: "usuario",
  },
  "app-favoritos": {
    path: "/app/favoritos",
    titulo: "Favoritos",
    resumo: "Estabelecimentos que você favoritou — acesso rápido.",
    tourRole: "usuario",
  },
  "app-indique": {
    path: "/app/indique",
    titulo: "Indique e ganhe",
    resumo:
      "Convide amigos — ambos ganham 1 mês grátis OU 50 BRAVA Coins quando o convidado assina.",
    oQueFaz: [
      "Seu link único de indicação (com tracking)",
      "Botão compartilhar (WhatsApp/Instagram)",
      "Histórico de indicados: quem se cadastrou, quem assinou, quanto você ganhou",
    ],
    calculos: [
      "Recompensa = 1 mês grátis no plano atual OU 50 coins (escolha do convidado ao assinar)",
      "Você recebe quando o convidado paga a 1ª mensalidade (anti-fraude)",
    ],
    tourRole: "usuario",
  },
  "app-extornos": {
    path: "/app/extornos",
    titulo: "Estornos / Reembolsos",
    resumo:
      "Solicite estorno de um pedido — análise em até 7 dias úteis. Status em tempo real.",
    oQueFaz: [
      "Lista solicitações com status (pendente / aprovado / recusado)",
      "Motivo + descrição do problema",
      "Anexo (foto do produto, comprovante)",
    ],
    tourRole: "usuario",
  },
  "app-suporte": {
    path: "/app/suporte",
    titulo: "Suporte",
    resumo: "Abra ticket com o time BRAVA+ — dúvidas, bugs, sugestões.",
    tourRole: "usuario",
  },
  "app-suporte-detalhe": {
    path: "/app/suporte/",
    titulo: "Ticket de suporte",
    resumo: "Conversa com o time BRAVA+ sobre seu ticket.",
    tourRole: "usuario",
  },
  "app-proximos": {
    path: "/app/proximos",
    titulo: "Perto de você",
    resumo:
      "Lista detalhada de parceiros próximos (raio configurável), ordenados por distância.",
    calculos: [
      "Distância = haversine(lat_user, lng_user, lat_estab, lng_estab) em km",
    ],
    tourRole: "usuario",
  },
  "app-desafios": {
    path: "/app/desafios",
    titulo: "Desafios",
    resumo:
      "Missões que dão coins extras: visitar 3 parceiros novos, resgatar 5 cupons no mês, etc.",
    oQueFaz: [
      "Lista desafios ativos com barra de progresso",
      "Recompensa em coins quando completa",
      "Reset mensal (alguns) — fique de olho",
    ],
    tourRole: "usuario",
  },
  "app-roleta": {
    path: "/app/roleta/",
    titulo: "Roleta da sorte",
    resumo:
      "Cada check-in libera giro na roleta do estabelecimento — chance de cupom-bomba, brinde ou recompensa em coins.",
    calculos: [
      "Probabilidades configuradas pelo lojista (somam 100%)",
      "Cupons raros têm peso baixo (1-5%); recompensas comuns peso alto",
    ],
    tourRole: "usuario",
  },
  "app-lista": {
    path: "/app/listas/",
    titulo: "Lista curada",
    resumo:
      "Coleção temática de estabelecimentos (ex: 'Top hambúrguers SP', 'Cafés pet-friendly') montada pelo admin BRAVA+.",
    tourRole: "usuario",
  },
  "app-pacote": {
    path: "/app/pacote/",
    titulo: "Pacote BRAVA+",
    resumo:
      "Combo promocional: vários produtos/serviços agrupados com desconto adicional. Compre uma vez, use à vontade.",
    tourRole: "usuario",
  },
  "app-menu": {
    path: "/app/menu",
    titulo: "Menu completo",
    resumo: "Acesso a todas as áreas do app — atalho útil quando você não acha algo na bottom nav.",
    tourRole: "usuario",
  },
  "assinar": {
    path: "/assinar",
    titulo: "Escolher plano",
    resumo:
      "3 planos: Básico, Premium e VIP. Cada um libera benefícios e nível de cupons diferentes.",
    calculos: [
      "Básico: R$ 19,90/mês — cupons comuns",
      "Premium: R$ 39,90/mês — cupons premium + 1 vale-presente/mês",
      "VIP: R$ 79,90/mês — todos cupons + roleta diária + cashback dobrado",
    ],
    tourRole: "usuario",
  },
  "assinar-tier": {
    path: "/assinar/",
    titulo: "Checkout da assinatura",
    resumo: "Pague PIX (instantâneo) ou cartão (recorrência mensal via Efí Bank).",
    oQueFaz: [
      "Aba PIX: QR code + copia-e-cola, ativa assinatura ao confirmar",
      "Aba cartão: salva tokenizado na Efí pra cobrar todo mês automaticamente",
    ],
    dicas: [
      "PIX libera na hora; cartão libera em até 2 min",
      "Cancele a qualquer momento em /app/perfil — sem multa",
    ],
    tourRole: "usuario",
  },
  "checkout": {
    path: "/checkout/",
    titulo: "Checkout do produto",
    resumo:
      "Compra de produto direto do catálogo do parceiro. PIX ou cartão via Efí, aplicação de cupom + BRAVA coins.",
    calculos: [
      "Total = preço − cupom − coins_usados + frete (se delivery)",
      "Cashback creditado = 1% do total final",
    ],
    tourRole: "usuario",
  },

  /* ==================================================================
     LOJISTA — /loja/*
     ================================================================== */
  "loja-home": {
    path: "/loja",
    titulo: "Painel da loja",
    resumo:
      "Sua dashboard: KPIs do mês, últimos pedidos, últimas visitas, atalhos pras ações mais comuns.",
    oQueFaz: [
      "4 KPIs: pedidos do mês, receita, novos clientes, visitas no clube de fidelidade",
      "Tabela últimos 10 pedidos com status",
      "Lista últimas 10 visitas (cliente + horário)",
      "Cards de acesso rápido: QR scanner, novo cupom, blast",
    ],
    tourRole: "lojista",
  },
  "loja-perfil": {
    path: "/loja/perfil",
    titulo: "Perfil da loja",
    resumo:
      "Edite identidade visual, contato, endereço e categorias da sua loja.",
    campos: [
      { nome: "Nome da loja", desc: "como aparece pros assinantes", obrigatorio: true },
      { nome: "Tagline", desc: "frase curta de impacto (até 80 chars)" },
      { nome: "Descrição", desc: "texto longo — apresentação completa" },
      { nome: "Logo", desc: "PNG quadrado, ideal 512×512", obrigatorio: true },
      { nome: "Fotos", desc: "até 3 — apareçam no hero do 360" },
      { nome: "Categoria principal", desc: "ajuda nos filtros do app", obrigatorio: true },
      { nome: "Telefone / WhatsApp", desc: "CTA direto pro cliente" },
      { nome: "Endereço completo", desc: "usado no mapa e busca por proximidade", obrigatorio: true },
      { nome: "Horários de funcionamento", desc: "exibido no 360 do estabelecimento" },
    ],
    tourRole: "lojista",
  },
  "loja-catalogo": {
    path: "/loja/catalogo",
    titulo: "Catálogo de produtos",
    resumo:
      "Cadastre os produtos/serviços que aparecem no 360 da sua loja. Quem compra paga via Efí, dinheiro cai na sua conta.",
    oQueFaz: [
      "CRUD inline: form + lista com pausar/editar/excluir",
      "Status: ativo (visível) / pausado (oculto)",
      "Estoque opcional (se zerar, oculta automaticamente)",
    ],
    campos: [
      { nome: "Nome", desc: "produto/serviço", obrigatorio: true },
      { nome: "Preço (R$)", desc: "valor cheio em reais", obrigatorio: true },
      { nome: "Descrição", desc: "ajuda o cliente decidir" },
      { nome: "Foto", desc: "1 imagem PNG/JPG até 5MB" },
      { nome: "Estoque", desc: "opcional — se preenchido, decrementa por pedido" },
      { nome: "Categoria interna", desc: "agrupa no catálogo da sua loja" },
    ],
    calculos: [
      "Você recebe = preço − taxa_efi (1% PIX / 3.5% cartão) − comissão BRAVA+ (variável)",
    ],
    tourRole: "lojista",
  },
  "loja-cupons": {
    path: "/loja/cupons",
    titulo: "Cupons",
    resumo:
      "Crie cupons promocionais — % ou R$ off — direcionados por tier (Básico/Premium/VIP).",
    oQueFaz: [
      "Lista cupons ativos + histórico",
      "CRUD com % ou R$ fixo",
      "Validade configurável",
      "Tier mínimo (ex: 'só Premium e VIP veem')",
    ],
    campos: [
      { nome: "Título", desc: "ex: '20% off no almoço'", obrigatorio: true },
      { nome: "Tipo de desconto", desc: "% (porcentagem) ou R$ (valor fixo)", obrigatorio: true },
      { nome: "Valor", desc: "10 = 10% OU R$ 10", obrigatorio: true },
      { nome: "Pedido mínimo (R$)", desc: "opcional — bloqueia uso abaixo desse valor" },
      { nome: "Tier mínimo", desc: "Básico / Premium / VIP" },
      { nome: "Quantidade total", desc: "estoque do cupom (10, 50, 100, ilimitado)" },
      { nome: "Validade", desc: "data até quando aceita resgate", obrigatorio: true },
    ],
    dicas: [
      "Cupom direcionado a VIP costuma gerar 3x mais valor — usuários engajados",
      "Pedido mínimo evita que cupom queime o ticket",
    ],
    tourRole: "lojista",
  },
  "loja-cupons-detalhe": {
    path: "/loja/cupons/",
    titulo: "Detalhe do cupom",
    resumo: "Edite, pause ou veja quantos clientes usaram esse cupom.",
    objetivoRelatorio:
      "Entender se o cupom está performando — se uso/dia está abaixo do esperado, ajuste % ou validade. Se está esgotando rápido, aumente cota.",
    tourRole: "lojista",
  },
  "loja-fidelidade": {
    path: "/loja/fidelidade",
    titulo: "Clube de fidelidade",
    resumo:
      "Configure quantas visitas o cliente precisa fazer pra ganhar um prêmio na sua loja.",
    visual: <FluxoVisita />,
    campos: [
      { nome: "Nome do clube", desc: "ex: 'Café do Mês'", obrigatorio: true },
      { nome: "Visitas necessárias", desc: "número (5, 10, 20)", obrigatorio: true },
      { nome: "Benefício", desc: "o que o cliente ganha — ex: 'café grátis'", obrigatorio: true },
      { nome: "Valor estimado do benefício (R$)", desc: "usado em BI e cashback contábil" },
    ],
    dicas: [
      "Comece com 5-10 visitas — fácil de bater, gera engajamento",
      "Aumente depois que tiver base recorrente",
    ],
    tourRole: "lojista",
  },
  "loja-promocoes": {
    path: "/loja/promocoes",
    titulo: "Tipos de promoção aceitos",
    resumo:
      "Selecione quais formatos a loja aceita: cupom, fidelidade, vale-presente, vale-compras. Filtros no app usam essa info.",
    tourRole: "lojista",
  },
  "loja-qr": {
    path: "/loja/qr-scanner",
    titulo: "Leitor de QR",
    resumo:
      "Câmera do navegador lê a carteirinha BRAVA+ do cliente — registra visita instantaneamente.",
    oQueFaz: [
      "Acessa câmera (precisa HTTPS)",
      "Lê QR + valida assinatura ativa do cliente",
      "Registra visita + atualiza progresso de fidelidade",
      "Fallback: campo de código manual (caso câmera falhe)",
    ],
    comoUsar: [
      "Toque 'iniciar scanner'",
      "Aponte pro QR do cliente",
      "Aguarde beep de confirmação",
      "Se quiser, digite o código manualmente como fallback",
    ],
    calculos: [
      "Cliente: +1 visita no seu clube + 5 BRAVA coins de cashback",
      "Você: +1 visita no contador, sem custo",
    ],
    tourRole: "lojista",
  },
  "loja-pedidos": {
    path: "/loja/pedidos",
    titulo: "Pedidos",
    resumo:
      "Tudo que clientes pediram pela sua loja. Aceite, prepare e entregue.",
    oQueFaz: [
      "Lista por status (aguardando, preparando, pronto, entregue, cancelado)",
      "Filtros: período, tipo (retirada / delivery), busca",
      "Detalhe: itens, total, cupom aplicado, código 4 dígitos",
    ],
    tourRole: "lojista",
  },
  "loja-clientes": {
    path: "/loja/clientes",
    titulo: "CRM de clientes (mini)",
    resumo:
      "Ranking dos clientes que mais visitam sua loja — base pra blast e cupons personalizados.",
    oQueFaz: [
      "Top 50 clientes por visitas",
      "Ticket médio, último check-in, dias inativo",
      "Botão 'mandar cupom personalizado' direto da linha",
      "Marcar top como 'Embaixador' (cupons VIP)",
    ],
    objetivoRelatorio:
      "Identificar clientes valiosos pra cuidar — quem está sumindo (>30 dias) merece ação; quem visita toda semana merece reconhecimento (embaixador).",
    tourRole: "lojista",
  },
  "loja-vale-presente": {
    path: "/loja/vale-presente",
    titulo: "Vale-presentes",
    resumo:
      "Crie vale-presentes da sua loja pra clientes presentearem — você vende, BRAVA+ entrega o cupom.",
    campos: [
      { nome: "Valor (R$)", desc: "ex: 50, 100, 200", obrigatorio: true },
      { nome: "Validade", desc: "tempo até expirar (90 dias padrão)" },
      { nome: "Personalização", desc: "mensagem do presenteador" },
    ],
    tourRole: "lojista",
  },
  "loja-recompensas": {
    path: "/loja/recompensas",
    titulo: "Recompensas resgatadas",
    resumo:
      "Histórico de prêmios de fidelidade que clientes resgataram na sua loja.",
    objetivoRelatorio:
      "Validar que prêmios estão sendo entregues e estimar custo do programa de fidelidade no mês.",
    tourRole: "lojista",
  },
  "loja-roleta": {
    path: "/loja/roleta",
    titulo: "Roleta da sorte",
    resumo:
      "Configure prêmios e probabilidades da sua roleta — cliente ganha giro a cada check-in.",
    campos: [
      { nome: "Lista de prêmios", desc: "ex: '10% off' / 'brinde' / 'nada'", obrigatorio: true },
      { nome: "Peso de cada prêmio", desc: "soma deve dar 100", obrigatorio: true },
      { nome: "Custo estimado por giro (R$)", desc: "BRAVA+ usa pra BI" },
    ],
    calculos: [
      "Custo médio/giro = Σ (probabilidade × valor_prêmio)",
      "Se média > ticket × 5%, considere reduzir prêmios raros",
    ],
    tourRole: "lojista",
  },
  "loja-blast": {
    path: "/loja/blast",
    titulo: "Promo Blast (hora vazia)",
    resumo:
      "Dispara cupom flash pra base de clientes que já visitou. Ótimo pra encher a casa em horário ocioso.",
    oQueFaz: [
      "Form rápido: % de desconto + validade (2-6h)",
      "Filtra clientes que visitaram nos últimos 90 dias",
      "Dispara push + email pra essa base",
      "Track de quantos abriram, quantos resgataram",
    ],
    campos: [
      { nome: "Desconto (%)", desc: "20-50% recomendado pra blast", obrigatorio: true },
      { nome: "Validade (h)", desc: "2 a 6 horas — curto = urgência" },
      { nome: "Raio (km)", desc: "limita pra quem está perto agora" },
    ],
    calculos: [
      "Audiência potencial = clientes_90d ∩ raio_km",
      "Custo por uso = desconto × ticket_médio (estimativa)",
    ],
    tourRole: "lojista",
  },
  "loja-hoje": {
    path: "/loja/hoje",
    titulo: "Ao vivo (hoje)",
    resumo:
      "O que está rolando agora na sua loja: check-ins, pedidos, chats abertos — em tempo real.",
    tourRole: "lojista",
  },
  "loja-entregas": {
    path: "/loja/entregas",
    titulo: "Entregas",
    resumo:
      "Pedidos delivery em andamento: aguardando entregador, retirado, a caminho, entregue.",
    visual: <FluxoEntrega />,
    tourRole: "lojista",
  },
  "loja-entrega": {
    path: "/loja/entrega",
    titulo: "Configuração de entrega",
    resumo:
      "Define se sua loja tem delivery, raio de cobertura, taxa, tempo médio.",
    campos: [
      { nome: "Habilitar delivery", desc: "liga/desliga o serviço" },
      { nome: "Raio máximo (km)", desc: "área de cobertura — 3 a 8 km recomendado", obrigatorio: true },
      { nome: "Taxa de entrega (R$)", desc: "valor base; pode ter free acima de X" },
      { nome: "Tempo médio (min)", desc: "exibido pro cliente no checkout" },
      { nome: "Pedido mínimo (R$)", desc: "opcional — evita pedido pequeno demais" },
    ],
    calculos: [
      "Frete sugerido = taxa_base + (distância_km × R$ 1,50)",
      "BRAVA+ usa motoboy freelancer; você não paga frota fixa",
    ],
    tourRole: "lojista",
  },
  "loja-entregadores": {
    path: "/loja/entregadores",
    titulo: "Entregadores",
    resumo:
      "Histórico dos entregadores que pegaram pedidos da sua loja — avaliação + tempo médio.",
    objetivoRelatorio:
      "Identificar entregadores rápidos pra pedir prioridade futura; reportar quem deu problema.",
    tourRole: "lojista",
  },
  "loja-entregadores-disp": {
    path: "/loja/entregadores/disponiveis",
    titulo: "Entregadores disponíveis agora",
    resumo:
      "Lista em tempo real de motoboys online perto da loja — útil pra estimar tempo de retirada.",
    tourRole: "lojista",
  },
  "loja-chat": {
    path: "/loja/chat",
    titulo: "Chat com clientes",
    resumo: "Conversas em tempo real com assinantes que abriram chat com sua loja.",
    tourRole: "lojista",
  },
  "loja-chat-detalhe": {
    path: "/loja/chat/",
    titulo: "Conversa com cliente",
    resumo: "Chat realtime com um cliente — texto, foto, ações rápidas.",
    tourRole: "lojista",
  },
  "loja-receita": {
    path: "/loja/receita",
    titulo: "Receita incremental",
    resumo:
      "Quanto receita a BRAVA+ trouxe pra sua loja no período — separando clientes NOVOS de recorrentes.",
    objetivoRelatorio:
      "Provar ROI da BRAVA+: 'sem nós, esses clientes novos não teriam vindo'. Use no boardroom pra justificar continuidade.",
    calculos: [
      "Receita BRAVA+ = Σ pedidos com cupom BRAVA+",
      "Receita de novos = pedidos de clientes 1ª visita há ≤ 90 dias",
      "Receita recorrente = total − novos",
    ],
    tourRole: "lojista",
  },
  "loja-contabil": {
    path: "/loja/contabil",
    titulo: "Contábil / Extrato",
    resumo:
      "Exporta movimento financeiro pra contabilidade — CSV/PDF com cada operação detalhada.",
    objetivoRelatorio:
      "Fechamento mensal — sua contadora usa esse CSV pra contabilidade fiscal e conciliação bancária.",
    tourRole: "lojista",
  },
  "loja-saques": {
    path: "/loja/saques",
    titulo: "Saques",
    resumo:
      "Solicite saque do saldo BRAVA+ pra sua conta bancária via PIX (até 1 dia útil).",
    oQueFaz: [
      "Saldo disponível em destaque",
      "Histórico de saques (pendente / processado / pago)",
      "Botão 'Sacar' abre modal com valor",
    ],
    calculos: [
      "Saldo = Σ pedidos pagos − comissão BRAVA+ − saques anteriores",
      "Taxa de saque: R$ 0 (PIX gratuito até nova ordem)",
    ],
    tourRole: "lojista",
  },
  "loja-extornos": {
    path: "/loja/extornos",
    titulo: "Estornos solicitados",
    resumo:
      "Reembolsos pedidos por clientes. Aprove, recuse ou peça mais info.",
    tourRole: "lojista",
  },
  "loja-plano": {
    path: "/loja/plano",
    titulo: "Plano lojista",
    resumo:
      "Sua assinatura BRAVA+ pra lojista — Free / Pro / Premium. Pro libera blast ilimitado + BI avançado; Premium libera destaque pago.",
    calculos: [
      "Free: 1 cupom ativo + 0 blasts/mês — R$ 0",
      "Pro: cupons ilimitados + 4 blasts/mês + BI avançado — R$ 49/mês",
      "Premium: tudo do Pro + slot destaque + push ilimitado — R$ 149/mês",
    ],
    tourRole: "lojista",
  },
  "loja-onboarding": {
    path: "/loja/onboarding",
    titulo: "Onboarding do lojista",
    resumo:
      "Wizard de 5 passos pra você começar com tudo configurado: perfil → catálogo → cupom inicial → fidelidade → publicar.",
    tourRole: "lojista",
  },
  "loja-mais": {
    path: "/loja/mais",
    titulo: "Mais (menu mobile)",
    resumo: "Atalho mobile pras áreas que não cabem na bottom nav.",
    tourRole: "lojista",
  },

  /* ==================================================================
     ENTREGADOR — /entregador/*
     ================================================================== */
  "entregador-home": {
    path: "/entregador",
    titulo: "Painel do entregador",
    resumo:
      "Sua dashboard: ganhos do dia, pedidos disponíveis perto de você, status (online/offline) e atalho pra rota.",
    visual: <FluxoEntrega />,
    oQueFaz: [
      "Toggle online/offline (controla se você recebe pedido)",
      "KPIs: pedidos hoje, ganhos hoje, avaliação média",
      "Lista pedidos disponíveis perto (com mapa)",
      "Botão 'aceitar' pega o pedido (regra: 1 por vez)",
    ],
    calculos: [
      "Ganho/entrega = taxa_base + (distância_km × R$ 1,50)",
      "Pago direto na sua conta via PIX (saque diário ou semanal)",
    ],
    tourRole: "entregador",
  },
  "entregador-pendente": {
    path: "/entregador/pendente",
    titulo: "Cadastro em análise",
    resumo:
      "Seu cadastro está sendo analisado pelo admin BRAVA+. Aguarde aprovação pra começar a entregar (até 24h úteis).",
    oQueFaz: [
      "Status do cadastro (em análise / aprovado / recusado)",
      "Lista de documentos enviados",
      "Botão pra reenviar doc se algo voltou pendente",
    ],
    tourRole: "entregador",
  },
  "entregador-detalhe": {
    path: "/entregador/",
    titulo: "Detalhe do pedido",
    resumo:
      "Tudo sobre a entrega: loja (com WhatsApp), endereço entrega, mapa, código 4 dígitos pra entregar.",
    oQueFaz: [
      "Card da loja com endereço de retirada + WhatsApp",
      "Card do cliente com endereço destino",
      "Mapa Mapbox com rota otimizada",
      "Status: aceito → retirei → a caminho → entregue",
      "Código 4 dígitos pra cliente confirmar entrega",
    ],
    comoUsar: [
      "Confirme 'cheguei pra retirada' ao chegar na loja",
      "Toque 'retirei' depois de pegar o pedido",
      "Toque 'a caminho' ao sair pra entrega",
      "Peça código 4 dígitos do cliente e digite — fecha pedido + libera pagamento",
    ],
    dicas: [
      "Código errado = não fecha pedido — confirme com o cliente",
      "Se o cliente não atende, abra chat na tela do pedido",
    ],
    tourRole: "entregador",
  },
  "entregador-rota": {
    path: "/entregador/rota",
    titulo: "Otimizador de rota",
    resumo:
      "Quando você tem 2+ entregas, o sistema sugere a melhor ordem usando algoritmo de roteamento.",
    calculos: [
      "Heurística: vizinho mais próximo a partir da posição atual + janela de tempo",
      "Considera trânsito médio do horário (não tempo real ainda)",
    ],
    tourRole: "entregador",
  },

  /* ==================================================================
     ADMIN — /admin/*
     ================================================================== */
  "admin-home": {
    path: "/admin",
    titulo: "Dashboard Admin",
    resumo:
      "Visão geral do sistema BRAVA+: assinantes, MRR, estabelecimentos ativos, pedidos, churn e crescimento.",
    oQueFaz: [
      "4 KPIs no topo: users totais, estabs ativos, MRR, pedidos mês",
      "4 charts: signups 14d, distribuição de tier, estabs por categoria, top cupons",
      "Acesso rápido pra áreas críticas (decisões pendentes)",
    ],
    objetivoRelatorio:
      "Saúde geral do negócio em 30 segundos. Use de manhã pra ver se o dia anterior teve algo fora do padrão.",
    tourRole: "admin",
  },
  "admin-bi": {
    path: "/admin/bi",
    titulo: "BI avançado",
    resumo:
      "Análises profundas: cohort, LTV, funil de assinatura, distribuição geográfica, mapa de calor de check-ins.",
    objetivoRelatorio:
      "Decisões estratégicas: onde concentrar marketing, qual cohort tem melhor LTV, onde abrir parceiros novos.",
    calculos: [
      "LTV = ticket_médio × frequência_visitas × lifetime_estimado",
      "Churn mensal = users_inativos_30d / total_assinantes",
      "CAC = gastos_marketing / novos_assinantes_pagos",
    ],
    tourRole: "admin",
  },
  "admin-usuarios": {
    path: "/admin/usuarios",
    titulo: "Usuários",
    resumo:
      "Lista todos os assinantes — filtro por tier, status (ativo/cancelado), busca por email/nome.",
    oQueFaz: [
      "Tabela paginada (50/página)",
      "Filtros: role (subscriber/establishment/deliverer/admin), tier, status",
      "Busca textual por nome ou email",
      "Click abre detalhe completo do user",
    ],
    tourRole: "admin",
  },
  "admin-usuarios-detalhe": {
    path: "/admin/usuarios/",
    titulo: "360 do usuário",
    resumo:
      "Tudo sobre um usuário: assinatura, histórico de pedidos, visitas, coins, pagamentos, dispositivos, logs.",
    oQueFaz: [
      "Bloco identidade + tier + status",
      "Cards: visitas, pedidos, coins, indicações",
      "Timeline de atividade (logs)",
      "Ações: trocar tier, cancelar, reembolsar, banir, logar como (impersonation)",
    ],
    tourRole: "admin",
  },
  "admin-usuarios-novo": {
    path: "/admin/usuarios/novo",
    titulo: "Criar usuário manual",
    resumo:
      "Cadastra user manualmente (canal off, suporte, conta interna).",
    campos: [
      { nome: "Email", desc: "vira login", obrigatorio: true },
      { nome: "Nome completo", desc: "exibição", obrigatorio: true },
      { nome: "Role", desc: "subscriber / establishment / deliverer / admin", obrigatorio: true },
      { nome: "Tier inicial", desc: "Básico / Premium / VIP (se subscriber)" },
      { nome: "Senha provisória", desc: "user troca no primeiro login" },
    ],
    tourRole: "admin",
  },
  "admin-estabelecimentos": {
    path: "/admin/estabelecimentos",
    titulo: "Estabelecimentos",
    resumo:
      "Lista todos parceiros — filtro por categoria, status (ativo/pendente/bloqueado), busca.",
    oQueFaz: [
      "Tabela com nome, cidade, categoria, status, dono",
      "Filtro 'pendentes' pra aprovar cadastros novos",
      "Ações por linha: aprovar, bloquear, editar, ver 360",
    ],
    tourRole: "admin",
  },
  "admin-estabelecimento-detalhe": {
    path: "/admin/estabelecimentos/",
    titulo: "360 do estabelecimento",
    resumo:
      "Visão completa de um parceiro: dados, catálogo, cupons, fidelidade, pedidos, ganhos, equipe.",
    tourRole: "admin",
  },
  "admin-estabelecimento-novo": {
    path: "/admin/estabelecimentos/novo",
    titulo: "Cadastrar estabelecimento (admin)",
    resumo: "Cadastro manual de loja — útil quando lead veio off-platform.",
    campos: [
      { nome: "Razão social + CNPJ", desc: "auto-busca via ReceitaWS", obrigatorio: true },
      { nome: "Email do dono", desc: "cria conta + envia convite", obrigatorio: true },
      { nome: "Categoria principal", desc: "afeta filtros do app", obrigatorio: true },
      { nome: "Endereço", desc: "ViaCEP + complemento", obrigatorio: true },
    ],
    tourRole: "admin",
  },
  "admin-estabelecimento-operacao": {
    path: "/admin/estabelecimentos/",
    titulo: "Operação do estabelecimento",
    resumo:
      "KPIs operacionais de um parceiro: tempo médio aceite, atrasos, cancelamentos, NPS de clientes.",
    objetivoRelatorio:
      "Identificar parceiro com problema operacional (muito cancelamento, NPS caindo) e agir antes do churn dele.",
    tourRole: "admin",
  },
  "admin-entregadores": {
    path: "/admin/entregadores",
    titulo: "Entregadores",
    resumo:
      "Gestão da malha de entregadores — aprovar, bloquear, ver avaliação, histórico.",
    oQueFaz: [
      "Filtros: status (em análise / aprovado / bloqueado), online/offline",
      "Botão 'aprovar' libera entregas pra esse motoboy",
      "Click no entregador abre 360 com docs + entregas + avaliação",
    ],
    tourRole: "admin",
  },
  "admin-entregas": {
    path: "/admin/entregas",
    titulo: "Entregas (operacional)",
    resumo:
      "Monitor em tempo real de TODAS as entregas — útil pra ver gargalos e intervir quando trava.",
    objetivoRelatorio:
      "SLA operacional: identificar entregas paradas há muito tempo, intervir manualmente, escalar pra outro motoboy.",
    tourRole: "admin",
  },
  "admin-assinaturas": {
    path: "/admin/assinaturas",
    titulo: "Assinaturas",
    resumo:
      "Todas assinaturas ativas/canceladas, com filtro por tier e status.",
    objetivoRelatorio:
      "Acompanhar MRR + churn em tempo real. Quem cancelou esse mês? Por quê?",
    calculos: [
      "MRR = Σ (preço_tier × usuários_ativos)",
      "Churn mensal = cancelados_no_mês / ativos_início_mês",
    ],
    tourRole: "admin",
  },
  "admin-planos": {
    path: "/admin/planos",
    titulo: "Configurar planos",
    resumo:
      "Edita preço e benefícios dos 3 tiers (Básico / Premium / VIP).",
    campos: [
      { nome: "Nome do tier", desc: "ex: Premium", obrigatorio: true },
      { nome: "Preço mensal (R$)", desc: "cobrança recorrente Efí", obrigatorio: true },
      { nome: "Benefícios", desc: "lista de bullets exibida no /assinar" },
      { nome: "Multiplicador de cashback", desc: "1.0 = padrão; VIP costuma ser 2.0" },
    ],
    dicas: [
      "Mudar preço afeta SÓ novas assinaturas — antigos mantêm preço congelado",
    ],
    tourRole: "admin",
  },
  "admin-cupons": {
    path: "/admin/cupons",
    titulo: "Cupons (todos)",
    resumo:
      "Visão sistêmica de todos cupons criados por lojistas — ordenados por uso.",
    objetivoRelatorio:
      "Identificar cupons campeões pra inspirar outros lojistas; pegar abuso (uso anômalo) cedo.",
    tourRole: "admin",
  },
  "admin-categorias": {
    path: "/admin/categorias",
    titulo: "Categorias",
    resumo:
      "Gerencia as categorias usadas pelos estabelecimentos (restaurante, café, beleza, etc).",
    campos: [
      { nome: "Nome", desc: "ex: 'Restaurantes'", obrigatorio: true },
      { nome: "Slug", desc: "URL-friendly: 'restaurantes'", obrigatorio: true },
      { nome: "Ícone (emoji)", desc: "exibido nas chips" },
      { nome: "Ordem", desc: "menor = aparece primeiro" },
      { nome: "Ativa", desc: "ocultar sem deletar" },
    ],
    tourRole: "admin",
  },
  "admin-saques": {
    path: "/admin/saques",
    titulo: "Saques (lojistas + entregadores)",
    resumo:
      "Solicitações de saque pendentes — admin aprova → dispara PIX via Efí.",
    oQueFaz: [
      "Lista pendentes em destaque",
      "Histórico de saques aprovados (com comprovante PIX)",
      "Botão 'aprovar e pagar' executa transferência Efí direto",
    ],
    objetivoRelatorio:
      "SLA financeiro: meta é até 1 dia útil. Se pendentes > 24h, há gargalo de aprovação ou problema Efí.",
    tourRole: "admin",
  },
  "admin-extornos": {
    path: "/admin/extornos",
    titulo: "Estornos (admin)",
    resumo:
      "Reembolsos solicitados por clientes que precisam de decisão centralizada (lojista recusou ou caso complexo).",
    tourRole: "admin",
  },
  "admin-suporte": {
    path: "/admin/suporte",
    titulo: "Suporte (tickets)",
    resumo: "Tickets abertos por users/lojistas/entregadores — fila do time de suporte.",
    tourRole: "admin",
  },
  "admin-denuncias": {
    path: "/admin/denuncias",
    titulo: "Denúncias",
    resumo:
      "Denúncias de comportamento abusivo, fraude, conteúdo impróprio — moderar e tomar ação.",
    tourRole: "admin",
  },
  "admin-fraude": {
    path: "/admin/fraude",
    titulo: "Antifraude",
    resumo:
      "Padrões suspeitos detectados automaticamente: múltiplos IPs, uso anômalo de cupom, indicações em loop.",
    oQueFaz: [
      "Lista alertas por severidade",
      "Detalhe: regra acionada + evidência",
      "Ações: bloquear user, reverter cupom, isenção (falso positivo)",
    ],
    objetivoRelatorio:
      "Proteger margem: cupom abusado = prejuízo direto pro lojista. Detectar cedo evita escalada.",
    tourRole: "admin",
  },
  "admin-churn": {
    path: "/admin/churn",
    titulo: "Churn radar",
    resumo:
      "Identifica users com 0 check-in em 30 dias — base pra ação de retenção (push + cupom-bomba).",
    objetivoRelatorio:
      "Reduzir churn: agir ANTES do cancelamento. User inativo é candidato natural ao 'cancel' no próximo ciclo.",
    calculos: [
      "Risco = (dias_sem_atividade × 0.5) + (dias_até_cobrança × 0.3) − engajamento_30d",
      "Score 7+ = ação urgente (cupom-bomba)",
    ],
    tourRole: "admin",
  },
  "admin-afiliados": {
    path: "/admin/afiliados",
    titulo: "Afiliados / Indicações",
    resumo:
      "Programa de indicação: quem indicou quem, quanto pagamos em recompensa, fraude potencial.",
    objetivoRelatorio:
      "Validar ROI do indique-e-ganhe vs. CAC marketing pago. Identificar 'super-promotores' pra cuidar.",
    tourRole: "admin",
  },
  "admin-b2b": {
    path: "/admin/b2b",
    titulo: "BRAVA+ Empresas (B2B)",
    resumo:
      "Pacote corporativo: RH de empresa contrata BRAVA+ como benefício pros colaboradores.",
    oQueFaz: [
      "Lista empresas-cliente (com qtd usuários)",
      "Faturamento por empresa",
      "Cadastrar nova empresa",
    ],
    objetivoRelatorio:
      "LTV brutal — 1 empresa de 100 colab vale 100 assinantes individuais sem CAC unitário.",
    tourRole: "admin",
  },
  "admin-pacotes": {
    path: "/admin/pacotes",
    titulo: "Pacotes promocionais",
    resumo:
      "Combos curados que aparecem como destaque no app — agrupa produtos/serviços de N parceiros.",
    tourRole: "admin",
  },
  "admin-pacote-detalhe": {
    path: "/admin/pacotes/",
    titulo: "Detalhe do pacote",
    resumo: "Edita itens, preço e validade de um pacote promocional.",
    tourRole: "admin",
  },
  "admin-listas": {
    path: "/admin/listas",
    titulo: "Listas curadas",
    resumo:
      "Coleções temáticas exibidas no app (ex: 'Top hambúrguers SP', 'Pet-friendly em Pinheiros').",
    tourRole: "admin",
  },
  "admin-lista-detalhe": {
    path: "/admin/listas/",
    titulo: "Detalhe da lista",
    resumo: "Adicionar/remover estabelecimentos da lista, alterar cover.",
    tourRole: "admin",
  },
  "admin-slots": {
    path: "/admin/slots",
    titulo: "Slots de destaque (monetização)",
    resumo:
      "Lojistas pagam pra aparecer no topo da categoria/região. Aqui você gerencia disponibilidade e preço.",
    campos: [
      { nome: "Categoria/região", desc: "escopo do slot", obrigatorio: true },
      { nome: "Preço/semana (R$)", desc: "cobrança Efí recorrente", obrigatorio: true },
      { nome: "Limite simultâneo", desc: "quantos lojistas dividem o slot" },
    ],
    objetivoRelatorio:
      "Receita não-mensalidade: slot é receita pura com margem alta. Acompanhe ocupação por região.",
    tourRole: "admin",
  },
  "admin-desafios": {
    path: "/admin/desafios",
    titulo: "Desafios (engajamento)",
    resumo:
      "Cria desafios mensais que aparecem no app pro user (ex: 'visite 3 parceiros novos' = 100 coins).",
    campos: [
      { nome: "Título", desc: "curto + chamativo", obrigatorio: true },
      { nome: "Meta", desc: "qtd ações pra completar", obrigatorio: true },
      { nome: "Ação trackada", desc: "check-in / cupom resgatado / pedido feito", obrigatorio: true },
      { nome: "Recompensa", desc: "qtd de BRAVA Coins", obrigatorio: true },
      { nome: "Validade", desc: "data limite" },
    ],
    tourRole: "admin",
  },
  "admin-menu": {
    path: "/admin/menu",
    titulo: "Menu admin completo",
    resumo: "Atalho mobile pra todas as áreas administrativas.",
    tourRole: "admin",
  },
};
