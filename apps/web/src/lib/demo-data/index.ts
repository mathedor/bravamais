import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEMO_OWNER_EMAIL,
  DEMO_OWNER_PASSWORD,
  DEMO_LOGINS,
  DEMO_SUBSCRIBERS,
  DEMO_SUBSCRIBER_PASSWORD,
  EXTRA_CATEGORIES,
  STORY_PHOTOS,
  STORY_CAPTIONS,
  REFUND_REASONS,
  generateEstablishments,
  pickOne,
  pickRandom,
  daysAgo,
} from "./data";

type Admin = SupabaseClient;

export type DemoStats = Record<string, number>;

export async function getDemoStats(): Promise<DemoStats> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("admin_demo_stats");
  if (error) throw new Error(error.message);
  return (data ?? {}) as DemoStats;
}

export async function clearDemoData(keepLogins: boolean): Promise<Record<string, number | string>> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("admin_clear_demo_data", { p_keep_logins: keepLogins });
  if (error) throw new Error(error.message);
  return (data ?? {}) as Record<string, number | string>;
}

// ---------------------------------------------------------------
// Seed completo: estabelecimentos + contas demo + atividade.
// Tudo em bulk pra caber no tempo de uma server action.
// ---------------------------------------------------------------

async function listAllUsersByEmail(admin: Admin): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    for (const u of data.users) if (u.email) map.set(u.email.toLowerCase(), u.id);
    if (data.users.length < 200 || page > 20) break;
    page += 1;
  }
  return map;
}

async function ensureUser(
  admin: Admin,
  byEmail: Map<string, string>,
  email: string,
  password: string,
  fullName: string,
): Promise<string> {
  const existing = byEmail.get(email.toLowerCase());
  if (existing) return existing;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
  byEmail.set(email.toLowerCase(), data.user.id);
  return data.user.id;
}

