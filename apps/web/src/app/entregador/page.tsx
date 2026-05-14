import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireDeliverer } from "@/lib/deliverer-guard";
import { formatBRL } from "@/lib/format";
import type { DeliveryStatus } from "@/lib/supabase/types";

export const metadata = { title: "Minhas entregas" };

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  awaiting_assignment: "⏳ Aguardando",
  assigned: "📨 Nova",
  accepted: "✅ Aceita",
  picked_up: "🛵 Coletei",
  in_transit: "📍 Em rota",
  delivered: "✔️ Entregue",
  canceled: "❌ Cancelada",
};

const STATUS_COLOR: Record<DeliveryStatus, string> = {
  awaiting_assignment: "bg-white/10 text-white/70",
  assigned: "bg-brava-yellow text-brava-black",
  accepted: "bg-blue-500/20 text-blue-200",
  picked_up: "bg-amber-500/20 text-amber-200",
  in_transit: "bg-amber-500/30 text-amber-100",
  delivered: "bg-green-500/20 text-green-200",
  canceled: "bg-red-500/20 text-red-200",
};

interface Row {
  id: string;
  status: DeliveryStatus;
  pickup_address: string;
  dropoff_address: string;
  distance_km: number | null;
  fee_cents: number;
  confirmation_code: string;
  created_at: string;
  orders: { id: string; profiles: { full_name: string | null } | null };
}

export default async function EntregadorHome() {
  const { deliverer } = await requireDeliverer();
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("deliveries")
    .select(`
      id, status, pickup_address, dropoff_address, distance_km, fee_cents,
      confirmation_code, created_at,
      orders!inner(id, profiles(full_name))
    `)
    .eq("deliverer_id", deliverer.id)
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: false });

  const list = (data as unknown as Row[] | null) ?? [];
  const active = list.filter((d) => !["delivered", "canceled"].includes(d.status));
  const done = list.filter((d) => ["delivered", "canceled"].includes(d.status));
  const earnings = done
    .filter((d) => d.status === "delivered")
    .reduce((s, d) => s + d.fee_cents, 0);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">Olá, {deliverer.full_name.split(" ")[0]}</p>
        <h1 className="mt-1 text-3xl font-black">Suas entregas hoje</h1>
        <div className="mt-3 flex gap-3 text-xs">
          <Kpi label="Ativas" value={active.length} />
          <Kpi label="Concluídas" value={done.length} />
          <Kpi label="Ganho hoje" value={formatBRL(earnings)} />
        </div>
      </header>

      {active.length > 1 && (
        <Link
          href="/entregador/rota"
          className="mb-4 block rounded-2xl border-2 border-brava-yellow bg-brava-yellow/10 p-4 text-center text-sm font-bold text-brava-yellow"
        >
          🗺️ Otimizar rota das {active.length} entregas ativas →
        </Link>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/60">Ativas ({active.length})</h2>
        {active.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
            Nenhuma entrega ativa. Você está {deliverer.is_online ? "online" : "offline"} —
            {!deliverer.is_online && " ative o status pra começar a receber."}
          </p>
        ) : (
          active.map((d) => (
            <Link
              key={d.id}
              href={`/entregador/${d.id}`}
              className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-brava-yellow"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">
                  #{d.id.slice(0, 6)} · {new Date(d.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[d.status]}`}>
                  {STATUS_LABELS[d.status]}
                </span>
              </div>
              <p className="mt-2 truncate text-sm font-bold">📍 {d.pickup_address}</p>
              <p className="truncate text-sm text-white/70">🏠 {d.dropoff_address}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
                <span>👤 {d.orders.profiles?.full_name ?? "Cliente"}</span>
                <span>📏 {d.distance_km ? `${Number(d.distance_km).toFixed(1)} km` : "—"}</span>
                <span className="ml-auto font-bold text-brava-yellow">{formatBRL(d.fee_cents)}</span>
              </div>
            </Link>
          ))
        )}
      </section>

      {done.length > 0 && (
        <section className="mt-8 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white/60">Concluídas hoje ({done.length})</h2>
          {done.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs text-white/60"
            >
              <span className={`mr-2 rounded-full px-2 py-0.5 text-[10px] ${STATUS_COLOR[d.status]}`}>
                {STATUS_LABELS[d.status]}
              </span>
              {d.dropoff_address} · {formatBRL(d.fee_cents)}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex-1 rounded-2xl bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-0.5 text-lg font-black">{value}</p>
    </div>
  );
}
