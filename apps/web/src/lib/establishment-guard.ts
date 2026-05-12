import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import type { Establishment } from "@/lib/supabase/types";

/**
 * /loja só pode ser operada pelo dono do estabelecimento.
 * Admin NÃO entra em /loja — usa /admin/estabelecimentos/[id] pra gerenciar.
 */
export async function requireEstablishment() {
  const { profile, user } = await requireRole("establishment");
  const supabase = await createClient();

  const { data: estab } = await supabase
    .from("establishments")
    .select("*")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Establishment>();

  if (!estab) {
    redirect("/cadastro-estabelecimento");
  }

  return { profile, user, establishment: estab };
}
