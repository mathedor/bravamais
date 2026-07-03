import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM ?? "BRAVA+ <onboarding@resend.dev>";
const replyTo = process.env.EMAIL_REPLY_TO;
// Teto diário de envios (Resend free = 100/dia). Sobras vão pra fila
// email_outbox e o cron /api/cron/email-outbox drena depois.
const DAILY_CAP = parseInt(process.env.EMAIL_DAILY_CAP ?? "90", 10);

const resend = apiKey ? new Resend(apiKey) : null;

export function emailEnabled(): boolean {
  return !!resend;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

async function sentToday(): Promise<number> {
  try {
    const admin = createAdminClient();
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { count } = await admin
      .from("email_outbox")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent")
      .gte("sent_at", startOfDay.toISOString());
    return count ?? 0;
  } catch {
    return 0; // tabela ainda não existe → não bloqueia envio
  }
}

/** Entrega imediata via Resend (sem passar pela fila). */
export async function deliverNow({ to, subject, html }: SendArgs): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.log(`[email-stub] to=${to} subject="${subject}"`);
    return { ok: true };
  }
  try {
    const { error } = await resend.emails.send({ from: fromAddress, to, subject, html, replyTo });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send failed" };
  }
}

async function send({ to, subject, html }: SendArgs): Promise<void> {
  if (!resend) {
    console.log(`[email-stub] to=${to} subject="${subject}"`);
    return;
  }
  const admin = createAdminClient();
  const used = await sentToday();
  if (used >= DAILY_CAP) {
    // estourou o teto do dia → enfileira; cron drena amanhã
    try {
      await admin.from("email_outbox").insert({ to_addr: to, subject, html, status: "queued" });
      console.log(`[email-queued] cap ${DAILY_CAP} atingido — to=${to} subject="${subject}"`);
    } catch (err) {
      console.warn("[email] queue failed:", err);
    }
    return;
  }
  const result = await deliverNow({ to, subject, html });
  try {
    await admin.from("email_outbox").insert({
      to_addr: to,
      subject,
      html,
      status: result.ok ? "sent" : "queued", // falha transitória → fila re-tenta
      attempts: 1,
      error: result.error ?? null,
      sent_at: result.ok ? new Date().toISOString() : null,
    });
  } catch {
    /* log é best-effort */
  }
  if (!result.ok) console.warn("[email] send failed:", result.error);
}

/** Drena a fila respeitando o teto diário. Usado pelo cron email-outbox. */
export async function drainEmailOutbox(): Promise<{ sent: number; failed: number; remaining_cap: number }> {
  const admin = createAdminClient();
  const used = await sentToday();
  let budget = Math.max(0, DAILY_CAP - used);
  let sent = 0;
  let failed = 0;
  if (!budget) return { sent, failed, remaining_cap: 0 };

  const { data: queued } = await admin
    .from("email_outbox")
    .select("id, to_addr, subject, html, attempts")
    .eq("status", "queued")
    .lt("attempts", 5)
    .order("created_at", { ascending: true })
    .limit(budget);

  for (const item of queued ?? []) {
    const result = await deliverNow({ to: item.to_addr, subject: item.subject, html: item.html });
    if (result.ok) {
      sent += 1;
      budget -= 1;
      await admin
        .from("email_outbox")
        .update({ status: "sent", attempts: item.attempts + 1, sent_at: new Date().toISOString(), error: null })
        .eq("id", item.id);
    } else {
      failed += 1;
      await admin
        .from("email_outbox")
        .update({
          status: item.attempts + 1 >= 5 ? "failed" : "queued",
          attempts: item.attempts + 1,
          error: result.error ?? null,
        })
        .eq("id", item.id);
    }
    if (!budget) break;
  }
  return { sent, failed, remaining_cap: budget };
}

