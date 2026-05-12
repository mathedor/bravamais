import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { LoyaltyForm } from "./form";

export const metadata = { title: "Clube de fidelidade" };

export default async function FidelidadePage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data: club } = await supabase
    .from("loyalty_clubs")
    .select("id, name, description, visits_required, benefit_description, is_active")
    .eq("establishment_id", establishment.id)
    .maybeSingle();

  const { count: progressCount } = await supabase
    .from("loyalty_progress")
    .select("*", { count: "exact", head: true })
    .eq("club_id", club?.id ?? "00000000-0000-0000-0000-000000000000");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Clube de fidelidade</h1>
      <p className="mt-1 text-brava-muted">
        Defina a regra: X visitas → benefício. Toda leitura de QR conta uma visita.
      </p>

      <section className="mt-8 rounded-3xl border border-brava-border bg-brava-card p-6">
        <LoyaltyForm club={club ?? null} />
      </section>

      {club && (
        <p className="mt-6 rounded-2xl bg-brava-yellow/20 px-5 py-4 text-sm text-brava-ink">
          <strong>{progressCount ?? 0}</strong> assinantes já estão participando do seu clube.
        </p>
      )}
    </div>
  );
}
