// Cria contas demo de TODOS os 5 roles pro memorial descritivo.
// Roda com: set -a && source .env.local && set +a && pnpm exec tsx scripts/create-demo-accounts.ts
export {};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("ENV faltando");
  process.exit(1);
}

const REST = `${SUPABASE_URL}/rest/v1`;
const AUTH = `${SUPABASE_URL}/auth/v1/admin`;
const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

async function api(method: string, path: string, body?: unknown, extra?: Record<string, string>) {
  const res = await fetch(path.startsWith("http") ? path : `${REST}${path}`, {
    method, headers: { ...H, ...(extra ?? {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function findOrCreateUser(email: string, password: string, fullName: string): Promise<string> {
  const list = await api("GET", `${AUTH}/users?per_page=1000`);
  const existing = list.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    await api("PUT", `${AUTH}/users/${existing.id}`, { password, email_confirm: true });
    return existing.id;
  }
  const created = await api("POST", `${AUTH}/users`, {
    email, password, email_confirm: true, user_metadata: { full_name: fullName },
  });
  return created.id;
}

async function setProfile(userId: string, fields: Record<string, unknown>) {
  await api("PATCH", `/profiles?id=eq.${userId}`, fields, { Prefer: "return=minimal" });
}

function makeCommercialCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "COM-";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function runDemo() {
  const accounts: { role: string; email: string; password: string; name: string; extra?: string }[] = [];

  // ============ ASSINANTE ============
  {
    const email = "demo.usuario@bravamais.app";
    const password = "BravaUser@2026!";
    const name = "Demo Usuário (assinante)";
    console.log("→ Assinante");
    const id = await findOrCreateUser(email, password, name);
    await setProfile(id, { role: "subscriber", full_name: name });
    // garante subscription trial
    await api("POST", `/subscriptions?on_conflict=user_id`, {
      user_id: id, tier: "premium", status: "active",
      current_period_end: new Date(Date.now() + 30 * 86400_000).toISOString(),
    }, { Prefer: "return=minimal,resolution=merge-duplicates" });
    accounts.push({ role: "Assinante (subscriber)", email, password, name });
  }

  // ============ LOJISTA ============
  {
    const email = "demo.lojista@bravamais.app";
    const password = "BravaLojista@2026!";
    const name = "Demo Lojista (estab)";
    console.log("→ Lojista");
    const id = await findOrCreateUser(email, password, name);
    await setProfile(id, { role: "establishment", full_name: name });
    // garante que tenha um establishment
    const exist = await api("GET", `/establishments?owner_id=eq.${id}&select=id,slug`);
    if (exist.length === 0) {
      await api("POST", `/establishments`, {
        owner_id: id, name: "Café Demo BRAVA+", slug: `cafe-demo-${id.slice(0, 6)}`,
        tagline: "Café artesanal · demonstração", city: "São Paulo", state: "SP",
        is_active: true, is_verified: true,
      }, { Prefer: "return=minimal" });
    }
    accounts.push({ role: "Lojista (establishment)", email, password, name });
  }

  // ============ ENTREGADOR ============
  {
    const email = "demo.entregador@bravamais.app";
    const password = "BravaEntregador@2026!";
    const name = "Demo Entregador";
    console.log("→ Entregador");
    const id = await findOrCreateUser(email, password, name);
    await setProfile(id, { role: "deliverer", full_name: name });
    const exist = await api("GET", `/deliverers?user_id=eq.${id}&select=id`);
    if (exist.length === 0) {
      await api("POST", `/deliverers`, {
        user_id: id, status: "approved", is_online: false,
        full_name: name, vehicle: "moto", phone: "(11) 99999-0000",
      }, { Prefer: "return=minimal" });
    } else {
      await api("PATCH", `/deliverers?id=eq.${exist[0].id}`, {
        status: "approved", is_online: false,
      }, { Prefer: "return=minimal" });
    }
    accounts.push({ role: "Entregador (deliverer)", email, password, name });
  }

  // ============ COMERCIAL ============
  {
    const email = "demo.comercial@bravamais.app";
    const password = "BravaComercial@2026!";
    const name = "Demo Comercial";
    console.log("→ Comercial");
    const id = await findOrCreateUser(email, password, name);
    await setProfile(id, { role: "commercial", full_name: name });
    const exist = await api("GET", `/commercial_affiliates?user_id=eq.${id}&select=id,code`);
    let code: string;
    if (exist.length > 0) {
      code = exist[0].code;
    } else {
      code = makeCommercialCode();
      await api("POST", `/commercial_affiliates`, {
        user_id: id, name, email, code,
        pix_key: email, territory: "Demo SP",
        is_active: true, onboarded_at: new Date().toISOString(),
        establishment_commission_kind: "percent",
        establishment_commission_value: 0.20,
        establishment_commission_months: 12,
        subscriber_commission_kind: "percent",
        subscriber_commission_basic_value: 0.30,
        subscriber_commission_premium_value: 0.20,
        subscriber_commission_vip_value: 0.15,
        subscriber_commission_months: 6,
        commission_rate: 0.20,
        duration_months: 12,
      }, { Prefer: "return=minimal" });
    }
    accounts.push({ role: "Comercial", email, password, name, extra: `código: ${code}` });
  }

  // ============ ADMIN DEMO ============
  {
    const email = "demo.admin@bravamais.app";
    const password = "BravaAdmin@2026!";
    const name = "Demo Admin (read-only sugerido)";
    console.log("→ Admin demo");
    const id = await findOrCreateUser(email, password, name);
    await setProfile(id, { role: "admin", full_name: name });
    accounts.push({ role: "Admin (administrador)", email, password, name, extra: "⚠ Cuidado — admin tem acesso total" });
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ CONTAS DEMO PRONTAS");
  console.log("=".repeat(70));
  console.log(`URL Login: https://brava-mais.vercel.app/entrar\n`);
  for (const a of accounts) {
    console.log(`📌 ${a.role}`);
    console.log(`   Email: ${a.email}`);
    console.log(`   Senha: ${a.password}`);
    if (a.extra) console.log(`   ${a.extra}`);
    console.log();
  }
  console.log("=".repeat(70));
}

runDemo().catch((e) => { console.error("❌", e.message); process.exit(1); });
