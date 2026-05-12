import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import type { Establishment } from "@/lib/supabase/types";

export async function requireEstablishment() {
  const { profile, user } = await requireRole(["establishment", "admin"]);
  const supabase = await createClient();

  // Pick first establishment owned by user. If admin and none owned, fall back to first verified estab.
  let { data: estab } = await supabase
    .from("establishments")
    .select("*")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Establishment>();

  if (!estab && profile.role === "admin") {
    const { data: anyEstab } = await supabase
      .from("establishments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<Establishment>();
    estab = anyEstab;
  }

  if (!estab) {
    redirect("/cadastro-estabelecimento");
  }

  return { profile, user, establishment: estab };
}
