import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Pacotes sazonais" };

interface SeasonalPkg {
  slug: string;
  title: string;
  subtitle: string | null;
  theme_emoji: string | null;
  theme_color: string | null;
  ends_at: string;
}

export default async function PacotesPage() {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: pkgsRaw } = await supabase
    .from("seasonal_packages")
    .select("slug, title, subtitle, theme_emoji, theme_color, ends_at")
    .eq("is_active", true)
    .gt("ends_at", new Date().toISOString())
    .order("display_order");
  const packages = (pkgsRaw as SeasonalPkg[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Por tempo limitado</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brava-ink">Pacotes sazonais</h1>
        <p className="mt-2 text-sm text-brava-muted">
          Coleções de cupons agrupadas por data e ocasião — Natal, Dia das Mães, festas juninas e mais. Aproveite antes
          de acabar.
        </p>
      </header>

      {packages.length === 0 ? (
        <div className="rounded-3xl border border-brava-border bg-brava-card p-10 text-center">
          <p className="text-4xl">🎀</p>
          <p className="mt-3 font-bold text-brava-ink">Nenhum pacote ativo no momento</p>
          <p className="mt-1 text-sm text-brava-muted">
            Os pacotes sazonais aparecem por aqui perto das datas comemorativas. Volte em breve!
          </p>
          <Link
            href="/app/cupons"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brava-yellow px-4 py-2 text-sm font-bold text-brava-black transition hover:brightness-105"
          >
            🎟️ Ver cupons disponíveis
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => {
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(p.ends_at).getTime() - Date.now()) / 86400000),
            );
            return (
              <Link
                key={p.slug}
                href={`/app/pacote/${p.slug}`}
                className="group relative overflow-hidden rounded-3xl p-5 text-brava-black shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, ${p.theme_color ?? "#FFD400"}, #ffffff)` }}
              >
                <p className="text-3xl">{p.theme_emoji ?? "🎉"}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-brava-blue">Pacote especial</p>
                <p className="mt-0.5 text-lg font-black leading-tight">{p.title}</p>
                {p.subtitle && <p className="mt-1 text-xs">{p.subtitle}</p>}
                <p className="mt-2 text-[11px] font-bold">
                  ⏰ {daysLeft > 0 ? `${daysLeft} dia${daysLeft === 1 ? "" : "s"} restantes` : "Último dia!"}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
