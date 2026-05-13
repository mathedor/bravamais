import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:contato@bravamais.app";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export function pushReady(): boolean {
  return !!(VAPID_PUBLIC && VAPID_PRIVATE);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}

/**
 * Envia push pra um usuário (todas as subscriptions registradas).
 * Silencioso: nunca quebra a action principal.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!pushReady()) return 0;

  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return 0;

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      );
      await admin.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", sub.id);
      sent += 1;
    } catch (err: unknown) {
      const e = err as { statusCode?: number };
      // 410 Gone / 404 = subscription expirada — limpa
      if (e?.statusCode === 410 || e?.statusCode === 404) {
        await admin.from("push_subscriptions").delete().eq("id", sub.id);
      } else {
        console.warn("[push] failed for", sub.endpoint.slice(0, 50), err);
      }
    }
  }
  return sent;
}
