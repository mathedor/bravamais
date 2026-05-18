"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type State = { error?: string; ok?: boolean } | undefined;

function makeCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "COM-";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (p?.role !== "admin") redirect("/");
  return supabase;
}

export async function createCommercialAction(_: State, formData: FormData): Promise<State> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "Brava@2026!");
  const phone = String(formData.get("phone") || "").trim();
  const territory = String(formData.get("territory") || "").trim();
  const pixKey = String(formData.get("pix_key") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  const estabKind = (String(formData.get("establishment_commission_kind") || "percent")) as "fixed" | "percent";
  const estabValueRaw = String(formData.get("establishment_commission_value") || "20");
  const estabMonths = parseInt(String(formData.get("establishment_commission_months") || "12"), 10);

  const subKind = (String(formData.get("subscriber_commission_kind") || "percent")) as "fixed" | "percent";
  const subBasicRaw = String(formData.get("subscriber_commission_basic_value") || "30");
  const subPremiumRaw = String(formData.get("subscriber_commission_premium_value") || "20");
  const subVipRaw = String(formData.get("subscriber_commission_vip_value") || "15");
  const subMonths = parseInt(String(formData.get("subscriber_commission_months") || "6"), 10);

  if (!name || !email) return { error: "Preencha nome e email." };
  if (password.length < 8) return { error: "Senha precisa ter ao menos 8 caracteres." };

  // % vem no form como número direto (20 = 20%); converte pra fração
  const parseValue = (raw: string, kind: "fixed" | "percent"): number => {
    const n = parseFloat(raw.replace(",", "."));
    if (isNaN(n)) return 0;
    return kind === "percent" ? n / 100 : n;
  };

  const admin = createAdminClient();

  // 1) Cria user (auth) — se já existe, busca o id
  let userId: string | null = null;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (createErr) {
    const msg = createErr.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      // pega existente
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) return { error: "Email já existe mas não foi possível recuperar usuário." };
      userId = found.id;
    } else {
      return { error: `Erro criando usuário: ${createErr.message}` };
    }
  } else {
    userId = created.user.id;
  }

  // 2) Atualiza profile pra role=commercial
  await admin.from("profiles").update({
    role: "commercial",
    full_name: name,
    phone: phone || null,
  }).eq("id", userId);

  // 3) Gera código único
  let code = makeCode();
  for (let i = 0; i < 10; i++) {
    const { data: c } = await admin.from("commercial_affiliates").select("id").eq("code", code).maybeSingle();
    if (!c) break;
    code = makeCode();
  }

  // 4) Cria commercial_affiliates
  const { error: insertErr } = await admin.from("commercial_affiliates").insert({
    user_id: userId,
    name,
    email,
    phone: phone || null,
    code,
    pix_key: pixKey || null,
    territory: territory || null,
    notes: notes || null,
    is_active: true,
    onboarded_at: new Date().toISOString(),
    establishment_commission_kind: estabKind,
    establishment_commission_value: parseValue(estabValueRaw, estabKind),
    establishment_commission_months: estabMonths || 12,
    subscriber_commission_kind: subKind,
    subscriber_commission_basic_value: parseValue(subBasicRaw, subKind),
    subscriber_commission_premium_value: parseValue(subPremiumRaw, subKind),
    subscriber_commission_vip_value: parseValue(subVipRaw, subKind),
    subscriber_commission_months: subMonths || 6,
    // legacy compat
    commission_rate: estabKind === "percent" ? parseValue(estabValueRaw, estabKind) : 0.2,
    duration_months: estabMonths || 12,
  });
  if (insertErr) return { error: `Erro criando comercial: ${insertErr.message}` };

  revalidatePath("/admin/comerciais", "layout");
  redirect("/admin/comerciais");
}

export async function updateCommercialAction(_: State, formData: FormData): Promise<State> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) return { error: "ID obrigatório." };

  const estabKind = (String(formData.get("establishment_commission_kind") || "percent")) as "fixed" | "percent";
  const subKind = (String(formData.get("subscriber_commission_kind") || "percent")) as "fixed" | "percent";
  const parseValue = (raw: string, kind: "fixed" | "percent"): number => {
    const n = parseFloat(String(raw).replace(",", "."));
    if (isNaN(n)) return 0;
    return kind === "percent" ? n / 100 : n;
  };

  const admin = createAdminClient();
  const updates: Record<string, unknown> = {
    name: String(formData.get("name") || "").trim() || undefined,
    phone: String(formData.get("phone") || "").trim() || null,
    territory: String(formData.get("territory") || "").trim() || null,
    pix_key: String(formData.get("pix_key") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    is_active: formData.get("is_active") === "on",
    establishment_commission_kind: estabKind,
    establishment_commission_value: parseValue(String(formData.get("establishment_commission_value") || "20"), estabKind),
    establishment_commission_months: parseInt(String(formData.get("establishment_commission_months") || "12"), 10) || 12,
    subscriber_commission_kind: subKind,
    subscriber_commission_basic_value: parseValue(String(formData.get("subscriber_commission_basic_value") || "30"), subKind),
    subscriber_commission_premium_value: parseValue(String(formData.get("subscriber_commission_premium_value") || "20"), subKind),
    subscriber_commission_vip_value: parseValue(String(formData.get("subscriber_commission_vip_value") || "15"), subKind),
    subscriber_commission_months: parseInt(String(formData.get("subscriber_commission_months") || "6"), 10) || 6,
  };

  const { error } = await admin.from("commercial_affiliates").update(updates).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/comerciais/${id}`);
  revalidatePath("/admin/comerciais");
  return { ok: true };
}

export async function deactivateCommercialAction(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("commercial_affiliates").update({ is_active: false }).eq("id", id);
  revalidatePath("/admin/comerciais", "layout");
}

export async function activateCommercialAction(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("commercial_affiliates").update({ is_active: true }).eq("id", id);
  revalidatePath("/admin/comerciais", "layout");
}
