import { createClient } from "@supabase/supabase-js";
import WS from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

(globalThis as { WebSocket?: typeof WebSocket }).WebSocket =
  (globalThis as { WebSocket?: typeof WebSocket }).WebSocket ??
  (WS as unknown as typeof WebSocket);

const admin = createClient(url, key, { auth: { persistSession: false } });

type PromotionType =
  | "cupom_desconto"
  | "vale_presente"
  | "vale_compras"
  | "clube_fidelidade"
  | "cashback";

const DEMO_OWNER_EMAIL = "demo-owner@bravamais.app";
const DEMO_OWNER_PASSWORD = "DemoOwner@2026!";

// ============================================================
// New categories to ensure
// ============================================================
const EXTRA_CATEGORIES = [
  { slug: "floricultura", name: "Floriculturas", icon: "flower-2", display_order: 11 },
  { slug: "decoracao", name: "Decoração", icon: "sofa", display_order: 12 },
  { slug: "casas-de-show", name: "Casas de Show", icon: "music", display_order: 13 },
  { slug: "presentes", name: "Loja de Presentes", icon: "gift", display_order: 14 },
  { slug: "papelaria", name: "Papelaria e Livraria", icon: "book-open", display_order: 15 },
];

// ============================================================
// Photo pools por categoria (Unsplash)
// ============================================================
const PHOTOS: Record<string, string[]> = {
  restaurantes: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
    "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=1200",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
  ],
  bares: [
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200",
    "https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=1200",
  ],
  cafes: [
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200",
    "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=1200",
  ],
  beleza: [
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200",
  ],
  moda: [
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
  ],
  saude: [
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200",
  ],
  esportes: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200",
  ],
  lazer: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200",
    "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=1200",
  ],
  petshop: [
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200",
  ],
  servicos: [
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200",
  ],
  floricultura: [
    "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1200",
    "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200",
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200",
    "https://images.unsplash.com/photo-1454425064867-d6b39435c7d6?w=1200",
  ],
  decoracao: [
    "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200",
    "https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=1200",
  ],
  "casas-de-show": [
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200",
    "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1200",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200",
  ],
  presentes: [
    "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200",
    "https://images.unsplash.com/photo-1481445054213-040cdb04b07a?w=1200",
  ],
  papelaria: [
    "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200",
    "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=1200",
    "https://images.unsplash.com/photo-1568667256549-094345857637?w=1200",
  ],
};

// ============================================================
// Tagline + description templates
// ============================================================
const TAGLINES: Record<string, string[]> = {
  restaurantes: ["Cozinha autoral com sabor da casa", "Pratos artesanais e ambiente acolhedor", "Sabor inesquecível, qualidade garantida"],
  bares: ["Drinks autorais e clima descontraído", "Chopp gelado, petisco caprichado", "O melhor encontro do bairro"],
  cafes: ["Café especial e pão quentinho", "Cafeteria artesanal e brunch", "Cantinho do café e doces caseiros"],
  beleza: ["Beleza com toque profissional", "Cuidados completos, resultado premiado", "Sua autoestima merece"],
  moda: ["Curadoria de moda autoral", "Marcas independentes e atemporais", "Estilo único, peças únicas"],
  saude: ["Saúde integrativa e bem-estar", "Cuidado personalizado pra você", "Equilíbrio e qualidade de vida"],
  esportes: ["Treinos personalizados e equipamentos de ponta", "Movimente o corpo, transforme a vida", "Performance e disposição"],
  lazer: ["Diversão pra família toda", "Momentos memoráveis garantidos", "Lazer, cultura e entretenimento"],
  petshop: ["Tudo pro seu melhor amigo", "Cuidados pet com carinho", "Higiene, saúde e diversão pet"],
  servicos: ["Soluções práticas, atendimento rápido", "Serviços de confiança", "Eficiência e qualidade"],
  floricultura: ["Flores frescas todo dia", "Arranjos personalizados e entrega rápida", "Beleza natural pro seu presente"],
  decoracao: ["Transforme sua casa em lar", "Decor com personalidade", "Móveis e objetos que contam histórias"],
  "casas-de-show": ["Música ao vivo todo fim de semana", "Palco do entretenimento", "Shows, drinks e energia boa"],
  presentes: ["Achados únicos pra presentear", "Mimos e surpresas pra ocasiões especiais", "Caixa de presente com história"],
  papelaria: ["Papelaria criativa e livros selecionados", "Material de qualidade e curadoria literária", "Pra quem ama escrever, desenhar e ler"],
};

