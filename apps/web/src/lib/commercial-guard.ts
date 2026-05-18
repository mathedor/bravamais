import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export type CommercialAffiliate = {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  code: string;
  is_active: boolean;
  pix_key: string | null;
  territory: string | null;
  notes: string | null;
  establishment_commission_kind: "fixed" | "percent";
  establishment_commission_value: number;
  establishment_commission_months: number;
  subscriber_commission_kind: "fixed" | "percent";
  subscriber_commission_basic_value: number;
  subscriber_commission_premium_value: number;
  subscriber_commission_vip_value: number;
  subscriber_commission_months: number;
  onboarded_at: string | null;
  created_at: string;
};

/** Garante que user é comercial E retorna a row commercial_affiliates dele. */
export async function requireCommercial() {
  const { user, profile } = await requireRole(["commercial", "admin"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("commercial_affiliates")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<CommercialAffiliate>();

  if (!data) {
    // Admin pode entrar mesmo sem ter affiliate (vê dashboard demo)
    if (profile.role === "admin") {
      const { data: any1 } = await supabase
        .from("commercial_affiliates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<CommercialAffiliate>();
      if (any1) return { affiliate: any1, profile };
    }
    redirect("/entrar");
  }

  return { affiliate: data, profile };
}
