import { createClient } from "@/lib/supabase/server";

export type FeatureCategory = "base" | "vendas" | "engajamento" | "bi" | "operacao" | "crescimento";

export interface FeatureCatalogRow {
  slug: string;
  name: string;
  short_desc: string;
  sales_pitch: string | null;
  category: FeatureCategory;
  monthly_cents: number;
  is_base: boolean;
  is_active: boolean;
  depends_on: string[];
  display_order: number;
  pricing_note: string | null;
}

export interface FeatureGrant {
  feature_slug: string;
  activated_at: string;
  source: string;
}

export async function listEstabFeatureGrants(establishmentId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("establishment_feature_grants")
    .select("feature_slug")
    .eq("establishment_id", establishmentId);
  return new Set((data ?? []).map((r) => r.feature_slug));
}

export async function listFeatureCatalog(opts?: { onlyActive?: boolean }): Promise<FeatureCatalogRow[]> {
  const supabase = await createClient();
  let q = supabase.from("establishment_features").select("*").order("display_order");
  if (opts?.onlyActive ?? true) {
    q = q.eq("is_active", true);
  }
  const { data } = await q;
  return (data ?? []) as FeatureCatalogRow[];
}

export interface EstabMonthlySummary {
  base_cents: number;
  features_total_cents: number;
  total_cents: number;
  active_grants: number;
  legacy_tier: string | null;
  migration_freeze_until: string | null;
}

export async function getEstabSubscriptionSummary(establishmentId: string): Promise<EstabMonthlySummary> {
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("establishment_subscriptions")
    .select("base_cents, features_total_cents, legacy_tier, migration_freeze_until")
    .eq("establishment_id", establishmentId)
    .maybeSingle();

  const grants = await listEstabFeatureGrants(establishmentId);

  const base = sub?.base_cents ?? 4900;
  const features = sub?.features_total_cents ?? 0;

  return {
    base_cents: base,
    features_total_cents: features,
    total_cents: base + features,
    active_grants: grants.size,
    legacy_tier: sub?.legacy_tier ?? null,
    migration_freeze_until: sub?.migration_freeze_until ?? null,
  };
}

export function filterGroupsByFeatures<T extends { href: string; featureSlug?: string }>(
  items: T[],
  activeSlugs: Set<string>,
): T[] {
  return items.filter((it) => !it.featureSlug || activeSlugs.has(it.featureSlug));
}

export function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
