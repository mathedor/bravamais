"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLE_HOME, type UserRole } from "@/lib/supabase/types";
import { logActivity } from "@/lib/activity-log";
import { sendWelcomeEmail } from "@/lib/email";

type State = { error?: string } | undefined;

export async function signInAction(_: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Informe email e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: traduzirErro(error.message) };
  }

  const role = await fetchRole(supabase);
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logActivity({ userId: user.id, entityType: "user", entityId: user.id, action: "auth_signin" });
  }
  revalidatePath("/", "layout");
  redirect(ROLE_HOME[role] ?? "/app");
}

export async function signUpAction(_: State, formData: FormData): Promise<State> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const birthdate = String(formData.get("birthdate") || "").trim() || null;
  const rawRef = String(formData.get("referral_code") || "").trim();
  // ref de COMERCIAL (token de link OU code COM-XXXX) é tratado em paralelo
  // ao referral_code clássico (indique-e-ganhe entre amigos)
  const isCommercialRef = rawRef.toUpperCase().startsWith("COM-") || rawRef.length === 32;
  const referralCode = !isCommercialRef ? rawRef.toUpperCase() || null : null;
  const commercialRef = isCommercialRef ? rawRef : null;

  // Endereço (opcional mas recomendado — usado pra mostrar parceiros próximos)
  const cep = String(formData.get("cep") || "").replace(/\D/g, "");
  const street = String(formData.get("street") || "").trim();
  const number = String(formData.get("number") || "").trim();
  const neighborhood = String(formData.get("neighborhood") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase().slice(0, 2);

  if (!fullName || !email || !password) {
    return { error: "Preencha nome, email e senha." };
  }
  if (password.length < 8) {
    return { error: "Senha precisa ter ao menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { data: signupData, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: traduzirErro(error.message) };
  }

  // Proteção anti-enumeração do Supabase: email já existente retorna user
  // "fantasma" (identities vazio, sem erro). Sem isso o cadastro "passa" mas
  // nada é criado de verdade.
  if (signupData.user && (!signupData.user.identities || signupData.user.identities.length === 0)) {
    return { error: "Esse email já tem conta. Faça login pra continuar." };
  }

  // Auto-confirma email via admin client (não exige clicar no link)
  if (signupData.user) {
    const admin = createAdminClient();
    try {
      await admin.auth.admin.updateUserById(signupData.user.id, { email_confirm: true });
    } catch {
      /* silent */
    }

    // Salva birthdate no profile (e referral_by se houver código válido)
    let referrerId: string | null = null;
    if (referralCode) {
      const { data: referrer } = await admin
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode)
        .maybeSingle();
      if (referrer && referrer.id !== signupData.user.id) {
        referrerId = referrer.id;
      }
    }

    await admin
      .from("profiles")
      .update({
        ...(birthdate ? { birthdate } : {}),
        ...(referrerId ? { referred_by_user_id: referrerId } : {}),
        terms_accepted_at: new Date().toISOString(),
        terms_version: 1,
      })
      .eq("id", signupData.user.id);

    if (referrerId) {
      await admin.from("referrals").insert({
        referrer_user_id: referrerId,
        referred_user_id: signupData.user.id,
        status: "pending",
        bonus_coins: 50,
      });
    }

    // Vínculo COMERCIAL (canal B2B) — independente do referral entre amigos
    if (commercialRef) {
      try {
        const { resolveCommercialRef, attachSubscriberReferral } = await import("@/lib/commercial-referral");
        const resolved = await resolveCommercialRef(commercialRef);
        if (resolved) {
          await attachSubscriberReferral(
            resolved.affiliate.id,
            signupData.user.id,
            resolved.affiliate,
            resolved.linkId,
          );
        }
      } catch (e) {
        console.error("commercial ref attach failed", e);
      }
    }

    // 7 dias grátis do plano Básico (a trigger faz isso, mas garantimos aqui
    // também — defensivo caso DB tenha versão antiga da trigger ou já exista
    // subscription do user)
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 7);
    await admin
      .from("subscriptions")
      .upsert(
        {
          user_id: signupData.user.id,
          tier: "vip",
          status: "trial",
          trial_ends_at: trialEnds.toISOString(),
          current_period_end: trialEnds.toISOString(),
        },
        { onConflict: "user_id" },
      );

    // Endereço inicial (se passado) → vira default em user_addresses
    if (cep && street && number && city && state) {
      await admin.from("user_addresses").insert({
        user_id: signupData.user.id,
        label: "Casa",
        cep,
        street,
        number,
        neighborhood: neighborhood || null,
        city,
        state,
        is_default: true,
      });
    }

    // Notificação in-app sobre o trial
    await admin.from("notifications").insert({
      user_id: signupData.user.id,
      type: "subscription",
      title: "🎁 Bem-vindo ao BRAVA+!",
      body: "Você ganhou 7 dias do plano TOP — acesso a TODAS as categorias. Ao fim, escolhe as que quer manter pra calcular sua mensalidade.",
      link: "/assinar/categorias",
      metadata: { trial_days: 7, trial_top: true, trial_ends_at: trialEnds.toISOString() },
    });
  }

  // Welcome email (fire and forget)
  sendWelcomeEmail({ to: email, name: fullName }).catch(() => {});

  // Garante login imediato (caso a confirmação tenha bloqueado a session)
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) {
    await supabase.auth.signInWithPassword({ email, password });
  }

  const role = await fetchRole(supabase);
  revalidatePath("/", "layout");
  redirect(ROLE_HOME[role] ?? "/app");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

async function fetchRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<UserRole> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "subscriber";
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return ((data?.role as UserRole) ?? "subscriber");
}

function traduzirErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email ou senha inválidos.";
  if (m.includes("already registered")) return "Esse email já tem conta. Tente entrar.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos.";
  if (m.includes("email not confirmed")) return "Confirme seu email antes de entrar.";
  return msg;
}
