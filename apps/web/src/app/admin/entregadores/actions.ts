"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export async function approveDelivererAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!id) return;

  const admin = createAdminClient();
  const supabase = await createClient();

  const { data: deliverer } = await supabase
    .from("deliverers")
    .select("user_id, email, full_name")
    .eq("id", id)
    .maybeSingle<{ user_id: string | null; email: string | null; full_name: string }>();

  await admin
    .from("deliverers")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: profile.id,
      rejection_reason: null,
    })
    .eq("id", id);

  if (deliverer?.user_id) {
    await admin.from("notifications").insert({
      user_id: deliverer.user_id,
      type: "system",
      title: "✅ Cadastro aprovado!",
      body: "Bem-vindo à rede BRAVA+. Já pode receber entregas.",
      link: "/entregador",
    });
  }

  revalidatePath("/admin/entregadores");
}

export async function rejectDelivererAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "Documentação inválida.").trim();
  if (!id) return;
  const admin = createAdminClient();

  const { data: deliverer } = await admin
    .from("deliverers")
    .select("user_id")
    .eq("id", id)
    .maybeSingle<{ user_id: string | null }>();

  await admin
    .from("deliverers")
    .update({ status: "rejected", rejection_reason: reason })
    .eq("id", id);

  if (deliverer?.user_id) {
    await admin.from("notifications").insert({
      user_id: deliverer.user_id,
      type: "system",
      title: "Cadastro não aprovado",
      body: reason,
      link: "/entregador/pendente",
    });
  }

  revalidatePath("/admin/entregadores");
}

export async function suspendDelivererAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") || "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("deliverers").update({ status: "suspended" }).eq("id", id);
  revalidatePath("/admin/entregadores");
}
