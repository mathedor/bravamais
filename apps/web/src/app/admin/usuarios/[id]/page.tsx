import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { UserAdminActions } from "./admin-actions";
import { GiftSubscriptionForm } from "./gift-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Usuário 360 — Admin" };

export default async function UserDetailPage({ params }: PageProps) {
  await requireRole("admin");
  const { id } = await params;

  const supabase = await createClient();
  const adminDb = createAdminClient();

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!profile) notFound();

  // Auth info
  const { data: authData } = await adminDb.auth.admin.getUserById(id);
  const auth = authData?.user;

  // Subscription + counters in parallel
  const [
    { data: sub },
    { count: visitsCount },
    { count: ordersCount },
    { count: rewardsCount },
    { count: giftsBoughtCount },
    { data: recentVisits },
    { data: recentRewards },
    { data: recentGifts },
    { data: recentOrders },
    { data: recentLogs },
    { data: recentNotifs },
  ] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase.from("loyalty_rewards").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase.from("gift_cards").select("*", { count: "exact", head: true }).eq("buyer_user_id", id),
    supabase
      .from("visits")
      .select("id, created_at, source, establishments(slug, name)")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("loyalty_rewards")
      .select("id, reward_code, benefit_description, claimed_at, used_at, establishments(slug, name)")
      .eq("user_id", id)
      .order("claimed_at", { ascending: false })
      .limit(10),
    supabase
      .from("gift_cards")
      .select("id, code, value_cents, status, created_at, redeemed_at, establishments(slug, name)")
      .eq("buyer_user_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("orders")
      .select("id, status, total_cents, created_at, establishments(slug, name)")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    adminDb
      .from("access_logs")
      .select("id, action, entity_type, entity_id, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("notifications")
      .select("id, type, title, body, read_at, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  type LogRow = { id: number; action: string; entity_type: string; entity_id: string; created_at: string };
  type VisitRow = { id: string; created_at: string; source: string; establishments: { slug: string; name: string } | null };
  type RewardRow = { id: string; reward_code: string; benefit_description: string; claimed_at: string; used_at: string | null; establishments: { slug: string; name: string } | null };
  type GiftRow = { id: string; code: string; value_cents: number; status: string; created_at: string; redeemed_at: string | null; establishments: { slug: string; name: string } | null };
  type OrderRow = { id: string; status: string; total_cents: number; created_at: string; establishments: { slug: string; name: string } | null };
  type NotifRow = { id: string; type: string; title: string; body: string | null; read_at: string | null; created_at: string };

  const logs = (recentLogs as LogRow[] | null) ?? [];
  const visits = (recentVisits as unknown as VisitRow[] | null) ?? [];
  const rewards = (recentRewards as unknown as RewardRow[] | null) ?? [];
  const gifts = (recentGifts as unknown as GiftRow[] | null) ?? [];
  const orders = (recentOrders as unknown as OrderRow[] | null) ?? [];
  const notifs = (recentNotifs as NotifRow[] | null) ?? [];

  const initials =
    profile.full_name
      ?.split(" ")
      .map((s: string) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  const totalSpent = orders.reduce((s, o) => s + o.total_cents, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link href="/admin/usuarios" className="text-xs text-brava-muted hover:text-brava-ink">← Usuários</Link>

      {/* Header */}
      <header className="mt-3 flex flex-wrap items-start gap-5 rounded-3xl border border-brava-border bg-brava-card p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brava-yellow to-amber-500 text-3xl font-black text-brava-blue">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Usuário</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-brava-ink sm:text-3xl">
            {profile.full_name ?? "(sem nome)"}
          </h1>
          <p className="text-sm text-brava-muted">{auth?.email}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-brava-paper px-3 py-1 font-bold uppercase">{profile.role}</span>
            <span className={`rounded-full px-3 py-1 font-bold uppercase ${profile.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {profile.is_active ? "ativo" : "suspenso"}
            </span>
            {auth?.email_confirmed_at ? (
              <span className="rounded-full bg-brava-blue/10 px-3 py-1 font-bold uppercase text-brava-blue">email ok</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-bold uppercase text-amber-700">email pendente</span>
            )}
            {profile.city && (
              <span className="rounded-full bg-brava-paper px-3 py-1 text-brava-muted">
                {profile.city}/{profile.state ?? ""}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Visitas" value={`${visitsCount ?? 0}`} />
        <Kpi label="Recompensas" value={`${rewardsCount ?? 0}`} />
        <Kpi label="Vale-presentes" value={`${giftsBoughtCount ?? 0}`} />
        <Kpi label="Gasto total" value={formatBRL(totalSpent)} />
      </section>

      {/* Subscription + auth meta */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Assinatura BRAVA+">
          {sub ? (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Cell label="Plano" value={sub.tier?.toUpperCase()} />
              <Cell label="Status" value={sub.status} />
              <Cell label="Renova em" value={sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("pt-BR") : "—"} />
              <Cell label="Trial até" value={sub.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString("pt-BR") : "—"} />
              <Cell label="Cancelará?" value={sub.cancel_at_period_end ? "Sim" : "Não"} />
              <Cell label="Efí" value={sub.efi_subscription_id ?? "—"} mono />
            </dl>
          ) : (
            <p className="text-sm text-brava-muted">Sem assinatura.</p>
          )}
        </Card>

        <Card title="Conta Supabase">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Cell label="Cadastro" value={profile.created_at ? new Date(profile.created_at).toLocaleString("pt-BR") : "—"} />
            <Cell label="Último login" value={auth?.last_sign_in_at ? new Date(auth.last_sign_in_at).toLocaleString("pt-BR") : "—"} />
            <Cell label="Email confirmado" value={auth?.email_confirmed_at ? new Date(auth.email_confirmed_at).toLocaleString("pt-BR") : "Pendente"} />
            <Cell label="Provider" value={auth?.app_metadata?.provider ?? "email"} />
          </dl>
        </Card>
      </section>

      {/* Atividade detalhada */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title={`Últimas visitas (${visitsCount ?? 0})`}>
          {visits.length === 0 ? (
            <p className="text-sm text-brava-muted">Nenhuma visita.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {visits.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={v.establishments ? `/admin/estabelecimentos/${v.establishments.slug}` : "#"}
                    className="line-clamp-1 text-brava-ink hover:text-brava-blue"
                  >
                    {v.establishments?.name ?? "—"}
                  </Link>
                  <span className="rounded-full bg-brava-paper px-2 py-0.5 text-[10px] font-bold uppercase">{v.source}</span>
                  <span className="text-xs text-brava-muted">
                    {new Date(v.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Recompensas (${rewardsCount ?? 0})`}>
          {rewards.length === 0 ? (
            <p className="text-sm text-brava-muted">Sem prêmios resgatados.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {rewards.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={r.establishments ? `/admin/estabelecimentos/${r.establishments.slug}` : "#"}
                    className="line-clamp-1 text-brava-ink hover:text-brava-blue"
                  >
                    {r.establishments?.name ?? "—"} · {r.benefit_description.slice(0, 30)}
                  </Link>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${r.used_at ? "bg-zinc-200 text-zinc-600" : "bg-green-100 text-green-700"}`}>
                    {r.used_at ? "usado" : "pendente"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Vale-presentes (${giftsBoughtCount ?? 0})`}>
          {gifts.length === 0 ? (
            <p className="text-sm text-brava-muted">Não comprou vale-presente ainda.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {gifts.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/presente/${g.code}`}
                    className="line-clamp-1 font-mono text-xs text-brava-ink hover:text-brava-blue"
                  >
                    {g.code}
                  </Link>
                  <span className="text-brava-muted">{g.establishments?.name?.slice(0, 16) ?? "—"}</span>
                  <span className="font-bold text-brava-ink">{formatBRL(g.value_cents)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${g.redeemed_at ? "bg-zinc-200 text-zinc-600" : g.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {g.redeemed_at ? "usado" : g.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Pedidos (${ordersCount ?? 0})`}>
          {orders.length === 0 ? (
            <p className="text-sm text-brava-muted">Sem pedidos.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-brava-muted">{o.id.slice(0, 6)}</span>
                  <span className="line-clamp-1 text-brava-ink">{o.establishments?.name ?? "—"}</span>
                  <span className="rounded-full bg-brava-paper px-2 py-0.5 text-[10px] font-bold uppercase">{o.status}</span>
                  <span className="font-bold text-brava-ink">{formatBRL(o.total_cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Notificações */}
      <section className="mt-6">
        <Card title="Últimas notificações">
          {notifs.length === 0 ? (
            <p className="text-sm text-brava-muted">Sem notificações enviadas.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {notifs.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 rounded-2xl bg-brava-paper px-3 py-2">
                  <div className="min-w-0">
                    <p className="font-bold text-brava-ink">{n.title}</p>
                    {n.body && <p className="text-xs text-brava-muted line-clamp-1">{n.body}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-brava-muted">
                    {new Date(n.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${n.read_at ? "bg-zinc-200 text-zinc-600" : "bg-brava-yellow text-brava-black"}`}>
                    {n.read_at ? "lida" : "nova"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Activity log (technical) */}
      <section className="mt-6">
        <Card title={`Logs de atividade (${logs.length})`}>
          {logs.length === 0 ? (
            <p className="text-sm text-brava-muted">
              Sem logs ainda. Eventos como visitas, resgates e compras passam a ser registrados a partir daqui.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-brava-border">
              <table className="w-full text-xs table-cards">
                <thead className="bg-brava-paper text-left uppercase tracking-wider text-brava-muted">
                  <tr>
                    <th className="px-3 py-2">Ação</th>
                    <th className="px-3 py-2">Entidade</th>
                    <th className="px-3 py-2 text-right">Quando</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brava-border">
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2 font-mono">{l.action}</td>
                      <td className="px-3 py-2 text-brava-muted">{l.entity_type}</td>
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

      {/* Brindar dias grátis */}
      <section className="mt-8 rounded-3xl border border-brava-yellow bg-brava-yellow/10 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brava-blue">🎁 Brindar assinatura grátis</h2>
        <div className="mt-3">
          <GiftSubscriptionForm userId={profile.id} />
        </div>
      </section>

      {/* Admin actions */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-blue">Ações administrativas</h2>
        <UserAdminActions
          user={{
            id: profile.id,
            full_name: profile.full_name,
            phone: profile.phone,
            city: profile.city,
            state: profile.state,
            role: profile.role,
            is_active: profile.is_active,
          }}
        />
      </section>

      <div className="h-8" />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-brava-border bg-brava-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-brava-ink">{value}</p>
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
