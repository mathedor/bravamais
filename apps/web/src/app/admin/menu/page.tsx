import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { ADMIN_NAV_GROUPS } from "@/components/admin/sidebar-nav";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata = { title: "Menu — Admin" };

export default async function AdminMenu() {
  const { profile } = await requireRole("admin");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">Admin</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brava-ink">
          {profile.full_name?.split(" ")[0] ?? "Admin"}
        </h1>
        <p className="mt-1 text-sm text-brava-muted">Painel completo de administração.</p>
      </header>

      <div className="space-y-6">
        {ADMIN_NAV_GROUPS.map((group) => (
          <section key={group.label}>
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brava-muted">
              {group.label}
            </p>
            <ul className="space-y-1 rounded-2xl border border-brava-border bg-brava-card p-2">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-brava-paper"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brava-paper text-xl">
                      {item.emoji}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-brava-ink">
                      {item.label}
                    </span>
                    <span className="text-brava-muted">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-8">
        <SignOutButton className="block w-full rounded-2xl border border-brava-border bg-brava-card px-4 py-3.5 text-center text-sm font-bold text-brava-ink hover:bg-brava-paper" />
      </div>

      <div className="h-8" />
    </div>
  );
}