const DESCRIPTIONS: Record<string, string[]> = {
  restaurantes: [
    "Restaurante familiar com receitas tradicionais reinventadas. Ingredientes frescos de produtores locais, ambiente aconchegante e atendimento atencioso.",
    "Cozinha autoral comandada por chef premiado. Menu sazonal que valoriza o produtor brasileiro e técnicas internacionais.",
    "Casa especializada em pratos da gastronomia italiana, com massas frescas, molhos artesanais e carta de vinhos cuidadosamente selecionada.",
  ],
  bares: [
    "Pub aconchegante com mais de 50 rótulos de cerveja artesanal, drinks autorais e tábuas de petiscos perfeitas pra dividir.",
    "Bar com música ao vivo de quinta a domingo, drinks clássicos e ambiente moderno. Happy hour das 18h às 20h.",
    "Boteco com a melhor chopp gelada da região, petiscos generosos e clima descontraído pra qualquer ocasião.",
  ],
  cafes: [
    "Cafeteria artesanal com grãos especiais, pães na hora, doces caseiros e brunch nos fins de semana.",
    "Café aconchegante pra trabalhar, encontrar amigos ou só relaxar. Wi-Fi rápido, tomadas em todas as mesas e atendimento caloroso.",
  ],
  beleza: [
    "Estúdio de beleza completo com profissionais especializados em corte, coloração, manicure, depilação e tratamentos estéticos.",
    "Salão premiado por técnicas inovadoras de coloração e visagismo. Atendimento personalizado e produtos de alta performance.",
  ],
  moda: [
    "Boutique com curadoria de marcas autorais brasileiras. Peças atemporais, produção consciente e atendimento que entende o seu estilo.",
    "Loja conceito que une moda contemporânea e design. Coleções limitadas e peças exclusivas de pequenos ateliês.",
  ],
  saude: [
    "Clínica integrativa com profissionais de fisioterapia, acupuntura, massoterapia e nutrição. Cuidado completo pro seu corpo.",
    "Espaço de bem-estar focado em terapias holísticas: massagem, yoga, meditação guiada e atendimento nutricional.",
  ],
  esportes: [
    "Academia equipada com aparelhos de ponta, aulas coletivas e personal trainer. Treinos sob medida pra cada objetivo.",
    "Box de crossfit com coaches certificados, programação progressiva e comunidade engajada. Bem-vindo ao seu próximo PR.",
  ],
  lazer: [
    "Espaço de entretenimento com salas temáticas, jogos, escape rooms e eventos especiais pra grupos e empresas.",
    "Cinema autoral com programação alternativa, sessões com bar e poltronas confortáveis. Cinema do jeito que tinha que ser.",
  ],
  petshop: [
    "Pet shop completo com banho e tosa, veterinário, ração premium, brinquedos e tudo que seu pet precisa.",
    "Atendimento veterinário 24h, consultas, vacinas e cirurgias. Banho, tosa e adestramento por profissionais qualificados.",
  ],
  servicos: [
    "Lavanderia especializada em roupas delicadas, ternos e roupas de cama. Coleta e entrega no bairro.",
    "Serviço completo de costura, ajustes, reformas e roupas sob medida. Atendimento de segunda a sábado.",
  ],
  floricultura: [
    "Floricultura com flores fresquinhas, arranjos personalizados, buquês e plantas pra dentro e fora de casa. Entrega rápida.",
    "Curadoria de flores raras e arranjos para casamentos, eventos e presentes especiais. Atendimento por encomenda.",
  ],
  decoracao: [
    "Loja de decoração com móveis de design, objetos autorais e tudo pra transformar sua casa num lar único.",
    "Curadoria de peças vintage e contemporâneas. Almofadas, luminárias, quadros e enxoval. Frete pra todo Brasil.",
  ],
  "casas-de-show": [
    "Casa de shows com programação semanal de música ao vivo, food trucks e bar completo. Capacidade pra 400 pessoas.",
    "Espaço cultural com shows de samba, mpb, jazz e rock. Bar premium, comida boa e som de qualidade.",
  ],
  presentes: [
    "Loja de presentes com curadoria de mimos pra todas as ocasiões: aniversário, casamento, dia das mães, namorados e mais.",
    "Caixas surpresa, kits personalizados e papelaria para presentes únicos. Embalagem cuidadosa e entrega pra todo Brasil.",
  ],
  papelaria: [
    "Papelaria criativa com material escolar, agendas, canetas premium e livros selecionados. Ambiente acolhedor pra navegar nos títulos.",
    "Livraria de bairro com curadoria de literatura nacional e estrangeira, livros infantis, papelaria diferenciada e cafezinho cortesia.",
  ],
};

