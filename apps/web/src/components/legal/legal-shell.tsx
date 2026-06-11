import Link from "next/link";
import Image from "next/image";
import { LandingFooter } from "@/components/landing/footer";

export function LegalShell({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string;
  subtitle?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-brava-paper">
      <header className="border-b border-brava-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex">
            <Image src="/logo.svg" alt="BRAVA+" width={120} height={44} priority />
          </Link>
          <Link href="/" className="text-sm text-brava-muted hover:text-brava-ink">
            ← Início
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-black text-brava-ink md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-base text-brava-muted">{subtitle}</p>}
        {updated && <p className="mt-2 text-sm text-brava-muted">Última atualização: {updated}.</p>}
        <article className="mt-8 space-y-6 text-sm leading-relaxed text-brava-ink">{children}</article>

        <div className="mt-12 rounded-2xl border border-brava-border bg-white p-5 text-sm text-brava-muted">
          Dúvidas? Fale com a gente:{" "}
          <a href="mailto:contato@bravamais.com.br" className="font-bold text-brava-blue hover:underline">
            contato@bravamais.com.br
          </a>
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-brava-ink">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
