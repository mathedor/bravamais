import type { TourStep } from "./tour-modal";

/* ============================================================
   USUÁRIO / ASSINANTE
   ============================================================ */
export const USUARIO_TOUR: TourStep[] = [
  {
    emoji: "🎉",
    eyebrow: "bem-vindo",
    titulo: "Bem-vindo ao BRAVA+!",
    subtitulo: "Sua assinatura agora vale ouro.",
    descricao:
      "Você paga mensalidade fixa e ganha cupons, prêmios e cashback em centenas de parceiros. Esse tour mostra como tirar o máximo proveito em 5 minutos.",
    pontos: [
      "🏠 Início: estabelecimentos perto de você + cupons em destaque",
      "🔎 Buscar: filtre por categoria, tipo de promoção e distância",
      "💳 Carteirinha QR: apresente em qualquer parceiro pra registrar visita",
      "💰 Carteira: cupons + BRAVA Coins + vale-presentes num lugar só",
    ],
  },
  {
    emoji: "💳",
    eyebrow: "★ feature principal",
    titulo: "Sua carteirinha QR",
    subtitulo: "Identidade BRAVA+ em qualquer parceiro",
    descricao:
      "Toque no botão amarelo CENTRAL da bottom nav pra abrir a carteirinha. Apresente o QR pro lojista no caixa — ele lê e você ganha:\n\n• +1 visita no clube de fidelidade dele\n• +5 BRAVA Coins (cashback interno)",
    pontos: [
      "QR rotaciona a cada 60s (segurança contra screenshot)",
      "Funciona offline — leu uma vez e fica no app",
      "Tier do plano (Básico/Premium/VIP) destacado no card",
    ],
    ctaHref: "/app/carteirinha",
    ctaLabel: "Ver minha carteirinha",
  },
  {
    emoji: "🎟️",
    eyebrow: "valor de verdade",
    titulo: "Cupons direcionados ao seu tier",
    subtitulo: "Premium e VIP veem cupons mais agressivos",
    descricao:
      "Cada cupom tem um tier mínimo. Você só vê os do SEU tier ou abaixo. Quanto mais alto o plano, melhor o cupom — % maior, marcas mais exclusivas.",
    pontos: [
      "Toque no cupom pra resgatar — vai pra sua carteira",
      "No checkout, escolha qual aplicar (1 por pedido)",
      "Cupom expirado some da home, fica no histórico",
    ],
    ctaHref: "/app/cupons",
    ctaLabel: "Ver meus cupons",
  },
  {
    emoji: "⭐",
    eyebrow: "fidelidade que premia",
    titulo: "Clubes de fidelidade",
    subtitulo: "Cada visita conta — complete e ganhe",
    descricao:
      "Cada parceiro tem seu clube: X visitas (definido por ele) = um prêmio. Sua carteirinha registra automaticamente quando o lojista lê o QR. Acompanhe progresso em /app/fidelidade.",
    pontos: [
      "Sem ficar carregando carteirinha papel ou app de cada loja",
      "Prêmio liberado vira código alfanumérico curto pra apresentar",
      "Recompensas disponíveis ficam em destaque amarelo",
    ],
    ctaHref: "/app/fidelidade",
    ctaLabel: "Meus clubes",
  },
  {
    emoji: "🪙",
    eyebrow: "cashback interno",
    titulo: "BRAVA Coins",
    subtitulo: "Acumula sozinho — use no checkout",
    descricao:
      "Toda interação que você faz com o BRAVA+ gera coins:\n\n• +5 coins por check-in (QR lido)\n• +10 coins por cupom resgatado\n• +1% do valor do pedido\n\n100 coins = R$ 1,00 abater em qualquer compra.",
    pontos: [
      "Saldo visível na Carteira (/app/carteira)",
      "VIP recebe DOBRO de coins em todas ações",
      "Sem expiração",
    ],
    ctaHref: "/app/carteira",
    ctaLabel: "Ver minha carteira",
  },
  {
    emoji: "🤝",
    eyebrow: "ganhe indicando",
    titulo: "Indique e ganhe",
    subtitulo: "Convide amigos — ambos ganham",
    descricao:
      "Compartilhe seu link único de indicação. Quando o amigo assina, vocês DOIS ganham:\n\n• 1 mês grátis no plano atual OU\n• 50 BRAVA Coins (escolha dele)\n\nPagamento liberado depois que ele paga a 1ª mensalidade (anti-fraude).",
    ctaHref: "/app/indique",
    ctaLabel: "Pegar meu link",
  },
  {
    emoji: "📍",
    eyebrow: "killer feature",
    titulo: "Push de proximidade",
    subtitulo: "Notif quando passa perto de promo",
    descricao:
      "Se você autoriza localização em background, o app te avisa quando você está a menos de 500m de um parceiro com cupom ativo. Excelente pra capturar oportunidades enquanto anda na rua.",
    pontos: [
      "Configure em /app/notificacoes",
      "Pode silenciar à noite (não envia 22h-7h)",
      "Funciona com app fechado (push OneSignal)",
    ],
  },
  {
    emoji: "🛵",
    eyebrow: "pedir online",
    titulo: "Comprar pelo BRAVA+",
    subtitulo: "Pague com PIX ou cartão — receba cashback",
    descricao:
      "Direto no 360 do parceiro: catálogo com produtos, escolhe, paga PIX/cartão. Pode aplicar cupom + BRAVA coins no checkout. Cashback (1%) crédita após confirmação do pedido.",
    pontos: [
      "Se a loja faz delivery, acompanha entregador no mapa em tempo real",
      "Código 4 dígitos pra confirmar entrega",
      "Estorno em 7 dias úteis se algo der errado",
    ],
  },
  {
    emoji: "♻️",
    eyebrow: "★★ não pode perder",
    titulo: "Benefícios Renováveis",
    subtitulo: "Cada loja te dá um mimo — mas tem que usar!",
    descricao:
      "Cada parceiro que você curte te dá um benefício exclusivo (desconto ou vale-compras). Mas atenção: NÃO ACUMULA! Você tem 1 benefício ativo de cada loja por vez. Se não usar até a data de renovação, ele expira e você recebe outro automaticamente. Então use enquanto está valendo!",
    pontos: [
      "Cada loja te dá um benefício (% off ou R$ em compras)",
      "Vem com arte bonita + a logo da loja",
      "NÃO ACUMULA — usou ou perdeu",
      "Renova sozinho: perdeu um, ganha outro automaticamente",
      "Você é avisado por notificação toda vez que ganha",
    ],
    ctaHref: "/app/beneficios",
    ctaLabel: "Ver meus benefícios",
  },
  {
    emoji: "💰",
    eyebrow: "★ novidade — sunk cost smart",
    titulo: "BRAVA Wallet (recarga com bônus)",
    subtitulo: "Deposita uma vez, ganha bônus, usa como dinheiro",
    descricao:
      "Recarregue valores pré-definidos e ganhe bônus na hora (até 25% sobre o depósito). Use o saldo em qualquer parceiro como se fosse dinheiro. Quanto maior o pack, melhor o bônus.",
    pontos: [
      "R$ 100 + R$ 10 bônus (10%)",
      "R$ 500 + R$ 100 bônus (20%)",
      "R$ 1000 + R$ 250 bônus (25%)",
      "Saldo nunca expira.",
    ],
    ctaHref: "/app/wallet",
    ctaLabel: "Conhecer Wallet",
  },
  {
    emoji: "🎉",
    eyebrow: "★ novidade — grupo",
    titulo: "Rolês em grupo",
    subtitulo: "Combine com amigos, todos ganham bônus",
    descricao:
      "Crie um rolê (parceiro + horário), convide amigos, todos veem cupons compartilhados e ganham bônus por ir juntos.",
    ctaHref: "/app/grupos",
    ctaLabel: "Criar rolê",
  },
  {
    emoji: "🚪",
    eyebrow: "★ novidade — heads up",
    titulo: "Vou aí agora",
    subtitulo: "Avise que está chegando — receba cortesia",
    descricao:
      "Antes de chegar num parceiro, avise pelo app. Lojista se prepara (mesa, fila), e alguns têm cortesia automática pra você (bebida, sobremesa).",
    ctaHref: "/app/vou-ai",
    ctaLabel: "Como funciona",
  },
  {
    emoji: "✨",
    eyebrow: "personalizado",
    titulo: "Recomendado pra você",
    subtitulo: "Engine sabe o que você gosta + horário do dia",
    descricao:
      "Lista personalizada baseada nas suas visitas e no momento do dia. Almoço sugere restaurante, noite sugere bar, manhã sugere café. Quanto mais usa, melhor a recomendação.",
    ctaHref: "/app/recomendados",
    ctaLabel: "Ver minhas recomendações",
  },
  {
    emoji: "🥇",
    eyebrow: "gamification",
    titulo: "Badges de explorador",
    subtitulo: "Visite, conquiste, ganhe coins",
    descricao:
      "Visite categorias diferentes, bairros, parceiros novos — desbloqueia badges e ganha BRAVA Coins extras. Tipo missões de RPG, mas na vida real.",
    ctaHref: "/app/badges",
    ctaLabel: "Ver conquistas",
  },
  {
    emoji: "📓",
    eyebrow: "diário pessoal",
    titulo: "Notas privadas em cada parceiro",
    subtitulo: "Anote o que quiser lembrar",
    descricao:
      "'Pedir o X de novo', 'evitar mesa 3', 'aniversariou aqui'. Privado — só você vê. Útil pra não esquecer recomendações pra você mesmo.",
    ctaHref: "/app/notas",
    ctaLabel: "Minhas notas",
  },
  {
    emoji: "💝",
    eyebrow: "presente",
    titulo: "Cupom-presente pra um amigo",
    subtitulo: "Mande desconto da sua loja favorita",
    descricao:
      "Crie cupom da sua loja favorita pra presentear amigo. Ele recebe email com código, usa, fica feliz. Forma carinhosa de indicar.",
    ctaHref: "/app/presente-pessoal",
    ctaLabel: "Enviar presente",
  },
  {
    emoji: "⏳",
    eyebrow: "★ novidade — fila virtual",
    titulo: "Lista de espera digital",
    subtitulo: "Restaurante cheio? Entre na fila pelo app",
    descricao:
      "Em vez de esperar em pé na porta, entre na fila virtual. Receba push quando chegar sua vez. Aproveite pra dar uma volta.",
    ctaHref: "/app/lista-espera",
    ctaLabel: "Minhas filas",
  },
  {
    emoji: "🎓",
    eyebrow: "ajuda sempre disponível",
    titulo: "Ajuda em CADA tela",
    subtitulo: "Botão 'Como eu utilizo essa área?'",
    descricao:
      "Em todas as telas do BRAVA+ tem um botão discreto no topo: 'Como eu utilizo essa área?'. Clique e abre uma tarja lateral com mini-tutorial específico daquela tela.\n\nNo rodapé da tarja sempre tem o botão pra reabrir esse tour completo. Você nunca está sozinho.",
    pontos: [
      "Mini-help = explica a tela atual",
      "Tour completo = visão geral do seu perfil (esse aqui)",
      "Acesse o tour a qualquer momento pelo menu do seu usuário",
    ],
  },
  {
    emoji: "🚀",
    eyebrow: "bora aproveitar",
    titulo: "Tudo pronto!",
    subtitulo: "Bem-vindo ao clube.",
    descricao:
      "Próximas ações sugeridas:\n\n1. Procure parceiros perto (/app/buscar)\n2. Resgate seu primeiro cupom\n3. Apresente a carteirinha na próxima visita\n4. Considere recarregar a Wallet pra ganhar bônus\n\nQualquer dúvida, abra suporte em /app/suporte.",
  },
];

