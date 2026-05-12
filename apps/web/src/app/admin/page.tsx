import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata = { title: "Admin" };

export default async function AdminHome() {
  const { profile } = await requireRole("admin");

  return (
    <main className="flex min-h-screen flex-col bg-brava-paper">
      <header className="border-b border-brava-border bg-brava-black text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="inline-flex">
            <Image src="/logo-dark.svg" alt="BRAVA+" width={130} height={48} priority />
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brava-yellow px-3 py-1 text-xs font-bold uppercase text-brava-black">
              Admin
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <h1 className="text-4xl font-black text-brava-ink">Painel Admin</h1>
        <p className="mt-2 text-brava-muted">Olá, {profile.full_name ?? "admin"}.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Assinantes ativos", value: "—" },
            { title: "Estabelecimentos", value: "—" },
            { title: "Pedidos do mês", value: "—" },
            { title: "MRR", value: "—" },
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-brava-border bg-white p-6">
              <p className="text-sm text-brava-muted">{card.title}</p>
              <p className="mt-2 text-3xl font-black text-brava-ink">{card.value}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 rounded-3xl border border-dashed border-brava-border bg-white p-10 text-center text-brava-muted">
          BI denso com gráficos virá na próxima fase (Recharts: compras, top estabelecimentos, cupons mais usados, churn, MRR).
        </p>
      </section>
    </main>
  );
}