function shell(headline: string, body: string, ctaUrl?: string, ctaLabel?: string): string {
  const cta = ctaUrl
    ? `<div style="margin:32px 0"><a href="${ctaUrl}" style="display:inline-block;background:#FBBF24;color:#0A0A0A;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:800;font-size:14px">${ctaLabel ?? "Abrir"}</a></div>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0F0F11;border-radius:24px;padding:40px;border:1px solid rgba(255,255,255,0.08)">
      <tr><td>
        <div style="font-size:24px;font-weight:900;letter-spacing:-1px">
          BRAVA<span style="color:#FBBF24">+</span>
        </div>
        <h1 style="font-size:28px;line-height:1.1;margin:24px 0 12px;font-weight:900">${headline}</h1>
        <div style="font-size:15px;line-height:1.6;color:rgba(255,255,255,0.78)">${body}</div>
        ${cta}
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0 16px"/>
        <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:0">BRAVA+ · Clube de vantagens</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://brava-mais.vercel.app";

// ============================================================
// Templates
// ============================================================
export async function sendWelcomeEmail(args: { to: string; name: string }) {
  await send({
    to: args.to,
    subject: "🎁 Bem-vindo ao BRAVA+ — 7 dias grátis ativados",
    html: shell(
      `Oi, ${args.name} 👋`,
      `<p>Sua conta BRAVA+ tá no ar! Você ganhou <strong>7 dias grátis</strong> do plano Básico pra explorar tudo sem custo:</p>
       <ul style="margin:16px 0;padding-left:20px;line-height:1.8">
         <li>🎟️ Cupons de desconto nos parceiros</li>
         <li>⭐ Clube de fidelidade com benefícios automáticos</li>
         <li>💳 Carteirinha QR pra check-in nas lojas</li>
         <li>🪙 BRAVA Coins de cashback em toda compra</li>
       </ul>
       <p>Comece encontrando os parceiros perto de você.</p>`,
      `${appUrl}/app`,
      "Aproveitar agora",
    ),
  });
}

export async function sendRewardClaimedEmail(args: {
  to: string;
  name: string;
  establishmentName: string;
  benefit: string;
  code: string;
}) {
  await send({
    to: args.to,
    subject: `🎉 Recompensa BRAVA+ desbloqueada em ${args.establishmentName}`,
    html: shell(
      "Você conquistou uma recompensa!",
      `<p>Parabéns, ${args.name}! Você completou o clube de fidelidade da <strong>${args.establishmentName}</strong>.</p>
       <p style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);border-radius:16px;padding:16px;margin:16px 0">
         <strong>Seu benefício:</strong><br/>${args.benefit}
       </p>
       <p>Mostre o código <strong style="font-family:monospace;color:#FBBF24">${args.code}</strong> no balcão pra resgatar.</p>`,
      `${appUrl}/premio/${args.code}`,
      "Ver meu prêmio",
    ),
  });
}

export async function sendGiftCardEmail(args: {
  to: string;
  buyerName: string;
  recipientName: string | null;
  establishmentName: string;
  valueBRL: string;
  code: string;
}) {
  await send({
    to: args.to,
    subject: `🎁 Vale-presente BRAVA+ de ${args.valueBRL} em ${args.establishmentName}`,
    html: shell(
      "Seu vale-presente está pronto",
      `<p>${args.buyerName}, seu vale-presente de <strong>${args.valueBRL}</strong> em <strong>${args.establishmentName}</strong> foi criado${args.recipientName ? ` para <strong>${args.recipientName}</strong>` : ""}.</p>
       <p style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);border-radius:16px;padding:16px;margin:16px 0">
         Código: <strong style="font-family:monospace;color:#FBBF24">${args.code}</strong>
       </p>
       <p>Compartilhe o link abaixo via WhatsApp ou email pra quem você quer presentear:</p>`,
      `${appUrl}/presente/${args.code}`,
      "Ver e compartilhar",
    ),
  });
}

export async function sendSubscriptionGiftEmail(args: {
  to: string;
  name: string;
  tier: string;
  days: number;
}) {
  await send({
    to: args.to,
    subject: `🎁 Você ganhou ${args.days} dias de BRAVA+ ${args.tier.toUpperCase()}`,
    html: shell(
      "Você ganhou uma cortesia BRAVA+!",
      `<p>Boa notícia, ${args.name}! A equipe BRAVA+ adicionou <strong>${args.days} dias grátis</strong> de assinatura <strong>${args.tier.toUpperCase()}</strong> na sua conta.</p>
       <p>Aproveite todos os benefícios sem custo.</p>`,
      `${appUrl}/app`,
      "Abrir BRAVA+",
    ),
  });
}

export async function sendRetentionEmail(args: { to: string; name: string }) {
  await send({
    to: args.to,
    subject: `${args.name}, voltamos com novidades 👀`,
    html: shell(
      `Saudades, ${args.name}!`,
      `<p>Faz mais de 30 dias que você não dá um check-in no BRAVA+. Que tal voltar pra descobrir as novidades?</p>
       <p style="background:rgba(11,107,255,.1);border:1px solid rgba(11,107,255,.3);border-radius:16px;padding:16px;margin:16px 0">
         🎁 <strong>Bônus de retorno:</strong> +50 BRAVA Coins na sua próxima visita.
       </p>
       <p>Tem cupons fresquinhos, novos parceiros e desafios mensais.</p>`,
      `${appUrl}/app`,
      "Bora explorar",
    ),
  });
}

export async function sendTicketReplyEmail(args: { to: string; name: string; subject: string; body: string; ticketId: string }) {
  await send({
    to: args.to,
    subject: `💬 Resposta no seu ticket: ${args.subject}`,
    html: shell(
      "O suporte respondeu",
      `<p>Oi ${args.name}, recebemos uma resposta no seu ticket <strong>${args.subject}</strong>:</p>
       <p style="background:rgba(255,255,255,.05);border-left:3px solid #FBBF24;padding:12px 16px;margin:16px 0;border-radius:8px">${args.body.replace(/\n/g, "<br/>")}</p>`,
      `${appUrl}/app/suporte/${args.ticketId}`,
      "Abrir ticket",
    ),
  });
}

export async function sendWeeklyDigestEstabEmail(args: {
  to: string;
  estabName: string;
  visits: number;
  coupons: number;
  revenue: string;
  newClients: number;
  period: string;
  inspectUrl: string;
}) {
  await send({
    to: args.to,
    subject: `📊 Resumo da semana — ${args.estabName}`,
    html: shell(
      `Sua semana no BRAVA+`,
      `<p>${args.estabName}, aqui está como foi sua <strong>${args.period}</strong>:</p>
       <table cellpadding="12" cellspacing="0" style="width:100%;margin:16px 0;border-collapse:separate;border-spacing:8px">
         <tr>
           <td style="background:rgba(255,255,255,.05);border-radius:12px;text-align:center">
             <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase">Check-ins</div>
             <div style="font-size:28px;font-weight:900;color:#FBBF24">${args.visits}</div>
           </td>
           <td style="background:rgba(255,255,255,.05);border-radius:12px;text-align:center">
             <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase">Cupons</div>
             <div style="font-size:28px;font-weight:900;color:#FBBF24">${args.coupons}</div>
           </td>
         </tr>
         <tr>
           <td style="background:rgba(255,255,255,.05);border-radius:12px;text-align:center">
             <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase">Receita BRAVA+</div>
             <div style="font-size:28px;font-weight:900;color:#FBBF24">${args.revenue}</div>
           </td>
           <td style="background:rgba(255,255,255,.05);border-radius:12px;text-align:center">
             <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase">Clientes novos</div>
             <div style="font-size:28px;font-weight:900;color:#FBBF24">${args.newClients}</div>
           </td>
         </tr>
       </table>
       <p>Continue postando stories, criando cupons e cuidando dos clientes top. 💪</p>`,
      args.inspectUrl,
      "Abrir painel",
    ),
  });
}

export async function sendPasswordResetByAdminEmail(args: { to: string; name: string }) {
  await send({
    to: args.to,
    subject: "Sua senha BRAVA+ foi atualizada",
    html: shell(
      "Senha redefinida",
      `<p>${args.name}, a equipe BRAVA+ redefiniu sua senha por motivo administrativo. Use a senha que recebeu por canal seguro pra acessar.</p>
       <p>Se não foi solicitado por você, fale com a gente imediatamente.</p>`,
      `${appUrl}/entrar`,
      "Acessar",
    ),
  });
}

// ============================================================
// Templates novos (sprint admin growth)
// ============================================================

export async function sendTrialEndingEmail(args: { to: string; name: string; daysLeft: number }) {
  await send({
    to: args.to,
    subject: `Faltam ${args.daysLeft} dia(s) pro fim do seu trial BRAVA+`,
    html: shell(
      `Seu trial top tá acabando, ${args.name}`,
      `<p>Faltam apenas <strong>${args.daysLeft} dia(s)</strong> do seu trial top com acesso a TODAS as categorias.</p>
       <p>Pra continuar usando, escolha as categorias que mais vai aproveitar.</p>
       <p>Spotify das categorias: você só paga pelo que usa de verdade.</p>`,
      `${appUrl}/assinar/categorias`,
      "Escolher minhas categorias",
    ),
  });
}

export async function sendChurnRetentionEmail(args: { to: string; name: string; code: string; estabName: string }) {
  await send({
    to: args.to,
    subject: "🥺 A gente sente sua falta no BRAVA+",
    html: shell(
      `Oi, ${args.name}`,
      `<p>Faz tempo que você não passa por nenhum parceiro BRAVA+. Que tal voltar com tudo?</p>
       <p style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);border-radius:16px;padding:16px;margin:16px 0">
         <strong>20% off na ${args.estabName}</strong><br/>
         Código: <span style="font-family:monospace;color:#FBBF24;font-size:18px">${args.code}</span><br/>
         <span style="opacity:.7;font-size:12px">Válido por 14 dias</span>
       </p>
       <p>Mostre esse código no balcão.</p>`,
      `${appUrl}/app/cupons`,
      "Ver meu cupom",
    ),
  });
}

export async function sendCampaignEmail(args: { to: string; name: string; title: string; body: string; ctaLabel: string; ctaUrl: string }) {
  await send({
    to: args.to,
    subject: args.title,
    html: shell(
      args.title,
      `<p>Oi, ${args.name} 👋</p>
       <div style="font-size:15px;line-height:1.6">${args.body}</div>`,
      args.ctaUrl,
      args.ctaLabel,
    ),
  });
}

export async function sendFraudAlertEmail(args: { to: string; signalKind: string; userName: string | null; userId: string }) {
  await send({
    to: args.to,
    subject: `[ANTIFRAUDE] Novo sinal: ${args.signalKind}`,
    html: shell(
      "Sinal de antifraude registrado",
      `<p>Um padrão suspeito foi detectado:</p>
       <p style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:16px;padding:16px;margin:16px 0">
         <strong>Tipo:</strong> ${args.signalKind}<br/>
         <strong>Usuário:</strong> ${args.userName ?? "—"} (<code>${args.userId.slice(0,8)}…</code>)
       </p>
       <p>Veja o detalhe no painel admin.</p>`,
      `${appUrl}/admin/fraude`,
      "Abrir antifraude",
    ),
  });
}
