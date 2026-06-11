import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Assinar BRAVA+" };

interface Plan {
  tier: "basico" | "premium" | "vip";
  name: string;
  monthly_cents: number;
  features: { bullets?: string[] };
}

export default async function AssinarPage() {
  const supabase = await createClient();
  const { data: plansRaw } = await supabase
    .from("subscription_plans")
    .select("tier, name, monthly_cents, features, display_order")
    .eq("is_active", true)
    .order("display_order");
  const plans = (plansRaw as Plan[] | null) ?? [];

  return (
    <main className="min-h-screen bg-brava-paper">
      <header className="border-b border-brava-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex">
            <Image src="/logo.svg" alt="BRAVA+" width={120} height={44} priority />
          </Link>
          <Link href="/" className="text-sm text-brava-muted hover:text-brava-ink">← Voltar</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-center text-4xl font-black text-brava-ink md:text-5xl">
          Escolha seu plano BRAVA+
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-brava-muted">
          7 dias grátis. Cancela quando quiser. Pagamento via PIX, cartão, Apple Pay ou Google Pay.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const isPremium = p.tier === "premium";
            return (
              <article
                key={p.tier}
                className={`relative rounded-3xl border p-8 ${
                  isPremium ? "border-brava-yellow bg-brava-black text-white shadow-2xl" : "border-brava-border bg-white text-brava-ink"
                }`}
              >
                {isPremium && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brava-yellow px-3 py-1 text-xs font-bold text-brava-black">
                    Mais popular
                  </span>
                )}
                <h3 className="text-2xl font-black">{p.name}</h3>
                <p className={`mt-4 text-4xl font-black ${isPremium ? "text-brava-yellow" : "text-brava-blue"}`}>
                  {formatBRL(p.monthly_cents)}
                  <span className={`text-base font-medium ${isPremium ? "text-white/60" : "text-brava-muted"}`}>/mês</span>
                </p>
                <ul className={`mt-6 space-y-2 text-sm ${isPremium ? "text-white/85" : "text-brava-muted"}`}>
                  {(p.features.bullets ?? []).map((b: string) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className={`mt-0.5 ${isPremium ? "text-brava-yellow" : "text-brava-blue"}`}>+</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/assinar/${p.tier}`}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold ${
                    isPremium ? "bg-brava-yellow text-brava-black" : "bg-brava-blue text-white"
                  }`}
                >
                  Escolher {p.name}
                </Link>
              </article>
            );
          })}
        </div>

        <p className="mt-10 rounded-2xl bg-emerald-50 px-5 py-3 text-center text-sm text-emerald-900">
          🔒 Pagamento seguro. Renova automaticamente todo mês — cancele quando quiser, sem multa.
        </p>
      </section>
    </main>
  );
}
