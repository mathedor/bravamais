import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { SortableTh } from "@/components/admin/sortable-th";
import { PeriodFilter } from "@/components/admin/period-filter";
import { periodStart } from "@/lib/period";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Assinaturas — Admin" };

const TIER_PRICE: Record<string, number> = { basico: 1990, premium: 3990, vip: 7990 };

interface Row {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  created_at: string;
  profiles: { full_name: string | null; city: string | null } | null;
}

export default async function AssinaturasAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; status?: string; sort?: string; dir?: string; period?: string }>;
}) {
  await requireRole("admin");
  const { tier, status, sort, dir, period } = await searchParams;
  const supabase = await createClient();

  const orderField = ["tier", "status", "current_period_end", "created_at"].includes(sort ?? "")
    ? sort!
    : "created_at";
  const asc = dir === "asc";

  let query = supabase
    .from("subscriptions")
    .select(
      "id, user_id, tier, status, current_period_start, current_period_end, trial_ends_at, created_at, profiles(full_name, city)",
    )
    .order(orderField, { ascending: asc })
    .limit(300);

  if (tier) query = query.eq("tier", tier);
  if (status) query = query.eq("status", status);
  const startAt = periodStart(period);
  if (startAt) query = query.gte("created_at", startAt);

  const { data } = await query;
  const rows = (data as unknown as Row[] | null) ?? [];

  const activeRevenue = rows
    .filter((r) => r.status === "active")
    .reduce((s, r) => s + (TIER_PRICE[r.tier] ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Assinaturas</h1>
      <p className="mt-1 text-brava-muted">{rows.length} assinaturas no filtro · MRR ativo estimado {formatBRL(activeRevenue)}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <FilterLink href="/admin/assinaturas" active={!tier && !status}>Todas</FilterLink>
        <FilterLink href="/admin/assinaturas?status=active" active={status === "active"}>Ativas</FilterLink>
        <FilterLink href="/admin/assinaturas?status=trial" active={status === "trial"}>Em trial</FilterLink>
        <FilterLink href="/admin/assinaturas?status=canceled" active={status === "canceled"}>Canceladas</FilterLink>
        <span className="mx-2 h-5 w-px bg-brava-border" />
        <FilterLink href="/admin/assinaturas?tier=basico" active={tier === "basico"}>Básico</FilterLink>
        <FilterLink href="/admin/assinaturas?tier=premium" active={tier === "premium"}>Premium</FilterLink>
        <FilterLink href="/admin/assinaturas?tier=vip" active={tier === "vip"}>VIP</FilterLink>
      </div>

      <div className="mt-4">
        <PeriodFilter />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-brava-border bg-brava-card">
        <table className="w-full text-sm table-cards">
          <thead className="bg-brava-paper text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <th className="px-4 py-3 text-left">Assinante</th>
              <SortableTh field="tier" label="Plano" />
              <SortableTh field="status" label="Status" />
              <th className="px-4 py-3 text-left">Cidade</th>
              <SortableTh field="current_period_end" label="Vence em" numeric />
              <SortableTh field="created_at" label="Início" numeric />
            </tr>
          </thead>
          <tbody className="divide-y divide-brava-border">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-brava-muted">Sem registros.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-brava-paper">
                <td className="px-4 py-3">
                  <Link href={`/admin/usuarios/${r.user_id}`} className="font-medium text-brava-ink hover:text-brava-blue">
                    {r.profiles?.full_name ?? r.user_id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brava-yellow/30 px-2 py-0.5 text-xs font-bold uppercase text-brava-blue">{r.tier}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyle(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-brava-muted">{r.profiles?.city ?? "—"}</td>
                <td className="px-4 py-3 text-right text-xs text-brava-muted">
                  {r.current_period_end ? new Date(r.current_period_end).toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="px-4 py-3 text-right text-xs text-brava-muted">
                  {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusStyle(s: string): string {
  if (s === "active") return "bg-green-100 text-green-700";
  if (s === "trial") return "bg-amber-100 text-amber-700";
  if (s === "canceled") return "bg-zinc-200 text-zinc-600";
  if (s === "past_due") return "bg-red-100 text-red-700";
  return "bg-brava-paper text-brava-ink";
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-brava-blue text-white" : "bg-brava-card border border-brava-border text-brava-ink"}`}>
      {children}
    </Link>
  );
}
