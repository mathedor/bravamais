"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

export async function createB2BAccountAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const company = String(formData.get("company_name") || "").trim();
  const cnpj = String(formData.get("cnpj") || "").trim() || null;
  const contactName = String(formData.get("contact_name") || "").trim() || null;
  const contactEmail = String(formData.get("contact_email") || "").trim() || null;
  const seats = parseInt(String(formData.get("seats") || "0"), 10);
  const reaisPerSeat = parseFloat(String(formData.get("reais_per_seat") || "0"));
  if (!company || !seats || !reaisPerSeat) return { error: "Preencha empresa, seats e valor." };

  const admin = createAdminClient();
  const { error } = await admin.from("b2b_accounts").insert({
    company_name: company,
    cnpj,
    contact_name: contactName,
    contact_email: contactEmail,
    seats_purchased: seats,
    monthly_cents_per_seat: Math.round(reaisPerSeat * 100),
    active: true,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/b2b");
  return { ok: `Conta ${company} criada com ${seats} seats.` };
}