/* ============================================================
   LOJISTA / ESTABELECIMENTO
   ============================================================ */
export const LOJISTA_TOUR: TourStep[] = [
  {
    emoji: "🏪",
    eyebrow: "bem-vindo lojista",
    titulo: "Bem-vindo ao painel BRAVA+",
    subtitulo: "Clientes recorrentes em automático.",
    descricao:
      "Você acabou de entrar pra rede de parceiros BRAVA+. Esse tour mostra como configurar tudo em 10 minutos e começar a receber clientes assinantes ainda hoje.",
    pontos: [
      "🏠 Início: KPIs + últimos pedidos + visitas",
      "📸 Perfil: identidade visual que aparece no app",
      "🛒 Catálogo: produtos vendidos via PIX/cartão",
      "🎟️ Cupons + Fidelidade: as duas grandes alavancas",
    ],
  },
  {
    emoji: "📸",
    eyebrow: "★ comece aqui",
    titulo: "Configure seu perfil",
    subtitulo: "É o cartão de visita no app",
    descricao:
      "Capriche nas fotos (até 3) — elas aparecem no hero do 360 da sua loja. Logo, descrição e categoria correta = mais cliques. Endereço é usado pra busca por proximidade.",
    pontos: [
      "Fotos: 1200×800px, boa iluminação, ângulos variados",
      "Descrição: 2-3 parágrafos contando sua história",
      "Categoria: escolha a principal — afeta filtros do app",
      "Horários: deixe atualizado — gera confiança",
    ],
    ctaHref: "/loja/perfil",
    ctaLabel: "Editar perfil",
  },
  {
    emoji: "🛒",
    eyebrow: "monetização direta",
    titulo: "Cadastre seu catálogo",
    subtitulo: "Venda direto pelo app com pagamento integrado",
    descricao:
      "Cliente compra dentro do BRAVA+, paga PIX ou cartão. Dinheiro cai na sua conta (saque PIX em 1 dia útil). Sua taxa é só a do gateway (≈1% PIX / 3.5% cartão) + comissão BRAVA+ (variável).",
    pontos: [
      "Cada produto: nome, preço, descrição, foto, estoque opcional",
      "Estoque zerado oculta o produto automaticamente",
      "Pausar produto sem deletar — útil pra sazonalidade",
    ],
    ctaHref: "/loja/catalogo",
    ctaLabel: "Adicionar produto",
  },
  {
    emoji: "🎟️",
    eyebrow: "atração de cliente novo",
    titulo: "Cupons direcionados por tier",
    subtitulo: "% ou R$ off — limite uso por cliente",
    descricao:
      "Crie cupons % ou R$. Configure validade, estoque total, tier mínimo (Básico/Premium/VIP), pedido mínimo. Cliente resgata, aparece na carteira dele, apresenta no caixa via QR.",
    pontos: [
      "Cupons direcionados a VIP rendem 3x mais — usuários engajados",
      "Pedido mínimo evita que cupom queime ticket",
      "Sistema controla estoque automaticamente",
    ],
    ctaHref: "/loja/cupons",
    ctaLabel: "Criar primeiro cupom",
  },
  {
    emoji: "⭐",
    eyebrow: "fidelidade gera recorrência",
    titulo: "Clube de fidelidade",
    subtitulo: "X visitas = prêmio",
    descricao:
      "Configure UMA regra de fidelidade simples: 'X visitas = Y prêmio'. Cada vez que você lê o QR do cliente no scanner, ele soma +1. Quando bate a meta, libera prêmio dele (código alfanumérico que ele apresenta).",
    pontos: [
      "Comece com 5-10 visitas — fácil de bater",
      "Aumente depois que tiver base recorrente",
      "Prêmio: café grátis, sobremesa, desconto, brinde — vc decide",
    ],
    ctaHref: "/loja/fidelidade",
    ctaLabel: "Configurar fidelidade",
  },
  {
    emoji: "📷",
    eyebrow: "operação diária",
    titulo: "Leitor QR no caixa",
    subtitulo: "Câmera do navegador — sem app extra",
    descricao:
      "No caixa, abra /loja/qr-scanner em tablet ou celular. Aponta pra carteirinha do cliente e BIPA. Registra visita + soma fidelidade. Fallback: digitar código manual.",
    pontos: [
      "Funciona em qualquer celular/tablet com câmera (HTTPS exigido)",
      "Tempo: <2 segundos por leitura",
      "Sem treinamento — equipe usa em 1 dia",
    ],
    ctaHref: "/loja/qr-scanner",
    ctaLabel: "Abrir scanner",
  },
  {
    emoji: "💥",
    eyebrow: "★ promo flash",
    titulo: "Promo Blast (hora vazia)",
    subtitulo: "Encha a casa em 1 clique",
    descricao:
      "Domingo à tarde tá vazio? Cria blast: % desconto + validade 2-6h. Sistema dispara push pros clientes que JÁ visitaram nos últimos 90 dias, dentro do raio configurado. Conversão alta — base já te conhece.",
    pontos: [
      "20-50% off é faixa que funciona",
      "Curta validade (2-6h) gera urgência",
      "Você vê em tempo real quantos abriram + quantos resgataram",
    ],
    ctaHref: "/loja/blast",
    ctaLabel: "Fazer um blast",
  },
  {
    emoji: "👥",
    eyebrow: "CRM mini integrado",
    titulo: "Seu top 50 clientes",
    subtitulo: "Atue antes do churn",
    descricao:
      "Em /loja/clientes você vê ranking dos clientes que mais visitam. Ticket médio, último check-in, dias inativo. Marque os top como 'Embaixadores' (cupons VIP). Quem sumiu há +30 dias merece cupom-bomba.",
    ctaHref: "/loja/clientes",
    ctaLabel: "Ver meus clientes",
  },
  {
    emoji: "🛵",
    eyebrow: "delivery sem frota",
    titulo: "Entregas via motoboy BRAVA+",
    subtitulo: "Use a malha — sem custo fixo",
    descricao:
      "Ative delivery em /loja/entrega. Configure raio, taxa, tempo médio. BRAVA+ chama motoboy freelancer da malha quando rola pedido. Cliente acompanha entregador em tempo real. Código 4 dígitos confirma entrega.",
    pontos: [
      "Você não tem frota fixa — só paga frete por entrega",
      "Frete sugerido: taxa_base + R$ 1,50/km",
      "Entregador é avaliado — quem dá problema é bloqueado",
    ],
    ctaHref: "/loja/entrega",
    ctaLabel: "Configurar delivery",
  },
  {
    emoji: "💰",
    eyebrow: "financeiro",
    titulo: "Saques + Contábil",
    subtitulo: "Dinheiro na sua conta em 1 dia útil",
    descricao:
      "Saldo acumulado em /loja/saques. Toque 'Sacar' → PIX cai na sua conta cadastrada em até 1 dia útil. Em /loja/contabil você exporta CSV/PDF de movimento mensal pra contadora.",
    pontos: [
      "Taxa de saque: R$ 0 (PIX gratuito até nova ordem)",
      "Sem mínimo de saque",
      "CSV pronto pra ContaAzul, Tiny, Bling",
    ],
    ctaHref: "/loja/saques",
    ctaLabel: "Ver saldo",
  },
  {
    emoji: "📊",
    eyebrow: "prova de ROI",
    titulo: "Receita incremental",
    subtitulo: "Quanto a BRAVA+ trouxe pra você",
    descricao:
      "Em /loja/receita você vê quanto da sua receita do mês veio via BRAVA+, separado por CLIENTES NOVOS vs. recorrentes. Use no boardroom pra justificar continuidade.",
    ctaHref: "/loja/receita",
    ctaLabel: "Ver receita BRAVA+",
  },
  {
    emoji: "🎓",
    eyebrow: "ajuda em toda tela",
    titulo: "Botão 'Como utilizo?' sempre presente",
    subtitulo: "Mini-help por tela + tour completo no menu",
    descricao:
      "No topo de cada tela do painel tem o botão 'Como eu utilizo essa área?'. Clique e abre tarja lateral com mini-tutorial daquela tela. Tem botão de reabrir esse tour completo no rodapé da tarja também.",
  },
  {
    emoji: "🧰",
    eyebrow: "★★ NOVO — escolha suas ferramentas",
    titulo: "Plano modular: você escolhe o que paga",
    subtitulo: "Acabaram os 3 planos engessados — agora é à la carte",
    descricao:
      "Base de R$ 49/mês inclui o essencial (perfil, catálogo, QR, 1 cupom, 1 benefício renovável, chat). Daí você ativa SÓ as ferramentas que vai usar — cada uma com seu preço. Pra remover, abre um pedido pro nosso time (evita liga/desliga abusivo). Ferramentas não-contratadas SOMEM do menu (sem poluição visual).",
    pontos: [
      "Base R$ 49: perfil + catálogo + QR + 1 cupom + 1 benefício + chat",
      "Cada ferramenta extra: você ativa em 1 clique, cobra pro-rata",
      "Pra remover: abre ticket pro admin (resposta rápida no chat)",
      "Sidebar e menu só mostram o que tu contratou",
      "Total atualizado em tempo real em /loja/minhas-ferramentas",
    ],
    ctaHref: "/loja/minhas-ferramentas",
    ctaLabel: "Ver minhas ferramentas",
  },
  {
    emoji: "♻️",
    eyebrow: "★★ OBRIGATÓRIO — o segredo do sucesso",
    titulo: "Benefício Renovável",
    subtitulo: "Toda loja PRECISA ter uma promoção ativa",
    descricao:
      "Promoção é o que traz cliente de volta. Por isso é OBRIGATÓRIO: você configura um benefício (cupom % off OU vale-compras R$) que o sistema entrega automaticamente pros membros. A cada X dias renova sozinho. NÃO ACUMULA — o cliente que não usar perde e recebe outro. Isso cria urgência e fideliza.",
    pontos: [
      "Cupom de desconto (ex: 20% off) OU vale-compras (ex: R$ 15)",
      "Você define a cada quantos dias renova (30 = mensal)",
      "Arte bonita gerada automaticamente com a SUA logo",
      "Não-acumulativo = urgência = cliente volta",
      "Sem ele, sua loja perde destaque no app (alerta vermelho no painel)",
    ],
    ctaHref: "/loja/beneficio-renovavel",
    ctaLabel: "Configurar agora (obrigatório)",
  },
  {
    emoji: "🪑",
    eyebrow: "★ novidade — operação",
    titulo: "Mesa QR + Display cozinha",
    subtitulo: "Pedido na mesa sem garçom, cozinha recebe na TV",
    descricao:
      "Cliente escaneia QR na mesa → pede e paga direto pelo BRAVA+ → cozinha recebe automaticamente em /loja/kitchen (TV/tablet). Reduz custo, aumenta ticket, gera dados.",
    ctaHref: "/loja/mesa-qr",
    ctaLabel: "Criar minha 1ª mesa QR",
  },
  {
    emoji: "📊",
    eyebrow: "★ novidade — moat de dados",
    titulo: "Comparativo anônimo",
    subtitulo: "Como sua loja está vs média da região",
    descricao:
      "Ver dados agregados (NUNCA expomos quem é quem) da sua categoria + cidade. Você sabe se está acima ou abaixo da média. Sugestões automáticas pra fechar o gap.",
    ctaHref: "/loja/comparativo",
    ctaLabel: "Ver meu benchmark",
  },
  {
    emoji: "🤝",
    eyebrow: "★ novidade — network",
    titulo: "Parcerias com vizinhos",
    subtitulo: "Combos com outras lojas, ticket sobe pros dois",
    descricao:
      "Crie combos cruzados com lojas vizinhas. 'Café + Padaria = combo R$ 20, split 50/50'. Você dobra audiência sem aumentar custo de aquisição.",
    ctaHref: "/loja/parcerias",
    ctaLabel: "Propor parceria",
  },
  {
    emoji: "🧪",
    eyebrow: "★ novidade — decisão data-driven",
    titulo: "A/B test de cupons em 1 clique",
    subtitulo: "Sem precisar ser analista pra testar",
    descricao:
      "Configure duas variantes (% off vs R$ off, 7d vs 30d, etc), sistema divide aleatoriamente entre clientes, em 48h você vê qual venceu.",
    ctaHref: "/loja/ab-test",
    ctaLabel: "Criar primeiro teste",
  },
  {
    emoji: "📅",
    eyebrow: "organização",
    titulo: "Calendário de promo",
    subtitulo: "Veja em 1 tela todas as campanhas que vem",
    descricao:
      "Evite choque de promo. Programa campanhas (cupom, blast, roleta) e visualiza tudo em 1 calendário. Sazonalidades sugeridas automaticamente (Festa Junina, Black Friday).",
    ctaHref: "/loja/calendario",
    ctaLabel: "Ver calendário",
  },
  {
    emoji: "🤖",
    eyebrow: "atendimento",
    titulo: "Auto-resposta no chat (bot)",
    subtitulo: "Bot responde dúvidas frequentes",
    descricao:
      "Configure pares 'palavra-chave → resposta'. Cliente pergunta 'até que horas?' → bot responde com sua resposta padrão. Atendente só intervém em casos complexos.",
    ctaHref: "/loja/chat-bot",
    ctaLabel: "Criar regras de bot",
  },
  {
    emoji: "🛒",
    eyebrow: "ticket sobe",
    titulo: "Cross-sell no recibo",
    subtitulo: "Cliente comprou X → recibo já vem com cupom de Y",
    descricao:
      "Após pagamento, recibo digital traz cupom pra outro produto seu ('comeu prato? leva sobremesa 20% off, só hoje'). Ticket médio sobe sem pressão.",
    ctaHref: "/loja/cross-sell",
    ctaLabel: "Configurar cross-sell",
  },
  {
    emoji: "🚪",
    eyebrow: "★ novidade — WOW",
    titulo: "Vou aí — recebimento + cortesia",
    subtitulo: "Receba clientes antes de chegarem",
    descricao:
      "Cliente avisa que vem aí, você vê em tempo real. Configure cortesia automática (café cortesia, sobremesa) — surpreende sem custar muito.",
    ctaHref: "/loja/vou-ai",
    ctaLabel: "Configurar cortesias",
  },
  {
    emoji: "⏳",
    eyebrow: "★ novidade — fila virtual",
    titulo: "Lista de espera digital",
    subtitulo: "Fila virtual em vez de pessoas na porta",
    descricao:
      "Cliente entra na fila pelo app. Você chama com 1 toque, ele recebe push. Sem mais gritar nome.",
    ctaHref: "/loja/lista-espera",
    ctaLabel: "Painel de fila",
  },
  {
    emoji: "📧",
    eyebrow: "★ novidade — financeiro auto",
    titulo: "Backup CFO automático",
    subtitulo: "Email semanal/mensal pra sua contadora",
    descricao:
      "Configure email + frequência. BRAVA+ envia automaticamente resumo financeiro + CSV. Sem precisar lembrar de exportar.",
    ctaHref: "/loja/cfo-backup",
    ctaLabel: "Configurar agora",
  },
  {
    emoji: "🎓",
    eyebrow: "★ novidade — treinamento",
    titulo: "Vídeos in-app de treinamento",
    subtitulo: "Pra você e funcionários novos",
    descricao:
      "Biblioteca de vídeos curtos (60-90s) explicando cada feature. Mostra pro funcionário novo no dia 1 — economiza horas de tutorial.",
    ctaHref: "/loja/treinamento",
    ctaLabel: "Ver vídeos",
  },
  {
    emoji: "🚀",
    eyebrow: "primeiros 7 dias",
    titulo: "Plano de 1ª semana atualizado",
    subtitulo: "Use as ferramentas novas pra acelerar",
    descricao:
      "1. Termine perfil + cadastre catálogo\n2. Crie 1 cupom de boas-vindas\n3. Configure fidelidade (10 visitas = brinde)\n4. Configure 1 mesa QR (mesmo que só pra testar)\n5. Cadastre 3 regras de auto-resposta no chat\n6. Configure 1 regra de cortesia 'Vou aí'\n7. Configure backup CFO automático\n8. Veja o comparativo regional pra entender onde você está\n\nDúvida? /loja/treinamento tem vídeos curtos.",
  },
];