export async function seedDemoData(): Promise<Record<string, number>> {
  const admin = createAdminClient();
  const summary: Record<string, number> = {};
  const byEmail = await listAllUsersByEmail(admin);

  // 1) Categorias extras
  await admin.from("categories").upsert(EXTRA_CATEGORIES, { onConflict: "slug" });

  // 2) Demo owner + estabelecimentos (bulk)
  const ownerId = await ensureUser(admin, byEmail, DEMO_OWNER_EMAIL, DEMO_OWNER_PASSWORD, "Demo Owner");
  await admin.from("profiles").update({ role: "establishment", full_name: "Demo Owner" }).eq("id", ownerId);

  const seeds = generateEstablishments();
  const { data: estabRows, error: estabErr } = await admin
    .from("establishments")
    .upsert(
      seeds.map((e) => ({
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
        cover_url: e.cover_url || null,
        phone: e.phone ?? null,
        whatsapp: e.whatsapp ?? null,
        instagram: e.instagram ?? null,
        is_active: true,
        is_verified: true,
      })),
      { onConflict: "slug" },
    )
    .select("id, slug");
  if (estabErr) throw new Error(`establishments: ${estabErr.message}`);
  const idBySlug = new Map((estabRows ?? []).map((r) => [r.slug, r.id]));
  summary.establishments = idBySlug.size;

  const { data: cats } = await admin.from("categories").select("id, slug");
  const catBySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));

  const estabCategories: { establishment_id: string; category_id: string }[] = [];
  const promotions: { establishment_id: string; promotion_type: string; is_active: boolean }[] = [];
  const coupons: Record<string, unknown>[] = [];
  for (const e of seeds) {
    const id = idBySlug.get(e.slug);
    if (!id) continue;
    const catId = catBySlug.get(e.category);
    if (catId) estabCategories.push({ establishment_id: id, category_id: catId });
    for (const p of e.promos) promotions.push({ establishment_id: id, promotion_type: p, is_active: true });
    coupons.push({
      establishment_id: id,
      code: e.coupon.code,
      description: e.coupon.description,
      discount_percent: e.coupon.discount_percent ?? null,
      discount_cents: e.coupon.discount_cents ?? null,
      is_active: true,
    });
  }
  await admin.from("establishment_categories").upsert(estabCategories, { onConflict: "establishment_id,category_id" });
  await admin.from("establishment_promotions").upsert(promotions, { onConflict: "establishment_id,promotion_type" });
  await admin.from("coupons").upsert(coupons, { onConflict: "establishment_id,code" });

  // Products: recria por estabelecimento seedado
  const estabIds = [...idBySlug.values()];
  await admin.from("products").delete().in("establishment_id", estabIds);
  const products = seeds.flatMap((e) => {
    const id = idBySlug.get(e.slug);
    if (!id) return [];
    return e.products.map((p) => ({
      establishment_id: id,
      name: p.name,
      description: p.description ?? null,
      price_cents: p.price_cents,
      photos: [],
      is_active: true,
    }));
  });
  await admin.from("products").insert(products);
  summary.products = products.length;

  // Loyalty clubs: insere só os que faltam
  const { data: existingClubs } = await admin
    .from("loyalty_clubs")
    .select("id, establishment_id")
    .in("establishment_id", estabIds);
  const hasClub = new Set((existingClubs ?? []).map((c) => c.establishment_id));
  const newClubs = seeds
    .filter((e) => idBySlug.get(e.slug) && !hasClub.has(idBySlug.get(e.slug)!))
    .map((e) => ({
      establishment_id: idBySlug.get(e.slug)!,
      name: e.loyalty.name,
      visits_required: e.loyalty.visits_required,
      benefit_description: e.loyalty.benefit_description,
      is_active: true,
    }));
  if (newClubs.length) await admin.from("loyalty_clubs").insert(newClubs);

  // 3) Logins demo dos 5 roles
  for (const acc of DEMO_LOGINS) {
    const id = await ensureUser(admin, byEmail, acc.email, acc.password, acc.name);
    await admin.from("profiles").update({ role: acc.role, full_name: acc.name }).eq("id", id);
    if (acc.role === "subscriber") {
      await admin.from("subscriptions").upsert(
        { user_id: id, tier: "premium", status: "active", current_period_end: daysAgo(-30) },
        { onConflict: "user_id" },
      );
    }
    if (acc.role === "establishment") {
      const { data: exist } = await admin.from("establishments").select("id").eq("owner_id", id).limit(1);
      if (!exist?.length) {
        await admin.from("establishments").insert({
          owner_id: id,
          name: "Café Demo BRAVA+",
          slug: `cafe-demo-${id.slice(0, 6)}`,
          tagline: "Café artesanal · demonstração",
          city: "São Paulo",
          state: "SP",
          is_active: true,
          is_verified: true,
        });
      }
    }
    if (acc.role === "deliverer") {
      const { data: exist } = await admin.from("deliverers").select("id").eq("user_id", id).limit(1);
      if (!exist?.length) {
        await admin.from("deliverers").insert({
          user_id: id,
          status: "approved",
          is_online: false,
          full_name: acc.name,
          vehicle: "moto",
          phone: "(11) 99999-0000",
        });
      } else {
        await admin.from("deliverers").update({ status: "approved" }).eq("id", exist[0].id);
      }
    }
    if (acc.role === "commercial") {
      const { data: exist } = await admin.from("commercial_affiliates").select("id").eq("user_id", id).limit(1);
      if (!exist?.length) {
        const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        let code = "COM-";
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
        await admin.from("commercial_affiliates").insert({
          user_id: id,
          name: acc.name,
          email: acc.email,
          code,
          pix_key: acc.email,
          territory: "Demo SP",
          is_active: true,
          onboarded_at: new Date().toISOString(),
          establishment_commission_kind: "percent",
          establishment_commission_value: 0.2,
          establishment_commission_months: 12,
          subscriber_commission_kind: "percent",
          subscriber_commission_basic_value: 0.3,
          subscriber_commission_premium_value: 0.2,
          subscriber_commission_vip_value: 0.15,
          subscriber_commission_months: 6,
          commission_rate: 0.2,
          duration_months: 12,
        });
      }
    }
  }
  summary.demo_logins = DEMO_LOGINS.length;

  // 4) Subscribers demo (5) com assinatura premium ativa
  const today = new Date();
  const subscriberIds: string[] = [];
  for (const [i, s] of DEMO_SUBSCRIBERS.entries()) {
    const id = await ensureUser(admin, byEmail, s.email, DEMO_SUBSCRIBER_PASSWORD, s.name);
    // 1º subscriber faz aniversário hoje (testa o cron de aniversário)
    const birthdate =
      i === 0
        ? `${today.getFullYear() - 30}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
        : `199${i}-0${i + 2}-1${i}`;
    await admin
      .from("profiles")
      .update({ full_name: s.name, role: "subscriber", city: s.city, state: s.state, birthdate })
      .eq("id", id);
    await admin.from("subscriptions").upsert(
      { user_id: id, tier: "premium", status: "active", current_period_start: daysAgo(20), current_period_end: daysAgo(-25) },
      { onConflict: "user_id" },
    );
    subscriberIds.push(id);
  }
  summary.subscribers = subscriberIds.length;

  // 5) Stories em 10 estabs (limpa antigos antes)
  const storyEstabs = estabIds.slice(0, 10);
  await admin.from("establishment_stories").delete().in("establishment_id", storyEstabs);
  const stories = storyEstabs.flatMap((estabId) =>
    Array.from({ length: 2 + Math.floor(Math.random() * 3) }).map((_, i) => ({
      establishment_id: estabId,
      media_url: pickOne(STORY_PHOTOS),
      caption: pickOne(STORY_CAPTIONS),
      expires_at: new Date(Date.now() + (12 + i * 4) * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    })),
  );
  await admin.from("establishment_stories").insert(stories);
  summary.stories = stories.length;

  // 6) Atividade: visits, loyalty, cupons, gift cards, pedidos, notifs
  const { data: estabFull } = await admin
    .from("establishments")
    .select("id, owner_id")
    .in("id", estabIds);
  const ownerByEstab = new Map((estabFull ?? []).map((e) => [e.id, e.owner_id]));

  const { data: clubs } = await admin
    .from("loyalty_clubs")
    .select("id, establishment_id, visits_required")
    .in("establishment_id", estabIds);
  const clubByEstab = new Map((clubs ?? []).map((c) => [c.establishment_id, c]));

  const { data: allCoupons } = await admin
    .from("coupons")
    .select("id, establishment_id, uses_count")
    .in("establishment_id", estabIds)
    .eq("is_active", true);
  const couponsByEstab = new Map<string, { id: string; uses_count: number | null }[]>();
  for (const c of allCoupons ?? []) {
    const list = couponsByEstab.get(c.establishment_id) ?? [];
    list.push(c);
    couponsByEstab.set(c.establishment_id, list);
  }

  const { data: allProducts } = await admin
    .from("products")
    .select("id, establishment_id, price_cents")
    .in("establishment_id", estabIds);
  const productsByEstab = new Map<string, { id: string; price_cents: number }[]>();
  for (const p of allProducts ?? []) {
    const list = productsByEstab.get(p.establishment_id) ?? [];
    list.push(p);
    productsByEstab.set(p.establishment_id, list);
  }

  const visits: Record<string, unknown>[] = [];
  const loyaltyProgress: Record<string, unknown>[] = [];
  const redemptions: Record<string, unknown>[] = [];
  const redeemedCouponIds: string[] = [];
  const giftCards: Record<string, unknown>[] = [];
  const orders: Record<string, unknown>[] = [];
  const orderItemsByIdx: { product_id: string; qty: number; unit_price_cents: number }[][] = [];
  const notifications: Record<string, unknown>[] = [];

  for (const userId of subscriberIds) {
    const userEstabs = pickRandom(estabIds, 4);
    for (const estabId of userEstabs) {
      const nVisits = 2 + Math.floor(Math.random() * 5);
      for (let i = 0; i < nVisits; i++) {
        visits.push({
          user_id: userId,
          establishment_id: estabId,
          source: "qr_scan",
          scanned_by_user_id: ownerByEstab.get(estabId) ?? null,
          created_at: daysAgo(Math.floor(Math.random() * 30)),
        });
      }
      const club = clubByEstab.get(estabId);
      if (club) {
        const count = Math.min(nVisits, club.visits_required);
        loyaltyProgress.push({
          user_id: userId,
          club_id: club.id,
          visits_count: count,
          completed_at: count >= club.visits_required ? new Date().toISOString() : null,
        });
      }
      for (const c of couponsByEstab.get(estabId) ?? []) {
        if (Math.random() > 0.5) continue;
        redemptions.push({ coupon_id: c.id, user_id: userId, redeemed_at: daysAgo(Math.floor(Math.random() * 20)) });
        redeemedCouponIds.push(c.id);
      }
      if (Math.random() > 0.5) {
        const value = pickOne([5000, 10000, 20000, 30000, 50000]);
        giftCards.push({
          establishment_id: estabId,
          code: `GIFT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          value_cents: value,
          remaining_cents: value,
          buyer_user_id: userId,
          granted_to_user_id: userId,
          recipient_name: pickOne(["Pra você mesmo", "Maria", "João", "Pra um amigo"]),
          recipient_message: pickOne(["Aproveite!", "Feliz aniversário 🎉", "Você merece", "Vamos sair juntos"]),
          granted_by: "purchase",
          status: "paid",
          efi_charge_id: `mock_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
          created_at: daysAgo(Math.floor(Math.random() * 15)),
        });
      }
      const prods = productsByEstab.get(estabId) ?? [];
      if (prods.length) {
        const picked = pickRandom(prods, Math.min(3, prods.length));
        const items = picked.map((p) => ({
          product_id: p.id,
          qty: 1 + Math.floor(Math.random() * 2),
          unit_price_cents: p.price_cents,
        }));
        const subtotal = items.reduce((s, it) => s + it.unit_price_cents * it.qty, 0);
        const discount = Math.floor(subtotal * 0.1 * Math.random());
        const status = Math.random() > 0.4 ? "paid" : "completed";
        orders.push({
          user_id: userId,
          establishment_id: estabId,
          status,
          subtotal_cents: subtotal,
          discount_cents: discount,
          total_cents: subtotal - discount,
          payment_method: pickOne(["pix", "credit_card"]),
          paid_at: daysAgo(Math.floor(Math.random() * 20)),
          completed_at: status === "completed" ? daysAgo(Math.floor(Math.random() * 15)) : null,
          created_at: daysAgo(Math.floor(Math.random() * 20) + 1),
        });
        orderItemsByIdx.push(items);
      }
    }
    notifications.push(
      { user_id: userId, type: "system", title: "🎉 Bem-vindo ao BRAVA+ Premium", body: "Aproveite todos os benefícios do clube", created_at: daysAgo(Math.floor(Math.random() * 5)) },
      { user_id: userId, type: "establishment_news", title: "📣 Bistrô da Rua Cinco: Menu degustação 30% off só hoje", body: "Aproveite essa promoção", created_at: daysAgo(Math.floor(Math.random() * 5)) },
      { user_id: userId, type: "loyalty_reward", title: "🎁 Você ganhou um cupom!", body: "Pelo clube de fidelidade da Padaria Pão da Vovó", created_at: daysAgo(Math.floor(Math.random() * 5)) },
    );
  }

  await admin.from("visits").insert(visits);
  summary.visits = visits.length;
  if (loyaltyProgress.length) {
    await admin.from("loyalty_progress").upsert(loyaltyProgress, { onConflict: "user_id,club_id" });
  }
  if (redemptions.length) {
    await admin.from("coupon_redemptions").insert(redemptions);
    // incrementa uses_count dos cupons usados
    const usesByCoupon = new Map<string, number>();
    for (const id of redeemedCouponIds) usesByCoupon.set(id, (usesByCoupon.get(id) ?? 0) + 1);
    const baseUses = new Map((allCoupons ?? []).map((c) => [c.id, c.uses_count ?? 0]));
    await Promise.all(
      [...usesByCoupon.entries()].map(([id, n]) =>
        admin.from("coupons").update({ uses_count: (baseUses.get(id) ?? 0) + n }).eq("id", id),
      ),
    );
  }
  summary.coupon_redemptions = redemptions.length;
  if (giftCards.length) await admin.from("gift_cards").insert(giftCards);
  summary.gift_cards = giftCards.length;

  const { data: createdOrders, error: ordersErr } = await admin.from("orders").insert(orders).select("id, user_id, establishment_id");
  if (ordersErr) throw new Error(`orders: ${ordersErr.message}`);
  const orderItems = (createdOrders ?? []).flatMap((o, idx) =>
    (orderItemsByIdx[idx] ?? []).map((it) => ({
      order_id: o.id,
      product_id: it.product_id,
      qty: it.qty,
      unit_price_cents: it.unit_price_cents,
    })),
  );
  if (orderItems.length) await admin.from("order_items").insert(orderItems);
  summary.orders = createdOrders?.length ?? 0;

  await admin.from("notifications").insert(notifications);
  summary.notifications = notifications.length;

  // 7) Withdrawals em 5 estabs
  const wdEstabs = estabIds.slice(0, 5);
  await admin.from("withdrawals").delete().in("establishment_id", wdEstabs);
  const withdrawals = wdEstabs.flatMap((estabId) => [
    {
      establishment_id: estabId,
      amount_cents: 15000 + Math.floor(Math.random() * 30000),
      status: "paid",
      pix_key: "demo@bravamais.app",
      requested_by_user_id: ownerByEstab.get(estabId) ?? ownerId,
      requested_at: daysAgo(15),
      paid_at: daysAgo(13),
      receipt_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
      notes: "Saque mensal",
    },
    {
      establishment_id: estabId,
      amount_cents: 12000 + Math.floor(Math.random() * 20000),
      status: "pending",
      pix_key: "demo@bravamais.app",
      requested_by_user_id: ownerByEstab.get(estabId) ?? ownerId,
      requested_at: daysAgo(2),
      notes: "Saque pendente",
    },
  ]);
  await admin.from("withdrawals").insert(withdrawals);
  summary.withdrawals = withdrawals.length;

  // 8) Refund tickets em vários status
  const sampled = pickRandom(createdOrders ?? [], Math.min(6, createdOrders?.length ?? 0));
  const statuses = ["open", "open", "contested", "refunded", "refunded", "rejected"];
  const tickets = sampled.map((o, i) => {
    const status = statuses[i];
    const t: Record<string, unknown> = {
      order_id: o.id,
      user_id: o.user_id,
      establishment_id: o.establishment_id,
      status,
      user_reason: pickOne(REFUND_REASONS),
      user_message: "Conforme combinado, gostaria do estorno.",
      refund_amount_cents: 5000 + Math.floor(Math.random() * 10000),
      created_at: daysAgo(Math.floor(Math.random() * 10) + 3),
    };
    if (["contested", "refunded", "rejected"].includes(status)) {
      t.establishment_contest = "Avaliamos seu caso, podemos resolver direto via cupom de 30%";
      t.contested_at = daysAgo(Math.floor(Math.random() * 8) + 1);
    }
    if (["refunded", "rejected"].includes(status)) {
      t.admin_decision = status === "refunded" ? "Estorno aprovado. Valor transferido via PIX." : "Após análise, não procede o pedido de estorno.";
      t.resolved_at = daysAgo(Math.floor(Math.random() * 5));
      if (status === "refunded") t.refund_receipt_url = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400";
    }
    return t;
  });
  if (tickets.length) await admin.from("refund_tickets").insert(tickets);
  summary.refund_tickets = tickets.length;

  return summary;
}
