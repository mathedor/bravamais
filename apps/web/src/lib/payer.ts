import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentPayer } from "@/lib/payments";

/** Monta o pagador (PIX exige nome/cpf/email/phone) a partir do usuário logado. */
export async function getPayer(): Promise<PaymentPayer | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, cpf, phone")
    .eq("id", user.id)
    .maybeSingle<{ full_name: string | null; cpf: string | null; phone: string | null }>();

  return {
    id: user.id,
    name: profile?.full_name ?? "Cliente BRAVA+",
    cpf: profile?.cpf ?? "",
    email: user.email ?? "",
    phone: profile?.phone ?? "",
  };
}

/** Monta o pagador a partir do user_id, sem sessão (uso em cron/webhook). */
export async function getPayerAdmin(userId: string): Promise<PaymentPayer | null> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, cpf, phone")
    .eq("id", userId)
    .maybeSingle<{ full_name: string | null; cpf: string | null; phone: string | null }>();

  let email = "";
  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    email = data.user?.email ?? "";
  } catch {
    /* ignora */
  }

  return {
    id: userId,
    name: profile?.full_name ?? "Cliente BRAVA+",
    cpf: profile?.cpf ?? "",
    email,
    phone: profile?.phone ?? "",
  };
}
