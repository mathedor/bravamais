"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

export async function createAffiliateAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  let code = String(formData.get("code") || "").trim().toUpperCase();
  const rate = parseFloat(String(formData.get("commission_rate") || "20")) / 100;
  const months = parseInt(String(formData.get("duration_months") || "12"), 10);
  const pixKey = String(formData.get("pix_key") || "").trim() || null;
  if (!name) return { error: "Nome obrigatório." };

  if (!code) {
    code = "COM-" + Array.from({ length: 6 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("commercial_affiliates").insert({
    name, email, phone, code,
    commission_rate: rate,
    duration_months: months,
    pix_key: pixKey,
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/afiliados");
  return { ok: `Afiliado criado · código ${code}` };
}
