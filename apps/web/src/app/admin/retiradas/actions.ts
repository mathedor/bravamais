"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

export async function registrarRetiradaAction(_: State, formData: FormData): Promise<State> {
  const { user: admin, profile } = await requireRole("admin");
  const tipo = String(formData.get("tipo") || "despesa");
  const descricao = String(formData.get("descricao") || "").trim();
  const valorStr = String(formData.get("valor") || "").trim().replace(",", ".");
  const observacao = String(formData.get("observacao") || "").trim();

  const valorCents = Math.round(parseFloat(valorStr) * 100);
  if (!descricao) return { error: "Descreva a retirada." };
  if (!Number.isFinite(valorCents) || valorCents <= 0) return { error: "Valor inválido." };
  if (!["despesa", "pro_labore", "imposto", "fornecedor", "outro"].includes(tipo)) {
    return { error: "Tipo inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("retiradas").insert({
    tipo,
    descricao,
    valor_centavos: valorCents,
    observacao: observacao || null,
    criado_por: admin.id,
    criado_por_nome: profile?.full_name ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/retiradas");
  return { ok: "Retirada registrada." };
}

export async function excluirRetiradaAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const id = String(formData.get("retirada_id") || "");
  if (!id) return { error: "ID inválido." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("retiradas").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/retiradas");
  return { ok: "Retirada excluída." };
}
