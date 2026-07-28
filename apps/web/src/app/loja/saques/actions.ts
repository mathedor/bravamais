"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import {
  saqueResumoEstab,
  saquePermitido,
  custoTransferencia,
  type Forma,
} from "@/lib/financeiro";

type State = { error?: string; ok?: string } | undefined;

/** Mantido por compatibilidade (usado em outros pontos): disponível com gate. */
export async function getAvailableBalance(establishmentId: string): Promise<number> {
  const resumo = await saqueResumoEstab(establishmentId);
  return resumo.total_disponivel_cents;
}

export async function requestWithdrawalAction(_: State, formData: FormData): Promise<State> {
  const { establishment, profile } = await requireEstablishment();
  const amountStr = String(formData.get("amount") || "").trim().replace(",", ".");
  const forma = (String(formData.get("forma") || "PIX") === "CARTAO" ? "CARTAO" : "PIX") as Forma;
  const bankAccountId = String(formData.get("bank_account_id") || "");
  const notes = String(formData.get("notes") || "").trim();

  const amountCents = Math.round(parseFloat(amountStr) * 100);
  if (!Number.isFinite(amountCents) || amountCents < 10000) {
    return { error: "Valor mínimo R$ 100,00" };
  }
  if (!bankAccountId) return { error: "Escolha a conta bancária pra receber." };

  const admin = createAdminClient();
  const { data: conta } = await admin
    .from("establishment_bank_accounts")
    .select("id, apelido, pix_chave, banco, agencia, conta, tipo_conta, titular, doc_titular")
    .eq("id", bankAccountId)
    .eq("establishment_id", establishment.id)
    .maybeSingle();
  if (!conta) return { error: "Conta bancária não encontrada." };

  // Gate de débitos: cobertura por todo o dinheiro na plataforma.
  const { permitido, restanteLinha, debitos } = await saquePermitido(establishment.id, forma);
  if (restanteLinha <= 0) {
    return { error: "Nada liberado pra saque nessa forma no momento." };
  }
  if (amountCents > permitido) {
    const sugerido = Math.max(0, permitido);
    if (sugerido < 10000) {
      return {
        error:
          debitos > 0
            ? `Saque travado por débitos ativos de R$ ${(debitos / 100).toFixed(2)}. Fale com a BRAVA+.`
            : `Valor acima do disponível (R$ ${(restanteLinha / 100).toFixed(2)}).`,
      };
    }
    return {
      error: `Valor acima do permitido. Máximo agora: R$ ${(sugerido / 100).toFixed(2)}${
        debitos > 0 ? ` (há débitos de R$ ${(debitos / 100).toFixed(2)} sendo cobertos)` : ""
      }.`,
    };
  }

  const taxa = await custoTransferencia(forma);

  const { error } = await admin.from("withdrawals").insert({
    establishment_id: establishment.id,
    amount_cents: amountCents,
    forma,
    bank_account_id: conta.id,
    conta_snapshot: conta,
    taxa_transferencia_centavos: taxa,
    pix_key: conta.pix_chave,
    notes: notes || null,
    requested_by_user_id: profile.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/loja/saques");
  return { ok: "Saque solicitado. A BRAVA+ vai processar em breve." };
}

export async function saveBankAccountAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const apelido = String(formData.get("apelido") || "").trim();
  const pixChave = String(formData.get("pix_chave") || "").trim();
  const banco = String(formData.get("banco") || "").trim();
  const agencia = String(formData.get("agencia") || "").trim();
  const conta = String(formData.get("conta") || "").trim();
  const tipoConta = String(formData.get("tipo_conta") || "corrente");
  const titular = String(formData.get("titular") || "").trim();
  const docTitular = String(formData.get("doc_titular") || "").trim();

  if (!pixChave && !(banco && agencia && conta)) {
    return { error: "Informe a chave PIX ou os dados bancários completos." };
  }
  if (!titular) return { error: "Informe o titular da conta." };

  const admin = createAdminClient();
  const { error } = await admin.from("establishment_bank_accounts").insert({
    establishment_id: establishment.id,
    apelido: apelido || null,
    pix_chave: pixChave || null,
    banco: banco || null,
    agencia: agencia || null,
    conta: conta || null,
    tipo_conta: tipoConta === "poupanca" ? "poupanca" : "corrente",
    titular,
    doc_titular: docTitular || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/loja/saques");
  return { ok: "Conta cadastrada." };
}

export async function deleteBankAccountAction(_: State, formData: FormData): Promise<State> {
  const { establishment } = await requireEstablishment();
  const id = String(formData.get("account_id") || "");
  if (!id) return { error: "Conta inválida." };

  const admin = createAdminClient();

  const { data: emUso } = await admin
    .from("withdrawals")
    .select("id")
    .eq("bank_account_id", id)
    .in("status", ["pending", "approved"])
    .limit(1);
  if (emUso && emUso.length > 0) {
    return { error: "Essa conta está em um saque em andamento." };
  }

  const { error } = await admin
    .from("establishment_bank_accounts")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishment.id);
  if (error) return { error: error.message };

  revalidatePath("/loja/saques");
  return { ok: "Conta removida." };
}
