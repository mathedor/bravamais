import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";
import { buildWhatsappDeliveryLink } from "@/lib/delivery-notifications";
import { AssignSelect } from "./assign-select";
import { assignDelivererAction, markPreparingAction, markReadyAction, cancelDeliveryAction } from "./actions";
import type { OrderStatus, DeliveryStatus } from "@/lib/supabase/types";

export const metadata = { title: "Entregas" };

interface Row {
  id: string;
  order_id: string;
  deliverer_id: string | null;
  status: DeliveryStatus;
  pickup_address: string;
  dropoff_address: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  distance_km: number | null;
  fee_cents: number;
  confirmation_code: string;
  notes: string | null;
  created_at: string;
  orders: { id: string; status: OrderStatus; total_cents: number; user_id: string; profiles: { full_name: string | null; phone: string | null } | null };
  deliverers: { id: string; full_name: string; phone: string; whatsapp: string | null } | null;
}

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  awaiting_assignment: "⏳ Aguardando entregador",
  assigned: "📨 Atribuído",
  accepted: "✅ Aceito",
  picked_up: "🛵 Coletado",
  in_transit: "📍 Em rota",
  delivered: "✔️ Entregue",
  canceled: "❌ Cancelado",
};

export default async function EntregasPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const [{ data: deliveriesRaw }, { data: equipe }, { data: settings }] = await Promise.all([
    supabase
      .from("deliveries")
      .select(`
        id, order_id, deliverer_id, status, pickup_address, dropoff_address,
        recipient_name, recipient_phone, distance_km, fee_cents, confirmation_code,
        notes, created_at,
        orders!inner(id, status, total_cents, user_id, profiles(full_name, phone)),
        deliverers(id, full_name, phone, whatsapp)
      `)
      .eq("establishment_id", establishment.id)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("establishment_deliverers")
      .select("deliverer_id, is_active, deliverers(id, full_name, phone, vehicle, is_online)")
      .eq("establishment_id", establishment.id)
      .eq("is_active", true),
    supabase
      .from("establishment_delivery_settings")
      .select("notify_template_whatsapp")
      .eq("establishment_id", establishment.id)
      .maybeSingle<{ notify_template_whatsapp: string | null }>(),
  ]);

  const deliveries = (deliveriesRaw as unknown as Row[] | null) ?? [];
  const team = ((equipe ?? []) as unknown as Array<{
    deliverer_id: string;
    deliverers: { id: string; full_name: string; phone: string; vehicle: string; is_online: boolean } | null;
  }>).map((r) => r.deliverers).filter(Boolean) as { id: string; full_name: string; phone: string; vehicle: string; is_online: boolean }[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-brava-ink">Entregas</h1>
          <p className="text-brava-muted">Atribua entregador, dispare notificação e acompanhe.</p>
        </div>
      </header>

      {deliveries.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
          Nenhuma entrega ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => {
            const targetPhone = d.deliverers?.whatsapp ?? d.deliverers?.phone ?? "";
            const waLink = targetPhone
              ? buildWhatsappDeliveryLink({
                  phone: targetPhone,
                  template: settings?.notify_template_whatsapp ?? null,
                  pickup: d.pickup_address,
                  dropoff: d.dropoff_address,
                  code: d.confirmation_code,
                  feeCents: d.fee_cents,
                })
              : null;

            return (
              <article key={d.id} className="rounded-3xl border border-brava-border bg-brava-card p-5">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-brava-muted">
                      Pedido #{d.order_id.slice(0, 8)} · {new Date(d.created_at).toLocaleString("pt-BR")}
                    </p>
                    <h2 className="text-lg font-black text-brava-ink">
                      {d.orders.profiles?.full_name ?? "Cliente"}
                    </h2>
                  </div>
                  <span className="rounded-full bg-brava-paper px-3 py-1 text-xs font-bold text-brava-ink">
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
                    {d.recipient_phone && <p className="text-brava-muted">📱 {d.recipient_phone}</p>}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-brava-muted">
                  <span>📏 {d.distance_km ? `${Number(d.distance_km).toFixed(1)} km` : "—"}</span>
                  <span>💰 taxa {formatBRL(d.fee_cents)}</span>
                  <span>🛒 total {formatBRL(d.orders.total_cents)}</span>
                  <span className="font-mono font-bold text-brava-blue">🔢 código {d.confirmation_code}</span>
                </div>

                {d.notes && (
                  <p className="mt-3 rounded-2xl border border-brava-yellow/40 bg-brava-yellow/10 p-3 text-xs">
                    💬 {d.notes}
                  </p>
                )}

                {/* Atribuição + ações */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {d.status === "awaiting_assignment" && (
                    <AssignSelect deliveryId={d.id} team={team} />
                  )}

                  {d.deliverer_id && (
                    <div className="rounded-full bg-brava-blue/10 px-3 py-1.5 text-xs font-bold text-brava-blue">
                      🧑‍✈️ {d.deliverers?.full_name} · {d.deliverers?.phone}
                    </div>
                  )}

                  {d.orders.status === "paid" && (
                    <form action={markPreparingAction}>
                      <input type="hidden" name="order_id" value={d.order_id} />
                      <button className="rounded-full border border-brava-border bg-brava-paper px-3 py-1.5 text-xs font-bold text-brava-ink hover:bg-brava-card">
                        Em preparação
                      </button>
                    </form>
                  )}

                  {d.orders.status === "preparing" && (
                    <form action={markReadyAction}>
                      <input type="hidden" name="order_id" value={d.order_id} />
                      <button className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200">
                        Pronto pra coleta
                      </button>
                    </form>
                  )}

                  {waLink && d.status !== "delivered" && d.status !== "canceled" && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-600"
                    >
                      📲 Avisar via WhatsApp
                    </a>
                  )}

                  {!["delivered", "canceled"].includes(d.status) && (
                    <form action={cancelDeliveryAction}>
                      <input type="hidden" name="delivery_id" value={d.id} />
                      <button className="text-xs text-red-600 hover:underline">cancelar</button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
