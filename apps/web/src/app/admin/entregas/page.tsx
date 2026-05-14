import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import type { DeliveryStatus } from "@/lib/supabase/types";

export const metadata = { title: "Entregas — Admin" };

interface Row {
  id: string;
  order_id: string;
  status: DeliveryStatus;
  pickup_address: string;
  dropoff_address: string;
  distance_km: number | null;
  fee_cents: number;
  confirmation_code: string;
  created_at: string;
  establishments: { name: string; slug: string } | null;
  deliverers: { full_name: string; phone: string; rating_avg: number | null } | null;
  orders: { total_cents: number; user_id: string; profiles: { full_name: string | null } | null };
}

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  awaiting_assignment: "⏳ Aguardando",
  assigned: "📨 Atribuído",
  accepted: "✅ Aceito",
  picked_up: "🛵 Coletado",
  in_transit: "📍 Em rota",
  delivered: "✔️ Entregue",
  canceled: "❌ Cancelado",
};

const STATUS_COLOR: Record<DeliveryStatus, string> = {
  awaiting_assignment: "bg-amber-100 text-amber-800",
  assigned: "bg-blue-100 text-blue-800",
  accepted: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-orange-100 text-orange-800",
  in_transit: "bg-orange-200 text-orange-900",
  delivered: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
};

export default async function AdminEntregasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const params = await searchParams;
  const filter = (params.status as DeliveryStatus | "all" | undefined) ?? "all";

  const supabase = await createClient();
  let query = supabase
    .from("deliveries")
    .select(`
      id, order_id, status, pickup_address, dropoff_address, distance_km, fee_cents,
      confirmation_code, created_at,
      establishments(name, slug),
      deliverers(full_name, phone, rating_avg),
      orders!inner(total_cents, user_id, profiles(full_name))
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter !== "all") query = query.eq("status", filter);

  const [{ data }, ...countQueries] = await Promise.all([
    query,
    ...(["awaiting_assignment", "assigned", "accepted", "picked_up", "in_transit", "delivered", "canceled"] as DeliveryStatus[]).map(
      async (s) => {
        const { count } = await supabase
          .from("deliveries")
          .select("*", { count: "exact", head: true })
          .eq("status", s);
        return [s, count ?? 0] as const;
      },
    ),
  ]);

  const list = (data as unknown as Row[] | null) ?? [];
  const counts = countQueries as ReadonlyArray<readonly [DeliveryStatus, number]>;
  const totalCount = counts.reduce((s, [, c]) => s + c, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-brava-ink">Entregas (todas)</h1>
        <p className="text-sm text-brava-muted">Visão global das entregas em andamento e histórico.</p>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        <a
          href="/admin/entregas"
          className={`rounded-full border border-brava-border px-4 py-1.5 text-xs font-bold ${
            filter === "all" ? "bg-brava-blue text-white" : "bg-brava-card text-brava-ink"
          }`}
        >
          Todas · {totalCount}
        </a>
        {counts.map(([s, c]) => (
          <a
            key={s}
            href={`/admin/entregas?status=${s}`}
            className={`rounded-full border border-brava-border px-4 py-1.5 text-xs font-bold ${
              filter === s ? "bg-brava-blue text-white" : "bg-brava-card text-brava-ink"
            }`}
          >
            {STATUS_LABELS[s]} · {c}
          </a>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
          Nenhuma entrega neste filtro.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <article key={d.id} className="rounded-3xl border border-brava-border bg-brava-card p-5">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-brava-muted">
                    Pedido #{d.order_id.slice(0, 8)} · {new Date(d.created_at).toLocaleString("pt-BR")}
                  </p>
                  <Link href={`/admin/estabelecimentos/${d.establishments?.slug ?? ""}`} className="text-lg font-black text-brava-ink hover:underline">
                    {d.establishments?.name ?? "—"}
                  </Link>
                  <p className="text-xs text-brava-muted">cliente: {d.orders.profiles?.full_name ?? "—"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLOR[d.status]}`}>
                  {STATUS_LABELS[d.status]}
                </span>
              </header>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-brava-paper p-3 text-xs">
                  <p className="font-bold uppercase text-brava-muted">📍 Origem</p>
                  <p className="text-brava-ink">{d.pickup_address}</p>
                </div>
                <div className="rounded-2xl bg-brava-paper p-3 text-xs">
                  <p className="font-bold uppercase text-brava-muted">🏠 Destino</p>
                  <p className="text-brava-ink">{d.dropoff_address}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-brava-muted">
                <span>📏 {d.distance_km ? `${Number(d.distance_km).toFixed(1)} km` : "—"}</span>
                <span>💰 taxa {formatBRL(d.fee_cents)}</span>
                <span>🛒 total {formatBRL(d.orders.total_cents)}</span>
                <span className="font-mono font-bold text-brava-blue">🔢 {d.confirmation_code}</span>
                {d.deliverers && (
                  <span className="ml-auto rounded-full bg-brava-blue/10 px-3 py-1 font-bold text-brava-blue">
                    🛵 {d.deliverers.full_name}
                    {d.deliverers.rating_avg ? ` · ⭐ ${Number(d.deliverers.rating_avg).toFixed(1)}` : ""}
                  </span>
                )}
                {!d.deliverers && (
                  <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-700">
                    sem entregador atribuído
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
