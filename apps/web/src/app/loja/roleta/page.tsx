import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { RoletaConfigForm } from "./form";

export const metadata = { title: "Roleta da sorte — Loja" };

export default async function LojaRoletaPage() {
  const { establishment } = await requireEstablishment();
  const admin = createAdminClient();

  const [{ data: draw }, { data: lastSpins }] = await Promise.all([
    admin
      .from("lucky_draws")
      .select("id, name, prizes, max_spins_per_user_day, is_active")
      .eq("establishment_id", establishment.id)
      .maybeSingle(),
    admin
      .from("lucky_draw_spins")
      .select("id, prize_label, created_at, profiles!lucky_draw_spins_user_id_fkey(full_name)")
      .eq("establishment_id", establishment.id)
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  type Spin = { id: string; prize_label: string; created_at: string; profiles: { full_name: string | null } | null };
  const spins = (lastSpins as unknown as Spin[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Roleta</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Roleta da Sorte</h1>
        <p className="mt-1 text-sm text-brava-muted">
          Configure prêmios e o cliente pode girar quando entrar no seu 360. Hábito e dopamina.
        </p>
      </header>

      <RoletaConfigForm
        existing={draw ? {
          name: draw.name,
          prizes: draw.prizes as never,
          maxSpinsPerDay: draw.max_spins_per_user_day,
          isActive: draw.is_active,
        } : null}
      />

      {spins.length > 0 && (
        <section className="mt-8 rounded-3xl border border-brava-border bg-brava-card p-5">
          <h2 className="text-lg font-black text-brava-ink">Últimos giros</h2>
          <ul className="mt-2 space-y-2">
            {spins.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl bg-brava-paper px-3 py-2 text-sm">
                <span className="font-medium text-brava-ink">{s.profiles?.full_name ?? "Cliente"}</span>
                <span className="text-xs">🎁 <strong>{s.prize_label}</strong></span>
                <span className="text-[10px] text-brava-muted">{new Date(s.created_at).toLocaleString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="h-8" />
    </div>
  );
}