// ============================================================
// Product templates per category
// ============================================================
type ProductT = { name: string; description?: string; price_cents: number };

function pickProducts(category: string): ProductT[] {
  const pool: Record<string, ProductT[]> = {
    restaurantes: [
      { name: "Prato executivo do dia", description: "Inclui entrada, prato principal e sobremesa", price_cents: 4990 },
      { name: "Risoto de cogumelos", description: "Arroz arbóreo, mix de cogumelos frescos, manteiga e parmesão", price_cents: 6890 },
      { name: "Filé ao molho madeira", description: "Filé mignon grelhado, batatas rústicas e molho madeira", price_cents: 8900 },
      { name: "Massa fresca da casa", description: "Tagliatelle artesanal ao molho à escolha", price_cents: 5490 },
      { name: "Salada gourmet completa", description: "Mix de folhas, queijos, frutas e proteína", price_cents: 4290 },
    ],
    bares: [
      { name: "Chopp Pilsen 300ml", price_cents: 990 },
      { name: "Porção de batata frita", description: "500g com molhos especiais", price_cents: 3490 },
      { name: "Drink autoral da casa", description: "Combinação exclusiva do bartender", price_cents: 2890 },
      { name: "Tábua de queijos e frios", description: "Seleção de queijos, charcutaria e geleias", price_cents: 7900 },
      { name: "Caldinho do dia", price_cents: 1490 },
    ],
    cafes: [
      { name: "Café espresso especial", price_cents: 890 },
      { name: "Cappuccino artesanal", price_cents: 1290 },
      { name: "Pão de queijo gourmet", description: "Massa de mandioca recheada", price_cents: 690 },
      { name: "Brunch completo", description: "Ovos, pão fresco, frutas e bebida quente", price_cents: 4890 },
      { name: "Brigadeiro gourmet (6un)", price_cents: 2290 },
    ],
    beleza: [
      { name: "Corte feminino", price_cents: 12000 },
      { name: "Coloração completa", description: "Coloração, ojon e finalização", price_cents: 28000 },
      { name: "Manicure + pedicure", price_cents: 8000 },
      { name: "Tratamento capilar profundo", price_cents: 18000 },
      { name: "Escova progressiva", price_cents: 35000 },
    ],
    moda: [
      { name: "Camiseta básica algodão pima", price_cents: 14900 },
      { name: "Calça reta alfaiataria", price_cents: 38900 },
      { name: "Vestido midi estampado", price_cents: 28900 },
      { name: "Jaqueta jeans premium", price_cents: 49900 },
      { name: "Bolsa de couro artesanal", price_cents: 79900 },
    ],
    saude: [
      { name: "Massagem relaxante 60min", price_cents: 16900 },
      { name: "Sessão de acupuntura", price_cents: 18900 },
      { name: "Consulta nutricional", price_cents: 22000 },
      { name: "Aula experimental de yoga", price_cents: 0 },
      { name: "Pacote de 5 massagens", price_cents: 78000 },
    ],
    esportes: [
      { name: "Aula experimental", price_cents: 0 },
      { name: "Plano mensal 3x semana", price_cents: 24900 },
      { name: "Plano trimestral livre acesso", price_cents: 65000 },
      { name: "Personal trainer avulso", price_cents: 12000 },
      { name: "Avaliação física completa", price_cents: 9000 },
    ],
    lazer: [
      { name: "Ingresso adulto", price_cents: 4500 },
      { name: "Ingresso criança", price_cents: 2500 },
      { name: "Combo família (4 ingressos)", price_cents: 14900 },
      { name: "Sessão privada para 10 pessoas", price_cents: 49000 },
    ],
    petshop: [
      { name: "Banho cão pequeno", price_cents: 6500 },
      { name: "Banho + tosa higiênica", price_cents: 11000 },
      { name: "Ração premium 10kg", price_cents: 18900 },
      { name: "Consulta veterinária", price_cents: 12000 },
      { name: "Vacina V10 cão", price_cents: 14000 },
    ],
    servicos: [
      { name: "Lavagem de roupa por kg", price_cents: 2900 },
      { name: "Limpeza de terno", price_cents: 5900 },
      { name: "Ajuste de barra calça", price_cents: 3500 },
      { name: "Customização exclusiva", price_cents: 12000 },
    ],
    floricultura: [
      { name: "Buquê de rosas vermelhas (12 hastes)", price_cents: 14900 },
      { name: "Buquê do campo", description: "Mix de flores sazonais", price_cents: 9900 },
      { name: "Arranjo para mesa de jantar", price_cents: 22900 },
      { name: "Cesta de presente com flores", price_cents: 18900 },
      { name: "Orquídea phalaenopsis", price_cents: 12900 },
    ],
    decoracao: [
      { name: "Almofada decorativa (par)", price_cents: 14900 },
      { name: "Luminária de mesa design", price_cents: 28900 },
      { name: "Quadro arte brasileira (60x60)", price_cents: 39900 },
      { name: "Tapete sala redondo 1,5m", price_cents: 49900 },
      { name: "Vaso cerâmica artesanal", price_cents: 18900 },
    ],
    "casas-de-show": [
      { name: "Ingresso show da semana", price_cents: 4500 },
      { name: "Ingresso VIP com open bar", price_cents: 14900 },
      { name: "Mesa para 4 pessoas + couvert", price_cents: 35000 },
      { name: "Pacote casal", description: "Ingressos + jantar + drink", price_cents: 24900 },
    ],
    presentes: [
      { name: "Kit chá da tarde", description: "Caneca, chá especial e biscoito artesanal", price_cents: 9900 },
      { name: "Cesta gourmet completa", price_cents: 24900 },
      { name: "Caixa surpresa do mês", price_cents: 14900 },
      { name: "Kit aniversariante", price_cents: 18900 },
    ],
    papelaria: [
      { name: "Agenda 2026 capa de couro", price_cents: 12900 },
      { name: "Kit canetas premium (5 cores)", price_cents: 8900 },
      { name: "Livro literatura brasileira", price_cents: 5990 },
      { name: "Caderno tipo bullet journal", price_cents: 6990 },
      { name: "Marcador de página vintage", price_cents: 2490 },
    ],
  };
  const list = pool[category] ?? [];
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(4, list.length));
}

