import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { PlansForm } from "./form";

export const metadata = { title: "Planos — Admin" };

interface Plan {
  tier: "basico" | "premium" | "vip";
  name: string;
  monthly_cents: number;
  yearly_cents: number | null;
  features: { bullets?: string[] };
}

export default async function PlanosAdminPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscription_plans")
    .select("tier, name, monthly_cents, yearly_cents, features, display_order")
    .order("display_order");
  const plans = (data as Plan[] | null) ?? [];

  // Stats
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("tier, status");

  const byTier: Record<string, { active: number; trial: number; total: number }> = {};
  for (const s of subs ?? []) {
    if (!byTier[s.tier]) byTier[s.tier] = { active: 0, trial: 0, total: 0 };
    byTier[s.tier].total += 1;
    if (s.status === "active") byTier[s.tier].active += 1;
    if (s.status === "trial") byTier[s.tier].trial += 1;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-3xl font-black tracking-tight">Planos BRAVA+</h1>
      <p className="mt-1 text-brava-muted">Edite preços, nome ou bulletpoints. Vigora pra novos assinantes.</p>

      <div className="mt-8 space-y-4">
        {plans.map((p) => (
          <div key={p.tier} className="rounded-3xl border border-brava-border bg-brava-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-2xl font-black">{p.name}</h2>
              <div className="text-xs text-brava-muted">
                <strong className="text-brava-ink">{byTier[p.tier]?.active ?? 0}</strong> ativos ·
                {" "}{byTier[p.tier]?.trial ?? 0} em trial ·
                {" "}{byTier[p.tier]?.total ?? 0} total
              </div>
            </div>
            <PlansForm plan={p} />
          </div>
        ))}
      </div>

      <div className="h-6" />
    </div>
  );
}
