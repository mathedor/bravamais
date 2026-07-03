// Cria comercial de teste usando a API REST do Supabase direto
// (sem o SDK pra evitar dependência de WebSocket no Node 20)

export {};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("ENV faltando. Use: set -a && source .env.local && set +a && pnpm exec tsx scripts/create-test-commercial.ts");
  process.exit(1);
}

const REST = `${SUPABASE_URL}/rest/v1`;
const AUTH = `${SUPABASE_URL}/auth/v1/admin`;
const HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

function makeCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "COM-";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function api(method: string, path: string, body?: unknown, extraHeaders?: Record<string, string>) {
  const res = await fetch(path.startsWith("http") ? path : `${REST}${path}`, {
    method,
    headers: { ...HEADERS, ...(extraHeaders ?? {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function createTestCommercial() {
  const email = "comercial.demo@bravamais.app";
  const password = "BravaComercial@2026!";
  const name = "Comercial Demo";

  console.log("→ Buscando user existente…");
  const users = await api("GET", `${AUTH}/users?per_page=1000`);
  let userId: string | undefined = users.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())?.id;

  if (userId) {
    console.log(`✓ Existe: ${userId}. Resetando senha…`);
    await api("PUT", `${AUTH}/users/${userId}`, { password, email_confirm: true });
  } else {
    console.log("→ Criando user…");
    const created = await api("POST", `${AUTH}/users`, {
      email, password, email_confirm: true, user_metadata: { full_name: name },
    });
    userId = created.id;
    console.log(`✓ Criado: ${userId}`);
  }

  console.log("→ Atualizando profile…");
  await api("PATCH", `/profiles?id=eq.${userId}`, {
    role: "commercial",
    full_name: name,
    phone: "(11) 99999-0000",
  }, { Prefer: "return=minimal" });

  console.log("→ Verificando commercial_affiliates…");
  const existing: any[] = await api("GET", `/commercial_affiliates?user_id=eq.${userId}&select=id,code`);

  let code: string;
  if (existing.length > 0) {
    code = existing[0].code;
    console.log(`✓ Affiliate existente: ${code}`);
    await api("PATCH", `/commercial_affiliates?id=eq.${existing[0].id}`, {
      is_active: true,
      establishment_commission_kind: "percent",
      establishment_commission_value: 0.20,
      establishment_commission_months: 12,
      subscriber_commission_kind: "percent",
      subscriber_commission_basic_value: 0.30,
      subscriber_commission_premium_value: 0.20,
      subscriber_commission_vip_value: 0.15,
      subscriber_commission_months: 6,
      territory: "São Paulo - Demo",
      pix_key: "comercial.demo@bravamais.app",
    }, { Prefer: "return=minimal" });
  } else {
    code = makeCode();
    for (let i = 0; i < 10; i++) {
      const check: any[] = await api("GET", `/commercial_affiliates?code=eq.${code}&select=id`);
      if (check.length === 0) break;
      code = makeCode();
    }
    await api("POST", `/commercial_affiliates`, {
      user_id: userId,
      name,
      email,
      phone: "(11) 99999-0000",
      code,
      pix_key: "comercial.demo@bravamais.app",
      territory: "São Paulo - Demo",
      notes: "Comercial de teste criado via script.",
      is_active: true,
      onboarded_at: new Date().toISOString(),
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
    console.log(`✓ Affiliate criado: ${code}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ COMERCIAL DE TESTE PRONTO");
  console.log("=".repeat(60));
  console.log(`URL login:    https://brava-mais.vercel.app/entrar`);
  console.log(`Email:        ${email}`);
  console.log(`Senha:        ${password}`);
  console.log(`Código:       ${code}`);
  console.log(`Painel:       https://brava-mais.vercel.app/comercial`);
  console.log(`Link sub:     https://brava-mais.vercel.app/cadastro?ref=${code}`);
  console.log(`Link lojista: https://brava-mais.vercel.app/cadastro-estabelecimento?ref=${code}`);
  console.log("=".repeat(60));
  console.log("Comissão:");
  console.log("  Estab: 20% sobre receita por 12 meses");
  console.log("  Sub:   30% Básico / 20% Premium / 15% VIP por 6 meses");
}

createTestCommercial().catch((e) => { console.error("❌", e.message); process.exit(1); });
