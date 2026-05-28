"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

const VALID_CATEGORIES = ["base", "vendas", "engajamento", "bi", "operacao", "crescimento"];

export async function upsertFeatureAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9_]{2,40}$/.test(slug)) {
    throw new Error("Slug inválido (use letras minúsculas, números e _)");
  }

  const name = String(formData.get("name") ?? "").trim();
  const short_desc = String(formData.get("short_desc") ?? "").trim();
  const sales_pitch = String(formData.get("sales_pitch") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "vendas");
  if (!VALID_CATEGORIES.includes(category)) throw new Error("category inválida");

  const monthlyReais = Number(formData.get("monthly_reais") ?? 0);
  const monthly_cents = Math.max(0, Math.round(monthlyReais * 100));
  const is_base = formData.get("is_base") === "on";
  const is_active = formData.get("is_active") !== "off";
  const depends_raw = String(formData.get("depends_on") ?? "").trim();
  const depends_on = depends_raw ? depends_raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const display_order = Number(formData.get("display_order") ?? 100);
  const pricing_note = String(formData.get("pricing_note") ?? "").trim() || null;

  if (!name || !short_desc) throw new Error("Nome e descrição curta obrigatórios");

  const { error } = await supabase.from("establishment_features").upsert({
    slug,
    name,
    short_desc,
    sales_pitch,
    category,
    monthly_cents,
    is_base,
    is_active,
    depends_on,
    display_order,
    pricing_note,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/features");
  revalidatePath("/loja/minhas-ferramentas");
}

export async function toggleFeatureAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const slug = String(formData.get("slug"));
  const currentActive = formData.get("is_active") === "true";
  await supabase.from("establishment_features").update({ is_active: !currentActive }).eq("slug", slug);
  revalidatePath("/admin/features");
}

export async function deleteFeatureAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const slug = String(formData.get("slug"));
  const { data: feat } = await supabase.from("establishment_features").select("is_base").eq("slug", slug).maybeSingle();
  if (feat?.is_base) throw new Error("Não pode deletar feature base");
  await supabase.from("establishment_features").delete().eq("slug", slug);
  revalidatePath("/admin/features");
}
