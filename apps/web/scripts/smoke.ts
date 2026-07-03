/**
 * Smoke e2e: loga com as contas demo e bate nas rotas críticas (fluxos de
 * dinheiro incluídos), garantindo 200 + página sem erro de runtime.
 *
 * Rodar:
 *   cd apps/web && set -a && source .env.local && set +a && pnpm exec tsx scripts/smoke.ts
 *   BASE_URL=https://www.bravamais.com.br pnpm exec tsx scripts/smoke.ts
 */
export {};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BASE = process.env.BASE_URL ?? "https://www.bravamais.com.br";

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY no env");
  process.exit(1);
}

const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];

const ACCOUNTS: Record<string, { email: string; password: string }> = {
  subscriber: { email: "demo.usuario@bravamais.app", password: "BravaUser@2026!" },
  lojista: { email: "demo.lojista@bravamais.app", password: "BravaLojista@2026!" },
  admin: { email: "demo.admin@bravamais.app", password: "BravaAdmin@2026!" },
};

const ROUTES: Record<string, string[]> = {
  public: ["/", "/assinar", "/seja-empresa", "/empresa/beneficio"],
  subscriber: ["/app", "/app/carteira", "/app/cupons", "/app/tag", "/app/economia", "/assinar/categorias"],
  lojista: ["/loja", "/loja/plano", "/loja/receita", "/loja/saques"],
  admin: ["/admin", "/admin/financeiro", "/admin/b2b", "/admin/dados-demo", "/admin/ativacao"],
};

const ERROR_MARKERS = ["Application error", "Internal Server Error", "__next_error__"];

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login ${email}: ${res.status} ${await res.text()}`);
  const session = await res.json();
  // formato de cookie do @supabase/ssr: base64url do JSON da session, com chunking
  const value = "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url");
  const name = `sb-${projectRef}-auth-token`;
  const CHUNK = 3180;
  if (value.length <= CHUNK) return `${name}=${value}`;
  const parts: string[] = [];
  for (let i = 0; i * CHUNK < value.length; i++) {
    parts.push(`${name}.${i}=${value.slice(i * CHUNK, (i + 1) * CHUNK)}`);
  }
  return parts.join("; ");
}

async function check(path: string, cookie?: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: cookie ? { cookie } : {},
      redirect: "follow",
    });
    const body = await res.text();
    if (res.status !== 200) return { ok: false, detail: `HTTP ${res.status}` };
    const marker = ERROR_MARKERS.find((m) => body.includes(m));
    if (marker) return { ok: false, detail: `marcador de erro: "${marker}"` };
    return { ok: true, detail: "200" };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "fetch failed" };
  }
}

async function main() {
  console.log(`🔥 Smoke em ${BASE}\n`);
  let failures = 0;

  for (const path of ROUTES.public) {
    const r = await check(path);
    console.log(`${r.ok ? "✅" : "❌"} [público] ${path} — ${r.detail}`);
    if (!r.ok) failures++;
  }

  for (const [role, acc] of Object.entries(ACCOUNTS)) {
    let cookie: string;
    try {
      cookie = await login(acc.email, acc.password);
      console.log(`\n🔑 ${role} logado (${acc.email})`);
    } catch (e) {
      console.log(`\n❌ ${role}: falha no login — ${e instanceof Error ? e.message : e}`);
      failures++;
      continue;
    }
    for (const path of ROUTES[role] ?? []) {
      const r = await check(path, cookie);
      console.log(`${r.ok ? "✅" : "❌"} [${role}] ${path} — ${r.detail}`);
      if (!r.ok) failures++;
    }
  }

  console.log(failures === 0 ? "\n✅ Smoke passou inteiro." : `\n❌ ${failures} falha(s).`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
