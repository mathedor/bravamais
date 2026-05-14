"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth-guard";

type State = { error?: string; ok?: boolean } | undefined;

export async function rateDelivererAction(_: State, formData: FormData): Promise<State> {
  const { profile } = await requireUser();
  const deliveryId = String(formData.get("delivery_id") || "");
  const stars = parseInt(String(formData.get("stars") || "0"), 10);
  const comment = String(formData.get("comment") || "").trim();

  if (!deliveryId || stars < 1 || stars > 5) {
    return { error: "Selecione entre 1 e 5 estrelas." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id, deliverer_id, orders!inner(user_id)")
    .eq("id", deliveryId)
    .maybeSingle<{ id: string; deliverer_id: string | null; orders: { user_id: string } }>();

  if (!delivery || delivery.orders.user_id !== profile.id) return { error: "Pedido não encontrado." };
  if (!delivery.deliverer_id) return { error: "Não há entregador para avaliar." };

  const { error } = await admin.from("delivery_ratings").insert({
    delivery_id: delivery.id,
    user_id: profile.id,
    deliverer_id: delivery.deliverer_id,
    stars,
    comment: comment || null,
  });

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) return { error: "Você já avaliou esta entrega." };
    return { error: error.message };
  }

  revalidatePath(`/app/pedidos/${delivery.id}`);
  return { ok: true };
}