/* ============================================================
   ENTREGADOR
   ============================================================ */
export const ENTREGADOR_TOUR: TourStep[] = [
  {
    emoji: "🛵",
    eyebrow: "bem-vindo entregador",
    titulo: "Bem-vindo à malha BRAVA+",
    subtitulo: "Sua moto, seu horário, seu ganho.",
    descricao:
      "Você é freelancer da malha BRAVA+. Quando está online, recebe oferta de entregas perto de você. Aceita o que quiser, ganho cai no PIX. Sem mensalidade, sem meta forçada.",
    pontos: [
      "Toggle online/offline controla se você recebe oferta",
      "Você escolhe quais aceitar (raio + ganho exibidos)",
      "Pagamento por entrega: taxa_base + R$ 1,50/km",
    ],
  },
  {
    emoji: "✅",
    eyebrow: "primeira coisa",
    titulo: "Cadastro aprovado",
    subtitulo: "Confira em /entregador/pendente",
    descricao:
      "Se você acabou de se cadastrar, o admin tem até 24h úteis pra aprovar (valida CNH, MEI, foto da moto). Você só fica online APÓS aprovação. Doc faltando? A tela pendente mostra o que reenviar.",
    ctaHref: "/entregador/pendente",
    ctaLabel: "Status do cadastro",
  },
  {
    emoji: "🟢",
    eyebrow: "ficar disponível",
    titulo: "Toggle online no header",
    subtitulo: "Verde = recebe oferta",
    descricao:
      "No topo do app tem o toggle online/offline. Verde = está disponível pra receber oferta. Quando você aceita uma entrega, fica BUSY automaticamente (não recebe outra simultânea).",
    pontos: [
      "Você pode ficar offline a qualquer hora (sem penalidade)",
      "Sistema valida que GPS está ligado quando online",
      "Bateria fraca? Apague — não receber e perder é pior",
    ],
  },
  {
    emoji: "📦",
    eyebrow: "fluxo da entrega",
    titulo: "Aceitar → Retirar → Entregar",
    subtitulo: "4 toques no app, do início ao fim",
    descricao:
      "1. Oferta chega — você vê endereço da loja, do cliente e ganho. Aceita ou rejeita.\n2. Vai até a loja, toca 'retirei' depois de pegar pedido.\n3. Toca 'a caminho' ao sair pra entrega.\n4. Cliente fala código de 4 dígitos, você digita — fecha pedido.",
    pontos: [
      "Código errado = pedido NÃO fecha — confirme com cliente",
      "Cliente sumiu? Chat com loja na própria tela do pedido",
      "Em emergência, suporte BRAVA+ via chat (header)",
    ],
  },
  {
    emoji: "🗺️",
    eyebrow: "otimização",
    titulo: "Rota com 2+ entregas",
    subtitulo: "Sistema sugere a ordem mais rápida",
    descricao:
      "Se você aceitar 2+ entregas ao mesmo tempo (só rola se forem na mesma rota), o sistema usa algoritmo de vizinho mais próximo pra sugerir ordem. Você pode aceitar a sugestão ou reordenar manualmente.",
    ctaHref: "/entregador/rota",
    ctaLabel: "Ver tela de rota",
  },
  {
    emoji: "💰",
    eyebrow: "pagamento",
    titulo: "PIX diário ou semanal",
    subtitulo: "Você escolhe a frequência de saque",
    descricao:
      "No fim de cada entrega, ganho crédita no seu saldo BRAVA+. Configure preferência de saque (diário ou semanal) — PIX cai na sua conta cadastrada automaticamente. Sem taxa.",
    calculos: [
      "Ganho por entrega = taxa_base (R$ 6,00) + (distância_km × R$ 1,50)",
      "Bônus de pico de demanda em horário/região quente (2x ganho)",
    ],
  },
  {
    emoji: "⭐",
    eyebrow: "reputação importa",
    titulo: "Avaliação do cliente + loja",
    subtitulo: "Mantenha 4.5+ pra prioridade",
    descricao:
      "Cliente avalia entrega de 1-5 ⭐. Loja também avalia (tempo no balcão, postura). Sua média afeta:\n\n• Prioridade nas ofertas (4.7+ recebe antes)\n• Bônus mensal (top 10% ganha extra)\n• Risco de bloqueio (<3.5 = avaliação interna)",
  },
  {
    emoji: "🎓",
    eyebrow: "ajuda sempre",
    titulo: "Mini-help em cada tela",
    subtitulo: "Botão 'Como eu utilizo?'",
    descricao:
      "Em cada tela tem o botão 'Como eu utilizo essa área?'. Clique e abre tarja lateral com explicação. Esse tour completo pode ser reaberto a qualquer hora pelo menu.",
  },
  {
    emoji: "🚀",
    eyebrow: "primeira entrega",
    titulo: "Tudo pronto, bora começar!",
    subtitulo: "Próximas ações",
    descricao:
      "1. Confirme que cadastro está APROVADO\n2. Ative toggle ONLINE no header\n3. Aceite primeira oferta (comece com entregas curtas, ≤3km)\n4. Bata 5 entregas pra desbloquear o bônus do iniciante (+R$ 50)\n\nDúvida operacional? Chat de suporte sempre disponível.",
  },
];

