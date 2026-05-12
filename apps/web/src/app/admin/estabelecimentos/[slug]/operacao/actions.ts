"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: string } | undefined;

// COUPONS
export async function adminCreateCouponAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const estabId = String(formData.get("estab_id") || "");
  const slug = String(formData.get("slug") || "");
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim();
  const discountPercent = parseInt(String(formData.get("discount_percent") || "0"), 10);
  const discountValue = String(formData.get("discount_value") || "").trim();
  if (!estabId || !code) return { error: "Loja e código obrigatórios." };
  if (!discountPercent && !discountValue) return { error: "Informe % ou R$." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").insert({
    establishment_id: estabId,
    code,
    description: description || null,
    discount_percent: discountPercent || null,
    discount_cents: discountValue ? Math.round(parseFloat(discountValue.replace(",", ".")) * 100) : null,
    is_active: true,
  });
  if (error) return { error: error.message };

  await logActivity({ userId: admin.id, entityType: "establishment", entityId: estabId, action: "coupon_created" });
  revalidatePath(`/admin/estabelecimentos/${slug}/operacao`);
  return { ok: "Cupom criado." };
}

export async function adminDeleteCouponAction(formData: FormData) {
  const { user: admin } = await requireRole("admin");
  const id = String(formData.get("id") || "");
  const slug = String(formData.get("slug") || "");
  const estabId = String(formData.get("estab_id") || "");
  if (!id) return;
  const supabase = createAdminClient();
  await supabase.from("coupons").delete().eq("id", id);
  await logActivity({ userId: admin.id, entityType: "establishment", entityId: estabId, action: "coupon_deleted" });
  if (slug) revalidatePath(`/admin/estabelecimentos/${slug}/operacao`);
}

export async function adminToggleCouponAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const isActive = String(formData.get("is_active") || "") === "true";
  const slug = String(formData.get("slug") || "");
  if (!id) return;
  const supabase = createAdminClient();
  await supabase.from("coupons").update({ is_active: !isActive }).eq("id", id);
  if (slug) revalidatePath(`/admin/estabelecimentos/${slug}/operacao`);
}

// PRODUCTS
export async function adminCreateProductAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const estabId = String(formData.get("estab_id") || "");
  const slug = String(formData.get("slug") || "");
  const name = String(formData.get("name") || "").trim();
  const price = String(formData.get("price") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!estabId || !name || !price) return { error: "Loja, nome e preço obrigatórios." };
  const priceCents = Math.round(parseFloat(price.replace(",", ".")) * 100);
  if (!Number.isFinite(priceCents) || priceCents < 0) return { error: "Preço inválido." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").insert({
    establishment_id: estabId,
    name,
    description: description || null,
    price_cents: priceCents,
    photos: [],
    is_active: true,
  });
  if (error) return { error: error.message };
  if (slug) revalidatePath(`/admin/estabelecimentos/${slug}/operacao`);
  return { ok: "Produto criado." };
}

export async function adminDeleteProductAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const slug = String(formData.get("slug") || "");
  if (!id) return;
  const supabase = createAdminClient();
  await supabase.from("products").delete().eq("id", id);
  if (slug) revalidatePath(`/admin/estabelecimentos/${slug}/operacao`);
}

// LOYALTY
export async function adminUpsertLoyaltyAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const estabId = String(formData.get("estab_id") || "");
  const slug = String(formData.get("slug") || "");
  const name = String(formData.get("name") || "").trim();
  const benefit = String(formData.get("benefit_description") || "").trim();
  const visitsRequired = parseInt(String(formData.get("visits_required") || "5"), 10);
  if (!estabId || !name || !benefit || !visitsRequired) return { error: "Preencha todos os campos." };

  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("loyalty_clubs").select("id").eq("establishment_id", estabId).maybeSingle();
  if (existing) {
    await supabase.from("loyalty_clubs").update({ name, benefit_description: benefit, visits_required: visitsRequired, is_active: true }).eq("id", existing.id);
  } else {
    await supabase.from("loyalty_clubs").insert({ establishment_id: estabId, name, benefit_description: benefit, visits_required: visitsRequired, is_active: true });
  }
  if (slug) revalidatePath(`/admin/estabelecimentos/${slug}/operacao`);
  return { ok: "Clube atualizado." };
}
