"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

export async function createSlotAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const estabId = String(formData.get("estab_id") || "");
  const placement = String(formData.get("placement") || "home_hero");
  const categorySlug = String(formData.get("category_slug") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const monthly = Math.round(parseFloat(String(formData.get("monthly_reais") || "0")) * 100);
  const days = parseInt(String(formData.get("days") || "30"), 10);
  if (!estabId || !monthly || !days) return { error: "Preencha todos os campos." };

  const admin = createAdminClient();
  const endsAt = new Date(Date.now() + days * 86400000).toISOString();
  const { error } = await admin.from("featured_slots").insert({
    establishment_id: estabId,
    placement,
    category_slug: categorySlug,
    city,
    priority: 50,
    starts_at: new Date().toISOString(),
    ends_at: endsAt,
    monthly_cents: monthly,
    paid: false,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/slots");
  return { ok: "Slot criado · marque como PAGO quando confirmar." };
}

export async function toggleSlotPaidAction(formData: FormData) {
  await requireRole("admin");
  const slotId = String(formData.get("slot_id") || "");
  const currentlyPaid = String(formData.get("paid") || "") === "true";
  if (!slotId) return;
  const admin = createAdminClient();
  await admin.from("featured_slots").update({ paid: !currentlyPaid }).eq("id", slotId);
  revalidatePath("/admin/slots");
}