/* ============================================================
   COMERCIAL (representante de campo)
   ============================================================ */
export const COMERCIAL_TOUR: TourStep[] = [
  {
    emoji: "🤝",
    eyebrow: "bem-vindo comercial",
    titulo: "Bem-vindo ao time BRAVA+",
    subtitulo: "Sua missão: trazer parceiros e assinantes.",
    descricao:
      "Você é representante comercial de campo. Sua missão é cadastrar estabelecimentos novos e assinantes pra rede BRAVA+. Cada cadastro que vira ativo gera comissão pra você, conforme tabela que o admin configurou.",
    pontos: [
      "🗺️ Mapa: descubra lojas próximas via Google Places (igual no Waze)",
      "📋 CRM: organize prospects no kanban — Novo → Contato → Visita → Proposta → Fechado",
      "🔗 Links: gere link único pra mandar pro prospect — ele se cadastra sozinho, conta cai no seu nome",
      "💰 Comissões: veja quanto você ganhou e quanto vai ganhar (estimado)",
    ],
  },
  {
    emoji: "🔑",
    eyebrow: "seu código pessoal",
    titulo: "Seu código de comercial",
    subtitulo: "Tudo que vem com seu código fica vinculado a você",
    descricao:
      "Cada comercial tem um código único (formato COM-XXXXXX). Quando um estab/assinante se cadastra usando seu código, a relação fica permanente — você passa a ganhar comissão sobre essa pessoa pelo tempo que o admin definiu.",
    pontos: [
      "Seu código está no topo do seu painel (badge no header)",
      "Link permanente: brava-mais.vercel.app/cadastro?ref=SEU_CODE (assinante) ou /cadastro-estabelecimento?ref=SEU_CODE (lojista)",
      "Pode mandar esse link no WhatsApp, redes, qualquer canal",
    ],
  },
  {
    emoji: "🗺️",
    eyebrow: "★ descoberta",
    titulo: "Mapa de prospects (Google Places)",
    subtitulo: "Veja todas as lojas reais de uma região no mapa",
    descricao:
      "Em /comercial/prospects você digita um endereço (ou bairro), escolhe categoria + raio, clica 'Buscar lojas' e o Google Places mostra TODOS os estabelecimentos reais daquela região como pinos AMARELOS. Você clica em qualquer um e adiciona ao seu CRM em 1 toque.",
    pontos: [
      "Funciona pra qualquer categoria (restaurantes, beleza, pets, etc) — não só uma",
      "Raio configurável: 500m a 5km",
      "Pinos AZUIS = lojas que já estão no seu CRM (você já trabalhou esse lead)",
      "Pinos AMARELOS = novidades — oportunidades de prospecção",
    ],
    ctaHref: "/comercial/prospects",
    ctaLabel: "Abrir mapa",
  },
  {
    emoji: "📋",
    eyebrow: "★ disciplina de venda",
    titulo: "CRM kanban — seu funil pessoal",
    subtitulo: "Cada prospect = 1 card. Arraste pelas colunas pra evoluir.",
    descricao:
      "Funil clássico: Novo → Contato → Visita → Proposta → Negociação → Fechado/Perdido. Você arrasta o card entre colunas conforme avança a negociação. Cada card guarda: contato, endereço, próxima ação (data + descrição), notas, ticket estimado.",
    pontos: [
      "Adicione próxima ação com data — aparece na sua Agenda automaticamente",
      "Quando bate 'Fechado', tem botão atalho pra cadastrar lojista/assinante (cai no seu código)",
      "Filtros por tipo (estab ou assinante), categoria",
    ],
    ctaHref: "/comercial/crm",
    ctaLabel: "Abrir meu CRM",
  },
  {
    emoji: "📅",
    eyebrow: "rotina",
    titulo: "Agenda do dia",
    subtitulo: "O que você precisa fazer hoje",
    descricao:
      "Agenda automatica baseada nas 'próximas ações' que você configurou no CRM. Mostra: atrasadas (alerta vermelho), hoje, próximos 7 dias, futuro. Abre todo dia logo cedo pra não esquecer ninguém.",
    ctaHref: "/comercial/agenda",
    ctaLabel: "Ver minha agenda",
  },
  {
    emoji: "🔗",
    eyebrow: "venda assistida",
    titulo: "Links de cadastro (auto-tracking)",
    subtitulo: "Gere link único pra cada prospect",
    descricao:
      "Em vez de pedir pra ele digitar seu código, gere um link único. Você manda no WhatsApp dele, ele clica, se cadastra. Conta JÁ NASCE no seu nome. Sem chance de esquecer o código.",
    pontos: [
      "Links com label e expiração (7-90 dias)",
      "Tracking: vê quantos clicaram, quantos efetivamente se cadastraram",
      "Botão WhatsApp já abre conversa com texto pronto",
    ],
    ctaHref: "/comercial/links",
    ctaLabel: "Gerar link agora",
  },
  {
    emoji: "🏪",
    eyebrow: "cadastro direto",
    titulo: "Cadastro assistido (você no caixa)",
    subtitulo: "Lojista/assinante na sua frente? Cadastra agora",
    descricao:
      "Em /comercial/cadastros você cria a conta DIRETO. Forms simples: dados do dono + dados da loja → confirma → conta criada com você vinculado. Útil em visita presencial — sem precisar mandar link.",
    ctaHref: "/comercial/cadastros",
    ctaLabel: "Cadastrar agora",
  },
  {
    emoji: "💰",
    eyebrow: "ganho",
    titulo: "Comissões — seu dinheiro",
    subtitulo: "Histórico + projeção do mês + tabela",
    descricao:
      "Em /comercial/comissoes: total que você já recebeu, comissão estimada do mês atual (calculada em tempo real com base na receita dos estabs vinculados e mensalidades ativas dos subs), lista detalhada de cada cliente que gera receita pra você.",
    pontos: [
      "Comissão é processada mensalmente pelo admin (PIX cai na chave que você cadastrou)",
      "Sua TABELA está no Perfil — pode ser % da receita OU R$ fixo, por tipo e tier",
      "Para subs: comissão varia por tier (Básico/Premium/VIP)",
    ],
    ctaHref: "/comercial/comissoes",
    ctaLabel: "Ver minhas comissões",
  },
  {
    emoji: "📊",
    eyebrow: "performance",
    titulo: "Relatórios + sugestões inteligentes",
    subtitulo: "Como você está vs como pode estar",
    descricao:
      "Em /comercial/relatorios: funil de conversão (quanto % dos seus prospects vira cliente), evolução mensal de cadastros (gráfico 6 meses), sugestões automáticas baseadas na sua atividade ('você tem X prospects parados em Novo há mais de 7 dias').",
    ctaHref: "/comercial/relatorios",
    ctaLabel: "Ver meu desempenho",
  },
  {
    emoji: "🎓",
    eyebrow: "ajuda sempre presente",
    titulo: "'Como utilizo essa área?' em cada tela",
    subtitulo: "Mini-help lateral + tour completo no header",
    descricao:
      "Em qualquer tela do seu painel, no topo tem o botão 'Como eu utilizo essa área?'. Clica → abre uma tarja com explicação detalhada da tela. Esse tour completo aqui pode ser reaberto pelo botão 🎓 no header a qualquer momento.",
  },
  {
    emoji: "🚀",
    eyebrow: "primeiros passos",
    titulo: "Plano de 1ª semana",
    subtitulo: "Faça nessa ordem pra começar bem",
    descricao:
      "1. Configure PIX no Perfil (sem isso, payout fica retido)\n2. Abra o Mapa, busque seu bairro, adicione 10 prospects ao CRM\n3. Pra cada um, defina próxima ação no CRM\n4. Use o WhatsApp + link de convite pra mandar pros 3 mais quentes\n5. Quando algum pedir pra ver a plataforma de perto, cadastre lá usando 'Cadastros'\n\nMeta da 1ª semana: 1 cadastro efetivo (lojista OU sub).",
  },
];

