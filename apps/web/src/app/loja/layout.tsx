import Image from "next/image";
import Link from "next/link";
import { requireEstablishment } from "@/lib/establishment-guard";
import { SignOutButton } from "@/components/sign-out-button";

const NAV = [
  { href: "/loja", label: "Início", emoji: "🏠" },
  { href: "/loja/perfil", label: "Perfil", emoji: "🏷️" },
  { href: "/loja/catalogo", label: "Catálogo", emoji: "📦" },
  { href: "/loja/cupons", label: "Cupons", emoji: "🎟️" },
  { href: "/loja/fidelidade", label: "Fidelidade", emoji: "⭐" },
  { href: "/loja/qr-scanner", label: "Ler QR", emoji: "📷" },
  { href: "/loja/pedidos", label: "Pedidos", emoji: "🛒" },
  { href: "/loja/clientes", label: "Clientes", emoji: "👥" },
];

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const { establishment } = await requireEstablishment();

  return (
    <div className="flex min-h-screen flex-col bg-brava-paper md:flex-row">
      <aside className="border-r border-brava-border bg-white md:w-64 md:shrink-0">
        <div className="border-b border-brava-border px-6 py-5">
          <Link href="/loja" className="inline-flex">
            <Image src="/logo.svg" alt="BRAVA+" width={120} height={44} priority />
          </Link>
          <p className="mt-3 truncate text-xs font-bold uppercase tracking-wider text-brava-blue">
            {establishment.name}
          </p>
          <p className="text-[11px] text-brava-muted">
            {establishment.is_active ? "Loja ativa" : establishment.is_verified ? "Aguardando ativação" : "Em revisão"}
          </p>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 py-4 md:flex-col md:gap-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brava-ink hover:bg-brava-paper"
            >
              <span aria-hidden>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-brava-border px-3 py-4">
          <SignOutButton className="block w-full rounded-xl border border-brava-border bg-white px-3 py-2 text-center text-sm text-brava-ink hover:bg-brava-paper" />
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
