import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata = { title: "Comercial" };

export default async function ComercialHome() {
  const { profile } = await requireRole(["commercial", "admin"]);

  return (
    <main className="flex min-h-screen flex-col bg-brava-paper">
      <header className="border-b border-brava-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/comercial" className="inline-flex">
            <Image src="/logo.svg" alt="BRAVA+" width={130} height={48} priority />
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brava-blue-bright px-3 py-1 text-xs font-bold uppercase text-white">
              Comercial
            </span>
            <SignOutButton className="rounded-full border border-brava-border bg-white px-4 py-2 text-sm text-brava-ink hover:bg-brava-paper" />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <h1 className="text-4xl font-black text-brava-ink">Painel Comercial</h1>
        <p className="mt-2 text-brava-muted">Olá, {profile.full_name ?? "comercial"}.</p>

        <p className="mt-10 rounded-3xl border border-dashed border-brava-border bg-white p-10 text-center text-brava-muted">
          Em construção. Aqui você vai captar novos estabelecimentos, acompanhar comissões e ver seu funil.
        </p>
      </section>
    </main>
  );
}
