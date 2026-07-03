"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import { seedDemoData, clearDemoData } from "@/lib/demo-data";

type State = { error?: string; ok?: string; detail?: string } | undefined;

function formatCounts(counts: Record<string, number | string>): string {
  return Object.entries(counts)
    .filter(([, v]) => typeof v === "number" && v > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

export async function seedDemoAction(): Promise<State> {
  await requireRole("admin");
  try {
    const summary = await seedDemoData();
    revalidatePath("/admin/dados-demo");
    return { ok: "Base populada com dados demo.", detail: formatCounts(summary) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao popular." };
  }
}

export async function clearDemoAction(_: State, formData: FormData): Promise<State> {
  const { user } = await requireRole("admin");
  const confirm = String(formData.get("confirm") || "").trim().toUpperCase();
  if (confirm !== "LIMPAR") return { error: 'Digite LIMPAR no campo de confirmação.' };

  const keepLogins = formData.get("keep_logins") === "on";
  // trava de segurança: admin logado com conta demo não pode se auto-apagar
  if (!keepLogins && user.email?.endsWith("@bravamais.app")) {
    return { error: "Você está logado com uma conta demo — ela seria apagada junto. Entre com sua conta real ou mantenha os logins demo." };
  }
  try {
    const counts = await clearDemoData(keepLogins);
    revalidatePath("/admin/dados-demo");
    return { ok: "Dados fictícios removidos.", detail: formatCounts(counts) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao limpar." };
  }
}
