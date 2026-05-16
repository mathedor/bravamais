/* eslint-disable no-console */
// Testa as APIs do Google Maps usadas pelo módulo Delivery do BRAVA+.
// - Geocoding API: endereço → lat/lng (usada no checkout do cliente e cadastro)
// - Directions API: rota entre 2 pontos + otimização multi-stop (rota do entregador)
//
// Rodar:
//   cd apps/web && set -a && source .env.local && set +a && pnpm exec tsx scripts/test-google-maps.ts

const KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!KEY) {
  console.error("✕ GOOGLE_MAPS_API_KEY não encontrada no env (.env.local)");
  process.exit(1);
}

console.log("\n🗺️  BRAVA+ Delivery — Teste Google Maps APIs\n");
console.log(`Key: ${KEY.slice(0, 8)}…${KEY.slice(-4)} (${KEY.length} chars)\n`);

// ============================================================
// 1. GEOCODING — converte endereço em lat/lng
// ============================================================
interface GeoResult {
  formatted_address: string;
  location: { lat: number; lng: number };
}

async function geocode(address: string): Promise<{ status: string; result?: GeoResult; error?: string }> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=br&key=${KEY}`;
  const res = await fetch(url);
  const j = (await res.json()) as {
    status: string;
    error_message?: string;
    results?: Array<{ formatted_address: string; geometry: { location: { lat: number; lng: number } } }>;
  };

  if (j.status !== "OK") {
    return { status: j.status, error: j.error_message };
  }

  const first = j.results?.[0];
  if (!first) return { status: "ZERO_RESULTS" };

  return {
    status: j.status,
    result: {
      formatted_address: first.formatted_address,
      location: first.geometry.location,
    },
  };
}

// ============================================================
// 2. DIRECTIONS — rota A→B
// ============================================================
interface DirectionsResult {
  distance_km: number;
  duration_min: number;
  polyline_points: number;
  start_address: string;
  end_address: string;
}

async function directions(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<{ status: string; result?: DirectionsResult; error?: string }> {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${KEY}`;
  const res = await fetch(url);
  const j = (await res.json()) as {
    status: string;
    error_message?: string;
    routes?: Array<{
      overview_polyline?: { points: string };
      legs?: Array<{
        distance?: { value: number };
        duration?: { value: number };
        start_address?: string;
        end_address?: string;
      }>;
    }>;
  };

  if (j.status !== "OK") {
    return { status: j.status, error: j.error_message };
  }

  const route = j.routes?.[0];
  const leg = route?.legs?.[0];
  if (!route || !leg) return { status: "ZERO_RESULTS" };

  return {
    status: j.status,
    result: {
      distance_km: (leg.distance?.value ?? 0) / 1000,
      duration_min: Math.round((leg.duration?.value ?? 0) / 60),
      polyline_points: route.overview_polyline?.points?.length ?? 0,
      start_address: leg.start_address ?? "",
      end_address: leg.end_address ?? "",
    },
  };
}

