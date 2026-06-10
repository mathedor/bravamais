import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import { CheckoutPanel } from "@/components/payments/checkout-panel";
import { createSubscriptionPix, createSubscriptionCard } from "./actions";

type Tier = "basico" | "premium" | "vip";

export const metadata = { title: "Checkout" };

interface PageProps {
  params: Promise<{ tier: string }>;
}

const TIER_PRICES: Record<string, number> = { basico: 1990, premium: 3990, vip: 7990 };

export default async function CheckoutPage({ params }: PageProps) {
  const { tier } = await params;
  if (!["basico", "premium", "vip"].includes(tier)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/entrar?next=${encodeURIComponent(`/assinar/${tier}`)}`);
  }

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("name, features")
    .eq("tier", tier)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-brava-paper">
      <header className="border-b border-brava-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex">
            <Image src="/logo.svg" alt="BRAVA+" width={120} height={44} priority />
          </Link>
          <Link href="/assinar" className="text-sm text-brava-muted hover:text-brava-ink">← Mudar plano</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-4xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">Pagamento</p>
          <h1 className="mt-2 text-3xl font-black text-brava-ink md:text-4xl">
            Ativar BRAVA+ {plan?.name ?? tier}
          </h1>
          <p className="mt-2 text-brava-muted">PIX na hora ou cartão (com Apple Pay e Google Pay). Cancele quando quiser.</p>

          <div className="mt-8 rounded-3xl border border-brava-border bg-white p-6">
            <CheckoutPanel
              amountCents={TIER_PRICES[tier]}
              successUrl="/assinar/sucesso"
              createPixAction={createSubscriptionPix.bind(null, tier as Tier)}
              createCardAction={createSubscriptionCard.bind(null, tier as Tier)}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-brava-border bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-brava-muted">Total mensal</p>
            <p className="mt-1 text-4xl font-black text-brava-blue">{formatBRL(TIER_PRICES[tier])}</p>
            <p className="mt-1 text-sm text-brava-muted">Cancela quando quiser. Sem fidelidade.</p>
          </div>

          <div className="rounded-3xl border border-brava-yellow bg-brava-yellow/10 p-6">
            <p className="text-sm font-bold text-brava-blue">O que vem com o plano</p>
            <ul className="mt-3 space-y-2 text-sm text-brava-ink">
              {((plan?.features as { bullets?: string[] } | null)?.bullets ?? []).map((b: string) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-0.5 text-brava-blue">+</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