function pickCoupon(category: string, name: string): { code: string; description: string; discount_percent?: number; discount_cents?: number } {
  const code = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8) + Math.floor(Math.random() * 20 + 10);

  const flavors = [
    { discount_percent: 10, description: "10% off em qualquer item" },
    { discount_percent: 15, description: "15% off na primeira compra" },
    { discount_percent: 20, description: "20% off pra assinantes BRAVA+" },
    { discount_percent: 25, description: "25% off no combo selecionado" },
    { discount_cents: 500, description: "R$ 5 off em compras acima de R$ 50" },
    { discount_cents: 1000, description: "R$ 10 off em compras acima de R$ 100" },
  ];
  const pick = flavors[Math.floor(Math.random() * flavors.length)];
  return { code, ...pick };
}

function pickLoyalty(category: string): { name: string; visits_required: number; benefit_description: string } {
  const templates: Record<string, { name: string; visits_required: number; benefit_description: string }[]> = {
    restaurantes: [{ name: "Mesa cativa", visits_required: 6, benefit_description: "6ª visita ganha sobremesa por conta da casa" }],
    bares: [{ name: "Cliente da casa", visits_required: 5, benefit_description: "5ª rodada com chopp em dobro" }],
    cafes: [{ name: "Café fiel", visits_required: 10, benefit_description: "10ª compra: café duplo grátis" }],
    beleza: [{ name: "Cliente especial", visits_required: 8, benefit_description: "8ª visita: tratamento extra grátis" }],
    moda: [{ name: "Estilo BRAVA", visits_required: 4, benefit_description: "4ª compra com 30% off em qualquer peça" }],
    saude: [{ name: "Trilha do bem-estar", visits_required: 5, benefit_description: "5 sessões: ganhe uma sessão extra" }],
    esportes: [{ name: "Treino constante", visits_required: 20, benefit_description: "20 check-ins: 1 sessão de personal" }],
    lazer: [{ name: "Membro do clube", visits_required: 5, benefit_description: "5ª visita: convide um amigo grátis" }],
    petshop: [{ name: "Pet camarada", visits_required: 6, benefit_description: "6º banho com tosa inclusa" }],
    servicos: [{ name: "Cliente regular", visits_required: 5, benefit_description: "5º serviço com 50% off" }],
    floricultura: [{ name: "Buquê fiel", visits_required: 4, benefit_description: "4ª compra: buquê do campo grátis" }],
    decoracao: [{ name: "Lar especial", visits_required: 3, benefit_description: "3ª compra com frete grátis" }],
    "casas-de-show": [{ name: "Fã da casa", visits_required: 4, benefit_description: "4ª presença: ingresso com 50% off" }],
    presentes: [{ name: "Mimo BRAVA", visits_required: 5, benefit_description: "5ª compra: caixa surpresa grátis" }],
    papelaria: [{ name: "Leitor frequente", visits_required: 6, benefit_description: "6ª compra com 25% off no próximo livro" }],
  };
  const list = templates[category] ?? [{ name: "Cliente fiel", visits_required: 5, benefit_description: "5ª visita ganha brinde especial" }];
  return list[Math.floor(Math.random() * list.length)];
}

