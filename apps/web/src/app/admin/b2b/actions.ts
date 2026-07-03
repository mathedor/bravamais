"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { sendCampaignEmail } from "@/lib/email";

type State = { error?: string; ok?: string } | undefined;

export async function createB2BAccountAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const company = String(formData.get("company_name") || "").trim();
  const cnpj = String(formData.get("cnpj") || "").trim() || null;
  const contactName = String(formData.get("contact_name") || "").trim() || null;
  const contactEmail = String(formData.get("contact_email") || "").trim() || null;
  const seats = parseInt(String(formData.get("seats") || "0"), 10);
  const reaisPerSeat = parseFloat(String(formData.get("reais_per_seat") || "0"));
  if (!company || !seats || !reaisPerSeat) return { error: "Preencha empresa, seats e valor." };

  const admin = createAdminClient();
  const { error } = await admin.from("b2b_accounts").insert({
    company_name: company,
    cnpj,
    contact_name: contactName,
    contact_email: contactEmail,
    seats_purchased: seats,
    monthly_cents_per_seat: Math.round(reaisPerSeat * 100),
    active: true,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/b2b");
  return { ok: `Conta ${company} criada com ${seats} seats.` };
}

export async function updateB2BAccountAction(_: State, formData: FormData): Promise<State> {
  await requireRole("admin");
  const id = String(formData.get("account_id") || "");
  const seats = parseInt(String(formData.get("seats") || "0"), 10);
  const reaisPerSeat = parseFloat(String(formData.get("reais_per_seat") || "0"));
  if (!id || !seats || !reaisPerSeat) return { error: "Preencha seats e valor." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("b2b_accounts")
    .update({ seats_purchased: seats, monthly_cents_per_seat: Math.round(reaisPerSeat * 100) })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/b2b");
  return { ok: "Conta atualizada." };
}

export async function toggleB2BAccountAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("account_id") || "");
  const active = String(formData.get("active") || "") === "true";
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("b2b_accounts").update({ active }).eq("id", id);
  revalidatePath("/admin/b2b");
}

export async function inviteB2BEmailsAction(_: State, formData: FormData): Promise<State> {
  const { user } = await requireRole("admin");
  const accountId = String(formData.get("account_id") || "");
  const raw = String(formData.get("emails") || "");
  const emails = [
    ...new Set(
      raw
        .split(/[\n,;\s]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)),
    ),
  ];
  if (!accountId || !emails.length) return { error: "Informe pelo menos um email válido." };

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("b2b_accounts")
    .select("id, company_name, active, seats_purchased, seats_used")
    .eq("id", accountId)
    .maybeSingle();
  if (!account) return { error: "Conta não encontrada." };
  if (!account.active) return { error: "Conta inativa — reative antes de convidar." };

  const { count: pendingCount } = await admin
    .from("b2b_invites")
    .select("*", { count: "exact", head: true })
    .eq("account_id", accountId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());
  const livres = account.seats_purchased - account.seats_used - (pendingCount ?? 0);
  if (emails.length > livres) {
    return { error: `Sem seats suficientes: ${livres} livres (contando convites pendentes), ${emails.length} emails.` };
  }

  const { error } = await admin.from("b2b_invites").upsert(
    emails.map((email) => ({
      account_id: accountId,
      email,
      invited_by_admin_user_id: user.id,
      expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    })),
    { onConflict: "account_id,email" },
  );
  if (error) return { error: error.message };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bravamais.com.br";
  await Promise.allSettled(
    emails.map((email) =>
      sendCampaignEmail({
        to: email,
        name: email.split("@")[0],
        title: `🎁 Você ganhou BRAVA+ da ${account.company_name}`,
        body: `<p>A <b>${account.company_name}</b> contratou o clube de vantagens BRAVA+ pra você. Crie sua conta com este email (ou entre, se já tiver) e ative seu benefício — é grátis pra você.</p><p>O convite vale por 14 dias.</p>`,
        ctaLabel: "Ativar meu benefício",
        ctaUrl: `${appUrl}/empresa/beneficio`,
      }),
    ),
  );

  revalidatePath("/admin/b2b");
  return { ok: `${emails.length} convite(s) enviado(s).` };
}

export async function revokeB2BInviteAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("invite_id") || "");
  if (!id) return;
  const admin = createAdminClient();
  // só revoga convite ainda não aceito
  await admin.from("b2b_invites").delete().eq("id", id).is("accepted_at", null);
  revalidatePath("/admin/b2b");
}
