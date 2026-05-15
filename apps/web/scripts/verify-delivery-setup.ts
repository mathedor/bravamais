/* eslint-disable no-console */
// Verifica se a infraestrutura do módulo Delivery está pronta:
// - Migrations 016 e 017 aplicadas (tabelas + enum value)
// - Bucket `deliverers` criado no Storage
// - Env vars críticas presentes
//
// Rodar:
//   cd apps/web && set -a && source .env.local && set +a && pnpm exec tsx scripts/verify-delivery-setup.ts

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

const TABLES = [
  "user_addresses",
  "deliverers",
  "establishment_deliverers",
  "delivery_zones",
  "establishment_delivery_settings",
  "deliveries",
  "delivery_tracking_pings",
  "delivery_ratings",
];

const ORDER_COLUMNS = [
  "delivery_type",
  "delivery_address_id",
  "delivery_fee_cents",
  "delivery_distance_km",
];

const ENV_CHECKS = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", required: true },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true },
  { name: "GOOGLE_MAPS_API_KEY", required: false, note: "rota otimizada server-side" },
  { name: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", required: false, note: "mapas no cliente" },
  { name: "NEXT_PUBLIC_VAPID_PUBLIC_KEY", required: false, note: "push web (opcional)" },
  { name: "VAPID_PRIVATE_KEY", required: false, note: "push web (opcional)" },
  { name: "EFI_CLIENT_ID", required: false, note: "Efí real (atualmente mock)" },
];

function pad(s: string, n: number): string {
  return s + " ".repeat(Math.max(0, n - s.length));
}

async function main() {
  let allOk = true;
  console.log("\n🧪 BRAVA+ Delivery — Verificação de infra\n");
  console.log(`Project URL: ${url}\n`);

  // 1. Tabelas
  console.log("📋 Tabelas:");
  for (const t of TABLES) {
    const { error, count } = await admin
      .from(t)
      .select("*", { count: "exact", head: true });
    if (error) {
      console.log(`  ❌ ${pad(t, 35)} ${error.message}`);
      allOk = false;
    } else {
      console.log(`  ✅ ${pad(t, 35)} (${count ?? 0} rows)`);
    }
  }

  // 2. Colunas em orders
  console.log("\n📦 Colunas adicionadas em orders:");
  const { data: ordersSample, error: ordersErr } = await admin
    .from("orders")
    .select(ORDER_COLUMNS.join(","))
    .limit(1);
  if (ordersErr) {
    console.log(`  ❌ erro ao buscar colunas: ${ordersErr.message}`);
    allOk = false;
  } else {
    const sample = (ordersSample?.[0] ?? null) as unknown as Record<string, unknown> | null;
    for (const col of ORDER_COLUMNS) {
      const present = sample === null ? true : col in sample;
      console.log(`  ${present ? "✅" : "❌"} ${col}`);
      if (!present) allOk = false;
    }
  }

  // 3. Enum user_role tem 'deliverer'
  console.log("\n🔐 Enum user_role contém 'deliverer':");
  const { data: roleProbe, error: roleErr } = await admin
    .from("profiles")
    .select("role")
    .eq("role", "deliverer")
    .limit(1);
  if (roleErr) {
    if (roleErr.message.toLowerCase().includes("invalid input value") || roleErr.message.includes("enum")) {
      console.log(`  ❌ enum não tem 'deliverer': ${roleErr.message}`);
      allOk = false;
    } else {
      console.log(`  ⚠️  erro inesperado: ${roleErr.message}`);
    }
  } else {
    console.log(`  ✅ enum aceita 'deliverer' (${roleProbe?.length ?? 0} usuários com esse role)`);
  }

  // 4. Bucket Storage `deliverers`
  console.log("\n🗄️  Storage bucket `deliverers`:");
  const { data: buckets, error: bucketsErr } = await admin.storage.listBuckets();
  if (bucketsErr) {
    console.log(`  ❌ erro listando buckets: ${bucketsErr.message}`);
    allOk = false;
  } else {
    const deliverersBucket = buckets?.find((b) => b.name === "deliverers");
    if (deliverersBucket) {
      console.log(`  ✅ bucket existe (public=${deliverersBucket.public}) — privado é o esperado, admin usa signed URLs`);
    } else {
      console.log(`  ❌ bucket 'deliverers' não existe`);
      console.log(`     → Criar em https://supabase.com/dashboard → Storage → New bucket → name="deliverers", public=true`);
      allOk = false;
    }
  }

  // 6. Trigger seed default zones rodou no backfill
  console.log("\n🌱 Backfill delivery_zones (cada estab tem ≥1 zona):");
  const { data: estabs, error: estabsErr } = await admin
    .from("establishments")
    .select("id", { count: "exact" })
    .limit(1);
  if (!estabsErr) {
    const { count: totalEstabs } = await admin.from("establishments").select("*", { count: "exact", head: true });
    const { count: totalZones } = await admin.from("delivery_zones").select("*", { count: "exact", head: true });
    const { count: totalSettings } = await admin.from("establishment_delivery_settings").select("*", { count: "exact", head: true });
    console.log(`  ${totalZones && totalEstabs && totalZones >= totalEstabs * 1 ? "✅" : "⚠️"} estabs=${totalEstabs}, zones=${totalZones}, settings=${totalSettings}`);
    if (totalEstabs && totalSettings && totalSettings < totalEstabs) {
      console.log(`     ⚠️  alguns estabelecimentos sem settings — trigger pode não ter rodado no backfill`);
    }
  } else {
    console.log(`  ⚠️  erro ao verificar: ${estabsErr.message}`);
  }
  void estabs;

  // 7. Env vars locais
  console.log("\n🔑 Env vars locais (.env.local):");
  for (const e of ENV_CHECKS) {
    const v = process.env[e.name];
    const ok = !!v && v.length > 0;
    const icon = ok ? "✅" : e.required ? "❌" : "⚠️";
    const tag = e.required ? "[obrigatória]" : "[opcional]";
    console.log(`  ${icon} ${pad(e.name, 36)} ${tag}${e.note ? ` — ${e.note}` : ""}`);
    if (!ok && e.required) allOk = false;
  }

  // 8. Resumo
  console.log("\n" + "─".repeat(60));
  if (allOk) {
    console.log("✅ Tudo verde: módulo Delivery pronto pra operar.");
  } else {
    console.log("⚠️  Itens pendentes acima — veja ❌ pra ação necessária.");
  }
  console.log("─".repeat(60) + "\n");

  console.log("Lembrete env vars Vercel produção (não dá pra verificar daqui):");
  console.log("  Dashboard Vercel → brava-mais → Settings → Environment Variables");
  console.log("  → GOOGLE_MAPS_API_KEY, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (rota/mapas)");
  console.log("  → NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (push web opcional)\n");
}

main().catch((e) => {
  console.error("Erro fatal:", e);
  process.exit(1);
});
