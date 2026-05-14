/* eslint-disable no-console */
// Seed de demonstração do módulo Delivery & Entregadores do BRAVA+.
// Cria 20 entregadores (mix freelancer + equipe), 1 conta demo do entregador,
// endereços pros assinantes, 50 orders com delivery em diferentes estágios.
//
// Rodar:
//   cd apps/web && set -a && source .env.local && set +a && pnpm exec tsx scripts/seed-delivery-demo.ts
//
// Idempotente: pode rodar várias vezes — só cria o que ainda não existe.

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

// ============================================================
// Constants
// ============================================================
const DEMO_DELIVERER_EMAIL = "demo-entregador@bravamais.app";
const DEMO_DELIVERER_PASSWORD = "DemoEntreg@2026!";

const PASSWORD_DEFAULT = "Brava@2026Delivery!";

const VEHICLES = ["moto", "moto", "moto", "moto", "carro", "carro", "bike", "bike", "a_pe", "van"] as const;
const MOTO_MODELS = ["Honda 160", "Honda Biz", "Yamaha Factor", "Honda XRE", "Yamaha Lander"];
const CAR_MODELS = ["Fiat Uno", "VW Gol", "Hyundai HB20", "Renault Kwid"];
const BIKE_MODELS = ["Caloi 10", "MTB Aro 29", "Bike elétrica"];
const COLORS = ["Vermelha", "Preta", "Branca", "Azul", "Cinza", "Prata", "Amarela"];

const FIRSTS = [
  "Carlos", "Ana", "João", "Maria", "Pedro", "Júlia", "Lucas", "Marina", "Rafael", "Beatriz",
  "Diego", "Camila", "Bruno", "Larissa", "Felipe", "Patrícia", "Thiago", "Fernanda", "Gabriel",
  "Letícia", "Matheus", "Renata", "Vinicius", "Sabrina", "Rodrigo",
];
const LASTS = [
  "Silva", "Souza", "Oliveira", "Santos", "Pereira", "Lima", "Costa", "Ferreira", "Almeida",
  "Carvalho", "Ribeiro", "Martins", "Gomes", "Mendes", "Barbosa", "Rocha", "Dias",
];

const PHONE_DDDs = ["11", "11", "11", "21", "11", "11"];

// ============================================================
// Util
// ============================================================
function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const ddd = rand(PHONE_DDDs);
  const a = 9;
  const b = String(Math.floor(1000 + Math.random() * 9000));
  const c = String(Math.floor(1000 + Math.random() * 9000));
  return `(${ddd}) ${a}${b}-${c}`;
}

