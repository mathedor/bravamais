import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { sendWelcomeEmail, sendChurnRetentionEmail, sendCampaignEmail, sendTrialEndingEmail, emailEnabled } from "@/lib/email";

/**
 * GET /api/admin/email-test?to=foo@bar.com&template=welcome
 *
 * Dispara um email de teste pra validar configuração do Resend.
 * Templates: welcome | churn | campaign | trial
 * Só admins.
 */
export async function GET(req: Request) {
  await requireRole("admin");

  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const template = (url.searchParams.get("template") ?? "welcome").toLowerCase();
  const name = url.searchParams.get("name") ?? "Admin Test";

  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: "Param 'to' inválido" }, { status: 400 });
  }

  try {
    switch (template) {
      case "welcome":
        await sendWelcomeEmail({ to, name });
        break;
      case "churn":
        await sendChurnRetentionEmail({
          to, name,
          code: "VOLTA-TEST123",
          estabName: "Loja Demo",
        });
        break;
      case "campaign":
        await sendCampaignEmail({
          to, name,
          title: "🌹 Teste de campanha",
          body: "<p>Esse é um corpo de campanha exemplo. Funciona?</p>",
          ctaLabel: "Abrir BRAVA+",
          ctaUrl: "https://brava-mais.vercel.app/app",
        });
        break;
      case "trial":
        await sendTrialEndingEmail({ to, name, daysLeft: 3 });
        break;
      default:
        return NextResponse.json({ ok: false, error: "Template desconhecido. Use welcome|churn|campaign|trial" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      to,
      template,
      sent: emailEnabled(),
      mode: emailEnabled() ? "real" : "stub (RESEND_API_KEY não configurado — só logou no console)",
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
