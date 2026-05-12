import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata = { title: "Painel do estabelecimento" };

export default async function LojaHome() {
  const { profile } = await requireRole(["establishment", "admin"]);

  return (
    <main className="flex min-h-screen flex-col bg-brava-paper">
      <header className="border-b border-brava-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/loja" className="inline-flex">
            <Image src="/logo.svg" alt="BRAVA+" width={130} height={48} priority />
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brava-blue px-3 py-1 text-xs font-bold uppercase text-white">
              Estabelecimento
            </span>
            <SignOutButton className="rounded-full border border-brava-border bg-white px-4 py-2 text-sm text-brava-ink hover:bg-brava-paper" />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <h1 className="text-4xl font-black text-brava-ink">Painel da Loja</h1>
        <p className="mt-2 text-brava-muted">Olá, {profile.full_name ?? "lojista"}.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            "Cadastro do estabelecimento",
            "Catálogo de produtos",
            "Cupons e promoções",
            "Clube de fidelidade",
            "Validar QR (câmera)",
            "Pedidos",
          ].map((titulo) => (
            <div key={titulo} className="rounded-3xl border border-dashed border-brava-border bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brava-yellow text-brava-blue">
                <span className="text-xl font-black">+</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-brava-ink">{titulo}</h3>
              <p className="mt-1 text-sm text-brava-muted">Em construção</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
