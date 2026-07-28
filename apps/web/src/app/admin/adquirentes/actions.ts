"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

type State = { error?: string; ok?: string } | undefined;

function parseMoney(v: string): number {
  const n = parseFloat(v.trim().replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function parsePct(v: string): number {
  const n = parseFloat(v.trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export async function saveAcquirerAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const id = String(formData.get("acquirer_id") || "");
  const nome = String(formData.get("nome") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const observacao = String(formData.get("observacao") || "").trim();
  const custo = parseMoney(String(formData.get("custo_transferencia") || "0"));

  if (!nome || !slug) return { error: "Nome e slug são obrigatórios." };
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: "Slug só com letras minúsculas, números e hífen." };

  const admin = createAdminClient();
  const payload = {
    nome,
    slug,
    observacao: observacao || null,
    custo_transferencia_centavos: Math.max(0, custo),
  };

  const { error } = id
    ? await admin.from("acquirers").update(payload).eq("id", id)
    : await admin.from("acquirers").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/admin/adquirentes");
  return { ok: id ? "Adquirente atualizado." : "Adquirente criado." };
}

export async function toggleAcquirerAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const id = String(formData.get("acquirer_id") || "");
  if (!id) return { error: "ID inválido." };

  const admin = createAdminClient();
  const { data: acq } = await admin.from("acquirers").select("ativo").eq("id", id).maybeSingle();
  if (!acq) return { error: "Adquirente não encontrado." };

  const { error } = await admin.from("acquirers").update({ ativo: !acq.ativo }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/adquirentes");
  return { ok: acq.ativo ? "Adquirente desativado." : "Adquirente ativado." };
}

export async function saveFeeAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const id = String(formData.get("fee_id") || "");
  const acquirerId = String(formData.get("acquirer_id") || "");
  const forma = String(formData.get("forma") || "pix");
  const rotulo = String(formData.get("rotulo") || "").trim();
  const taxaPct = parsePct(String(formData.get("taxa_percentual") || "0"));
  const taxaFixa = parseMoney(String(formData.get("taxa_fixa") || "0"));
  const prazo = parseInt(String(formData.get("prazo_liberacao_dias") || "0"), 10) || 0;
  const parcelado = formData.get("parcelado") === "on";
  const taxaParcelaPct = parsePct(String(formData.get("taxa_parcela_percentual") || "0"));
  const maxParcelas = parseInt(String(formData.get("max_parcelas") || "1"), 10) || 1;

  if (!acquirerId) return { error: "Adquirente inválido." };
  if (!["pix", "credito", "debito"].includes(forma)) return { error: "Forma inválida." };

  const admin = createAdminClient();
  const payload = {
    acquirer_id: acquirerId,
    forma,
    rotulo: rotulo || null,
    taxa_percentual: taxaPct,
    taxa_fixa_centavos: Math.max(0, taxaFixa),
    prazo_liberacao_dias: Math.max(0, prazo),
    parcelado,
    taxa_parcela_percentual: taxaParcelaPct,
    max_parcelas: Math.max(1, maxParcelas),
  };

  const { error } = id
    ? await admin.from("acquirer_fees").update(payload).eq("id", id)
    : await admin.from("acquirer_fees").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/admin/adquirentes");
  return { ok: "Taxa salva." };
}

export async function deleteFeeAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const id = String(formData.get("fee_id") || "");
  if (!id) return { error: "ID inválido." };

  const admin = createAdminClient();
  const { error } = await admin.from("acquirer_fees").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/adquirentes");
  return { ok: "Taxa removida." };
}
