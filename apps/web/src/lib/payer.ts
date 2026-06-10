import { createClient } from "@/lib/supabase/server";
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
