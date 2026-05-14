import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import type { Deliverer } from "@/lib/supabase/types";

/**
 * /entregador só pode ser acessado por quem tem profile.role = 'deliverer'
 * E que tenha um deliverers record vinculado (criado pela loja ou aprovado pelo admin).
 */
export async function requireDeliverer() {
  const { profile, user } = await requireRole("deliverer");
  const supabase = await createClient();

  const { data: deliverer } = await supabase
    .from("deliverers")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle<Deliverer>();

  if (!deliverer) {
    redirect("/entregador/pendente");
  }

  if (deliverer.status !== "approved") {
    redirect("/entregador/pendente");
  }

  return { profile, user, deliverer };
}
