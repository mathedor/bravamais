import { createClient } from "@supabase/supabase-js";
import WS from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Node 20 needs explicit WS injection for supabase-js realtime
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
  cover_url?: string;
  categories: string[];
  promos: PromotionType[];
  products: { name: string; description?: string; price_cents: number; photo?: string }[];
  coupon?: { code: string; discount_percent?: number; discount_cents?: number; description: string };
  loyalty?: { name: string; visits_required: number; benefit_description: string };
  phone?: string;
  whatsapp?: string;
  instagram?: string;
}

const DEMO_OWNER_EMAIL = "demo-owner@bravamais.app";
const DEMO_OWNER_PASSWORD = "DemoOwner@2026!";

const ESTABLISHMENTS: EstablishmentSeed[] = [
  {
    slug: "boteco-do-zeca",
    name: "Boteco do Zeca",
    tagline: "Boteco raiz com chopp gelado e petisco bom",
    description: "Boteco tradicional com a melhor chopp da região. Petiscos, música ao vivo nos fins de semana e clima de bairro.",
    city: "São Paulo", state: "SP", lat: -23.561414, lng: -46.655881,
    photos: [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200",
    ],
    logo_url: "https://api.dicebear.com/9.x/initials/svg?seed=Boteco+Zeca&backgroundColor=fbbf24",
    cover_url: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1600",
    categories: ["bares"],
    promos: ["cupom_desconto", "clube_fidelidade"],
    products: [
      { name: "Chopp Pilsen 300ml", description: "Servido bem gelado", price_cents: 990, photo: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600" },
      { name: "Porção de bolinho de bacalhau", description: "10 unidades", price_cents: 4490, photo: "https://images.unsplash.com/photo-1599982920763-fae37e92a96b?w=600" },
      { name: "Caldinho de feijão", price_cents: 1290 },
    ],
    coupon: { code: "PRIMEIRACHOPP", discount_percent: 20, description: "20% na primeira rodada" },
    loyalty: { name: "Mestre da Casa", visits_required: 5, benefit_description: "Chopp em dobro toda 5ª visita" },
    phone: "1133334444", whatsapp: "5511999998888", instagram: "@botecodozeca",
  },
  {
    slug: "bistro-da-rua-cinco",
    name: "Bistrô da Rua Cinco",
    tagline: "Cozinha autoral, ingredientes locais",
    description: "Menu sazonal com ingredientes do produtor. Ambiente intimista perfeito pra encontros especiais.",
    city: "São Paulo", state: "SP", lat: -23.564224, lng: -46.652102,
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
    ],
    logo_url: "https://api.dicebear.com/9.x/initials/svg?seed=Bistro+5&backgroundColor=1e3a8a&textColor=fbbf24",
    cover_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600",
    categories: ["restaurantes"],
    promos: ["cupom_desconto", "vale_presente"],
    products: [
      { name: "Risoto de funghi", price_cents: 6890, photo: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600" },
      { name: "Menu degustação 5 tempos", price_cents: 18900 },
    ],
    coupon: { code: "BISTRO15", discount_percent: 15, description: "15% no menu degustação" },
    loyalty: { name: "Cliente especial", visits_required: 4, benefit_description: "Sobremesa por conta da casa" },
  },
  {
    slug: "padaria-pao-da-vovo",
    name: "Padaria Pão da Vovó",
    tagline: "Padaria de bairro com pão quentinho o dia todo",
    description: "Pão francês, doces caseiros, café gourmet e almoço executivo.",
    city: "São Paulo", state: "SP", lat: -23.547654, lng: -46.641129,
    photos: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200",
      "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=1200",
    ],
    logo_url: "https://api.dicebear.com/9.x/initials/svg?seed=Pao+Vovo&backgroundColor=fbbf24",
    categories: ["cafes"],
    promos: ["clube_fidelidade", "cupom_desconto"],
    products: [
      { name: "Pão de queijo", price_cents: 590 },
      { name: "Café espresso", price_cents: 790 },
    ],
    coupon: { code: "CAFE10", discount_cents: 200, description: "R$ 2 off no combo café+pão" },
    loyalty: { name: "Café fiel", visits_required: 10, benefit_description: "10ª compra com café grátis" },
  },
  {
    slug: "studio-fit-vila-nova",
    name: "Studio Fit Vila Nova",
    tagline: "Crossfit, funcional e personal",
    description: "Box completo, aulas de crossfit, funcional, mobilidade e atendimento com personal individual.",
    city: "São Paulo", state: "SP", lat: -23.586711, lng: -46.687922,
    photos: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200",
    ],
    logo_url: "https://api.dicebear.com/9.x/initials/svg?seed=Studio+Fit&backgroundColor=1e3a8a&textColor=fbbf24",
    categories: ["esportes", "saude"],
    promos: ["cupom_desconto", "clube_fidelidade"],
    products: [
      { name: "Aula experimental", price_cents: 0 },
      { name: "Plano mensal 3x semana", price_cents: 24900 },
    ],
    coupon: { code: "FITSTART", discount_percent: 30, description: "30% no primeiro mês de plano" },
    loyalty: { name: "Treino constante", visits_required: 20, benefit_description: "20 check-ins = 1 sessão de personal grátis" },
  },
  {
    slug: "salao-corte-belo",
    name: "Salão Corte & Belo",
    tagline: "Salão de beleza completo, mão de obra premiada",
    description: "Corte, coloração, escova, manicure e tratamentos capilares. Profissionais com prêmios nacionais.",
    city: "São Paulo", state: "SP", lat: -23.572234, lng: -46.660555,
    photos: [
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200",
      "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200",
    ],
    logo_url: "https://api.dicebear.com/9.x/initials/svg?seed=Corte+Belo&backgroundColor=fbbf24",
    categories: ["beleza"],
    promos: ["cupom_desconto", "vale_presente", "clube_fidelidade"],
    products: [
      { name: "Corte feminino", price_cents: 9000 },
      { name: "Coloração completa", price_cents: 24000 },
    ],
    coupon: { code: "BELO20", discount_percent: 20, description: "20% no primeiro corte" },
    loyalty: { name: "Cliente do salão", visits_required: 8, benefit_description: "8ª visita: tratamento capilar grátis" },
  },
  {
    slug: "moda-zen",
    name: "Moda Zen",
    tagline: "Roupas conceituais com curadoria",
    description: "Marcas independentes brasileiras. Foco em produção consciente e peças atemporais.",
    city: "São Paulo", state: "SP", lat: -23.555612, lng: -46.671224,
    photos: [
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
    ],
    logo_url: "https://api.dicebear.com/9.x/initials/svg?seed=Moda+Zen&backgroundColor=1e3a8a&textColor=fbbf24",
    categories: ["moda"],
    promos: ["cupom_desconto", "vale_compras"],
    products: [
      { name: "Camiseta básica algodão pima", price_cents: 14900 },
      { name: "Calça reta alfaiataria", price_cents: 38900 },
    ],
    coupon: { code: "ZEN10", discount_percent: 10, description: "10% na primeira compra" },
  },
  {
    slug: "patinhas-pet-shop",
    name: "Patinhas Pet Shop",
    tagline: "Tudo pro melhor amigo, com atendimento veterinário",
    description: "Banho, tosa, veterinário e a melhor seleção de ração e brinquedos.",
    city: "São Paulo", state: "SP", lat: -23.591144, lng: -46.628772,
    photos: [
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200",
    ],
    logo_url: "https://api.dicebear.com/9.x/initials/svg?seed=Patinhas&backgroundColor=fbbf24",
    categories: ["petshop"],
    promos: ["clube_fidelidade", "cupom_desconto"],
    products: [
      { name: "Banho cão pequeno", price_cents: 6500 },
      { name: "Ração premium 10kg", price_cents: 18900 },
    ],
    coupon: { code: "BANHOPRIMEIRO", discount_percent: 25, description: "25% no primeiro banho" },
    loyalty: { name: "Pet camarada", visits_required: 6, benefit_description: "6º banho com tosa higiênica inclusa" },
  },
  {
    slug: "espaco-bem-viver",
    name: "Espaço Bem Viver",
    tagline: "Massagem, acupuntura e terapias integrativas",
    description: "Clínica de saúde integrativa com profissionais especializados em corpo e mente.",
    city: "São Paulo", state: "SP", lat: -23.534121, lng: -46.681223,
    photos: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200",
    ],
    logo_url: "https://api.dicebear.com/9.x/initials/svg?seed=Bem+Viver&backgroundColor=1e3a8a&textColor=fbbf24",
    categories: ["saude"],
    promos: ["cupom_desconto", "vale_presente", "clube_fidelidade"],
    products: [
      { name: "Massagem relaxante 60min", price_cents: 16900 },
      { name: "Sessão de acupuntura", price_cents: 18900 },
    ],
    coupon: { code: "BEMVIVER", discount_percent: 15, description: "15% na primeira sessão" },
    loyalty: { name: "Trilha do bem-estar", visits_required: 5, benefit_description: "5 sessões: ganhe uma massagem extra" },
  },
];

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
    console.log(`! Usuário ${email} não encontrado — pule a confirmação`);
    return;
  }
  if (!user.email_confirmed_at) {
    const { error } = await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
    if (error) throw error;
    console.log(`✓ Email confirmado: ${email}`);
  } else {
    console.log(`• Email já confirmado: ${email}`);
  }
  const { error: pErr } = await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
  if (pErr) throw pErr;
  console.log(`✓ Promovido a admin: ${email}`);
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
  if (error || !estab) throw error || new Error("no estab returned");

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

  // products: delete current, insert fresh
  await admin.from("products").delete().eq("establishment_id", estab.id);
  if (e.products.length) {
    await admin.from("products").insert(
      e.products.map((p) => ({
        establishment_id: estab.id,
        name: p.name,
        description: p.description ?? null,
        price_cents: p.price_cents,
        photos: p.photo ? [p.photo] : [],
        is_active: true,
      })),
    );
  }

  if (e.coupon) {
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
  }

  if (e.loyalty) {
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

  console.log(`✓ Estabelecimento: ${e.slug}`);
}

async function main() {
  await confirmAndPromoteAdmin("mathe@diretoriow.com.br");

  const ownerId = await ensureDemoOwner();
  console.log(`• Demo owner id: ${ownerId}`);

  const { data: cats, error: cErr } = await admin
    .from("categories")
    .select("id, slug");
  if (cErr) throw cErr;
  const catBySlug = Object.fromEntries((cats ?? []).map((c) => [c.slug, c.id]));

  for (const e of ESTABLISHMENTS) {
    await seedEstablishment(ownerId, e, catBySlug);
  }

  console.log("\nDone.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
