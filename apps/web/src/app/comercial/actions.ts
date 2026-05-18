"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCommercial } from "@/lib/commercial-guard";
import { attachEstablishmentReferral, attachSubscriberReferral } from "@/lib/commercial-referral";

type State = { error?: string; ok?: boolean; redirect?: string } | undefined;

// Wrappers de FormData-only pra uso direto em <form action={...}>
export async function createProspectFormAction(fd: FormData) { await createProspectAction(undefined, fd); }
export async function updateProspectFormAction(fd: FormData) { await updateProspectAction(undefined, fd); }
export async function createInviteLinkFormAction(fd: FormData) { await createInviteLinkAction(undefined, fd); }
export async function commercialCreateEstabFormAction(fd: FormData) { await commercialCreateEstablishmentAction(undefined, fd); }
export async function commercialCreateSubFormAction(fd: FormData) { await commercialCreateSubscriberAction(undefined, fd); }

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/* ============================================================
   PROSPECTS — CRM kanban
   ============================================================ */
export async function createProspectAction(_: State, formData: FormData): Promise<State> {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();

  const kind = (String(formData.get("kind") || "establishment")) as "establishment" | "subscriber";
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Nome obrigatório." };

  const lat = formData.get("lat") ? parseFloat(String(formData.get("lat"))) : null;
  const lng = formData.get("lng") ? parseFloat(String(formData.get("lng"))) : null;

  const { error } = await supabase.from("commercial_prospects").insert({
    affiliate_id: affiliate.id,
    kind,
    name,
    status: "novo",
    source: (String(formData.get("source") || "manual")) as "gmaps" | "manual" | "imported",
    cnpj: String(formData.get("cnpj") || "").trim() || null,
    category_slug: String(formData.get("category_slug") || "").trim() || null,
    address: String(formData.get("address") || "").trim() || null,
    city: String(formData.get("city") || "").trim() || null,
    uf: String(formData.get("uf") || "").trim().toUpperCase().slice(0, 2) || null,
    phone: String(formData.get("phone") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    contact_name: String(formData.get("contact_name") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    next_action_label: String(formData.get("next_action_label") || "").trim() || null,
    next_action_at: formData.get("next_action_at") ? new Date(String(formData.get("next_action_at"))).toISOString() : null,
    estimated_value_cents: formData.get("estimated_value_cents")
      ? Math.floor(parseFloat(String(formData.get("estimated_value_cents")).replace(",", ".")) * 100)
      : null,
    lat, lng,
    gmaps_place_id: String(formData.get("gmaps_place_id") || "").trim() || null,
    gmaps_rating: formData.get("gmaps_rating") ? parseFloat(String(formData.get("gmaps_rating"))) : null,
  });

  if (error) return { error: error.message };
  revalidatePath("/comercial/crm");
  revalidatePath("/comercial/prospects");
  return { ok: true };
}

export async function updateProspectStatusAction(prospectId: string, newStatus: string) {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();
  await supabase.from("commercial_prospects")
    .update({ status: newStatus as any })
    .eq("id", prospectId)
    .eq("affiliate_id", affiliate.id);
  revalidatePath("/comercial/crm");
}

export async function updateProspectAction(_: State, formData: FormData): Promise<State> {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return { error: "ID obrigatório." };

  const updates: Record<string, unknown> = {
    name: String(formData.get("name") || "").trim() || undefined,
    notes: String(formData.get("notes") || "").trim() || null,
    next_action_label: String(formData.get("next_action_label") || "").trim() || null,
    next_action_at: formData.get("next_action_at") ? new Date(String(formData.get("next_action_at"))).toISOString() : null,
    phone: String(formData.get("phone") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    contact_name: String(formData.get("contact_name") || "").trim() || null,
    estimated_value_cents: formData.get("estimated_value_cents")
      ? Math.floor(parseFloat(String(formData.get("estimated_value_cents")).replace(",", ".")) * 100)
      : null,
  };
  if (formData.get("status")) updates.status = String(formData.get("status"));

  const { error } = await supabase.from("commercial_prospects")
    .update(updates).eq("id", id).eq("affiliate_id", affiliate.id);
  if (error) return { error: error.message };
  revalidatePath("/comercial/crm");
  return { ok: true };
}

export async function deleteProspectAction(id: string) {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();
  await supabase.from("commercial_prospects").delete().eq("id", id).eq("affiliate_id", affiliate.id);
  revalidatePath("/comercial/crm");
}

/* ============================================================
   LINKS DE CADASTRO
   ============================================================ */
export async function createInviteLinkAction(_: State, formData: FormData): Promise<State> {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();
  const kind = (String(formData.get("kind") || "establishment")) as "establishment" | "subscriber";
  const label = String(formData.get("label") || "").trim();
  const prospectId = String(formData.get("prospect_id") || "").trim() || null;
  const expiresInDays = parseInt(String(formData.get("expires_in_days") || "30"), 10);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

  const { error } = await supabase.from("commercial_invite_links").insert({
    affiliate_id: affiliate.id,
    kind,
    label: label || null,
    prospect_id: prospectId,
    expires_at: expiresAt.toISOString(),
  });
  if (error) return { error: error.message };
  revalidatePath("/comercial/links");
  return { ok: true };
}

export async function deleteInviteLinkAction(id: string) {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();
  await supabase.from("commercial_invite_links").delete().eq("id", id).eq("affiliate_id", affiliate.id);
  revalidatePath("/comercial/links");
}

/* ============================================================
   CADASTRO ASSISTIDO — comercial cadastra direto pro prospect
   ============================================================ */
export async function commercialCreateEstablishmentAction(_: State, formData: FormData): Promise<State> {
  const { affiliate } = await requireCommercial();

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || `Brava@${Math.floor(Math.random() * 9000 + 1000)}`);
  const estabName = String(formData.get("estab_name") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase();
  const phone = String(formData.get("phone") || "").trim();
  const categoryId = String(formData.get("category_id") || "").trim();
  const prospectId = String(formData.get("prospect_id") || "").trim();

  if (!fullName || !email || !estabName || !city || !state) {
    return { error: "Preencha nome do dono, email, nome da loja, cidade e estado." };
  }

  const admin = createAdminClient();

  // Cria user
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: fullName },
  });
  if (cErr) return { error: `Erro criando usuário: ${cErr.message}` };
  const userId = created.user.id;

  // Promove role
  await admin.from("profiles").update({
    role: "establishment", full_name: fullName, phone: phone || null,
  }).eq("id", userId);

  // Slug único
  const baseSlug = slugify(estabName);
  let slug = baseSlug;
  for (let i = 0; i < 20; i++) {
    const { data: e } = await admin.from("establishments").select("id").eq("slug", slug).maybeSingle();
    if (!e) break;
    slug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  // Cria estab
  const { data: estab, error: eErr } = await admin.from("establishments").insert({
    owner_id: userId, slug, name: estabName,
    phone: phone || null, city, state: state.slice(0, 2),
    is_active: false, is_verified: false,
  }).select("id").single();
  if (eErr || !estab) return { error: `Erro criando estab: ${eErr?.message}` };

  if (categoryId) {
    await admin.from("establishment_categories").insert({
      establishment_id: estab.id, category_id: categoryId,
    });
  }
  await admin.from("establishment_promotions").insert([
    { establishment_id: estab.id, promotion_type: "cupom_desconto", is_active: true },
    { establishment_id: estab.id, promotion_type: "clube_fidelidade", is_active: true },
  ]);

  // Cria referral (vincula ao comercial)
  await attachEstablishmentReferral(
    affiliate.id, estab.id,
    affiliate.establishment_commission_months,
    affiliate.establishment_commission_value,
  );

  // Marca prospect como fechado
  if (prospectId) {
    await admin.from("commercial_prospects").update({
      status: "fechado",
      converted_establishment_id: estab.id,
      converted_at: new Date().toISOString(),
    }).eq("id", prospectId).eq("affiliate_id", affiliate.id);
  }

  revalidatePath("/comercial", "layout");
  redirect("/comercial/cadastros?ok=estab");
}

export async function commercialCreateSubscriberAction(_: State, formData: FormData): Promise<State> {
  const { affiliate } = await requireCommercial();

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || `Brava@${Math.floor(Math.random() * 9000 + 1000)}`);
  const phone = String(formData.get("phone") || "").trim();
  const tier = (String(formData.get("tier") || "basico")) as "basico" | "premium" | "vip";
  const prospectId = String(formData.get("prospect_id") || "").trim();

  if (!fullName || !email) return { error: "Preencha nome e email." };

  const admin = createAdminClient();
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: fullName },
  });
  if (cErr) return { error: `Erro criando usuário: ${cErr.message}` };
  const userId = created.user.id;

  await admin.from("profiles").update({
    role: "subscriber", full_name: fullName, phone: phone || null,
  }).eq("id", userId);

  // Cria assinatura com trial 7 dias (sem cobrança ainda — vai cobrar quando trial acabar)
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  await admin.from("subscriptions").upsert({
    user_id: userId,
    tier,
    status: "trialing",
    trial_ends_at: trialEnd.toISOString(),
  }, { onConflict: "user_id" });

  // Vincula ao comercial
  await attachSubscriberReferral(affiliate.id, userId, affiliate);

  if (prospectId) {
    await admin.from("commercial_prospects").update({
      status: "fechado",
      converted_user_id: userId,
      converted_at: new Date().toISOString(),
    }).eq("id", prospectId).eq("affiliate_id", affiliate.id);
  }

  revalidatePath("/comercial", "layout");
  redirect("/comercial/cadastros?ok=sub");
}
