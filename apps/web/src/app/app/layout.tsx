import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole(["subscriber", "admin"]);

  return (
    <main className="flex min-h-screen flex-col bg-brava-paper">
      <header className="border-b border-brava-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/app" className="inline-flex">
            <Image src="/logo.svg" alt="BRAVA+" width={130} height={48} priority />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/app/carteirinha" className="hidden rounded-full bg-brava-yellow px-4 py-2 text-sm font-bold text-brava-black sm:inline-flex">
              Carteirinha
            </Link>
            <span className="hidden text-sm text-brava-muted md:inline">
              Olá, {primeiroNome(profile.full_name)}
            </span>
            <SignOutButton className="rounded-full border border-brava-border bg-white px-4 py-2 text-sm text-brava-ink hover:bg-brava-paper" />
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}

function primeiroNome(nome: string | null): string {
  if (!nome) return "amigo";
  return nome.split(" ")[0];
}
