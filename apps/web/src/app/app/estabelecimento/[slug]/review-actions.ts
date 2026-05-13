"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type State = { error?: string; ok?: string } | undefined;

export async function submitReviewAction(_: State, formData: FormData): Promise<State> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login pra avaliar." };

  const estabId = String(formData.get("estab_id") || "");
  const rating = parseInt(String(formData.get("rating") || "0"), 10);
  const body = String(formData.get("body") || "").trim();
  if (!estabId || !rating || rating < 1 || rating > 5) return { error: "Escolha de 1 a 5 estrelas." };

  const admin = createAdminClient();
  // Garante que tem ao menos uma visita
  const { count } = await admin
    .from("visits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("establishment_id", estabId);
  if ((count ?? 0) === 0) return { error: "Você precisa ter visitado a loja antes." };

  // Upsert: mesma combinação user+estab+visit (sem visit) reusa
  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("establishment_id", estabId)
    .is("visit_id", null)
    .maybeSingle();

  if (existing) {
    await admin.from("reviews").update({ rating, body: body || null }).eq("id", existing.id);
  } else {
    await admin.from("reviews").insert({
      user_id: user.id,
      establishment_id: estabId,
      rating,
      body: body || null,
    });
  }

  revalidatePath(`/app/estabelecimento/[slug]`, "page");
  return { ok: "Obrigado pela avaliação!" };
}