function randomCpf(): string {
  const n = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join("");
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`;
}

function randomPlate(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const L = (n: number) => Array.from({ length: n }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  return `${L(3)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function jitter(value: number, amount = 0.012): number {
  return value + (Math.random() - 0.5) * amount;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function code4(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function fullAddress(o: { street?: string | null; number?: string | null; neighborhood?: string | null; city?: string | null; state?: string | null; cep?: string | null }): string {
  const p1 = [o.street, o.number].filter(Boolean).join(", ");
  const p2 = [o.neighborhood, o.city, o.state].filter(Boolean).join(" - ");
  return [p1, p2, o.cep].filter(Boolean).join(", ");
}

function pickVehicleModel(v: string): string {
  if (v === "moto") return rand(MOTO_MODELS);
  if (v === "carro") return rand(CAR_MODELS);
  if (v === "bike") return rand(BIKE_MODELS);
  if (v === "van") return "Fiat Ducato";
  return "";
}

// ============================================================
// Helpers — find or create user
// ============================================================
async function findUserByEmail(email: string): Promise<string | null> {
  // listUsers via admin API com filtro indireto (paginated)
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.warn(`[listUsers] ${error.message}`);
    return null;
  }
  const u = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return u?.id ?? null;
}

async function ensureUser(email: string, password: string, fullName: string): Promise<string> {
  const existing = await findUserByEmail(email);
  if (existing) return existing;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user.id;
}

// ============================================================
// Seeders
// ============================================================
interface DelivererSeed {
  email: string;
  fullName: string;
  vehicle: string;
  vehicleModel: string;
  vehicleColor: string;
  plate: string;
  phone: string;
  cpf: string;
  city: string;
  state: string;
  status: "approved" | "pending_review";
  isPublic: boolean;
  isDemo: boolean;
}

function makeSeeds(): DelivererSeed[] {
  const seeds: DelivererSeed[] = [];
  // Demo user (login fácil pro user testar)
  seeds.push({
    email: DEMO_DELIVERER_EMAIL,
    fullName: "Demo Entregador",
    vehicle: "moto",
    vehicleModel: "Honda 160",
    vehicleColor: "Amarela",
    plate: "BRA-2026",
    phone: "(11) 99000-0001",
    cpf: "000.000.000-01",
    city: "São Paulo",
    state: "SP",
    status: "approved",
    isPublic: false,
    isDemo: true,
  });

  // 5 freelancers públicos aprovados
  for (let i = 0; i < 5; i++) {
    const first = rand(FIRSTS);
    const last = rand(LASTS);
    const veh = rand(VEHICLES);
    seeds.push({
      email: `freelancer-${i + 1}@bravamais.app`,
      fullName: `${first} ${last}`,
      vehicle: veh,
      vehicleModel: pickVehicleModel(veh),
      vehicleColor: rand(COLORS),
      plate: veh === "moto" || veh === "carro" || veh === "van" ? randomPlate() : "",
      phone: randomPhone(),
      cpf: randomCpf(),
      city: "São Paulo",
      state: "SP",
      status: "approved",
      isPublic: true,
      isDemo: false,
    });
  }

  // 3 freelancers públicos pendentes (pra admin testar aprovação)
  for (let i = 0; i < 3; i++) {
    const first = rand(FIRSTS);
    const last = rand(LASTS);
    const veh = rand(VEHICLES);
    seeds.push({
      email: `candidato-${i + 1}@bravamais.app`,
      fullName: `${first} ${last}`,
      vehicle: veh,
      vehicleModel: pickVehicleModel(veh),
      vehicleColor: rand(COLORS),
      plate: veh === "moto" || veh === "carro" || veh === "van" ? randomPlate() : "",
      phone: randomPhone(),
      cpf: randomCpf(),
      city: "São Paulo",
      state: "SP",
      status: "pending_review",
      isPublic: true,
      isDemo: false,
    });
  }

  // 11 entregadores de equipe (vinculados a estabs)
  for (let i = 0; i < 11; i++) {
    const first = rand(FIRSTS);
    const last = rand(LASTS);
    const veh = rand(VEHICLES);
    seeds.push({
      email: `entregador-${i + 1}@bravamais.app`,
      fullName: `${first} ${last}`,
      vehicle: veh,
      vehicleModel: pickVehicleModel(veh),
      vehicleColor: rand(COLORS),
      plate: veh === "moto" || veh === "carro" || veh === "van" ? randomPlate() : "",
      phone: randomPhone(),
      cpf: randomCpf(),
      city: "São Paulo",
      state: "SP",
      status: "approved",
      isPublic: false,
      isDemo: false,
    });
  }

  return seeds;
}

interface DelivererRow {
  id: string;
  user_id: string;
}

async function seedDeliverers(): Promise<{ approved: DelivererRow[]; demo: DelivererRow | null }> {
  const seeds = makeSeeds();
  const approved: DelivererRow[] = [];
  let demo: DelivererRow | null = null;

  for (const s of seeds) {
    const password = s.isDemo ? DEMO_DELIVERER_PASSWORD : PASSWORD_DEFAULT;
    const userId = await ensureUser(s.email, password, s.fullName);

    // Promove role
    await admin.from("profiles").update({ role: "deliverer", full_name: s.fullName, phone: s.phone, cpf: s.cpf }).eq("id", userId);

    // Já existe deliverer pra esse user?
    const { data: existingDeliverer } = await admin
      .from("deliverers")
      .select("id, user_id")
      .eq("user_id", userId)
      .maybeSingle<DelivererRow>();

    let delivererId: string;
    if (existingDeliverer) {
      delivererId = existingDeliverer.id;
      // Atualiza pra refletir estado correto
      await admin
        .from("deliverers")
        .update({
          status: s.status,
          is_public_freelancer: s.isPublic,
          is_online: s.status === "approved",
          approved_at: s.status === "approved" ? new Date().toISOString() : null,
        })
        .eq("id", delivererId);
    } else {
      const { data: inserted, error: insErr } = await admin
        .from("deliverers")
        .insert({
          user_id: userId,
          full_name: s.fullName,
          phone: s.phone,
          whatsapp: s.phone,
          email: s.email,
          cpf: s.cpf,
          vehicle: s.vehicle,
          vehicle_model: s.vehicleModel || null,
          vehicle_color: s.vehicleColor || null,
          plate: s.plate || null,
          city: s.city,
          state: s.state,
          status: s.status,
          is_public_freelancer: s.isPublic,
          is_online: s.status === "approved",
          approved_at: s.status === "approved" ? new Date().toISOString() : null,
          rating_avg: s.status === "approved" ? Math.round((4 + Math.random()) * 10) / 10 : null,
          rating_count: s.status === "approved" ? Math.floor(Math.random() * 50) : 0,
          total_deliveries: s.status === "approved" ? Math.floor(Math.random() * 80) : 0,
        })
        .select("id, user_id")
        .single<DelivererRow>();
      if (insErr || !inserted) throw new Error(`Insert deliverer ${s.email}: ${insErr?.message}`);
      delivererId = inserted.id;
    }

    if (s.isDemo) demo = { id: delivererId, user_id: userId };
    if (s.status === "approved") approved.push({ id: delivererId, user_id: userId });
    console.log(`  ✓ ${s.fullName.padEnd(28)} ${s.status.padEnd(15)} ${s.isPublic ? "freelancer" : "equipe"} ${s.email}`);
  }

  return { approved, demo };
}

interface EstabRow {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  cep: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
}

async function linkDeliverersToEstablishments(deliverers: DelivererRow[], estabs: EstabRow[], demoDelivererId: string | null) {
  console.log("\n🔗 Vinculando entregadores às lojas...");

  // Demo deliverer vinculado a TODAS as lojas pra facilitar testes
  if (demoDelivererId) {
    for (const e of estabs) {
      await admin
        .from("establishment_deliverers")
        .upsert(
          { establishment_id: e.id, deliverer_id: demoDelivererId, hired_via: "manual", is_active: true },
          { onConflict: "establishment_id,deliverer_id" },
        );
    }
    console.log(`  ✓ demo-entregador vinculado a ${estabs.length} lojas`);
  }

  // Outros entregadores (não-demo): cada um vinculado a 1-3 lojas aleatórias
  for (const d of deliverers) {
    if (d.id === demoDelivererId) continue;
    const n = 1 + Math.floor(Math.random() * 3);
    const picks = [...estabs].sort(() => Math.random() - 0.5).slice(0, n);
    for (const e of picks) {
      await admin
        .from("establishment_deliverers")
        .upsert(
          { establishment_id: e.id, deliverer_id: d.id, hired_via: Math.random() > 0.5 ? "manual" : "bridge", is_active: true },
          { onConflict: "establishment_id,deliverer_id" },
        );
    }
  }
  console.log(`  ✓ ${deliverers.length - 1} entregadores adicionais distribuídos`);
}

async function ensureAddressForSubscriber(userId: string, estabs: EstabRow[]): Promise<string | null> {
  const { data: existing } = await admin
    .from("user_addresses")
    .select("id")
    .eq("user_id", userId)
    .limit(1);
  if (existing && existing.length > 0) return existing[0].id;

  // Cria endereço com jitter perto de um estab aleatório (pra ficar no raio)
  const e = rand(estabs);
  if (!e.lat || !e.lng) return null;

  const { data: addr } = await admin
    .from("user_addresses")
    .insert({
      user_id: userId,
      label: "Casa",
      cep: e.cep ?? "01310-000",
      street: "R. das Flores",
      number: String(Math.floor(100 + Math.random() * 900)),
      neighborhood: e.neighborhood ?? "Centro",
      city: e.city ?? "São Paulo",
      state: e.state ?? "SP",
      lat: jitter(e.lat, 0.04),
      lng: jitter(e.lng, 0.04),
      is_default: true,
    })
    .select("id")
    .single();
  return addr?.id ?? null;
}

interface OrderTarget {
  status: "pending_payment" | "paid" | "preparing" | "ready" | "completed";
  deliveryType: "pickup" | "delivery";
  deliveryStatus?: "awaiting_assignment" | "assigned" | "accepted" | "picked_up" | "in_transit" | "delivered";
  assignDeliverer?: boolean;
}

function buildOrderPlan(): OrderTarget[] {
  const plan: OrderTarget[] = [];
  // 10 entregas awaiting_assignment (PRINCIPAL pedido do user)
  for (let i = 0; i < 10; i++) plan.push({ status: "paid", deliveryType: "delivery", deliveryStatus: "awaiting_assignment" });
  // 8 entregas assigned (já atribuídas, esperando entregador aceitar)
  for (let i = 0; i < 8; i++) plan.push({ status: "preparing", deliveryType: "delivery", deliveryStatus: "assigned", assignDeliverer: true });
  // 6 entregas aceitas
  for (let i = 0; i < 6; i++) plan.push({ status: "preparing", deliveryType: "delivery", deliveryStatus: "accepted", assignDeliverer: true });
  // 4 em rota
  for (let i = 0; i < 4; i++) plan.push({ status: "ready", deliveryType: "delivery", deliveryStatus: "in_transit", assignDeliverer: true });
  // 8 entregues
  for (let i = 0; i < 8; i++) plan.push({ status: "completed", deliveryType: "delivery", deliveryStatus: "delivered", assignDeliverer: true });
  // 8 pickup (sem delivery)
  for (let i = 0; i < 8; i++) plan.push({ status: "completed", deliveryType: "pickup" });
  // 6 pickup pending payment
  for (let i = 0; i < 6; i++) plan.push({ status: "pending_payment", deliveryType: "pickup" });
  // Total: 50 ✓
  return plan;
}

interface DelivererForAssign {
  id: string;
  user_id: string;
  estab_ids: Set<string>;
}

async function seedOrders(estabs: EstabRow[], subscribers: { id: string }[], deliverers: DelivererRow[]) {
  console.log("\n🛒 Criando 50 orders + deliveries de demonstração...");

  // Pré-mapeia entregador -> estabelecimentos que pode atender
  const delivererEstabMap: Map<string, Set<string>> = new Map();
  const { data: pivots } = await admin
    .from("establishment_deliverers")
    .select("deliverer_id, establishment_id")
    .eq("is_active", true);
  for (const p of pivots ?? []) {
    if (!delivererEstabMap.has(p.deliverer_id)) delivererEstabMap.set(p.deliverer_id, new Set());
    delivererEstabMap.get(p.deliverer_id)!.add(p.establishment_id);
  }

  const delivererPool: DelivererForAssign[] = deliverers.map((d) => ({
    id: d.id,
    user_id: d.user_id,
    estab_ids: delivererEstabMap.get(d.id) ?? new Set(),
  }));

  const plan = buildOrderPlan();
  let created = 0;
  let createdAwaiting = 0;

  for (const target of plan) {
    if (subscribers.length === 0 || estabs.length === 0) break;

    const subscriber = rand(subscribers);
    const estab = rand(estabs);

    if (!estab.lat || !estab.lng) continue;

    // Pega um produto desse estab
    const { data: products } = await admin
      .from("products")
      .select("id, price_cents, name")
      .eq("establishment_id", estab.id)
      .eq("is_active", true)
      .limit(10);
    if (!products || products.length === 0) continue;
    const product = rand(products);
    const qty = 1 + Math.floor(Math.random() * 2);
    const subtotal = product.price_cents * qty;

    let feeCents = 0;
    let distanceKm: number | null = null;
    let addressId: string | null = null;
    let dropoffLat: number | null = null;
    let dropoffLng: number | null = null;
    let dropoffAddress = "";
    let recipientName = "Cliente";
    let recipientPhone: string | null = null;

    if (target.deliveryType === "delivery") {
      addressId = await ensureAddressForSubscriber(subscriber.id, estabs);
      if (!addressId) continue;
      const { data: addr } = await admin
        .from("user_addresses")
        .select("street, number, neighborhood, city, state, cep, lat, lng, recipient_name, recipient_phone")
        .eq("id", addressId)
        .single();
      if (!addr || !addr.lat || !addr.lng) continue;
      dropoffLat = addr.lat;
      dropoffLng = addr.lng;
      dropoffAddress = fullAddress(addr);
      recipientName = addr.recipient_name ?? "Cliente";
      recipientPhone = addr.recipient_phone ?? null;

      distanceKm = Math.round(haversineKm({ lat: estab.lat, lng: estab.lng }, { lat: dropoffLat as number, lng: dropoffLng as number }) * 100) / 100;
      // Aplica faixa apropriada: <5 = 1500, <10 = 2500, <=20 = 3500
      if (distanceKm > 20) {
        // Reduz distância recriando endereço mais perto
        await admin
          .from("user_addresses")
          .update({ lat: jitter(estab.lat, 0.02), lng: jitter(estab.lng, 0.02) })
          .eq("id", addressId);
        const { data: re } = await admin.from("user_addresses").select("lat, lng").eq("id", addressId).single<{ lat: number | null; lng: number | null }>();
        dropoffLat = re?.lat ?? dropoffLat;
        dropoffLng = re?.lng ?? dropoffLng;
        distanceKm = Math.round(haversineKm({ lat: estab.lat, lng: estab.lng }, { lat: dropoffLat as number, lng: dropoffLng as number }) * 100) / 100;
      }
      if (distanceKm <= 5) feeCents = 1500;
      else if (distanceKm <= 10) feeCents = 2500;
      else feeCents = 3500;
    }

    const totalCents = subtotal + feeCents;

    // Cria order
    const { data: orderRow, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: subscriber.id,
        establishment_id: estab.id,
        status: target.status,
        subtotal_cents: subtotal,
        discount_cents: 0,
        total_cents: totalCents,
        payment_method: "pix",
        delivery_type: target.deliveryType,
        delivery_address_id: addressId,
        delivery_fee_cents: feeCents,
        delivery_distance_km: distanceKm,
        paid_at: target.status === "pending_payment" ? null : new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        completed_at: target.status === "completed" ? new Date().toISOString() : null,
      })
      .select("id")
      .single<{ id: string }>();

    if (orderErr || !orderRow) {
      console.warn(`  ! erro criando order: ${orderErr?.message}`);
      continue;
    }

    // order_items
    await admin.from("order_items").insert({
      order_id: orderRow.id,
      product_id: product.id,
      qty,
      unit_price_cents: product.price_cents,
    });

    // delivery (se for delivery)
    if (target.deliveryType === "delivery" && target.deliveryStatus) {
      let delivererId: string | null = null;
      let acceptedAt: string | null = null;
      let pickedUpAt: string | null = null;
      let deliveredAt: string | null = null;
      let assignedAt: string | null = null;

      if (target.assignDeliverer) {
        // Pega entregador vinculado a esse estab; senão, qualquer um aprovado
        const candidates = delivererPool.filter((d) => d.estab_ids.has(estab.id));
        const pool = candidates.length > 0 ? candidates : delivererPool;
        if (pool.length === 0) continue;
        delivererId = rand(pool).id;
        assignedAt = new Date().toISOString();
        if (["accepted", "picked_up", "in_transit", "delivered"].includes(target.deliveryStatus)) acceptedAt = assignedAt;
        if (["picked_up", "in_transit", "delivered"].includes(target.deliveryStatus)) pickedUpAt = assignedAt;
        if (target.deliveryStatus === "delivered") deliveredAt = new Date().toISOString();
      } else if (target.deliveryStatus !== "awaiting_assignment") {
        assignedAt = new Date().toISOString();
      }

      await admin.from("deliveries").insert({
        order_id: orderRow.id,
        establishment_id: estab.id,
        deliverer_id: delivererId,
        status: target.deliveryStatus,
        pickup_address: fullAddress(estab),
        pickup_lat: estab.lat,
        pickup_lng: estab.lng,
        dropoff_address: dropoffAddress,
        dropoff_lat: dropoffLat,
        dropoff_lng: dropoffLng,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        distance_km: distanceKm,
        fee_cents: feeCents,
        confirmation_code: code4(),
        assigned_at: assignedAt,
        accepted_at: acceptedAt,
        picked_up_at: pickedUpAt,
        delivered_at: deliveredAt,
      });
      if (target.deliveryStatus === "awaiting_assignment") createdAwaiting++;
    }

    created++;
  }

  console.log(`  ✓ ${created} orders criadas (${createdAwaiting} entregas aguardando atribuição)`);
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log("\n🛵 BRAVA+ — Seed Delivery & Entregadores\n");

  // 1. Entregadores
  console.log("👤 Criando 20 entregadores (mix freelancer/equipe + demo)...");
  const { approved, demo } = await seedDeliverers();

  // 2. Estabelecimentos (todos com coords)
  const { data: estabsData } = await admin
    .from("establishments")
    .select("id, name, slug, owner_id, cep, street, number, neighborhood, city, state, lat, lng")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .eq("is_active", true)
    .limit(50);

  const estabs = (estabsData ?? []) as EstabRow[];
  console.log(`\n🏪 Encontrados ${estabs.length} estabelecimentos ativos.`);

  // 3. Vincula entregadores às lojas
  await linkDeliverersToEstablishments(approved, estabs, demo?.id ?? null);

  // 4. Pega assinantes (não-owners)
  const { data: subscribersData } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "subscriber")
    .limit(30);
  const subscribers = (subscribersData ?? []).map((s) => ({ id: s.id }));
  console.log(`\n👥 Usando ${subscribers.length} assinantes pra criar pedidos.`);

  if (subscribers.length === 0) {
    console.log("\n⚠️  Nenhum assinante encontrado. Pulando criação de orders.");
    console.log("    Crie pelo menos 1 conta no /cadastro e rode novamente.");
    return;
  }

  // 5. Cria orders + deliveries
  await seedOrders(estabs, subscribers, approved);

  console.log("\n✅ Seed concluído!");
  console.log("\n🔑 Acesso de demo:");
  console.log(`   Entregador: ${DEMO_DELIVERER_EMAIL} / ${DEMO_DELIVERER_PASSWORD}`);
  console.log(`   Senha padrão dos demais entregadores: ${PASSWORD_DEFAULT}`);
  console.log(`   (login em /entrar → será redirecionado pra /entregador)\n`);
}

main().catch((err) => {
  console.error("\n❌ Erro:", err);
  process.exit(1);
});
