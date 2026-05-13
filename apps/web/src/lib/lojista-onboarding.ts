import { createAdminClient } from "@/lib/supabase/admin";

export interface OnboardingState {
  profile_complete: boolean;
  first_coupon: boolean;
  loyalty_setup: boolean;
  first_story: boolean;
  first_visit_scanned: boolean;
  completed_at: string | null;
}

export const ONBOARDING_STEPS: { key: keyof OnboardingState; label: string; description: string; href: string; emoji: string }[] = [
  { key: "profile_complete", label: "Complete o perfil da loja", description: "Logo, foto de capa e descrição", href: "/loja/perfil", emoji: "🏪" },
  { key: "first_coupon", label: "Crie seu primeiro cupom", description: "Desconto que cliente vai usar", href: "/loja/cupons", emoji: "🎟️" },
  { key: "loyalty_setup", label: "Configure clube de fidelidade", description: "X visitas = prêmio automático", href: "/loja/fidelidade", emoji: "⭐" },
  { key: "first_story", label: "Poste primeiro story", description: "'Ao vivo hoje' aparece pra clientes", href: "/loja/hoje", emoji: "📸" },
  { key: "first_visit_scanned", label: "Escaneie o primeiro QR", description: "Cliente check-in pelo balcão", href: "/loja/qr-scanner", emoji: "📷" },
];

/**
 * Recalcula o estado do onboarding olhando o que de fato existe no banco.
 * Idempotente. Roda no /loja layout pra manter o badge atualizado.
 */
export async function computeAndSaveOnboarding(estabId: string): Promise<OnboardingState> {
  const admin = createAdminClient();

  const [{ data: estab }, { count: couponsCount }, { count: loyaltyCount }, { count: storiesCount }, { count: visitsCount }] = await Promise.all([
    admin.from("establishments").select("logo_url, cover_url, description, onboarding").eq("id", estabId).maybeSingle(),
    admin.from("coupons").select("*", { count: "exact", head: true }).eq("establishment_id", estabId),
    admin.from("loyalty_clubs").select("*", { count: "exact", head: true }).eq("establishment_id", estabId).eq("is_active", true),
    admin.from("establishment_stories").select("*", { count: "exact", head: true }).eq("establishment_id", estabId),
    admin.from("visits").select("*", { count: "exact", head: true }).eq("establishment_id", estabId),
  ]);

  const profile_complete = !!(estab?.logo_url && estab?.cover_url && estab?.description && estab.description.length > 10);
  const first_coupon = (couponsCount ?? 0) > 0;
  const loyalty_setup = (loyaltyCount ?? 0) > 0;
  const first_story = (storiesCount ?? 0) > 0;
  const first_visit_scanned = (visitsCount ?? 0) > 0;

  const allDone = profile_complete && first_coupon && loyalty_setup && first_story && first_visit_scanned;
  const completed_at = allDone
    ? (estab?.onboarding?.completed_at ?? new Date().toISOString())
    : null;

  const next: OnboardingState = { profile_complete, first_coupon, loyalty_setup, first_story, first_visit_scanned, completed_at };

  // Persiste só se mudou — evita writes inúteis
  const current = (estab?.onboarding ?? {}) as Partial<OnboardingState>;
  const changed = (Object.keys(next) as (keyof OnboardingState)[]).some((k) => current[k] !== next[k]);
  if (changed) {
    await admin.from("establishments").update({ onboarding: next }).eq("id", estabId);
  }

  return next;
}

export function progressPercent(state: OnboardingState): number {
  const total = ONBOARDING_STEPS.length;
  const done = ONBOARDING_STEPS.filter((s) => state[s.key]).length;
  return Math.round((done / total) * 100);
}
