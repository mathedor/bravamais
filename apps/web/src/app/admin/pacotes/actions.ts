"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

export async function createPackageAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim() || null;
  const emoji = String(formData.get("theme_emoji") || "🎉").trim();
  const color = String(formData.get("theme_color") || "#FFD400").trim();
  const startsAt = String(formData.get("starts_at") || "");
  const endsAt = String(formData.get("ends_at") || "");
  if (!slug || !title || !startsAt || !endsAt) return { error: "Preencha slug/título/datas." };

  const admin = createAdminClient();
  const { error } = await admin.from("seasonal_packages").insert({
    slug, title, subtitle,
    theme_emoji: emoji,
    theme_color: color,
    starts_at: startsAt,
    ends_at: endsAt + "T23:59:59",
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/pacotes");
  return { ok: "Pacote criado." };
}

export async function togglePackageActiveAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  const admin = createAdminClient();
  await admin.from("seasonal_packages").update({ is_active: !active }).eq("id", id);
  revalidatePath("/admin/pacotes");
  revalidatePath("/app");
}

export async function deletePackageAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const admin = createAdminClient();
  await admin.from("seasonal_packages").delete().eq("id", id);
  revalidatePath("/admin/pacotes");
}

export async function addCouponToPackageAction(formData: FormData) {
  await requireRole("admin");
  const packageId = String(formData.get("package_id") || "");
  const couponId = String(formData.get("coupon_id") || "");
  const highlight = formData.get("highlight") === "on";
  if (!packageId || !couponId) return;
  const admin = createAdminClient();
  await admin.from("seasonal_package_coupons").upsert(
    { package_id: packageId, coupon_id: couponId, highlight, display_order: 100 },
    { onConflict: "package_id,coupon_id" },
  );
  revalidatePath(`/admin/pacotes/${packageId}`);
}

export async function removeCouponFromPackageAction(formData: FormData) {
  await requireRole("admin");
  const packageId = String(formData.get("package_id") || "");
  const couponId = String(formData.get("coupon_id") || "");
  const admin = createAdminClient();
  await admin.from("seasonal_package_coupons").delete().eq("package_id", packageId).eq("coupon_id", couponId);
  revalidatePath(`/admin/pacotes/${packageId}`);
}
