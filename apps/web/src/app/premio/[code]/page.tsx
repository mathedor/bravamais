import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  return {
    title: `Prêmio ${code}`,
    description: "Conquista do clube de fidelidade BRAVA+",
  };
}

interface RewardRow {
  reward_code: string;
  benefit_description: string;
  claimed_at: string;
  used_at: string | null;
  establishments: { name: string; slug: string; logo_url: string | null; cover_url: string | null; city: string | null; state: string | null } | null;
  profiles: { full_name: string | null } | null;
}

export default async function PremioPage({ params }: PageProps) {
  const { code } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("loyalty_rewards")
    .select(
      "reward_code, benefit_description, claimed_at, used_at, establishments(name, slug, logo_url, cover_url, city, state), profiles!loyalty_rewards_user_id_fkey(full_name)",
    )
    .eq("reward_code", code.toUpperCase())
    .maybeSingle();

  const reward = data as unknown as RewardRow | null;
  if (!reward) notFound();

  const estab = reward.establishments;

  return (
    <main className="flex min-h-screen flex-col bg-brava-black text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-brava-yellow blur-3xl" />
        <div className="absolute -bottom-48 -left-32 h-[560px] w-[560px] rounded-full bg-brava-blue-bright blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between px-6 py-6">
        <Image src="/logo-dark.svg" alt="BRAVA+" width={120} height={44} />
        <Link href="/" className="text-xs text-white/65 hover:text-white">BRAVA+</Link>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 items-center px-6 pb-12">
        <article className="w-full">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">
            🎉 Recompensa BRAVA+
          </p>
          <h1 className="mt-3 text-center text-3xl font-black leading-[0.95] tracking-tight">
            Você conquistou <span className="text-brava-yellow">{estab?.name ?? "—"}</span>.
          </h1>

          <div className="relative mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brava-blue via-brava-blue-bright to-brava-blue p-6 text-white shadow-2xl">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brava-yellow/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-brava-yellow/20 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-brava-yellow">{estab?.name ?? "—"}</p>
                {estab?.city && <p className="mt-1 text-xs text-white/65">{estab.city}/{estab.state ?? ""}</p>}
              </div>
              {estab?.logo_url && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-brava-yellow/40">
                  <Image src={estab.logo_url} alt="" fill sizes="64px" className="object-cover" />
                </div>
              )}
            </div>

            <p className="relative mt-6 text-2xl font-black leading-tight">
              {reward.benefit_description}
            </p>

            <div className="relative mt-6 border-t border-dashed border-white/15 pt-4">
              <p className="text-[11px] uppercase tracking-wider text-brava-yellow">Código de resgate</p>
              <p className="mt-1 font-mono text-xl font-black tracking-wider">{reward.reward_code}</p>
            </div>

            <p className="relative mt-4 text-[11px] uppercase tracking-wider text-brava-yellow">
              {reward.used_at ? "✓ JÁ UTILIZADO" : "VÁLIDO · APRESENTE NO BALCÃO"}
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-white/75">
            {reward.profiles?.full_name ? `Conquistado por ${reward.profiles.full_name}.` : ""} Apresente esse código pra resgatar o benefício.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={estab ? `/app/estabelecimento/${estab.slug}` : "/"}
              className="flex-1 rounded-full bg-brava-yellow py-3 text-center text-sm font-bold text-brava-black"
            >
              Ver loja
            </Link>
            <Link
              href="/app/fidelidade"
              className="flex-1 rounded-full border border-white/15 bg-white/5 py-3 text-center text-sm font-medium text-white backdrop-blur"
            >
              Meus clubes
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