/* ============================================================
   ADMIN
   ============================================================ */
export const ADMIN_TOUR: TourStep[] = [
  {
    emoji: "🛠️",
    eyebrow: "bem-vindo admin",
    titulo: "Painel Admin BRAVA+",
    subtitulo: "Sua cabine de controle do negócio.",
    descricao:
      "Você tem acesso total ao sistema. Esse tour passa pelas 6 áreas críticas: dashboard, usuários, estabs, entregadores, monetização e antifraude.",
    pontos: [
      "📊 Dashboard + BI: saúde do negócio",
      "👥 Usuários + Estabs: gestão das pontas",
      "🛵 Entregas: SLA operacional",
      "💰 Saques + Assinaturas: financeiro",
      "🚨 Fraude + Churn: proteção da margem",
      "💎 Slots + B2B + Pacotes: monetização avançada",
    ],
  },
  {
    emoji: "📊",
    eyebrow: "comece aqui",
    titulo: "Dashboard — saúde em 30s",
    subtitulo: "Abra todo dia de manhã",
    descricao:
      "4 KPIs no topo (users, estabs, MRR, pedidos) + charts (signups 14d, tier, top categorias, top cupons). Olhe rápido — algo fora da curva? Vá pra área específica.",
    ctaHref: "/admin",
    ctaLabel: "Dashboard",
  },
  {
    emoji: "📈",
    eyebrow: "decisões estratégicas",
    titulo: "BI avançado",
    subtitulo: "Cohort, LTV, geografia",
    descricao:
      "Em /admin/bi você tem análises profundas: cohort de retenção, LTV por tier, mapa de calor de check-ins, funil de assinatura. Use pra decidir onde concentrar marketing.",
    calculos: [
      "LTV = ticket_médio × frequência × lifetime_estimado",
      "Churn = users_inativos_30d / total_assinantes",
      "CAC = gastos_mkt / novos_pagos",
    ],
    ctaHref: "/admin/bi",
    ctaLabel: "Abrir BI",
  },
  {
    emoji: "👥",
    eyebrow: "gestão de pessoas",
    titulo: "Usuários — 360 completo",
    subtitulo: "Suporte e moderação aqui",
    descricao:
      "Lista todos users com filtros (role/tier/status). Click no user abre 360: assinatura, visitas, pedidos, coins, logs. Ações disponíveis: trocar tier, cancelar, reembolsar, banir, IMPERSONAR (logar como ele pra debugar).",
    pontos: [
      "Impersonation registra audit completo (cuidado: ações são reais)",
      "Cancelamento mantém histórico — não deleta",
      "Banir é reversível; deletar é permanente (cuidado)",
    ],
    ctaHref: "/admin/usuarios",
    ctaLabel: "Lista de usuários",
  },
  {
    emoji: "🏪",
    eyebrow: "parceiros = core do negócio",
    titulo: "Estabelecimentos",
    subtitulo: "Aprovar onboarding + operação",
    descricao:
      "Filtro 'pendentes' = cadastros novos esperando aprovação. Aprove rápido (24h) pra não perder lead. Em /admin/estabelecimentos/[slug]/operacao você vê SLA da loja — quem tá cancelando muito merece atenção.",
    ctaHref: "/admin/estabelecimentos",
    ctaLabel: "Lista de estabs",
  },
  {
    emoji: "🛵",
    eyebrow: "SLA operacional",
    titulo: "Entregadores + Entregas",
    subtitulo: "Aprovar cadastro + monitorar tempo real",
    descricao:
      "/admin/entregadores: aprovar novos cadastros (valida CNH, MEI). /admin/entregas: monitor tempo real — se uma entrega trava, intervenha (chat com motoboy, escala outro).",
    pontos: [
      "Entregador <3.5 ⭐ = avaliação interna obrigatória",
      "Entregas paradas >30 min = alerta vermelho",
      "Bônus de pico de demanda configurado em /admin/configuracoes",
    ],
    ctaHref: "/admin/entregas",
    ctaLabel: "Monitor de entregas",
  },
  {
    emoji: "💰",
    eyebrow: "financeiro crítico",
    titulo: "Saques (SLA 1 dia útil)",
    subtitulo: "Aprovar = paga via PIX na hora",
    descricao:
      "Lojistas e entregadores solicitam saque em suas áreas. Aqui você aprova → o pagamento sai via PIX. Meta: aprovar em <24h pra manter NPS alto. Atraso = ticket abre.",
    ctaHref: "/admin/saques",
    ctaLabel: "Saques pendentes",
  },
  {
    emoji: "📉",
    eyebrow: "manutenção da base",
    titulo: "Churn radar",
    subtitulo: "Aja ANTES do cancelamento",
    descricao:
      "Em /admin/churn lista users com 0 check-in em 30 dias. Acione retenção: cupom-bomba + push direcionado. Custo do cupom < custo de readquirir o user.",
    calculos: [
      "Risco = (dias_sem_atividade × 0.5) + (dias_até_cobrança × 0.3) − engajamento_30d",
      "Score 7+ = urgência",
    ],
    ctaHref: "/admin/churn",
    ctaLabel: "Churn radar",
  },
  {
    emoji: "🚨",
    eyebrow: "proteção da margem",
    titulo: "Antifraude",
    subtitulo: "Padrões suspeitos detectados",
    descricao:
      "Sistema detecta automaticamente: múltiplos IPs simultâneos, uso anômalo de cupom, indicações em loop. Você decide se é falso positivo ou age (bloquear, reverter cupom).",
    pontos: [
      "Cupom abusado = prejuízo direto pro lojista",
      "Falso positivo? Marque 'isenção' pra treinar a regra",
      "Severidade alta = banir imediato + investigar",
    ],
    ctaHref: "/admin/fraude",
    ctaLabel: "Antifraude",
  },
  {
    emoji: "💎",
    eyebrow: "monetização avançada",
    titulo: "Slots + B2B + Pacotes",
    subtitulo: "Receita além da mensalidade",
    descricao:
      "• /admin/slots: lojista paga pra aparecer no topo da categoria (receita pura)\n• /admin/b2b: BRAVA+ Empresas — RH contrata como benefício corp (LTV brutal)\n• /admin/pacotes: combos curados (cross-sell entre parceiros)",
    pontos: [
      "Slot ocupado = lojista pagando R$/semana, margem ~95%",
      "B2B fechou? 1 empresa = 50-500 assinantes sem CAC unitário",
      "Pacotes campeões vão pro destaque na home /app",
    ],
  },
  {
    emoji: "📋",
    eyebrow: "operacional do dia",
    titulo: "Tickets + Denúncias + Estornos",
    subtitulo: "Suporte centralizado",
    descricao:
      "• /admin/suporte: tickets de users/lojistas/entregadores\n• /admin/denuncias: moderação de conteúdo/comportamento\n• /admin/extornos: reembolsos que precisam de admin (lojista recusou ou caso complexo)",
    pontos: [
      "Resposta meta: <4h em horário comercial",
      "Tickets sem resposta 24h dispara alerta",
    ],
  },
  {
    emoji: "🎓",
    eyebrow: "ajuda sempre disponível",
    titulo: "Botão 'Como utilizo?' em cada tela",
    subtitulo: "Mini-help por tela + tour completo no menu",
    descricao:
      "Em cada tela do painel admin tem o botão 'Como eu utilizo essa área?'. Tarja lateral com explicação, cálculos financeiros e dicas. Esse tour completo fica acessível a qualquer hora pelo menu.",
  },
  {
    emoji: "🧰",
    eyebrow: "★ ferramentas novas",
    titulo: "Hub de ferramentas — CRUDs e monitors",
    subtitulo: "Tudo da sprint de features fica em /admin/ferramentas",
    descricao:
      "Configurações centralizadas: packs Wallet (deposita X, ganha Y bônus), badges de explorador, templates sazonais (Festa Junina, Black Friday), vídeos de treinamento por público. Cada item tem CRUD próprio.",
    ctaHref: "/admin/ferramentas",
    ctaLabel: "Hub completo",
  },
  {
    emoji: "📊",
    eyebrow: "monitoramento das ferramentas",
    titulo: "Relatório das ferramentas novas",
    subtitulo: "KPIs sistêmicos pra cada feature",
    descricao:
      "Em /admin/relatorios/ferramentas você vê: caixa total da Wallet, rolês ativos, mesas QR ativas, A/B tests concluídos com vencedor, parcerias entre lojistas, badges conquistados nos últimos 30d.",
    ctaHref: "/admin/relatorios/ferramentas",
    ctaLabel: "Ver relatório",
  },
  {
    emoji: "🚀",
    eyebrow: "rotina sugerida",
    titulo: "Daily admin recomendado",
    subtitulo: "20 minutos por dia",
    descricao:
      "1. Dashboard (2 min) — algo fora da curva? KPIs novos das ferramentas em destaque.\n2. Saques pendentes (5 min) — aprovar tudo\n3. Estabs pendentes (3 min) — aprovar novos\n4. Tickets suporte (5 min) — responder os 24h+\n5. Antifraude + Denúncias (5 min) — moderar\n6. Relatório de ferramentas (2 min) — A/B tests fechados, novas parcerias, badges desbloqueados\n\nSemanalmente: Churn radar + BI cohort + Slots ocupação.",
  },
];
