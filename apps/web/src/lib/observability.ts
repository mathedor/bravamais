/**
 * Observabilidade: Sentry (errors) + PostHog (product analytics).
 * Configuração via env vars — sem keys, vira no-op.
 *
 *   SENTRY_DSN=
 *   NEXT_PUBLIC_POSTHOG_KEY=
 *   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com (default)
 */

export const SENTRY_DSN = process.env.SENTRY_DSN ?? "";
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function observabilityReady(): { sentry: boolean; posthog: boolean } {
  return { sentry: !!SENTRY_DSN, posthog: !!POSTHOG_KEY };
}

/**
 * Captura erro no Sentry (no-op se DSN não estiver configurado).
 * Stub leve: quando ativarmos Sentry, instalar @sentry/nextjs e substituir.
 */
export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) return;
  console.error("[sentry-stub]", err, context);
}

/**
 * Event tracking (PostHog) — fire and forget HTTP POST.
 * Sem PostHog instalado pra evitar dep extra; o capture vai direto pra /capture/.
 */
export async function trackEvent(args: {
  userId?: string;
  event: string;
  properties?: Record<string, unknown>;
}): Promise<void> {
  if (!POSTHOG_KEY) return;
  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event: args.event,
        distinct_id: args.userId ?? "anonymous",
        properties: args.properties ?? {},
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    /* silent */
  }
}
