import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Perfil" };

const TIER_PRICE: Record<string, number> = { basico: 1990, premium: 3990, vip: 7990 };

export default async function PerfilPage() {
  const { profile, user } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: sub }, { count: visits }, { count: orders }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("tier, status, current_period_end, trial_ends_at, cancel_at_period_end")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
  ]);

  const initials =
    profile.full_name
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "B";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brava-yellow to-amber-500 text-3xl font-black text-brava-blue shadow-md">
          {initials}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Perfil</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-brava-ink">
            {profile.full_name ?? "Você"}
          </h1>
          <p className="text-sm text-brava-muted">{user.email}</p>
        </div>
      </header>

      {sub && (
        <section className="rounded-3xl bg-gradient-to-br from-brava-black to-brava-blue p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brava-yellow">Plano atual</p>
              <p className="mt-2 text-3xl font-black">BRAVA+ {sub.tier.toUpperCase()}</p>
              <p className="mt-1 text-sm text-white/70">
                {sub.status === "trial" ? "Trial gratuito" : statusLabel(sub.status)}
                {sub.tier && ` · ${formatBRL(TIER_PRICE[sub.tier] ?? 0)}/mês`}
              </p>
            </div>
            <span className="rounded-full bg-brava-yellow px-3 py-1 text-xs font-bold text-brava-black">
              {sub.tier.toUpperCase()}
            </span>
          </div>

          <p className="mt-5 text-sm text-white/70">
            {sub.status === "trial"
              ? `Trial até ${formatDate(sub.trial_ends_at)}`
              : `Renova em ${formatDate(sub.current_period_end)}`}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/assinar"
              className="rounded-full bg-brava-yellow px-5 py-2.5 text-xs font-bold text-brava-black hover:scale-105"
            >
              Fazer upgrade
            </Link>
            <Link
              href="/assinar"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-white backdrop-blur hover:bg-white/10"
            >
              Gerenciar assinatura
            </Link>
          </div>
        </section>
      )}

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Kpi label="Visitas registradas" value={`${visits ?? 0}`} />
        <Kpi label="Compras feitas" value={`${orders ?? 0}`} />
      </section>

      <section className="mt-6 space-y-2 rounded-3xl border border-brava-border bg-white p-2">
        <Row href="/app/carteirinha" emoji="💳" label="Minha carteirinha" />
        <Row href="/app/fidelidade" emoji="⭐" label="Meus clubes de fidelidade" />
        <Row href="/app/buscar" emoji="🔎" label="Buscar parceiros" />
      </section>

      <section className="mt-6 space-y-2 rounded-3xl border border-brava-border bg-white p-2">
        <Row href="/seja-parceiro" emoji="🏪" label="Tenho um estabelecimento" subtitle="Conheça o programa de parceiros" />
        <Row href="mailto:contato@bravamais.app" emoji="✉️" label="Falar com suporte" />
      </section>

      <div className="mt-6">
        <SignOutButton className="block w-full rounded-3xl border border-brava-border bg-white px-4 py-3.5 text-center text-sm font-bold text-brava-ink hover:bg-brava-paper" />
      </div>

      <div className="h-6" />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-brava-border bg-white p-4">
      <p className="text-[11px] uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-brava-ink">{value}</p>
    </article>
  );
}

function Row({ href, emoji, label, subtitle }: { href: string; emoji: string; label: string; subtitle?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-brava-paper"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brava-paper text-xl">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-brava-ink">{label}</p>
        {subtitle && <p className="text-xs text-brava-muted">{subtitle}</p>}
      </div>
      <span className="text-brava-muted">→</span>
    </Link>
  );
}

function statusLabel(s: string): string {
  switch (s) {
    case "active": return "Ativa";
    case "past_due": return "Pagamento atrasado";
    case "canceled": return "Cancelada";
    case "paused": return "Pausada";
    default: return s;
  }
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
