import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resolve um código de ref (token de link OU código permanente do comercial)
 * e retorna o affiliate + se veio de link específico (pra incrementar counter).
 */
export async function resolveCommercialRef(ref: string | null | undefined) {
  if (!ref) return null;
  const admin = createAdminClient();

  // 1) Tenta token de link
  const { data: link } = await admin
    .from("commercial_invite_links")
    .select("id, kind, affiliate_id, expires_at")
    .eq("token", ref)
    .maybeSingle();

  if (link && (!link.expires_at || new Date(link.expires_at) > new Date())) {
    const { data: aff } = await admin
      .from("commercial_affiliates")
      .select("*")
      .eq("id", link.affiliate_id)
      .eq("is_active", true)
      .maybeSingle();
    if (aff) return { affiliate: aff, linkId: link.id, linkKind: link.kind };
  }

  // 2) Tenta código permanente (COM-XXXX)
  const { data: aff } = await admin
    .from("commercial_affiliates")
    .select("*")
    .eq("code", ref.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();
  if (aff) return { affiliate: aff, linkId: null, linkKind: null };

  return null;
}

/**
 * Cria affiliate_referral pra estabelecimento + atualiza counters do link.
 */
export async function attachEstablishmentReferral(
  affiliateId: string,
  establishmentId: string,
  establishmentCommissionMonths: number,
  establishmentCommissionValue: number,
  linkId?: string | null,
) {
  const admin = createAdminClient();
  const until = new Date();
  until.setMonth(until.getMonth() + (establishmentCommissionMonths ?? 12));

  await admin.from("affiliate_referrals").insert({
    affiliate_id: affiliateId,
    establishment_id: establishmentId,
    commission_rate: establishmentCommissionValue,
    commission_until: until.toISOString(),
  });

  if (linkId) {
    await admin.rpc("increment_link_signups", { p_link_id: linkId }).then(
      () => null,
      async () => {
        const { data: l } = await admin
          .from("commercial_invite_links")
          .select("signups")
          .eq("id", linkId)
          .maybeSingle();
        await admin
          .from("commercial_invite_links")
          .update({
            signups: (l?.signups ?? 0) + 1,
            last_signup_at: new Date().toISOString(),
          })
          .eq("id", linkId);
      },
    );
  }
}

/**
 * Cria subscriber_referral + atualiza counter do link.
 */
export async function attachSubscriberReferral(
  affiliateId: string,
  userId: string,
  affiliate: any,
  linkId?: string | null,
) {
  const admin = createAdminClient();
  const until = new Date();
  until.setMonth(until.getMonth() + (affiliate.subscriber_commission_months ?? 6));

  await admin.from("subscriber_referrals").insert({
    affiliate_id: affiliateId,
    user_id: userId,
    commission_kind: affiliate.subscriber_commission_kind,
    commission_basic_value: affiliate.subscriber_commission_basic_value,
    commission_premium_value: affiliate.subscriber_commission_premium_value,
    commission_vip_value: affiliate.subscriber_commission_vip_value,
    commission_until: until.toISOString(),
  });

  if (linkId) {
    const { data: l } = await admin
      .from("commercial_invite_links")
      .select("signups")
      .eq("id", linkId)
      .maybeSingle();
    await admin
      .from("commercial_invite_links")
      .update({
        signups: (l?.signups ?? 0) + 1,
        last_signup_at: new Date().toISOString(),
      })
      .eq("id", linkId);
  }
}
