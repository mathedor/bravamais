import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";
import { computeAndSaveOnboarding, progressPercent } from "@/lib/lojista-onboarding";

export const metadata = { title: "Loja — Início" };

export default async function LojaHome() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const onboarding = await computeAndSaveOnboarding(establishment.id);
  const onboardingPct = progressPercent(onboarding);

  const [
    { count: productsCount },
    { count: couponsCount },
    { count: visitsCount },
    { count: ordersCount },
    { count: activeStories },
    { count: giftCards },
    { count: pendingWithdrawals },
    { count: openRefunds },
    { data: recentOrders },
    { data: lastVisits },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("establishment_id", establishment.id).eq("is_active", true),
    supabase.from("coupons").select("*", { count: "exact", head: true }).eq("establishment_id", establishment.id).eq("is_active", true),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("establishment_id", establishment.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("establishment_id", establishment.id),
    supabase
      .from("establishment_stories")
      .select("*", { count: "exact", head: true })
      .eq("establishment_id", establishment.id)
      .gt("expires_at", new Date().toISOString()),
    supabase
      .from("gift_cards")
      .select("*", { count: "exact", head: true })
      .eq("establishment_id", establishment.id)
      .eq("status", "paid"),
    supabase
      .from("withdrawals")
      .select("*", { count: "exact", head: true })
      .eq("establishment_id", establishment.id)
      .eq("status", "pending"),
    supabase
      .from("refund_tickets")
      .select("*", { count: "exact", head: true })
      .eq("establishment_id", establishment.id)
      .eq("status", "open"),
    supabase
      .from("orders")
      .select("id, status, total_cents, created_at")
      .eq("establishment_id", establishment.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("visits")
      .select("id, created_at, source")
      .eq("establishment_id", establishment.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const firstName = establishment.name.split(" ").slice(0, 2).join(" ");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brava-black via-brava-ink to-brava-blue p-6 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brava-yellow/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-brava-blue-bright/40 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">
              {establishment.is_active ? "Loja ativa" : "Em revisão"}
            </p>
            <h1 className="mt-2 text-3xl font-black leading-[0.95] tracking-tight sm:text-5xl">
              {firstName}
            </h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              {establishment.city ? `${establishment.city}/${establishment.state ?? ""}` : "—"}
              {establishment.is_verified && " · Verificada"}
            </p>
          </div>

          <Link
            href="/loja/qr-scanner"
            className="inline-flex items-center gap-2 rounded-full bg-brava-yellow px-5 py-3 text-sm font-bold text-brava-black shadow-xl shadow-brava-yellow/40 transition hover:scale-105"
          >
            📷 Abrir QR
          </Link>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:max-w-md sm:grid-cols-4">
          <HeroChip emoji="📸" label="HOJE" value={activeStories ?? 0} href="/loja/hoje" />
          <HeroChip emoji="🎟️" label="Cupons" value={couponsCount ?? 0} href="/loja/cupons" />
          <HeroChip emoji="🎁" label="V-presentes" value={giftCards ?? 0} href="/loja/vale-presente" />
          <HeroChip emoji="📦" label="Catálogo" value={productsCount ?? 0} href="/loja/catalogo" />
        </div>
      </section>

      {/* KPIs compactos — 3 col mobile, 6 col desktop */}
      <section className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        <Kpi label="Visitas" value={`${visitsCount ?? 0}`} />
        <Kpi label="Pedidos" value={`${ordersCount ?? 0}`} />
        <Kpi label="Cupons" value={`${couponsCount ?? 0}`} />
        <Kpi label="Produtos" value={`${productsCount ?? 0}`} />
        <Kpi label="V-presentes" value={`${giftCards ?? 0}`} />
        <Kpi label="Stories hoje" value={`${activeStories ?? 0}`} />
      </section>

      {/* Onboarding (só se incompleto) */}
      {onboardingPct < 100 && (
        <Link
          href="/loja/onboarding"
          className="mt-4 flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-brava-yellow bg-gradient-to-r from-brava-yellow/15 via-amber-100/20 to-brava-yellow/10 p-4 hover:from-brava-yellow/25 transition"
        >
          <div className="relative h-12 w-12 shrink-0">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="#FFD400" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(onboardingPct / 100) * 94.2} 94.2`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-brava-ink">
              {onboardingPct}%
            </span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">Onboarding</p>
            <p className="font-bold text-brava-ink">Termine de configurar sua loja</p>
          </div>
          <span className="text-brava-blue">→</span>
        </Link>
      )}

      {/* Alertas pendentes (só aparecem se tiver algo) */}
      {((pendingWithdrawals ?? 0) + (openRefunds ?? 0)) > 0 && (
        <section className="mt-4 grid gap-2 sm:grid-cols-2">
          {(pendingWithdrawals ?? 0) > 0 && (
            <Link href="/loja/saques" className="flex items-center justify-between rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 hover:bg-amber-100">
              <span><strong>💰 {pendingWithdrawals}</strong> saque(s) pendente(s)</span><span>→</span>
            </Link>
          )}
          {(openRefunds ?? 0) > 0 && (
            <Link href="/loja/extornos" className="flex items-center justify-between rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 hover:bg-red-100">
              <span><strong>🔴 {openRefunds}</strong> pedido(s) de extorno</span><span>→</span>
            </Link>
          )}
        </section>
      )}

      {/* Atalhos rápidos */}
      <section className="mt-6">
        <SectionHeader title="Ação rápida" subtitle="O que mais usa, num clique" />
        <div className="mt-3 grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/loja/blast" color="yellow" emoji="⚡" title="Promo flash" desc="Tô vazio, dispara!" />
          <QuickAction href="/loja/receita" color="blue" emoji="📈" title="Painel de receita" desc="Quanto BRAVA+ trouxe" />
          <QuickAction href="/loja/contabil" color="blue" emoji="📋" title="Extrato contábil" desc="Mensal · CSV" />
          <QuickAction href="/loja/roleta" color="black" emoji="🎰" title="Roleta da sorte" desc="Engaja com prêmios" />
        </div>
      </section>

      {/* Atividade */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <h2 className="text-base font-bold text-brava-ink">Últimas visitas</h2>
          {(lastVisits as { id: string; created_at: string; source: string }[] | null)?.length ? (
            <ul className="mt-4 space-y-2">
              {(lastVisits as { id: string; created_at: string; source: string }[]).map((v) => (
                <li key={v.id} className="flex items-center justify-between rounded-2xl bg-brava-paper px-3 py-2 text-sm">
                  <span className="font-medium text-brava-ink">QR Scan</span>
                  <span className="text-xs text-brava-muted">{new Date(v.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-brava-muted">Sem visitas ainda. Comece lendo um QR.</p>
          )}
        </article>

        <article className="rounded-3xl border border-brava-border bg-brava-card p-6">
          <h2 className="text-base font-bold text-brava-ink">Últimos pedidos</h2>
          {(recentOrders as { id: string; status: string; total_cents: number; created_at: string }[] | null)?.length ? (
            <ul className="mt-4 space-y-2">
              {(recentOrders as { id: string; status: string; total_cents: number; created_at: string }[]).map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-2xl bg-brava-paper px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-brava-muted">{o.id.slice(0, 6)}</span>
                  <span className="rounded-full bg-brava-card px-2 py-0.5 text-[10px] font-bold uppercase">{o.status}</span>
                  <span className="font-bold text-brava-ink">{formatBRL(o.total_cents)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-brava-muted">Sem pedidos ainda.</p>
          )}
        </article>
      </section>

      <div className="h-10" />
    </div>
  );
}

function HeroChip({ emoji, label, value, href }: { emoji: string; label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-start gap-1 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur transition hover:bg-white/15"
    >
      <span className="text-xl transition-transform group-hover:scale-110">{emoji}</span>
      <span className="text-[10px] uppercase tracking-wider text-white/55">{label}</span>
      <span className="text-xl font-black text-white">{value}</span>
    </Link>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-brava-border bg-brava-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-0.5 text-lg font-black text-brava-ink sm:text-xl">{value}</p>
    </article>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-xl font-black tracking-tight text-brava-ink sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-brava-muted sm:text-sm">{subtitle}</p>}
    </div>
  );
}

function QuickAction({ href, emoji, title, desc, color }: { href: string; emoji: string; title: string; desc: string; color: "yellow" | "blue" | "black" }) {
  const styles =
    color === "yellow"
      ? "from-brava-yellow to-amber-400 text-brava-black"
      : color === "blue"
      ? "from-brava-blue to-brava-blue-bright text-white"
      : "from-brava-black to-brava-ink text-white";
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl bg-gradient-to-br p-3 transition hover:-translate-y-0.5 hover:shadow-lg ${styles}`}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black">{title}</p>
        <p className="text-[11px] opacity-80">{desc}</p>
      </div>
      <span className="text-sm font-bold opacity-90 group-hover:translate-x-1 transition-transform">→</span>
    </Link>
  );
}
