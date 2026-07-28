"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

export async function criarBloqueioAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const establishmentId = String(formData.get("establishment_id") || "");
  const razao = String(formData.get("razao") || "outro");
  const valorStr = String(formData.get("valor") || "").trim().replace(",", ".");
  const observacao = String(formData.get("observacao") || "").trim();

  const valorCents = Math.round(parseFloat(valorStr) * 100);
  if (!establishmentId) return { error: "Escolha o lojista." };
  if (!Number.isFinite(valorCents) || valorCents <= 0) return { error: "Valor inválido." };
  if (!["chargeback_cartao", "contestacao_pix", "reembolso", "repasse_excedente", "outro"].includes(razao)) {
    return { error: "Razão inválida." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("financial_blocks").insert({
    establishment_id: establishmentId,
    valor_centavos: valorCents,
    razao,
    observacao: observacao || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/bloqueios");
  return { ok: "Bloqueio criado. Ele passa a ser coberto pelo saldo do lojista na plataforma." };
}

export async function resolverBloqueioAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const id = String(formData.get("block_id") || "");
  if (!id) return { error: "ID inválido." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("financial_blocks")
    .update({ status: "resolvido" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/bloqueios");
  return { ok: "Bloqueio resolvido." };
}
