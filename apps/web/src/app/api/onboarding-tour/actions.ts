"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TourRole = "usuario" | "lojista" | "entregador" | "admin" | "comercial";

const VALID: TourRole[] = ["usuario", "lojista", "entregador", "admin", "comercial"];

export async function markTourCompletedAction(role: TourRole) {
  if (!VALID.includes(role)) return { ok: false };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: cur } = await supabase
    .from("profiles")
    .select("tutorials_completed")
    .eq("id", user.id)
    .maybeSingle();

  const next = {
    ...(cur?.tutorials_completed ?? {}),
    [role]: new Date().toISOString(),
  };
  await supabase.from("profiles").update({ tutorials_completed: next }).eq("id", user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function resetTourAction(role: TourRole) {
  if (!VALID.includes(role)) return { ok: false };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: cur } = await supabase
    .from("profiles")
    .select("tutorials_completed")
    .eq("id", user.id)
    .maybeSingle();

  const map = { ...(cur?.tutorials_completed ?? {}) };
  delete map[role];
  await supabase.from("profiles").update({ tutorials_completed: map }).eq("id", user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}
