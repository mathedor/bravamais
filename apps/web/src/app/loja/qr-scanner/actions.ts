"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { logActivity } from "@/lib/activity-log";

export type ScanResult =
  | { ok: true; user: { id: string; name: string | null }; visit_id: string; loyalty?: { current: number; required: number; just_completed: boolean } }
  | { ok: false; error: string };

export async function markVisitAction(code: string): Promise<ScanResult> {
  const cleaned = code.replace(/^BRAVAMAIS:/i, "").trim().toUpperCase();
  if (!cleaned) return { ok: false, error: "Código vazio." };

  const { establishment, user: scanner } = await requireEstablishment();

  // service-role pra olhar QR sem RLS bloquear
  const admin = createAdminClient();

  const { data: qr } = await admin
    .from("qr_cards")
    .select("user_id")
    .eq("code", cleaned)
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
  if (visitErr || !visit) {
    return { ok: false, error: visitErr?.message ?? "Erro ao registrar visita." };
  }

  await logActivity({
    userId: scanner.id,
    entityType: "establishment",
    entityId: establishment.id,
    action: "visit_registered",
  });

  // Loyalty progress
  let loyaltyInfo: { current: number; required: number; just_completed: boolean } | undefined;
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
    const justCompleted = !progress?.visits_count ? newCount >= club.visits_required : (progress.visits_count < club.visits_required && newCount >= club.visits_required);

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

    loyaltyInfo = {
      current: newCount,
      required: club.visits_required,
      just_completed: justCompleted,
    };
  }

  revalidatePath("/loja/qr-scanner");
  revalidatePath("/loja");

  return {
    ok: true,
    user: { id: qr.user_id, name: profile?.full_name ?? null },
    visit_id: visit.id,
    loyalty: loyaltyInfo,
  };
}
