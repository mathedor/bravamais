import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL } from "@/lib/format";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  return {
    title: `Vale-presente ${code}`,
    description: "Você recebeu um vale-presente pelo BRAVA+",
  };
}

interface GiftCardRow {
  code: string;
  value_cents: number;
  recipient_name: string | null;
  recipient_message: string | null;
  redeemed_at: string | null;
  status: string;
  expires_at: string | null;
  establishments: { name: string; slug: string; logo_url: string | null; cover_url: string | null; city: string | null; state: string | null } | null;
}

export default async function PresentePage({ params }: PageProps) {
  const { code } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("gift_cards")
    .select(
      "code, value_cents, recipient_name, recipient_message, redeemed_at, status, expires_at, establishments(name, slug, logo_url, cover_url, city, state)",
    )
    .eq("code", code.toUpperCase())
    .maybeSingle();

  const gift = data as unknown as GiftCardRow | null;
  if (!gift) notFound();

  const estab = gift.establishments;

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
            Vale-presente
          </p>
          <h1 className="mt-3 text-center text-3xl font-black leading-[0.95] tracking-tight">
            Você ganhou {formatBRL(gift.value_cents)}
            <br />
            em {estab?.name ?? "—"}.
          </h1>

          <div className="relative mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brava-yellow via-amber-300 to-brava-yellow-deep p-6 text-brava-black">
            <div className="pointer-events-none absolute -right-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-black" />
            <div className="pointer-events-none absolute -left-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-black" />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">{estab?.name ?? "—"}</p>
                {estab?.city && <p className="mt-1 text-xs text-brava-black/65">{estab.city}/{estab.state ?? ""}</p>}
                <p className="mt-4 text-5xl font-black">{formatBRL(gift.value_cents)}</p>
              </div>
              {estab?.logo_url && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-brava-black/10">
                  <Image src={estab.logo_url} alt="" fill sizes="64px" className="object-cover" />
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-dashed border-brava-black/20 pt-4">
              <p className="text-[11px] uppercase tracking-wider text-brava-blue">Código</p>
              <p className="mt-1 font-mono text-2xl font-black tracking-wider text-brava-black">{gift.code}</p>
            </div>

            {gift.recipient_message && (
              <p className="mt-4 rounded-2xl bg-brava-black/10 px-4 py-3 text-sm italic text-brava-black/80">
                &quot;{gift.recipient_message}&quot;
              </p>
            )}

            <p className="mt-4 text-[11px] uppercase tracking-wider text-brava-blue">
              {gift.redeemed_at ? "✓ JÁ UTILIZADO" : "VÁLIDO · APRESENTE NO BALCÃO"}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-center text-sm text-white/75">
              Apresente esse código no balcão da loja. Quem é assinante BRAVA+ acumula visita também.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={estab ? `/app/estabelecimento/${estab.slug}` : "/"}
                className="flex-1 rounded-full bg-brava-yellow py-3 text-center text-sm font-bold text-brava-black"
              >
                Ver loja
              </Link>
              <Link
                href="/cadastro"
                className="flex-1 rounded-full border border-white/15 bg-white/5 py-3 text-center text-sm font-medium text-white backdrop-blur"
              >
                Sou BRAVA+
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
