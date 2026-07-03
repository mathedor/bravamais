import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTrialEndingEmail, sendCampaignEmail } from "@/lib/email";

export const maxDuration = 300;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.bravamais.com.br";

/**
 * Régua de conversão do trial (welcome D0 já sai no signup):
 * - ending:     trial termina em até 2 dias  → "seu trial está acabando"
 * - ended:      trial terminou nas últimas 24h → CTA de assinatura
 * - last_offer: terminou há 3-4 dias e não converteu → última chamada (categorias a partir de R$1,90)
 * Dedupe por (user, passo) em trial_touch_log.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const out = { ending: 0, ended: 0, last_offer: 0 };

  const steps: { step: "ending" | "ended" | "last_offer"; from: string; to: string }[] = [
    { step: "ending", from: new Date(now).toISOString(), to: new Date(now + 2 * 86400000).toISOString() },
    { step: "ended", from: new Date(now - 86400000).toISOString(), to: new Date(now).toISOString() },
    { step: "last_offer", from: new Date(now - 4 * 86400000).toISOString(), to: new Date(now - 3 * 86400000).toISOString() },
  ];

  for (const { step, from, to } of steps) {
    const { data: subs } = await admin
      .from("subscriptions")
      .select("user_id, trial_ends_at, profiles(full_name)")
      .eq("status", "trial")
      .gte("trial_ends_at", from)
      .lt("trial_ends_at", to)
      .limit(200);

    for (const sub of subs ?? []) {
      // dedupe: insere o log primeiro; se já existe, pula
      const { error: dupErr } = await admin
        .from("trial_touch_log")
        .insert({ user_id: sub.user_id, step });
      if (dupErr) continue;

      const { data: userData } = await admin.auth.admin.getUserById(sub.user_id);
      const email = userData?.user?.email;
      if (!email || email.endsWith("@bravamais.app")) continue;
      const name = ((sub.profiles as unknown as { full_name: string | null } | null)?.full_name ?? "").split(" ")[0] || "você";

      if (step === "ending") {
        const daysLeft = Math.max(1, Math.ceil((new Date(sub.trial_ends_at!).getTime() - now) / 86400000));
        await sendTrialEndingEmail({ to: email, name, daysLeft });
        out.ending += 1;
      } else if (step === "ended") {
        await sendCampaignEmail({
          to: email,
          name,
          title: "Seu período grátis terminou — continue economizando 💛",
          body: "<p>Seu acesso de teste ao BRAVA+ acabou, mas os descontos continuam te esperando. Assine e siga aproveitando cupons, fidelidade e vantagens nos seus lugares favoritos.</p>",
          ctaLabel: "Assinar agora",
          ctaUrl: `${APP_URL}/assinar`,
        });
        out.ended += 1;
      } else {
        await sendCampaignEmail({
          to: email,
          name,
          title: "Última chamada: BRAVA+ a partir de R$ 1,90/mês",
          body: "<p>Sabia que dá pra assinar só as categorias que você usa? Tem categoria a partir de <b>R$ 1,90/mês</b> — menos que um café. Monte seu plano do seu jeito e volte a economizar.</p>",
          ctaLabel: "Montar meu plano",
          ctaUrl: `${APP_URL}/assinar/categorias`,
        });
        out.last_offer += 1;
      }
    }
  }

  return NextResponse.json({ ok: true, ...out });
}
