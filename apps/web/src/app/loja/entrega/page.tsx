import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";
import { SettingsForm, ZoneForm } from "./forms";
import { deleteZoneAction } from "./actions";
import type { DeliveryZone, EstablishmentDeliverySettings } from "@/lib/supabase/types";

export const metadata = { title: "Entrega" };

export default async function EntregaPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const [{ data: zones }, { data: settings }] = await Promise.all([
    supabase
      .from("delivery_zones")
      .select("*")
      .eq("establishment_id", establishment.id)
      .order("max_km", { ascending: true }),
    supabase
      .from("establishment_delivery_settings")
      .select("*")
      .eq("establishment_id", establishment.id)
      .maybeSingle<EstablishmentDeliverySettings>(),
  ]);

  const initial: EstablishmentDeliverySettings = settings ?? {
    establishment_id: establishment.id,
    delivery_enabled: true,
    pickup_enabled: true,
    max_radius_km: 20,
    default_prep_minutes: 30,
    notify_template_whatsapp: null,
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Entrega</h1>
      <p className="mt-1 text-brava-muted">Configure taxa por distância, raio máximo e tempo de preparo.</p>

      <section className="mt-8 rounded-3xl border border-brava-border bg-brava-card p-6">
        <h2 className="text-lg font-bold text-brava-ink">Configurações gerais</h2>
        <div className="mt-4">
          <SettingsForm initial={initial} />
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-brava-border bg-brava-card p-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brava-ink">Faixas de taxa</h2>
            <p className="text-xs text-brava-muted">A menor faixa que cobrir a distância é aplicada.</p>
          </div>
        </header>

        <div className="mt-4 space-y-2">
          {(zones as DeliveryZone[] | null)?.map((z) => (
            <div key={z.id} className="rounded-2xl border border-brava-border bg-brava-paper p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-brava-ink">
                  até {Number(z.max_km).toFixed(1)} km — {formatBRL(z.fee_cents)}
                  {z.free_above_cents ? ` (grátis acima de ${formatBRL(z.free_above_cents)})` : ""}
                </span>
                <form action={deleteZoneAction}>
                  <input type="hidden" name="id" value={z.id} />
                  <button className="text-xs text-red-600 hover:underline">excluir</button>
                </form>
              </div>
              <ZoneForm zone={{ id: z.id, max_km: Number(z.max_km), fee_cents: z.fee_cents, free_above_cents: z.free_above_cents }} />
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-brava-border bg-brava-paper p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-brava-muted">Nova faixa</p>
          <ZoneForm />
        </div>

        <p className="mt-4 text-xs text-brava-muted">
          💡 Faixas padrão sugeridas: até 5 km / R$ 15 · até 10 km / R$ 25 · até 20 km / R$ 35.
        </p>
      </section>
    </div>
  );
}
