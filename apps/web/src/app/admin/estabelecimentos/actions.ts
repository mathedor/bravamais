"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: string } | undefined;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function adminCreateEstablishmentAction(_: State, formData: FormData): Promise<State> {
  const { user: admin } = await requireRole("admin");
  const name = String(formData.get("name") || "").trim();
  const ownerEmail = String(formData.get("owner_email") || "").trim();
  const ownerPassword = String(formData.get("owner_password") || "");
  const ownerName = String(formData.get("owner_name") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase();
  const categoryId = String(formData.get("category_id") || "").trim();

  if (!name || !ownerEmail || !ownerPassword || !ownerName || !city || !state) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const supabase = createAdminClient();

  // Verifica se email já existe
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers.users.find((u) => u.email === ownerEmail);

  let ownerId: string;
  if (existing) {
    ownerId = existing.id;
    await supabase.from("profiles").update({ role: "establishment", full_name: ownerName }).eq("id", ownerId);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: { full_name: ownerName },
    });
    if (error || !data.user) return { error: error?.message ?? "Falha ao criar dono." };
    ownerId = data.user.id;
    await supabase.from("profiles").update({ role: "establishment", full_name: ownerName }).eq("id", ownerId);
  }

  // Cria estabelecimento
  let slug = slugify(name);
  for (let i = 0; i < 20; i++) {
    const { data: dup } = await supabase.from("establishments").select("id").eq("slug", slug).maybeSingle();
    if (!dup) break;
    slug = `${slugify(name)}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  const { data: estab, error: estabErr } = await supabase
    .from("establishments")
    .insert({
      owner_id: ownerId,
      slug,
      name,
      city,
      state: state.slice(0, 2),
      is_active: true,
      is_verified: true,
    })
    .select("id, slug")
    .single();
  if (estabErr || !estab) return { error: estabErr?.message ?? "Falha ao criar loja." };

  if (categoryId) {
    await supabase.from("establishment_categories").insert({ establishment_id: estab.id, category_id: categoryId });
  }
  await supabase.from("establishment_promotions").insert([
    { establishment_id: estab.id, promotion_type: "cupom_desconto", is_active: true },
    { establishment_id: estab.id, promotion_type: "clube_fidelidade", is_active: true },
  ]);

  await logActivity({
    userId: admin.id,
    entityType: "establishment",
    entityId: estab.id,
    action: "establishment_created",
  });

  revalidatePath("/admin/estabelecimentos");
  redirect(`/admin/estabelecimentos/${estab.slug}`);
}

export async function adminDeleteEstablishmentAction(formData: FormData) {
  const { user: admin } = await requireRole("admin");
  const estabId = String(formData.get("estab_id") || "");
  if (!estabId) return;

  const supabase = createAdminClient();
  await supabase.from("establishments").delete().eq("id", estabId);

  await logActivity({
    userId: admin.id,
    entityType: "establishment",
    entityId: estabId,
    action: "admin_establishment_suspended",
  });

  revalidatePath("/admin/estabelecimentos");
}
