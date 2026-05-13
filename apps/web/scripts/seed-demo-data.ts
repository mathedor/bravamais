/**
 * Popula o banco com dados de demonstração realistas:
 * - 5 subscribers demo
 * - Visits, loyalty progress + rewards, coupon redemptions
 * - Gift card purchases (dados, recebidos)
 * - Orders + order_items pagos
 * - Withdrawals (pending + paid)
 * - Refund tickets em diversos status
 * - Stories ativos
 * - Notifications
 *
 * Idempotente: usa upsert ou check-before-insert.
 *
 * Rodar:
 *   cd apps/web && set -a && source .env.local && set +a && pnpm exec tsx scripts/seed-demo-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import WS from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Missing env vars");
  process.exit(1);
}

(globalThis as { WebSocket?: typeof WebSocket }).WebSocket =
  (globalThis as { WebSocket?: typeof WebSocket }).WebSocket ??
  (WS as unknown as typeof WebSocket);

const admin = createClient(url, key, { auth: { persistSession: false } });

const today = new Date();
const todayIso = (mm: number, dd: number) =>
  `${today.getFullYear() - 30}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;

const DEMO_SUBSCRIBERS = [
  { email: "maria.demo@bravamais.app", name: "Maria Silva", city: "São Paulo", state: "SP", birthdate: todayIso(today.getMonth() + 1, today.getDate()) }, // hoje! testa birthday
  { email: "joao.demo@bravamais.app", name: "João Santos", city: "São Paulo", state: "SP", birthdate: "1992-08-14" },
  { email: "ana.demo@bravamais.app", name: "Ana Costa", city: "São Paulo", state: "SP", birthdate: "1990-03-22" },
  { email: "pedro.demo@bravamais.app", name: "Pedro Lima", city: "São Paulo", state: "SP", birthdate: "1988-11-05" },
  { email: "carla.demo@bravamais.app", name: "Carla Mendes", city: "São Paulo", state: "SP", birthdate: "1995-06-17" },
];

const STORY_PHOTOS = [
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
  "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800",
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800",
  "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800",
  "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800",
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800",
];

const STORY_CAPTIONS = [
  "Chopp em dobro até 22h hoje!",
  "Acabou de sair do forno 🔥",
  "Promoção surpresa, só hoje",
  "Ambiente animado essa noite",
  "Confira nossa novidade do dia",
  "Casa cheia, venha aproveitar",
  "10% off em qualquer item até fechar",
  "Música ao vivo a partir das 20h",
];

const REFUND_REASONS = [
  "Produto chegou com defeito",
  "Não foi o que pedi",
  "Demora excessiva na entrega",
  "Mudei de ideia",
  "Estabelecimento estava fechado",
];

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString();
}

async function ensureSubscriber(spec: typeof DEMO_SUBSCRIBERS[number]): Promise<string> {
  // Try find existing
  let page = 1;
  while (page < 10) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    const found = data.users.find((u) => u.email === spec.email);
    if (found) {
      await admin
        .from("profiles")
        .update({ full_name: spec.name, role: "subscriber", city: spec.city, state: spec.state, birthdate: spec.birthdate })
        .eq("id", found.id);
      return found.id;
    }
    if (data.users.length < 200) break;
    page += 1;
  }

  // Create
  const { data, error } = await admin.auth.admin.createUser({
    email: spec.email,
    password: "Demo@2026Brava",
    email_confirm: true,
    user_metadata: { full_name: spec.name },
  });
  if (error || !data.user) throw new Error(`createUser ${spec.email}: ${error?.message}`);
  await admin
    .from("profiles")
    .update({ full_name: spec.name, role: "subscriber", city: spec.city, state: spec.state, birthdate: spec.birthdate })
    .eq("id", data.user.id);

  // Ativa subscription premium
  await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: data.user.id,
        tier: "premium",
        status: "active",
        current_period_start: daysAgo(20),
        current_period_end: daysAgo(-25),
      },
      { onConflict: "user_id" },
    );

  return data.user.id;
}

async function seedStories(estabId: string, ownerId: string) {
  // Limpa stories antigos
  await admin.from("establishment_stories").delete().eq("establishment_id", estabId);
  // Cria 2-4 stories ativos
  const n = 2 + Math.floor(Math.random() * 3);
  const rows = Array.from({ length: n }).map((_, i) => ({
    establishment_id: estabId,
    media_url: pickOne(STORY_PHOTOS),
    caption: pickOne(STORY_CAPTIONS),
    expires_at: new Date(Date.now() + (12 + i * 4) * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - i * 3600 * 1000).toISOString(),
  }));
  await admin.from("establishment_stories").insert(rows);

  // Log
  await admin.from("access_logs").insert(
    rows.map(() => ({
      user_id: ownerId,
      entity_type: "establishment",
      entity_id: estabId,
      action: "story_posted",
    })),
  );
}

async function seedVisitsAndLoyalty(userId: string, estabId: string, scannerId: string, count: number) {
  for (let i = 0; i < count; i++) {
    await admin.from("visits").insert({
      user_id: userId,
      establishment_id: estabId,
      source: "qr_scan",
      scanned_by_user_id: scannerId,
      created_at: daysAgo(Math.floor(Math.random() * 30)),
    });
  }

  // Loyalty progress
  const { data: club } = await admin
    .from("loyalty_clubs")
    .select("id, visits_required")
    .eq("establishment_id", estabId)
    .maybeSingle();
  if (club) {
    const visits = Math.min(count, club.visits_required);
    await admin.from("loyalty_progress").upsert(
      {
        user_id: userId,
        club_id: club.id,
        visits_count: visits,
        completed_at: visits >= club.visits_required ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,club_id" },
    );
  }
}

async function seedCouponRedemption(userId: string, estabId: string) {
  const { data: coupons } = await admin
    .from("coupons")
    .select("id, uses_count")
    .eq("establishment_id", estabId)
    .eq("is_active", true)
    .limit(2);
  for (const c of coupons ?? []) {
    if (Math.random() > 0.5) continue;
    await admin.from("coupon_redemptions").insert({
      coupon_id: c.id,
      user_id: userId,
      redeemed_at: daysAgo(Math.floor(Math.random() * 20)),
    });
    await admin
      .from("coupons")
      .update({ uses_count: (c.uses_count ?? 0) + 1 })
      .eq("id", c.id);
  }
}

async function seedGiftCardPurchase(userId: string, estabId: string) {
  const values = [5000, 10000, 20000, 30000, 50000];
  const value = pickOne(values);
  const recipient = pickOne(["Pra você mesmo", "Maria", "João", "Pra um amigo"]);
  const messages = ["Aproveite!", "Feliz aniversário 🎉", "Você merece", "Vamos sair juntos"];
  const code = `GIFT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  await admin.from("gift_cards").insert({
    establishment_id: estabId,
    code,
    value_cents: value,
    remaining_cents: value,
    buyer_user_id: userId,
    granted_to_user_id: userId,
    recipient_name: recipient,
    recipient_message: pickOne(messages),
    granted_by: "purchase",
    status: "paid",
    efi_charge_id: `mock_${Date.now()}_${Math.random()}`,
    created_at: daysAgo(Math.floor(Math.random() * 15)),
  });
}

async function seedOrder(userId: string, estabId: string, status: "paid" | "completed") {
  const { data: products } = await admin
    .from("products")
    .select("id, price_cents, name")
    .eq("establishment_id", estabId)
    .limit(5);
  if (!products?.length) return null;

  const picked = pickRandom(products, Math.min(3, products.length));
  const items = picked.map((p) => ({
    product_id: p.id,
    qty: 1 + Math.floor(Math.random() * 2),
    unit_price_cents: p.price_cents,
  }));
  const subtotal = items.reduce((s, it) => s + it.unit_price_cents * it.qty, 0);
  const discount = Math.floor(subtotal * 0.1 * Math.random()); // 0-10% off
  const total = subtotal - discount;

  const paymentMethods: ("pix" | "credit_card")[] = ["pix", "credit_card"];
  const { data: order } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      establishment_id: estabId,
      status,
      subtotal_cents: subtotal,
      discount_cents: discount,
      total_cents: total,
      payment_method: pickOne(paymentMethods),
      paid_at: daysAgo(Math.floor(Math.random() * 20)),
      completed_at: status === "completed" ? daysAgo(Math.floor(Math.random() * 15)) : null,
      created_at: daysAgo(Math.floor(Math.random() * 20) + 1),
    })
    .select("id")
    .single();

  if (order) {
    await admin.from("order_items").insert(
      items.map((it) => ({
        order_id: order.id,
        product_id: it.product_id,
        qty: it.qty,
        unit_price_cents: it.unit_price_cents,
      })),
    );
  }

  return order;
}

async function seedWithdrawals(estabId: string, ownerId: string) {
  await admin.from("withdrawals").delete().eq("establishment_id", estabId);
  const rows = [
    {
      establishment_id: estabId,
      amount_cents: 15000 + Math.floor(Math.random() * 30000),
      status: "paid" as const,
      pix_key: "demo@bravamais.app",
      requested_by_user_id: ownerId,
      requested_at: daysAgo(15),
      paid_at: daysAgo(13),
      receipt_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
      notes: "Saque mensal",
    },
    {
      establishment_id: estabId,
      amount_cents: 12000 + Math.floor(Math.random() * 20000),
      status: "pending" as const,
      pix_key: "demo@bravamais.app",
      requested_by_user_id: ownerId,
      requested_at: daysAgo(2),
      notes: "Saque pendente",
    },
  ];
  await admin.from("withdrawals").insert(rows);
}

async function seedRefundTicket(userId: string, estabId: string, orderId: string, status: string) {
  const ticketData: Record<string, unknown> = {
    order_id: orderId,
    user_id: userId,
    establishment_id: estabId,
    status,
    user_reason: pickOne(REFUND_REASONS),
    user_message: "Conforme combinado, gostaria do estorno.",
    refund_amount_cents: 5000 + Math.floor(Math.random() * 10000),
    created_at: daysAgo(Math.floor(Math.random() * 10) + 3),
  };
  if (status === "contested" || status === "refunded" || status === "rejected") {
    ticketData.establishment_contest = "Avaliamos seu caso, podemos resolver direto via cupom de 30%";
    ticketData.contested_at = daysAgo(Math.floor(Math.random() * 8) + 1);
  }
  if (status === "refunded" || status === "rejected") {
    ticketData.admin_decision = status === "refunded"
      ? "Estorno aprovado. Valor transferido via PIX."
      : "Após análise, não procede o pedido de estorno.";
    ticketData.resolved_at = daysAgo(Math.floor(Math.random() * 5));
    if (status === "refunded") {
      ticketData.refund_receipt_url = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400";
    }
  }
  await admin.from("refund_tickets").insert(ticketData);
}

async function seedNotifications(userId: string) {
  const items = [
    { type: "system", title: "🎉 Bem-vindo ao BRAVA+ Premium", body: "Aproveite todos os benefícios do clube" },
    { type: "establishment_news", title: "📣 Bistrô da Rua Cinco: Menu degustação 30% off só hoje", body: "Aproveite essa promoção" },
    { type: "loyalty_reward", title: "🎁 Você ganhou um cupom!", body: "Pelo clube de fidelidade da Padaria Pão da Vovó" },
  ];
  for (const item of items) {
    await admin.from("notifications").insert({
      user_id: userId,
      ...item,
      created_at: daysAgo(Math.floor(Math.random() * 5)),
    });
  }
}

async function main() {
  console.log("🌱 Populando banco com dados demo…");

  // 1. Subscribers
  console.log("\n👥 Criando subscribers demo…");
  const userIds: string[] = [];
  for (const s of DEMO_SUBSCRIBERS) {
    const id = await ensureSubscriber(s);
    userIds.push(id);
    console.log(`  ✓ ${s.email}`);
  }

  // 2. Pega estabelecimentos + owner pra scan
  const { data: estabs } = await admin
    .from("establishments")
    .select("id, slug, name, owner_id")
    .eq("is_active", true)
    .limit(15);
  if (!estabs?.length) throw new Error("Sem estabelecimentos no banco");
  console.log(`\n🏪 ${estabs.length} estabelecimentos encontrados`);

  // 3. Stories em metade dos estabs
  console.log("\n📸 Posting stories…");
  for (const e of estabs.slice(0, 10)) {
    await seedStories(e.id, e.owner_id);
    console.log(`  ✓ ${e.slug}`);
  }

  // 4. Activity por user
  console.log("\n📊 Gerando atividade dos users…");
  for (const userId of userIds) {
    const userEstabs = pickRandom(estabs, 4);
    for (const e of userEstabs) {
      const visits = 2 + Math.floor(Math.random() * 5);
      await seedVisitsAndLoyalty(userId, e.id, e.owner_id, visits);
      await seedCouponRedemption(userId, e.id);
      if (Math.random() > 0.5) await seedGiftCardPurchase(userId, e.id);

      const orderStatus = Math.random() > 0.4 ? "paid" : "completed";
      await seedOrder(userId, e.id, orderStatus);
    }
    await seedNotifications(userId);
    console.log(`  ✓ user ${userId.slice(0, 8)}`);
  }

  // 5. Withdrawals em alguns estabs
  console.log("\n💰 Criando withdrawals (pending + paid)…");
  for (const e of estabs.slice(0, 5)) {
    await seedWithdrawals(e.id, e.owner_id);
    console.log(`  ✓ ${e.slug}`);
  }

  // 6. Refund tickets em vários status (precisa de orders)
  console.log("\n🔴 Criando refund tickets…");
  const { data: orders } = await admin
    .from("orders")
    .select("id, user_id, establishment_id")
    .in("status", ["paid", "completed"])
    .limit(20);
  if (orders?.length) {
    const sampled = pickRandom(orders, 6);
    const statuses = ["open", "open", "contested", "refunded", "refunded", "rejected"];
    for (let i = 0; i < sampled.length; i++) {
      await seedRefundTicket(sampled[i].user_id, sampled[i].establishment_id, sampled[i].id, statuses[i]);
    }
    console.log(`  ✓ ${sampled.length} tickets`);
  }

  // 7. Stats finais
  const counters = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "subscriber"),
    admin.from("visits").select("*", { count: "exact", head: true }),
    admin.from("coupon_redemptions").select("*", { count: "exact", head: true }),
    admin.from("gift_cards").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("withdrawals").select("*", { count: "exact", head: true }),
    admin.from("refund_tickets").select("*", { count: "exact", head: true }),
    admin.from("establishment_stories").select("*", { count: "exact", head: true })
      .gt("expires_at", new Date().toISOString()),
    admin.from("notifications").select("*", { count: "exact", head: true }),
  ]);

  console.log("\n✅ Banco populado:");
  console.log(`  Subscribers ativos: ${counters[0].count ?? 0}`);
  console.log(`  Visitas: ${counters[1].count ?? 0}`);
  console.log(`  Cupons usados: ${counters[2].count ?? 0}`);
  console.log(`  Vale-presentes: ${counters[3].count ?? 0}`);
  console.log(`  Pedidos: ${counters[4].count ?? 0}`);
  console.log(`  Saques: ${counters[5].count ?? 0}`);
  console.log(`  Extornos: ${counters[6].count ?? 0}`);
  console.log(`  Stories ativos: ${counters[7].count ?? 0}`);
  console.log(`  Notificações: ${counters[8].count ?? 0}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌", err);
    process.exit(1);
  });
