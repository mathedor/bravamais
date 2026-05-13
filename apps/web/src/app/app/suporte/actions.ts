"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTicketReplyEmail } from "@/lib/email";
import { sendPushToUser } from "@/lib/push";

type State = { error?: string; ok?: string } | undefined;

export async function openTicketAction(_: State, formData: FormData): Promise<State> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login." };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile?.role ?? "subscriber") as "subscriber" | "establishment" | "admin" | "commercial";

  const subject = String(formData.get("subject") || "").trim();
  const category = String(formData.get("category") || "geral");
  const body = String(formData.get("body") || "").trim();
  if (!subject || !body) return { error: "Preencha assunto e mensagem." };

  const { data: ticket, error } = await admin
    .from("support_tickets")
    .insert({
      opener_user_id: user.id,
      opener_role: role,
      subject,
      category,
      status: "waiting_admin",
    })
    .select("id")
    .single();
  if (error || !ticket) return { error: error?.message ?? "Falha" };

  await admin.from("support_messages").insert({
    ticket_id: ticket.id,
    sender_user_id: user.id,
    is_admin_reply: false,
    body,
  });

  revalidatePath("/app/suporte");
  redirect(`/app/suporte/${ticket.id}`);
}

export async function replyTicketAction(_: State, formData: FormData): Promise<State> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Faça login." };

  const ticketId = String(formData.get("ticket_id") || "");
  const body = String(formData.get("body") || "").trim();
  if (!ticketId || !body) return { error: "Mensagem vazia." };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";

  const { data: ticket } = await admin.from("support_tickets").select("opener_user_id").eq("id", ticketId).maybeSingle();
  if (!ticket) return { error: "Ticket não encontrado." };
  if (!isAdmin && ticket.opener_user_id !== user.id) return { error: "Sem permissão." };

  await admin.from("support_messages").insert({
    ticket_id: ticketId,
    sender_user_id: user.id,
    is_admin_reply: isAdmin,
    body,
  });

  await admin
    .from("support_tickets")
    .update({
      status: isAdmin ? "waiting_user" : "waiting_admin",
      last_message_at: new Date().toISOString(),
      assigned_admin_user_id: isAdmin ? user.id : undefined,
    })
    .eq("id", ticketId);

  // Notifica a contraparte
  if (isAdmin) {
    await admin.from("notifications").insert({
      user_id: ticket.opener_user_id,
      type: "system",
      title: "💬 Resposta no seu ticket",
      body: body.slice(0, 80),
      link: `/app/suporte/${ticketId}`,
    });

    sendPushToUser(ticket.opener_user_id, {
      title: "💬 Resposta no seu ticket",
      body: body.slice(0, 80),
      url: `/app/suporte/${ticketId}`,
      tag: `ticket-${ticketId}`,
    }).catch(() => {});

    const [{ data: u }, { data: t2 }] = await Promise.all([
      admin.auth.admin.getUserById(ticket.opener_user_id),
      admin.from("support_tickets").select("subject").eq("id", ticketId).maybeSingle(),
    ]);
    if (u?.user?.email && t2?.subject) {
      const { data: prof } = await admin.from("profiles").select("full_name").eq("id", ticket.opener_user_id).maybeSingle();
      sendTicketReplyEmail({
        to: u.user.email,
        name: prof?.full_name?.split(" ")[0] ?? "amigo",
        subject: t2.subject,
        body,
        ticketId,
      }).catch(() => {});
    }
  }

  revalidatePath(`/app/suporte/${ticketId}`);
  if (isAdmin) revalidatePath(`/admin/suporte/${ticketId}`);
  return { ok: "Mensagem enviada." };
}

export async function closeTicketAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const ticketId = String(formData.get("ticket_id") || "");
  const admin = createAdminClient();
  await admin
    .from("support_tickets")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", ticketId);
  revalidatePath(`/app/suporte/${ticketId}`);
  revalidatePath(`/admin/suporte`);
}
