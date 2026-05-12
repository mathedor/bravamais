import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";

const NAV = [
  { href: "/admin", label: "Dashboard", emoji: "📊" },
  { href: "/admin/usuarios", label: "Usuários", emoji: "👤" },
  { href: "/admin/estabelecimentos", label: "Estabelecimentos", emoji: "🏪" },
  { href: "/admin/cupons", label: "Cupons", emoji: "🎟️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");

  return (
    <div className="flex min-h-screen flex-col bg-brava-paper md:flex-row">
      <aside className="border-r border-brava-border bg-brava-black text-white md:w-60 md:shrink-0">
        <div className="border-b border-white/10 px-6 py-5">
          <Link href="/admin" className="inline-flex">
            <Image src="/logo-dark.svg" alt="BRAVA+" width={120} height={44} priority />
          </Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-brava-yellow">Admin</p>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 py-4 md:flex-col md:gap-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              <span aria-hidden>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 px-3 py-4">
          <SignOutButton className="block w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-center text-sm text-white/80 hover:bg-white/10" />
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
