import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { registerPaymentMethodDomain, stripeIsMock } from "@/lib/stripe";

/**
 * Registra o domínio pro Apple Pay / Google Pay aparecerem no Payment Element.
 * Rodar uma vez (admin) depois do deploy com o domínio final no ar:
 *   POST /api/stripe/register-domain  { "domain": "www.bravamais.com.br" }
 * Pré-requisito: /.well-known/apple-developer-merchantid-domain-association acessível.
 */
export async function POST(req: Request) {
  await requireRole(["admin"]);
  if (stripeIsMock()) return NextResponse.json({ ok: false, error: "stripe-mock" }, { status: 400 });

  const { domain } = (await req.json().catch(() => ({}))) as { domain?: string };
  const target = domain || (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!target) return NextResponse.json({ ok: false, error: "no-domain" }, { status: 400 });

  try {
    const result = await registerPaymentMethodDomain(target);
    return NextResponse.json({ ok: true, domain: target, result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
