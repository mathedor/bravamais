"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { createPayment, type CreatePixResult, type CreateCardResult } from "@/lib/payments";
import { getPayer } from "@/lib/payer";

async function startRecharge(packId: string, method: "pix" | "card") {
  await requireRole(["subscriber", "admin"]);
  if (!packId) return { error: "Pacote inválido." };

  const supabase = await createClient();
  const { data: pack } = await supabase
    .from("tag_recharge_packs")
    .select("name, amount_cents")
    .eq("id", packId)
    .eq("is_active", true)
    .maybeSingle<{ name: string; amount_cents: number }>();
  if (!pack) return { error: "Pacote indisponível." };

  const payer = await getPayer();
  if (!payer) return { error: "Faça login pra recarregar." };

  return createPayment({
    kind: "tag_recharge",
    refId: packId,
    refMeta: { pack: pack.name },
    method,
    amountCents: pack.amount_cents,
    description: `BRAVA Tag — ${pack.name}`,
    statementSuffix: "BRAVATAG",
    payer,
  });
}

export async function createTagRechargePix(packId: string): Promise<CreatePixResult | { error: string }> {
  return (await startRecharge(packId, "pix")) as CreatePixResult | { error: string };
}

export async function createTagRechargeCard(packId: string): Promise<CreateCardResult | { error: string }> {
  return (await startRecharge(packId, "card")) as CreateCardResult | { error: string };
}

async function startMonthly(method: "pix" | "card") {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("tag_settings")
    .select("monthly_plan_cents")
    .maybeSingle<{ monthly_plan_cents: number }>();
  const amount = settings?.monthly_plan_cents ?? 4900;

  const payer = await getPayer();
  if (!payer) return { error: "Faça login pra assinar." };

  return createPayment({
    kind: "tag_monthly",
    refId: "monthly",
    method,
    amountCents: amount,
    description: "Plano BRAVA Tag mensal",
    statementSuffix: "BRAVATAG",
    payer,
  });
}

export async function createTagMonthlyPix(): Promise<CreatePixResult | { error: string }> {
  return (await startMonthly("pix")) as CreatePixResult | { error: string };
}

export async function createTagMonthlyCard(): Promise<CreateCardResult | { error: string }> {
  return (await startMonthly("card")) as CreateCardResult | { error: string };
}

export async function cancelMonthlyAction(): Promise<{ ok: boolean }> {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();
  await supabase.rpc("tag_cancel_monthly");
  revalidatePath("/app/tag");
  return { ok: true };
}
