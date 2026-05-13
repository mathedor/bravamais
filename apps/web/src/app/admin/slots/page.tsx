import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { SlotForm } from "./form";
import { TogglePaid } from "./toggle";

export const metadata = { title: "Slots pagos — Admin" };

interface Slot {
  id: string;
  placement: string;
  category_slug: string | null;
  city: string | null;
  state: string | null;
  priority: number;
  starts_at: string;
  ends_at: string;
  monthly_cents: number;
  paid: boolean;
  establishments: { name: string; slug: string } | null;
}

export default async function AdminSlotsPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: slotsRaw }, { data: estabs }] = await Promise.all([
    admin
      .from("featured_slots")
      .select("id, placement, category_slug, city, state, priority, starts_at, ends_at, monthly_cents, paid, establishments(name, slug)")
      .order("ends_at", { ascending: false })
      .limit(100),
    admin.from("establishments").select("id, name, slug, city, state").eq("is_active", true).order("name").limit(200),
  ]);

  const slots = (slotsRaw as unknown as Slot[] | null) ?? [];
  const activeSlots = slots.filter((s) => s.paid && new Date(s.ends_at) > new Date());
  const activeRevenue = activeSlots.reduce((s, sl) => s + sl.monthly_cents, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin · Monetização</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Slots de destaque pago</h1>
        <p className="mt-1 text-sm text-brava-muted">
          {activeSlots.length} slots ativos · MRR atual {formatBRL(activeRevenue)}
        </p>
      </header>

      <SlotForm
        estabs={(estabs as { id: string; name: string; slug: string; city: string | null; state: string | null }[] | null) ?? []}
      />

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-black text-brava-ink">Slots</h2>
        {slots.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
            Nenhum slot cadastrado.
          </p>
        ) : (
          slots.map((s) => {
            const expired = new Date(s.ends_at) < new Date();
            return (
              <article key={s.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-brava-ink">{s.establishments?.name ?? "—"}</p>
                    <p className="text-[11px] text-brava-muted">
                      {placementLabel(s.placement)}
                      {s.category_slug && ` · ${s.category_slug}`}
                      {s.city && ` · ${s.city}/${s.state ?? ""}`}
                      {" · prio "}{s.priority}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brava-ink">{formatBRL(s.monthly_cents)}/mês</p>
                    <p className="text-[10px] text-brava-muted">
                      Até {new Date(s.ends_at).toLocaleDateString("pt-BR")}
                      {expired && " · EXPIRADO"}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {s.paid ? "PAGO" : "AGUARDANDO"}
                  </span>
                  <TogglePaid slotId={s.id} paid={s.paid} />
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

function placementLabel(p: string): string {
  switch (p) {
    case "home_hero": return "🏠 Home hero";
    case "category_top": return "🗂️ Topo da categoria";
    case "nearby_top": return "📍 Topo do perto de mim";
    default: return p;
  }
}
