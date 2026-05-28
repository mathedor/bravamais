import { createClient } from "@/lib/supabase/server";

export interface UserCategoryAccess {
  /** Set de category IDs acessíveis */
  ids: Set<string>;
  /** True durante trial top (libera tudo) */
  unlimited: boolean;
  /** Preço por categoria pra CTA "adicione esse" */
  pricing: Map<string, { name: string; monthly_cents: number }>;
}

/**
 * Carrega quais categorias o user pode usar.
 * Durante trial top, qualquer categoria libera.
 * Após trial, só as que ele assinou em user_subscription_categories.
 */
export async function getUserCategoryAccess(userId: string): Promise<UserCategoryAccess> {
  const supabase = await createClient();

  const [{ data: subscription }, { data: subCats }, { data: allCats }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, trial_ends_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_subscription_categories")
      .select("category_id, subscriptions!inner(user_id)")
      .eq("subscriptions.user_id", userId),
    supabase
      .from("categories")
      .select("id, name, monthly_cents")
      .eq("is_active", true),
  ]);

  const unlimited = !!subscription?.trial_ends_at && new Date(subscription.trial_ends_at) > new Date();

  const pricing = new Map<string, { name: string; monthly_cents: number }>();
  for (const c of (allCats ?? []) as Array<{ id: string; name: string; monthly_cents: number }>) {
    pricing.set(c.id, { name: c.name, monthly_cents: c.monthly_cents });
  }

  if (unlimited) {
    return { ids: new Set(Array.from(pricing.keys())), unlimited, pricing };
  }

  const ids = new Set<string>();
  for (const row of (subCats ?? []) as Array<{ category_id: string }>) {
    ids.add(row.category_id);
  }

  return { ids, unlimited, pricing };
}

export function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