// ============================================================
// 3. DIRECTIONS multi-stop com otimização
// ============================================================
async function directionsOptimized(
  origin: { lat: number; lng: number },
  stops: Array<{ lat: number; lng: number; label: string }>,
): Promise<{ status: string; orderedLabels?: string[]; totalKm?: number; totalMin?: number; error?: string }> {
  const waypoints = stops.map((s) => `${s.lat},${s.lng}`).join("|");
  const last = stops[stops.length - 1];
  const url =
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}` +
    `&destination=${last.lat},${last.lng}` +
    `&waypoints=optimize:true|${waypoints}` +
    `&mode=driving&key=${KEY}`;

  const res = await fetch(url);
  const j = (await res.json()) as {
    status: string;
    error_message?: string;
    routes?: Array<{
      waypoint_order?: number[];
      legs?: Array<{ distance?: { value: number }; duration?: { value: number } }>;
    }>;
  };

  if (j.status !== "OK") return { status: j.status, error: j.error_message };

  const r = j.routes?.[0];
  if (!r?.legs?.length) return { status: "ZERO_RESULTS" };

  const totalM = r.legs.reduce((s, l) => s + (l.distance?.value ?? 0), 0);
  const totalS = r.legs.reduce((s, l) => s + (l.duration?.value ?? 0), 0);
  const order = r.waypoint_order ?? [];
  const orderedLabels = order.map((i) => stops[i].label);

  return {
    status: j.status,
    orderedLabels,
    totalKm: totalM / 1000,
    totalMin: Math.round(totalS / 60),
  };
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  let okCount = 0;
  let failCount = 0;

  // -------- TESTE 1: Geocoding loja ----------
  console.log("📍 1. Geocoding API — endereço da loja (SP)");
  const loja = await geocode("Avenida Paulista, 1578, São Paulo, SP");
  if (loja.result) {
    console.log(`  ✅ ${loja.result.formatted_address}`);
    console.log(`     → lat=${loja.result.location.lat.toFixed(6)}, lng=${loja.result.location.lng.toFixed(6)}\n`);
    okCount++;
  } else {
    console.log(`  ❌ status=${loja.status} ${loja.error ? `· ${loja.error}` : ""}\n`);
    failCount++;
  }

  // -------- TESTE 2: Geocoding cliente ----------
  console.log("📍 2. Geocoding API — endereço do cliente (SP)");
  const cliente = await geocode("Rua Augusta, 2200, São Paulo, SP");
  if (cliente.result) {
    console.log(`  ✅ ${cliente.result.formatted_address}`);
    console.log(`     → lat=${cliente.result.location.lat.toFixed(6)}, lng=${cliente.result.location.lng.toFixed(6)}\n`);
    okCount++;
  } else {
    console.log(`  ❌ status=${cliente.status} ${cliente.error ? `· ${cliente.error}` : ""}\n`);
    failCount++;
  }

  // -------- TESTE 3: Directions A→B ----------
  if (loja.result && cliente.result) {
    console.log("🛵 3. Directions API — rota loja → cliente");
    const rota = await directions(loja.result.location, cliente.result.location);
    if (rota.result) {
      console.log(`  ✅ Rota traçada`);
      console.log(`     → Distância: ${rota.result.distance_km.toFixed(2)} km`);
      console.log(`     → Tempo estimado: ${rota.result.duration_min} min`);
      console.log(`     → Polyline: ${rota.result.polyline_points} pontos codificados\n`);
      okCount++;
    } else {
      console.log(`  ❌ status=${rota.status} ${rota.error ? `· ${rota.error}` : ""}\n`);
      failCount++;
    }
  }

  // -------- TESTE 4: Multi-stop otimizado ----------
  console.log("🧭 4. Directions API — rota multi-stop otimizada (3 entregas)");
  const origem = await geocode("Praça da República, São Paulo, SP");
  const destinos = await Promise.all([
    geocode("Rua Oscar Freire, 500, São Paulo, SP"),
    geocode("Avenida Brigadeiro Faria Lima, 3000, São Paulo, SP"),
    geocode("Rua dos Pinheiros, 1000, São Paulo, SP"),
  ]);
  if (origem.result && destinos.every((d) => d.result)) {
    const stops = destinos.map((d, i) => ({
      lat: d.result!.location.lat,
      lng: d.result!.location.lng,
      label: ["Oscar Freire", "Faria Lima", "Pinheiros"][i],
    }));
    const opt = await directionsOptimized(origem.result.location, stops);
    if (opt.orderedLabels) {
      console.log(`  ✅ Ordem otimizada: ${opt.orderedLabels.join(" → ")}`);
      console.log(`     → Distância total: ${opt.totalKm?.toFixed(2)} km`);
      console.log(`     → Tempo total: ${opt.totalMin} min`);
      console.log(`     → Economia vs ordem original calculada pelo Google\n`);
      okCount++;
    } else {
      console.log(`  ❌ status=${opt.status} ${opt.error ? `· ${opt.error}` : ""}\n`);
      failCount++;
    }
  } else {
    console.log(`  ⚠️  pulou (algum geocode falhou)\n`);
  }

  // -------- TESTE 5: client-side key (NEXT_PUBLIC) ----------
  console.log("🔑 5. Verificação NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  const pubKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (pubKey) {
    console.log(`  ✅ presente (${pubKey.slice(0, 8)}…${pubKey.slice(-4)})`);
    if (pubKey === KEY) {
      console.log(`     ⚠️  é a MESMA chave da server-side — em produção, restrinja-a por HTTP referrer pro domínio do app`);
    }
  } else {
    console.log(`  ⚠️  ausente (mapas client-side podem não renderizar)`);
  }

  // -------- RESUMO ----------
  console.log("\n" + "─".repeat(64));
  if (failCount === 0) {
    console.log(`✅ Todos os ${okCount} testes passaram — rastreio Google Maps tá 100% pronto`);
  } else {
    console.log(`⚠️  ${okCount} ok / ${failCount} falhas`);
    console.log(`   → Confira no Cloud Console se Geocoding API + Directions API estão`);
    console.log(`     habilitadas no projeto da chave: https://console.cloud.google.com/apis/library`);
  }
  console.log("─".repeat(64) + "\n");
}

main().catch((e) => {
  console.error("Erro fatal:", e);
  process.exit(1);
});
