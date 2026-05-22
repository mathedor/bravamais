"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";

/* ============================================================
   LOJISTA — configurar o Benefício Renovável
   ============================================================ */
export async function renewableBenefitUpsertAction(_: unknown, fd: FormData) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const kind = (String(fd.get("kind") || "percent")) as "percent" | "voucher";
  const rawValue = parseFloat(String(fd.get("value") || "0").replace(",", "."));
  // percent: guarda o número direto (20 = 20%). voucher: guarda em centavos.
  const value = kind === "voucher" ? Math.round(rawValue * 100) : rawValue;

  if (!rawValue || rawValue <= 0) return { error: "Informe um valor válido." };
  if (kind === "percent" && rawValue > 90) return { error: "Desconto máximo 90%." };

  const headline = String(fd.get("headline") || "").trim() ||
    (kind === "percent" ? `${rawValue}% de desconto` : `R$ ${rawValue.toFixed(2)} em compras`);

  const data = {
    establishment_id: establishment.id,
    kind,
    value,
    headline,
    description: String(fd.get("description") || "").trim() || null,
    renew_days: Math.min(90, Math.max(7, parseInt(String(fd.get("renew_days") || "30"), 10))),
    audience: (String(fd.get("audience") || "clientes")) as "clientes" | "cidade" | "todos",
    min_order_cents: fd.get("min_order_brl")
      ? Math.round(parseFloat(String(fd.get("min_order_brl")).replace(",", ".")) * 100)
      : null,
    is_active: fd.get("is_active") !== "off",
  };

  const id = String(fd.get("id") || "");
  if (id) {
    await supabase.from("renewable_benefits").update(data).eq("id", id).eq("establishment_id", establishment.id);
  } else {
    // só permite 1 benefício ativo por estab — desativa os anteriores
    await supabase.from("renewable_benefits").update({ is_active: false }).eq("establishment_id", establishment.id);
    await supabase.from("renewable_benefits").insert(data);
  }

  revalidatePath("/loja/beneficio-renovavel");
  revalidatePath("/loja");
  return { ok: true };
}

export async function renewableBenefitToggleAction(id: string, active: boolean) {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  await supabase.from("renewable_benefits").update({ is_active: active })
    .eq("id", id).eq("establishment_id", establishment.id);
  revalidatePath("/loja/beneficio-renovavel");
}

/**
 * Dispara o benefício AGORA pros membros elegíveis (sem esperar o cron).
 * Útil logo após criar o benefício. Limitado a 500 por chamada.
 */
export async function renewableDispatchNowAction() {
  await requireEstablishment();
  const admin = createAdminClient();
  const { data } = await admin.rpc("dispatch_renewable_benefits", { p_limit: 500 });
  revalidatePath("/loja/beneficio-renovavel");
  return { ok: true, result: data?.[0] ?? null };
}

/* ============================================================
   USUÁRIO — resgatar (marcar usado)
   ============================================================ */
export async function useRenewableGrantAction(grantId: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("use_renewable_grant", { p_grant_id: grantId });
  revalidatePath("/app/beneficios");
  return { ok: data === true };
}

/* ============================================================
   FORM WRAPPER
   ============================================================ */
export async function fdRenewableBenefit(fd: FormData) {
  await renewableBenefitUpsertAction(undefined, fd);
}
