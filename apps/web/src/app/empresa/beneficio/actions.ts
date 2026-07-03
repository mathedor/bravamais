"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type State = { error?: string; ok?: string } | undefined;

export async function acceptB2BInviteAction(): Promise<State> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Entre na sua conta pra ativar o benefício." };

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("b2b_invites")
    .select("id, account_id, expires_at, accepted_at, b2b_accounts(id, company_name, active, seats_purchased, seats_used)")
    .eq("email", user.email.toLowerCase())
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!invite) return { error: "Nenhum convite pendente pra esse email." };
  const account = invite.b2b_accounts as unknown as {
    id: string; company_name: string; active: boolean; seats_purchased: number; seats_used: number;
  } | null;
  if (!account?.active) return { error: "A conta da empresa está inativa. Fale com o RH." };
  if (account.seats_used >= account.seats_purchased) {
    return { error: "Todos os seats da empresa já foram usados. Fale com o RH." };
  }

  const { error: invErr } = await admin
    .from("b2b_invites")
    .update({ accepted_user_id: user.id, accepted_at: new Date().toISOString() })
    .eq("id", invite.id)
    .is("accepted_at", null);
  if (invErr) return { error: invErr.message };

  await admin
    .from("b2b_accounts")
    .update({ seats_used: account.seats_used + 1 })
    .eq("id", account.id);

  // benefício corporativo: premium ativo por 1 ano (renovado enquanto a empresa mantiver o contrato)
  const periodEnd = new Date(Date.now() + 365 * 86400000).toISOString();
  const { error: subErr } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        tier: "premium",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        cancel_at_period_end: false,
      },
      { onConflict: "user_id" },
    );
  if (subErr) return { error: subErr.message };

  revalidatePath("/empresa/beneficio");
  return { ok: `Benefício da ${account.company_name} ativado! Seu BRAVA+ Premium já está valendo. 🎉` };
}
