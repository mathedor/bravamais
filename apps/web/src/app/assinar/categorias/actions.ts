"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { createPayment, type CreatePixResult, type CreateCardResult } from "@/lib/payments";
import { getPayer } from "@/lib/payer";

async function startCategories(categoryIds: string[], method: "pix" | "card") {
  await requireRole(["subscriber", "admin"]);
  const ids = categoryIds.filter((s) => s && s !== "null");
  if (ids.length === 0) return { error: "Selecione ao menos 1 categoria." };

  const supabase = await createClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("id, monthly_cents")
    .in("id", ids);
  const total = (cats ?? []).reduce((s, c) => s + (c.monthly_cents as number), 0);
  if (total <= 0) return { error: "Valor inválido." };

  const payer = await getPayer();
  if (!payer) return { error: "Faça login pra assinar." };

  return createPayment({
    kind: "category_subscription",
    refId: "categories",
    refMeta: { category_ids: ids },
    method,
    amountCents: total,
    description: `BRAVA+ — ${ids.length} categoria(s)`,
    statementSuffix: "BRAVAMAIS",
    payer,
    recurring: true,
  });
}

export async function createCategoryPix(categoryIds: string[]): Promise<CreatePixResult | { error: string }> {
  return (await startCategories(categoryIds, "pix")) as CreatePixResult | { error: string };
}

export async function createCategoryCard(categoryIds: string[]): Promise<CreateCardResult | { error: string }> {
  return (await startCategories(categoryIds, "card")) as CreateCardResult | { error: string };
}

export async function setUserCategoriesAction(formData: FormData): Promise<{ ok: boolean; error?: string; total_cents?: number }> {
  const { user } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const raw = formData.getAll("category_ids");
  const ids = raw.map(String).filter((s) => s && s !== "null");

  const { data, error } = await supabase.rpc("set_user_categories", {
    p_category_ids: ids,
  });

  if (error) return { ok: false, error: error.message };

  {
    const { trackEvent } = await import("@/lib/observability");
    trackEvent({ userId: user.id, event: "categories_selected", properties: { count: ids.length } }).catch(() => {});
  }

  revalidatePath("/assinar/categorias");
  revalidatePath("/app", "layout");
  return data as { ok: boolean; total_cents?: number };
}
