"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export async function resolveFraudSignalAction(formData: FormData): Promise<void> {
  const { profile } = await requireRole("admin");
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await admin
    .from("fraud_signals_log")
    .update({ resolved_at: new Date().toISOString(), resolved_by: profile.id, notes })
    .eq("id", id);

  revalidatePath("/admin/fraude");
}

export async function runFraudScanNowAction(): Promise<void> {
  await requireRole("admin");
  const admin = createAdminClient();
  await admin.rpc("run_fraud_scan");
  revalidatePath("/admin/fraude");
}
