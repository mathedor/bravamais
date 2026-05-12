"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { logActivity } from "@/lib/activity-log";

type State = { error?: string; ok?: string; count?: number } | undefined;

export async function blastPromoAction(_: State, formData: FormData): Promise<State> {
  const { establishment, user } = await requireEstablishment();

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const linkSlug = establishment.slug;

  if (!title) return { error: "Coloque um título da promoção." };
  if (title.length > 100) return { error: "Título muito longo (máx 100 chars)." };

  const admin = createAdminClient();

  // Busca assinantes ativos (subscribers com subscription active/trial)
  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id")
    .in("status", ["active", "trial"]);

  if (!subs || subs.length === 0) {
    return { error: "Nenhum assinante ativo no momento." };
  }

  // Bulk insert notifications (chunks de 500)
  const rows = subs.map((s) => ({
    user_id: s.user_id,
    type: "establishment_news",
    title: `📣 ${establishment.name}: ${title}`,
    body: body || null,
    link: `/app/estabelecimento/${linkSlug}`,
  }));

  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    await admin.from("notifications").insert(rows.slice(i, i + chunkSize));
  }

  await logActivity({
    userId: user.id,
    entityType: "establishment",
    entityId: establishment.id,
    action: "story_posted", // reusing type — could add a new "promo_blasted"
  });

  revalidatePath("/loja/promocoes");
  return { ok: `Promoção enviada pra ${rows.length} assinante(s).`, count: rows.length };
}
