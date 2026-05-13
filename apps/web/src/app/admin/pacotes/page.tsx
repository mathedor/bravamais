import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { PackageForm } from "./form";
import { PackageRow } from "./row";

export const metadata = { title: "Pacotes sazonais — Admin" };

interface Pkg {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  theme_emoji: string | null;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  display_order: number;
}

export default async function AdminPacotesPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const { data } = await admin.from("seasonal_packages").select("*").order("display_order");
  const pkgs = (data as Pkg[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin · Editorial</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Pacotes sazonais</h1>
        <p className="mt-1 text-sm text-brava-muted">Black Friday, Dia das Mães, Festas Juninas: agrupe cupons numa campanha temática.</p>
      </header>

      <PackageForm />

      <section className="mt-8 space-y-2">
        {pkgs.map((p) => (
          <PackageRow key={p.id} pkg={p} />
        ))}
      </section>
    </div>
  );
}