function pickPromos(): PromotionType[] {
  const all: PromotionType[] = ["cupom_desconto", "vale_presente", "vale_compras", "clube_fidelidade", "cashback"];
  const n = 2 + Math.floor(Math.random() * 3); // 2 a 4
  return [...all].sort(() => Math.random() - 0.5).slice(0, n);
}

// ============================================================
// Locations — bairros de São Paulo (lat/lng centrais)
// ============================================================
const NEIGHBORHOODS = [
  { city: "São Paulo", state: "SP" as const, name: "Vila Madalena", lat: -23.5475, lng: -46.689 },
  { city: "São Paulo", state: "SP" as const, name: "Pinheiros", lat: -23.567, lng: -46.685 },
  { city: "São Paulo", state: "SP" as const, name: "Itaim Bibi", lat: -23.585, lng: -46.677 },
  { city: "São Paulo", state: "SP" as const, name: "Jardins", lat: -23.567, lng: -46.658 },
  { city: "São Paulo", state: "SP" as const, name: "Higienópolis", lat: -23.546, lng: -46.658 },
  { city: "São Paulo", state: "SP" as const, name: "Moema", lat: -23.605, lng: -46.661 },
  { city: "São Paulo", state: "SP" as const, name: "Pompeia", lat: -23.522, lng: -46.681 },
  { city: "São Paulo", state: "SP" as const, name: "Vila Mariana", lat: -23.589, lng: -46.633 },
  { city: "São Paulo", state: "SP" as const, name: "Perdizes", lat: -23.535, lng: -46.677 },
  { city: "São Paulo", state: "SP" as const, name: "Brooklin", lat: -23.617, lng: -46.692 },
];

