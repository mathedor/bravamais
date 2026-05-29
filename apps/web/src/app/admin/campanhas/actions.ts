"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

interface SegmentInput {
  categories?: string[];
  cities?: string[];
  tiers?: string[];
  min_visits?: number;
}

function buildSegment(formData: FormData): SegmentInput {
  const categories = String(formData.get("categories") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const cities = String(formData.get("cities") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const tiers = String(formData.get("tiers") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const minVisits = Number(formData.get("min_visits") ?? 0);
  const segment: SegmentInput = {};
  if (categories.length) segment.categories = categories;
  if (cities.length) segment.cities = cities;
  if (tiers.length) segment.tiers = tiers;
  if (minVisits > 0) segment.min_visits = minVisits;
  return segment;
}

export async function createCampaignAction(formData: FormData): Promise<void> {
  const { profile } = await requireRole("admin");
  const admin = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim() || null;
  const scheduledIso = String(formData.get("scheduled_at") ?? "").trim() || null;
  const sendEmail = formData.get("send_email") === "on";
  const sendPush = formData.get("send_push") !== "off";
  const segment = buildSegment(formData);

  if (!name || !title || !body) throw new Error("Nome, título e mensagem obrigatórios");

  await admin.from("campaigns").insert({
    name,
    title,
    body,
    link,
    segment,
    scheduled_at: scheduledIso ? new Date(scheduledIso).toISOString() : null,
    status: scheduledIso ? "scheduled" : "draft",
    send_email: sendEmail,
    send_push: sendPush,
    created_by: profile.id,
  });

  revalidatePath("/admin/campanhas");
}

export async function dispatchCampaignAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("missing_id");

  await admin.rpc("dispatch_campaign", { p_campaign_id: id });
  revalidatePath("/admin/campanhas");
}

export async function cancelCampaignAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const admin = createAdminClient();
  await admin.from("campaigns").update({ status: "cancelled" }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/campanhas");
}

export async function estimateAudienceAction(formData: FormData): Promise<{ count: number }> {
  await requireRole("admin");
  const admin = createAdminClient();
  const segment = buildSegment(formData);
  const { data } = await admin.rpc("estimate_campaign_audience", { p_segment: segment });
  return (data as { count: number } | null) ?? { count: 0 };
}
