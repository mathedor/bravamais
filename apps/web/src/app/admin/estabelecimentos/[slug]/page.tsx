import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { EstablishmentAdminActions } from "./admin-actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = { title: "Estabelecimento 360 — Admin" };

export default async function EstablishmentDetailPage({ params }: PageProps) {
  await requireRole("admin");
  const { slug } = await params;

  const supabase = await createClient();
  const adminDb = createAdminClient();

  const { data: estab } = await supabase
    .from("establishments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!estab) notFound();

  // Owner info
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, city, state, role, is_active, created_at")
    .eq("id", estab.owner_id)
    .maybeSingle();

  const { data: ownerAuth } = await adminDb.auth.admin.getUserById(estab.owner_id);

  // Aggregates
  const [
    { count: productsCount },
    { count: couponsCount },
    { count: storiesActiveCount },
    { count: visitsCount },
    { count: ordersCount },
    { count: giftCardsCount },
    { count: loyaltyProgressCount },
    { count: loyaltyRewardsCount },
    { data: visitsLast30 },
    { data: ordersAgg },
    { data: giftsAgg },
    { data: recentStories },
    { data: recentCoupons },
    { data: recentRewards },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("establishment_id", estab.id).eq("is_active", true),
    supabase.from("coupons").select("*", { count: "exact", head: true }).eq("establishment_id", estab.id).eq("is_active", true),
    supabase
      .from("establishment_stories")
      .select("*", { count: "exact", head: true })
      .eq("establishment_id", estab.id)
      .gt("expires_at", new Date().toISOString()),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("establishment_id", estab.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("establishment_id", estab.id),
    supabase
      .from("gift_cards")
      .select("*", { count: "exact", head: true })
      .eq("establishment_id", estab.id)
      .neq("status", "pending"),
    supabase.from("loyalty_progress").select("*", { count: "exact", head: true }).eq("club_id", estab.id),
    supabase.from("loyalty_rewards").select("*", { count: "exact", head: true }).eq("establishment_id", estab.id),
    supabase
      .from("visits")
      .select("created_at")
      .eq("establishment_id", estab.id)
      .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase
      .from("orders")
      .select("total_cents, status, created_at")
      .eq("establishment_id", estab.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("gift_cards")
      .select("value_cents, status, created_at")
      .eq("establishment_id", estab.id),
    supabase
      .from("establishment_stories")
      .select("id, media_url, caption, expires_at, created_at")
      .eq("establishment_id", estab.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("coupons")
      .select("id, code, description, discount_percent, discount_cents, uses_count, is_active")
      .eq("establishment_id", estab.id)
      .order("uses_count", { ascending: false })
      .limit(8),
    supabase
      .from("loyalty_rewards")
      .select("id, reward_code, benefit_description, claimed_at, used_at")
      .eq("establishment_id", estab.id)
      .order("claimed_at", { ascending: false })
      .limit(10),
    adminDb
      .from("access_logs")
      .select("id, action, entity_type, entity_id, created_at, user_id")
      .eq("entity_id", estab.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const totalRevenue = ((ordersAgg as { total_cents: number; status: string }[] | null) ?? [])
    .filter((o) => ["paid", "completed"].includes(o.status))
    .reduce((s, o) => s + o.total_cents, 0);

  const totalGiftSold = ((giftsAgg as { value_cents: number; status: string }[] | null) ?? [])
    .filter((g) => g.status === "paid" || g.status === "redeemed")
    .reduce((s, g) => s + g.value_cents, 0);

  type LogRow = { id: number; action: string; entity_type: string; entity_id: string; created_at: string; user_id: string | null };
  type StoryRow = { id: string; media_url: string; caption: string | null; expires_at: string; created_at: string };
  type CouponRow = { id: string; code: string; description: string | null; discount_percent: number | null; discount_cents: number | null; uses_count: number; is_active: boolean };
  type RewardRow = { id: string; reward_code: string; benefit_description: string; claimed_at: string; used_at: string | null };

  const logs = (recentLogs as LogRow[] | null) ?? [];
  const stories = (recentStories as StoryRow[] | null) ?? [];
  const coupons = (recentCoupons as CouponRow[] | null) ?? [];
  const rewards = (recentRewards as RewardRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link href="/admin/estabelecimentos" className="text-xs text-brava-muted hover:text-brava-ink">← Estabelecimentos</Link>

      {/* Header */}
      <header className="mt-3 flex flex-wrap items-start gap-5 rounded-3xl border border-brava-border bg-brava-card p-6">
        {estab.logo_url ? (
          <Image src={estab.logo_url} alt="" width={80} height={80} className="h-20 w-20 shrink-0 rounded-3xl object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-3xl bg-brava-yellow" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Estabelecimento</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-brava-ink sm:text-3xl">{estab.name}</h1>
          <p className="text-sm text-brava-muted">{estab.tagline ?? "—"}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-brava-paper px-3 py-1 font-mono text-[11px]">/{estab.slug}</span>
            <span className={`rounded-full px-3 py-1 font-bold uppercase ${estab.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {estab.is_active ? "ativa" : "suspensa"}
            </span>
            {estab.is_verified && (
              <span className="rounded-full bg-brava-blue px-3 py-1 font-bold uppercase text-white">verificada</span>
            )}
            {estab.city && (
              <span className="rounded-full bg-brava-paper px-3 py-1 text-brava-muted">
                {estab.city}/{estab.state ?? ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/estabelecimentos/${estab.slug}/operacao`}
            className="rounded-full bg-brava-yellow px-4 py-2 text-xs font-bold text-brava-black"
          >
            ⚙️ Operação (cupons / catálogo / fidelidade)
          </Link>
          <Link
            href={`/app/estabelecimento/${estab.slug}`}
            className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-xs font-medium text-brava-ink hover:bg-brava-paper"
          >
            Ver 360 público →
          </Link>
        </div>
      </header>

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Visitas total" value={`${visitsCount ?? 0}`} sub={`${(visitsLast30 as { created_at: string }[] | null)?.length ?? 0} em 30d`} />
        <Kpi label="Pedidos" value={`${ordersCount ?? 0}`} sub={formatBRL(totalRevenue)} />
        <Kpi label="Vale-presentes" value={`${giftCardsCount ?? 0}`} sub={formatBRL(totalGiftSold)} />
        <Kpi label="Prêmios fidelidade" value={`${loyaltyRewardsCount ?? 0}`} sub={`${loyaltyProgressCount ?? 0} clientes ativos`} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Owner */}
        <Card title="Dono da loja">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Cell label="Nome" value={ownerProfile?.full_name ?? "—"} />
            <Cell label="Email" value={ownerAuth?.user?.email ?? "—"} mono />
            <Cell label="Telefone" value={ownerProfile?.phone ?? "—"} />
            <Cell label="Conta" value={ownerProfile?.is_active ? "Ativa" : "Suspensa"} />
            <Cell label="Cadastro" value={ownerProfile?.created_at ? new Date(ownerProfile.created_at).toLocaleDateString("pt-BR") : "—"} />
            <Cell label="Último login" value={ownerAuth?.user?.last_sign_in_at ? new Date(ownerAuth.user.last_sign_in_at).toLocaleString("pt-BR") : "—"} />
          </dl>
          {ownerProfile && (
            <Link
              href={`/admin/usuarios/${ownerProfile.id}`}
              className="mt-4 inline-flex items-center rounded-full bg-brava-black px-4 py-2 text-xs font-bold text-white"
            >
              Abrir 360 do dono →
            </Link>
          )}
        </Card>

        {/* Configuração */}
        <Card title="Operação atual">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Cell label="Produtos ativos" value={`${productsCount ?? 0}`} />
            <Cell label="Cupons ativos" value={`${couponsCount ?? 0}`} />
            <Cell label="Stories no ar" value={`${storiesActiveCount ?? 0}`} />
            <Cell label="Clientes ativos" value={`${loyaltyProgressCount ?? 0}`} />
          </dl>
        </Card>
      </section>

      {/* Stories preview */}
      {stories.length > 0 && (
        <section className="mt-6">
          <Card title={`Últimos stories (${stories.length})`}>
            <div className="-mx-1 flex gap-2 overflow-x-auto">
              {stories.map((s) => {
                const expired = new Date(s.expires_at) <= new Date();
                return (
                  <div key={s.id} className={`relative h-32 w-24 shrink-0 overflow-hidden rounded-xl ${expired ? "opacity-50" : ""}`}>
                    <Image src={s.media_url} alt="" fill sizes="96px" className="object-cover" />
                    {expired && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] font-bold text-white">expirado</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* Top cupons */}
      {coupons.length > 0 && (
        <section className="mt-6">
          <Card title={`Cupons (${coupons.length})`}>
            <ul className="space-y-2 text-sm">
              {coupons.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 rounded-2xl bg-brava-paper px-3 py-2">
                  <span className="rounded-md bg-brava-yellow px-2 py-0.5 font-mono text-xs font-bold text-brava-black">{c.code}</span>
                  <span className="line-clamp-1 flex-1 text-brava-muted">{c.description ?? "—"}</span>
                  <span className="font-bold text-brava-blue">
                    {c.discount_percent ? `${c.discount_percent}%` : c.discount_cents ? `R$${(c.discount_cents / 100).toFixed(2)}` : "—"}
                  </span>
                  <span className="rounded-full bg-brava-card px-2 py-0.5 text-xs">{c.uses_count} usos</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* Recompensas recentes */}
      {rewards.length > 0 && (
        <section className="mt-6">
          <Card title={`Últimos prêmios resgatados (${rewards.length})`}>
            <ul className="space-y-2 text-sm">
              {rewards.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-2xl bg-brava-paper px-3 py-2">
                  <span className="font-mono text-xs">{r.reward_code}</span>
                  <span className="line-clamp-1 flex-1 text-brava-ink">{r.benefit_description}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.used_at ? "bg-zinc-200 text-zinc-600" : "bg-green-100 text-green-700"}`}>
                    {r.used_at ? "usado" : "pendente"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* Activity log */}
      <section className="mt-6">
        <Card title={`Logs de atividade (${logs.length})`}>
          {logs.length === 0 ? (
            <p className="text-sm text-brava-muted">Sem logs registrados neste estabelecimento ainda.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-brava-border">
              <table className="w-full text-xs">
                <thead className="bg-brava-paper text-left uppercase tracking-wider text-brava-muted">
                  <tr>
                    <th className="px-3 py-2">Ação</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Por</th>
                    <th className="px-3 py-2 text-right">Quando</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brava-border">
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2 font-mono">{l.action}</td>
                      <td className="px-3 py-2 text-brava-muted">{l.entity_type}</td>
                      <td className="px-3 py-2">
                        {l.user_id ? (
                          <Link href={`/admin/usuarios/${l.user_id}`} className="text-brava-blue hover:underline">
                            ver →
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-brava-muted">
                        {new Date(l.created_at).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      {/* Admin actions */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-blue">Ações administrativas</h2>
        <p className="mb-3 rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-900">
          ⚠️ Admin só mexe em dados <strong>cadastrais</strong>. Operação (catálogo, cupons, stories, fidelidade) é do dono no /loja.
        </p>
        <EstablishmentAdminActions
          establishment={{
            id: estab.id,
            slug: estab.slug,
            name: estab.name,
            tagline: estab.tagline,
            city: estab.city,
            state: estab.state,
            phone: estab.phone,
            whatsapp: estab.whatsapp,
            is_active: estab.is_active,
            is_verified: estab.is_verified,
          }}
          ownerId={estab.owner_id}
          ownerEmail={ownerAuth?.user?.email ?? null}
        />
      </section>

      <div className="h-8" />
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <article className="rounded-2xl border border-brava-border bg-brava-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-brava-ink">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-brava-muted">{sub}</p>}
    </article>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-blue">{title}</h2>
      {children}
    </article>
  );
}

function Cell({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-brava-muted">{label}</dt>
      <dd className={`mt-0.5 font-bold text-brava-ink ${mono ? "font-mono text-xs" : ""}`}>{value ?? "—"}</dd>
    </div>
  );
}