function jitter(value: number, amount = 0.008): number {
  return value + (Math.random() - 0.5) * amount * 2;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface EstablishmentSeed {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  state: "SP" | "RJ" | "MG" | "PR" | "RS";
  lat: number;
  lng: number;
  photos: string[];
  logo_url: string;
  cover_url: string;
  categories: string[];
  promos: PromotionType[];
  products: ProductT[];
  coupon: { code: string; description: string; discount_percent?: number; discount_cents?: number };
  loyalty: { name: string; visits_required: number; benefit_description: string };
  phone?: string;
  whatsapp?: string;
  instagram?: string;
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gen(category: string, name: string, neighborhoodIdx?: number): EstablishmentSeed {
  const n = NEIGHBORHOODS[neighborhoodIdx ?? Math.floor(Math.random() * NEIGHBORHOODS.length)];
  const photoPool = PHOTOS[category] ?? [];
  const shuffledPhotos = [...photoPool].sort(() => Math.random() - 0.5).slice(0, Math.min(3, photoPool.length));
  return {
    slug: slugify(name),
    name,
    tagline: pickOne(TAGLINES[category] ?? ["Estabelecimento parceiro BRAVA+"]),
    description: pickOne(DESCRIPTIONS[category] ?? ["Parceiro oficial do clube BRAVA+."]),
    city: n.city,
    state: n.state,
    lat: jitter(n.lat),
    lng: jitter(n.lng),
    photos: shuffledPhotos.length ? shuffledPhotos : photoPool.slice(0, 2),
    cover_url: photoPool[0] ?? "",
    logo_url: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${pickOne(["fbbf24", "1e3a8a"])}`,
    categories: [category],
    promos: pickPromos(),
    products: pickProducts(category),
    coupon: pickCoupon(category, name),
    loyalty: pickLoyalty(category),
    instagram: `@${slugify(name).replace(/-/g, "")}`,
  };
}

// ============================================================
// 50 estabelecimentos: 8 mantidos + 42 novos via gen()
// ============================================================
const HAND_PICKED: EstablishmentSeed[] = [
  {
    slug: "boteco-do-zeca",
    name: "Boteco do Zeca",
    tagline: "Boteco raiz com chopp gelado e petisco bom",
    description: "Boteco tradicional com a melhor chopp da região. Petiscos, música ao vivo nos fins de semana e clima de bairro.",
    city: "São Paulo", state: "SP", lat: -23.561414, lng: -46.655881,
    photos: [PHOTOS.bares[0], PHOTOS.bares[1]],
    logo_url: "https://api.dicebear.com/9.x/initials/svg?seed=Boteco+Zeca&backgroundColor=fbbf24",
    cover_url: PHOTOS.bares[0],
    categories: ["bares"], promos: ["cupom_desconto", "clube_fidelidade"],
    products: pickProducts("bares"),
    coupon: { code: "PRIMEIRACHOPP", discount_percent: 20, description: "20% na primeira rodada" },
    loyalty: { name: "Mestre da Casa", visits_required: 5, benefit_description: "Chopp em dobro toda 5ª visita" },
    phone: "1133334444", whatsapp: "5511999998888", instagram: "@botecodozeca",
  },
  gen("restaurantes", "Bistrô da Rua Cinco", 3),
  gen("cafes", "Padaria Pão da Vovó", 4),
  gen("esportes", "Studio Fit Vila Nova", 5),
  gen("beleza", "Salão Corte & Belo", 2),
  gen("moda", "Moda Zen", 0),
  gen("petshop", "Patinhas Pet Shop", 7),
  gen("saude", "Espaço Bem Viver", 6),
];

const SEED_NAMES_BY_CAT: Record<string, string[]> = {
  restaurantes: ["Cantina da Nonna", "Tempero da Maria", "Sushi Yamato", "Cozinha Aberta", "Empório Verde", "Madeira & Brasa", "Burger House", "Garden Bistro"],
  bares: ["Bar do Português", "Pub Old School", "Cervejaria Local", "Drinkeria do Centro"],
  cafes: ["Café Central", "Brunch & Pão", "Manhã Cafeteria"],
  moda: ["Atelier Mosaico", "Bossa Roupas", "Vila Linho", "Urbano Wear"],
  floricultura: ["Floricultura Jardim", "Flora Bella", "Botânica do Bairro", "Pétalas & Folhas"],
  decoracao: ["Casa Bonita Decor", "Studio Decor", "Vila Lar", "Espaço Aconchego"],
  "casas-de-show": ["Casa Live", "Teatro Lume", "Palco da Vila"],
  presentes: ["Caixa de Presentes", "Loja do Mimo", "Cesta Surpresa", "Achados & Mimos"],
  papelaria: ["Papel & Letra", "Livraria do Beco", "Caderno e Pincel"],
  beleza: ["Studio Glow", "Barbearia Costa", "Spa Renove"],
  saude: ["Clínica Equilíbrio"],
  servicos: ["Lavanderia Sol", "Sapataria Boa"],
  lazer: ["Cinema Rosa"],
};

const GENERATED: EstablishmentSeed[] = [];
for (const [cat, names] of Object.entries(SEED_NAMES_BY_CAT)) {
  for (const name of names) {
    GENERATED.push(gen(cat, name));
  }
}

const ESTABLISHMENTS: EstablishmentSeed[] = [...HAND_PICKED, ...GENERATED];
console.log(`Total establishments to seed: ${ESTABLISHMENTS.length}`);

// ============================================================
// DB operations
// ============================================================
async function findUserByEmail(email: string) {
  let page = 1;
  while (page < 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found;
    if (data.users.length < 200) return null;
    page += 1;
  }
  return null;
}

async function ensureDemoOwner(): Promise<string> {
  const existing = await findUserByEmail(DEMO_OWNER_EMAIL);
  if (existing) {
    await admin
      .from("profiles")
      .update({ role: "establishment", full_name: "Demo Owner" })
      .eq("id", existing.id);
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_OWNER_EMAIL,
    password: DEMO_OWNER_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Demo Owner" },
  });
  if (error) throw error;
  await admin
    .from("profiles")
    .update({ role: "establishment", full_name: "Demo Owner" })
    .eq("id", data.user.id);
  return data.user.id;
}

async function confirmAndPromoteAdmin(email: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    console.log(`! Usuário ${email} não encontrado`);
    return;
  }
  if (!user.email_confirmed_at) {
    await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
    console.log(`✓ Email confirmado: ${email}`);
  } else {
    console.log(`• Email já confirmado: ${email}`);
  }
  await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
  console.log(`✓ Promovido a admin: ${email}`);
}

async function ensureExtraCategories() {
  for (const c of EXTRA_CATEGORIES) {
    await admin
      .from("categories")
      .upsert(c, { onConflict: "slug" });
  }
  console.log(`✓ ${EXTRA_CATEGORIES.length} categorias garantidas`);
}

async function seedEstablishment(ownerId: string, e: EstablishmentSeed, catBySlug: Record<string, string>) {
  const { data: estab, error } = await admin
    .from("establishments")
    .upsert(
      {
        owner_id: ownerId,
        slug: e.slug,
        name: e.name,
        tagline: e.tagline,
        description: e.description,
        city: e.city,
        state: e.state,
        lat: e.lat,
        lng: e.lng,
        photos: e.photos,
        logo_url: e.logo_url,
        cover_url: e.cover_url ?? null,
        phone: e.phone ?? null,
        whatsapp: e.whatsapp ?? null,
        instagram: e.instagram ?? null,
        is_active: true,
        is_verified: true,
      },
      { onConflict: "slug" },
    )
    .select()
    .single();
  if (error || !estab) {
    console.error(`✗ ${e.slug}:`, error);
    return;
  }

  for (const slug of e.categories) {
    if (catBySlug[slug]) {
      await admin
        .from("establishment_categories")
        .upsert({ establishment_id: estab.id, category_id: catBySlug[slug] });
    }
  }
  for (const p of e.promos) {
    await admin
      .from("establishment_promotions")
      .upsert(
        { establishment_id: estab.id, promotion_type: p, is_active: true },
        { onConflict: "establishment_id,promotion_type" },
      );
  }

  await admin.from("products").delete().eq("establishment_id", estab.id);
  if (e.products.length) {
    await admin.from("products").insert(
      e.products.map((p) => ({
        establishment_id: estab.id,
        name: p.name,
        description: p.description ?? null,
        price_cents: p.price_cents,
        photos: [],
        is_active: true,
      })),
    );
  }

  await admin
    .from("coupons")
    .upsert(
      {
        establishment_id: estab.id,
        code: e.coupon.code,
        description: e.coupon.description,
        discount_percent: e.coupon.discount_percent ?? null,
        discount_cents: e.coupon.discount_cents ?? null,
        is_active: true,
      },
      { onConflict: "establishment_id,code" },
    );

  const { data: existingClub } = await admin
    .from("loyalty_clubs")
    .select("id")
    .eq("establishment_id", estab.id)
    .maybeSingle();
  if (existingClub) {
    await admin
      .from("loyalty_clubs")
      .update({
        name: e.loyalty.name,
        visits_required: e.loyalty.visits_required,
        benefit_description: e.loyalty.benefit_description,
        is_active: true,
      })
      .eq("id", existingClub.id);
  } else {
    await admin.from("loyalty_clubs").insert({
      establishment_id: estab.id,
      name: e.loyalty.name,
      visits_required: e.loyalty.visits_required,
      benefit_description: e.loyalty.benefit_description,
      is_active: true,
    });
  }
}

async function main() {
  await confirmAndPromoteAdmin("mathe@diretoriow.com.br");
  await ensureExtraCategories();

  const ownerId = await ensureDemoOwner();
  console.log(`• Demo owner id: ${ownerId}`);

  const { data: cats } = await admin.from("categories").select("id, slug");
  const catBySlug = Object.fromEntries((cats ?? []).map((c) => [c.slug, c.id]));

  let done = 0;
  for (const e of ESTABLISHMENTS) {
    await seedEstablishment(ownerId, e, catBySlug);
    done += 1;
    if (done % 10 === 0) console.log(`  ${done}/${ESTABLISHMENTS.length} seedados`);
  }

  console.log(`\n✓ Total seedado: ${done} estabelecimentos`);
  const { count } = await admin
    .from("establishments")
    .select("*", { count: "exact", head: true });
  console.log(`✓ Estabelecimentos no banco agora: ${count}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
