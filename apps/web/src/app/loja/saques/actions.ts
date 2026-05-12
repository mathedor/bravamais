"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";

type State = { error?: string; ok?: string } | undefined;

export async function getAvailableBalance(establishmentId: string): Promise<number> {
  const admin = createAdminClient();
  const [{ data: orders }, { data: withdrawals }] = await Promise.all([
    admin
      .from("orders")
      .select("total_cents, status, withdrawn_at")
      .eq("establishment_id", establishmentId),
    admin
      .from("withdrawals")
      .select("amount_cents, status")
      .eq("establishment_id", establishmentId),
  ]);

  const revenue = (orders ?? [])
    .filter((o) => ["paid", "completed"].includes(o.status) && !o.withdrawn_at)
    .reduce((s, o) => s + o.total_cents, 0);
  const locked = (withdrawals ?? [])
    .filter((w) => w.status === "pending" || w.status === "paid")
    .reduce((s, w) => s + w.amount_cents, 0);

  return Math.max(0, revenue - locked);
}

export async function requestWithdrawalAction(_: State, formData: FormData): Promise<State> {
  const { establishment, profile } = await requireEstablishment();
  const amountStr = String(formData.get("amount") || "").trim().replace(",", ".");
  const pixKey = String(formData.get("pix_key") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  const amountCents = Math.round(parseFloat(amountStr) * 100);
  if (!Number.isFinite(amountCents) || amountCents < 10000) {
    return { error: "Valor mínimo R$ 100,00" };
  }
  if (!pixKey) return { error: "Informe a chave PIX pra receber." };

  const available = await getAvailableBalance(establishment.id);
  if (amountCents > available) {
    return { error: `Valor acima do disponível (R$ ${(available / 100).toFixed(2)})` };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("withdrawals").insert({
    establishment_id: establishment.id,
    amount_cents: amountCents,
    pix_key: pixKey,
    notes: notes || null,
    requested_by_user_id: profile.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/loja/saques");
  return { ok: "Saque solicitado. Admin vai processar em breve." };
}
