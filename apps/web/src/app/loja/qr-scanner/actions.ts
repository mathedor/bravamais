"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { logActivity } from "@/lib/activity-log";

export type ScanResult =
  | {
      ok: true;
      kind: "visit";
      user: { id: string; name: string | null };
      visit_id: string;
      loyalty?: { current: number; required: number; just_completed: boolean };
    }
  | {
      ok: true;
      kind: "reward";
      user: { id: string; name: string | null };
      benefit: string;
      reward_id: string;
    }
  | { ok: false; error: string };

export async function scanCodeAction(rawCode: string): Promise<ScanResult> {
  const cleaned = rawCode.replace(/^BRAVAMAIS:/i, "").trim().toUpperCase();
  if (!cleaned) return { ok: false, error: "Código vazio." };
  if (cleaned.startsWith("REWARD-")) return useReward(cleaned);
  return markVisit(cleaned);
}

export async function markVisitAction(rawCode: string): Promise<ScanResult> {
  return scanCodeAction(rawCode);
}

async function markVisit(code: string): Promise<ScanResult> {
  const { establishment, user: scanner } = await requireEstablishment();
  const admin = createAdminClient();

  const { data: qr } = await admin
    .from("qr_cards")
    .select("user_id")
    .eq("code", code)
    .maybeSingle();
  if (!qr) return { ok: false, error: "QR code não reconhecido." };

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("id", qr.user_id)
    .maybeSingle();

  const supabase = await createClient();
  const { data: visit, error: visitErr } = await supabase
    .from("visits")
    .insert({
      user_id: qr.user_id,
      establishment_id: establishment.id,
      source: "qr_scan",
      scanned_by_user_id: scanner.id,
    })
    .select("id")
    .single();
  if (visitErr || !visit) return { ok: false, error: visitErr?.message ?? "Erro ao registrar visita." };

  await logActivity({ userId: scanner.id, entityType: "establishment", entityId: establishment.id, action: "visit_registered" });

  let loyalty: { current: number; required: number; just_completed: boolean } | undefined;
  const { data: club } = await admin
    .from("loyalty_clubs")
    .select("id, visits_required")
    .eq("establishment_id", establishment.id)
    .eq("is_active", true)
    .maybeSingle();

  if (club) {
    const { data: progress } = await admin
      .from("loyalty_progress")
      .select("id, visits_count")
      .eq("user_id", qr.user_id)
      .eq("club_id", club.id)
      .maybeSingle();

    const newCount = (progress?.visits_count ?? 0) + 1;
    const wasIncomplete = (progress?.visits_count ?? 0) < club.visits_required;
    const justCompleted = wasIncomplete && newCount >= club.visits_required;

    if (progress) {
      await admin
        .from("loyalty_progress")
        .update({
          visits_count: newCount,
          completed_at: justCompleted ? new Date().toISOString() : progress.visits_count >= club.visits_required ? null : null,
        })
        .eq("id", progress.id);
    } else {
      await admin.from("loyalty_progress").insert({
        user_id: qr.user_id,
        club_id: club.id,
        visits_count: newCount,
        completed_at: newCount >= club.visits_required ? new Date().toISOString() : null,
      });
    }

    loyalty = { current: newCount, required: club.visits_required, just_completed: justCompleted };
  }

  revalidatePath("/loja/qr-scanner");
  revalidatePath("/loja");

  return {
    ok: true,
    kind: "visit",
    user: { id: qr.user_id, name: profile?.full_name ?? null },
    visit_id: visit.id,
    loyalty,
  };
}

async function useReward(rewardCode: string): Promise<ScanResult> {
  const { establishment, user: scanner } = await requireEstablishment();
  const admin = createAdminClient();

  const { data: reward } = await admin
    .from("loyalty_rewards")
    .select("id, user_id, benefit_description, used_at, establishment_id")
    .eq("reward_code", rewardCode)
    .maybeSingle();

  if (!reward) return { ok: false, error: "Código de prêmio não encontrado." };
  if (reward.establishment_id !== establishment.id) return { ok: false, error: "Esse prêmio é de outro estabelecimento." };
  if (reward.used_at) return { ok: false, error: "Prêmio já utilizado." };

  const { error: updateErr } = await admin
    .from("loyalty_rewards")
    .update({ used_at: new Date().toISOString(), used_by_establishment_user_id: scanner.id })
    .eq("id", reward.id);
  if (updateErr) return { ok: false, error: updateErr.message };

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", reward.user_id)
    .maybeSingle();

  await admin.from("notifications").insert({
    user_id: reward.user_id,
    type: "loyalty_reward",
    title: `Recompensa resgatada na ${establishment.name}!`,
    body: reward.benefit_description,
    link: "/app/premios",
  });

  await logActivity({ userId: scanner.id, entityType: "reward", entityId: reward.id, action: "reward_used" });

  revalidatePath("/loja/qr-scanner");
  revalidatePath("/loja/recompensas");

  return {
    ok: true,
    kind: "reward",
    user: { id: reward.user_id, name: profile?.full_name ?? null },
    benefit: reward.benefit_description,
    reward_id: reward.id,
  };
}
